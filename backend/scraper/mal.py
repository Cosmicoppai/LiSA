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

    async def get_top_mange(self, manga_type: str, limit: int = 0):

        top_anime_params = {
            'type': self.manga_types_dict[manga_type],
            'limit': limit,
        }

        bs_top = BeautifulSoup(await self.get(f'{self.site_url}/topmanga.php', top_anime_params, get_headers()),
                               'html.parser')

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

        title = bs_top.find_all("h3", {"class": "manga_h3"})

        info = bs_top.find_all("div", {"class": "information"})
        vols = []
        a_type = []
        for x in info:
            val = x.text.replace('\n', '').replace(' ', '')
            start, end = val.index("("), val.index(")")
            vols.append(val[start + 1:end])
            a_type.append(val[:start])

        top_manga = []

        for idx, rank in enumerate(ranks):
            if rank == "-":
                rank = "na"
            top_manga.append({"rank": rank, "img_url": imgs[idx], "title": title[idx].text, "type": a_type[idx],
                              "volumes": vols[idx].replace('vols', ''),
                              "manga_detail": f'{ServerConfig.API_SERVER_ADDRESS}/search?type=manga&query={title[idx].text}&total_res=1'})

        response: Dict[str, Any] = {"data": top_manga}

        try:
            next_top = bs_top.find("a", {"class": "next"}).get("href").replace("type", "c")
            response["next_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{next_top}&type=manga"
        except AttributeError:
            response["next_top"] = None

        try:
            prev_top = bs_top.find("a", {"class": "prev"}).get("href").replace("type", "c")
            response["prev_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{prev_top}&type=manga"
        except AttributeError:
            response["prev_top"] = None

        return response

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
        top_anime_headers = get_headers()

        top_anime_params = {
            'type': self.anime_types_dict[anime_type],
            'limit': limit,
        }

        bs_top = BeautifulSoup(await self.get(f'{self.site_url}/topanime.php', top_anime_params, top_anime_headers),
                               'html.parser')

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

        title = bs_top.find_all("h3", {"class": "anime_ranking_h3"})

        info = bs_top.find_all("div", {"class": "information"})
        episodes = []
        a_type = []
        for x in info:
            val = x.text.replace('\n', '').replace(' ', '')
            start, end = 0, 0
            for i in range(len(val)):
                if val[i] == '(':
                    start = i
                if val[i] == ')':
                    end = i
            episodes.append(val[start + 1:end])
            a_type.append(val[:start])

        score = bs_top.find_all("span", {"class": [
            "score-10", "score-9", "score-8", "score-7", "score-6", "score-5", "score-4", "score-3", "score-2",
            "score-1", "score-na"
        ]})

        top_anime = []

        for idx, rank in enumerate(ranks):
            if rank == "-":
                rank = "na"
            top_anime.append({"rank": rank, "img_url": imgs[idx], "title": title[idx].text, "anime_type": a_type[idx],
                              "episodes": episodes[idx].replace('eps', ''), "score": score[idx * 2].text,
                              "anime_detail": f'{ServerConfig.API_SERVER_ADDRESS}/search?type=anime&query={title[idx].text}&total_res=1'})

        response: Dict[str, Any] = {"data": top_anime}

        try:
            next_top = bs_top.find("a", {"class": "next"}).get("href").replace("type", "c")
            response["next_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{next_top}&type=anime"
        except AttributeError:
            response["next_top"] = None

        try:
            prev_top = bs_top.find("a", {"class": "prev"}).get("href").replace("type", "c")
            response["prev_top"] = f"{ServerConfig.API_SERVER_ADDRESS}/top{prev_top}&type=anime"
        except AttributeError:
            response["prev_top"] = None

        return response

