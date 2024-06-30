from __future__ import annotations
import re
from bs4 import BeautifulSoup
from typing import Dict, Any
from config import ServerConfig
from utils.headers import get_headers
from .base import Scraper


class MyAL(Scraper):
    site_url: str = "https://myanimelist.net"
    cache: Dict[str, Dict[str, Any]] = {}

    anime_types_dict = {
        "all_anime": "",
        "airing": "airing",
        "upcoming": "upcoming",
        "tv": "tv",
        "movie": "movie",
        "ova": "ova",
        "ona": "ona",
        "special": "special",
        "by_popularity": "bypopularity",
        "favorite": "favorite",
    }

    manga_types_dict = {
        "all_manga": "",
        "manga": "manga",
        "oneshots": "oneshots",
        "doujin": "doujin",
        "light_novels": "lightnovels",
        "novels": "novels",
        "manhwa": "manhwa",
        "manhua": "manhua",
        "by_popularity": "bypopularity",
        "favourite": "favourite"
    }

    types_dict = {"anime": anime_types_dict, "manga": manga_types_dict}

    @classmethod
    async def get_top_manga(cls, manga_type: str, limit: int = 0):
        return await cls.get_top(manga_type, limit, "manga")

    @classmethod
    async def get_top_anime(cls, anime_type: str, limit: int = 0):
        """request to scrape top anime from MAL website
        Args:
            anime_type (str): either of ['airing', 'upcoming', 'tv', 'movie', 'ova', 'ona', 'special', 'by_popularity', 'favorite']
            limit (str): page number (number of tops in a page)
        Returns:
            Dict[str, Dict[str, str]]: {
                "<rank>" : {
                    "img_url" : (str)url,
                    "title" : (str),
                    "anime_type" : (str),
                    "episodes" : (str),
                    "score" : (str),
                },
                ...
                "next_top":"api_server_address/top_anime?type=anime_type&limit=limit"
            }
        """
        return await cls.get_top(anime_type, limit, "anime")

    @classmethod
    async def get_top(cls, typ: str, limit: int = 0, media: str = "anime") -> Dict[str, Any]:
        key = f"{media}_{typ}_{limit}"

        if cls.cache.get(key, None):
            return cls.cache[key]

        top_headers = get_headers()

        top_anime_params = {
            'type': cls.types_dict[media][typ],
            'limit': limit,
        }

        resp = await cls.get(f'{cls.site_url}/top{media}.php', top_anime_params, top_headers)

        bs_top = BeautifulSoup(await resp.text(), 'html.parser')

        ranks_text = bs_top.find_all("span", {"class": ['rank1', 'rank2', 'rank3', 'rank4']})
        ranks = []

        if not ranks_text:
            ranks = [span.get_text() for div in bs_top.find_all('div', {'class': 'icon-ranking'}) for span in div.find_all('span') if span.get_text()]
        else:
            for i in ranks_text:
                ranks.append(i.text)

        img = bs_top.find_all("img", {"width": "50", "height": "70"})
        imgs = []
        for x in img:
            src = x.get("data-src")
            start, end = 0, 0
            for i in range(len(src)):
                if src[i] == '/' and src[i + 1] == 'r':
                    start = i
                if src[i] == '/' and src[i + 1] == 'i':
                    end = i
            imgs.append(src.replace(src[start:end], ""))

        if not imgs:
            imgs = [image.get('data-bg') for image in bs_top.find_all("div", {"class": "tile-unit"})]

        title_class: str = ""
        match media:
            case "anime":
                title_class = "anime_ranking_h3"
            case "manga":
                title_class = "manga_h3"

        titles = [title.get_text() for title in bs_top.find_all("h3", {"class": title_class})]

        if not titles:
            titles = [title.get_text() for title in bs_top.find_all("h2", {"class": "title"})]

        info = bs_top.find_all("div", {"class": "information"})
        segments = []
        a_type = []
        for x in info:
            text = x.text.replace('\n', '').replace(' ', '')
            if not text:
                continue

            match1 = re.search(r'(TV|OVA|ONA|Movie|TV Special|Special|Manga|Manhwa|Light Novel|Novel|Manhua|Doujinshi|One-shot)\s*\((\d+)\s*(eps|vols)?\)', text)
            match2 = re.search(r'(TV|OVA|ONA|Movie|TV Special|Special|Manga|Manhwa|Light Novel|Novel|Manhua|Doujinshi|One-shot)\s*\(\?\s*(eps|vols)?\)', text)
            match3 = re.search(r'(TV|OVA|ONA|Movie|TV Special|Special|Manga|Manhwa|Light Novel|Novel|Manhua|Doujinshi|One-shot)\s*\((\d+)\)', text)
            match4 = re.search(r'(TV|OVA|ONA|Movie|TV Special|Special|Manga|Manhwa|Light Novel|Novel|Manhua|Doujinshi|One-shot)\s*(\((\d+)\s*(eps|vols)?\))?', text)

            if match1:
                a_type.append(match1.group(1))
                segments.append(match1.group(2))
            elif match2:
                a_type.append(match2.group(1))
                segments.append("?")
            elif match3:
                a_type.append(match3.group(1))
                segments.append(match3.group(2))
            elif match4:
                a_type.append(match4.group(1))
                segments.append("1")
            else:
                a_type.append("Unknown")
                segments.append("0")

        score = bs_top.find_all("span", {"class": [
            "score-10", "score-9", "score-8", "score-7", "score-6", "score-5", "score-4", "score-3", "score-2",
            "score-1", "score-na"
        ]})

        top = []

        for idx, rank in enumerate(ranks):
            if rank == "-":
                rank = "na"
            item = {"rank": rank, "poster": imgs[idx], "title": titles[idx], "type": a_type[idx],
                    f"{media}_detail": f'{ServerConfig.API_SERVER_ADDRESS}/search?type={media}&query={titles[idx]}&total_res=1'}

            match media:
                case "anime":
                    item["episodes"] = segments[idx]
                    item["score"] = score[idx].text if len(score) == len(ranks) else score[idx*2].text
                case "manga":
                    item["volumes"] = segments[idx]

            top.append(item)

        response: Dict[str, Any] = {"data": top}

        try:
            next_top = bs_top.find("a", {"class": "next"}).get("href").replace("type", "c")
            response["next_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{next_top}&type={typ}"
        except AttributeError:
            response["next_top"] = None

        try:
            prev_top = bs_top.find("a", {"class": "prev"}).get("href").replace("type", "c")
            response["prev_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{prev_top}&type={typ}"
        except AttributeError:
            response["prev_top"] = None

        cls.cache[key] = response
        return response
