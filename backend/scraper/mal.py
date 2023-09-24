from __future__ import annotations
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple, Any
from config import ServerConfig
from utils.headers import get_headers
from .base import Scraper


class MyAL(Scraper):
    site_url: str = "https://myanimelist.net"

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

    async def get_top_mange(self, manga_type: str, limit: int = 0):
        return await self.get_top(manga_type, limit, "manga")

    async def get_top_anime(self, anime_type: str, limit: int = 0):
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
        return await self.get_top(anime_type, limit, "anime")

    async def get_top(self, typ: str, limit: int = 0, media: str = "anime"):
        top_headers = get_headers()

        top_anime_params = {
            'type': self.types_dict[media][typ],
            'limit': limit,
        }

        resp = await self.get(f'{self.site_url}/top{media}.php', top_anime_params, top_headers)

        bs_top = BeautifulSoup(await resp.text(), 'html.parser')

        rank = bs_top.find_all("span", {"class": ['rank1', 'rank2', 'rank3', 'rank4']})
        ranks = []
        for i in rank:
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

        title_class: str = ""
        match media:
            case "anime":
                title_class = "anime_ranking_h3"
            case "manga":
                title_class = "manga_h3"

        title = bs_top.find_all("h3", {"class": title_class})

        info = bs_top.find_all("div", {"class": "information"})
        segments = []
        a_type = []
        for x in info:
            val = x.text.replace('\n', '').replace(' ', '')
            start, end = val.index("("), val.index(")")
            segments.append(val[start + 1:end])
            a_type.append(val[:start])

        score = bs_top.find_all("span", {"class": [
            "score-10", "score-9", "score-8", "score-7", "score-6", "score-5", "score-4", "score-3", "score-2",
            "score-1", "score-na"
        ]})

        top = []

        for idx, rank in enumerate(ranks):
            if rank == "-":
                rank = "na"
            item = {"rank": rank, "poster": imgs[idx], "title": title[idx].text, "type": a_type[idx],
                    f"{typ}_detail": f'{ServerConfig.API_SERVER_ADDRESS}/search?type={typ}&query={title[idx].text}&total_res=1'}

            match typ:
                case "anime":
                    item["episodes"] = segments[idx].replace('eps', '')
                    item["score"] = score[idx * 2].text,
                case "manga":
                    item["volumes"] = segments[idx].replace('vols', ''),

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

        return response
