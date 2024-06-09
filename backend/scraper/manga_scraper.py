from __future__ import annotations
from abc import abstractmethod
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from config import ServerConfig
from utils.headers import get_headers
import re
from .base import Scraper


class Manga(Scraper):
    _SITE_NAME: str = None
    site_url: str
    api_url: str
    manifest_header: dict = get_headers()
    default_poster: str = "def_manga.png"
    _SCRAPERS: Dict[str, object] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._SCRAPERS[cls._SITE_NAME] = cls

    @classmethod
    def get_scraper(cls, site_name: str) -> Manga:
        return cls._SCRAPERS.get(site_name.lower(), None)

    @abstractmethod
    def search_manga(self, manga_name: str, search_by: str = "book_name") -> List[Dict[str, str]]:
        ...

    @abstractmethod
    def get_chp_session(self, manga_session: str) -> List[Dict[int, Dict[str, str]]]:
        ...

    @abstractmethod
    def get_manga_source_data(self, chp_session: str) -> Dict[str, str]:
        ...

    @abstractmethod
    def get_recommendation(self, manga_session: str) -> List[Dict[str, str]]:
        ...


class MangaKatana(Manga):
    _SITE_NAME: str = "mangakatana"
    site_url: str = "https://mangakatana.com"
    api_url: str = "https://mangakatana.com"

    async def search_manga(self, manga_name: str, search_by: str = "book_name", page_no: int = 1, total_res: int = 20) -> Dict[str, Any]:

        resp_text = await self.get(f"{self.site_url}/page/{page_no}", data={"search": manga_name, "search_by": search_by})

        resp_text = await resp_text.text()

        resp = {"response": List[Dict[str, str]]}

        search_bs = BeautifulSoup(resp_text, 'html.parser')

        if len(search_bs.find("title").text) != len(manga_name):
            scrape_func = self.__scrape_list

            pag_list = search_bs.find("ul", {"class": "uk-pagination"})  # check if multiple pages exists or not

            if pag_list:

                resp["prev"] = f"{ServerConfig.API_SERVER_ADDRESS}/search?type=manga&page={int(page_no) - 1}&query={manga_name}" if pag_list.find(
                    "a", {"class": "prev"}) else None

                resp["next"] = f"{ServerConfig.API_SERVER_ADDRESS}/search?type=manga&page={int(page_no) + 1}&query={manga_name}" if pag_list.find(
                    "a", {"class": "next"}) else None
        else:
            scrape_func = self.__scrape_detail

        manga_list = scrape_func(search_bs)

        resp["response"] = (await manga_list)[:total_res]
        return resp

    @staticmethod
    async def __scrape_list(search_bs: BeautifulSoup) -> List[Dict[str, str]]:

        res = []

        book_list = search_bs.find("div", {"id": "book_list"})

        for title_bs in book_list.find_all("div", {"class": "item"}):
            manga = {}
            text_class = title_bs.find("div", {"class": "text"})
            manga["title"] = text_class.find('a').string
            total_chps = text_class.find('span').text.strip(" ").strip("- ").split()
            try:
                manga["total_chps"] = float(total_chps[0])
            except ValueError:
                manga["total_chps"] = float(total_chps[-1])

            manga["genres"] = []
            for genre in title_bs.find("div", {"class": "genres"}).find_all("a"):
                manga["genres"].append(genre.string)

            media = title_bs.find("div", {"class": "media"})
            media_a = media.find("div", {"class": "wrap_img"}).find("a")
            manga["poster"] = media_a.find("img")["src"]
            manga["status"] = media.find("div", {"class": "status"}).text.strip().capitalize()

            manga_session = media_a['href']
            manga["manga_detail"] = f"{ServerConfig.API_SERVER_ADDRESS}/manga_detail?session={manga_session}"
            manga["session"] = manga_session

            res.append(manga)

        return res

    @staticmethod
    async def __scrape_detail(search_bs: BeautifulSoup) -> List[Dict[str, str]]:

        manga = {}

        info = search_bs.find("div", {"class": "info"})

        manga["title"] = info.find("h1", {"class": "heading"}).string
        meta_data = info.find("ul", {"class": "meta d-table"})
        manga["total_chps"] = meta_data.find("div", {"class": "new_chap"}).text.strip(" ").split()[-1]
        manga["genres"] = []
        for genre in meta_data.find("div", {"class": "genres"}).find_all("a"):
            manga["genres"].append(genre.string)

        manga["poster"] = search_bs.find("div", {"class": "cover"}).find("img")["src"]
        manga["status"] = meta_data.find("div", {"class": "status"}).text.capitalize()
        manga_url = search_bs.find("meta", property="og:url")["content"]
        manga["manga_detail"] = f"{ServerConfig.API_SERVER_ADDRESS}/manga_detail?session={manga_url}"
        manga["session"] = manga_url

        return [manga]

    async def get_chp_session(self, manga_session: str) -> dict[str, list[Any] | dict[Any, Any] | str]:
        res = {"chapters": [], "description": {}}

        resp_text = await (await self.get(manga_session)).text()

        detail_bs = BeautifulSoup(resp_text, 'html.parser')

        for info in detail_bs.find("div", {"class": 'chapters'}).find_all("tr"):
            chp_info = info.find("div", {"class": "chapter"})
            _chp_info = chp_info.text.lstrip("Chapter ").split(":")
            chp_no, chp_name = _chp_info[0], _chp_info[-1]
            chp_session = chp_info.find("a")["href"]
            res["chapters"].append({chp_no: {
                "chp_link": f'{ServerConfig.API_SERVER_ADDRESS}/read?chp_session={chp_session}',
                "chp_name": chp_name,
                "chp_session": chp_session}})

        for meta_data in detail_bs.find("ul", {"class": "meta"}).find_all("div", {"class": ["alt_name", "authors"]}):
            if "alt_name" in meta_data["class"]:
                res["description"]["alt_name"] = meta_data.text
            else:
                res["description"]["author"] = meta_data.text

        res["description"]["summary"] = detail_bs.find("div", {"class": "summary"}).find("p").text
        res["recommendation"] = f"{ServerConfig.API_SERVER_ADDRESS}/recommendation?type=manga&manga_session={manga_session}"

        return res

    async def get_manga_source_data(self, chp_session: str) -> List[str]:
        return (await self.get_manifest_file(chp_session))[0]

    async def get_recommendation(self, manga_session: str) -> List[Dict[str, str]]:
        resp_text = await (await self.get(manga_session)).text()

        rec_bs = BeautifulSoup(resp_text, 'html.parser')

        recommendations = []

        for widget in rec_bs.find("div", {"id": "hot_book"}).find_all("div", {"class": "widget"}):

            # only add items from similar-series widget
            if widget.find("div", {"class": "widget-title"}).find("span").text.lower() == "similar series":

                for rec in widget.find_all("div", {"class": "item"}):

                    recommendation = {"title": str, "total_chps": float, "poster": str, "status": str, "manga_detail": str}  # noqa

                    recommendation["poster"] = rec.find("div", {"class": "wrap_img"}).find("img")["data-src"]
                    rec_data = rec.find("div", {"class": "text"})
                    title_data = rec_data.find("h3")
                    recommendation["title"] = title_data.text
                    recommendation["total_chps"] = float(rec_data.find("div", {"class": "chapter"}).text.strip("Chapter ").split(" ")[0])
                    recommendation["status"] = rec_data.find("div", {"class": "status"}).text
                    manga_session = title_data.find('a')['href']
                    recommendation["manga_detail"] = f"{ServerConfig.API_SERVER_ADDRESS}/manga_detail?session={manga_session}"
                    recommendation["session"] = title_data.find('a')['href']

                    recommendations.append(recommendation)
                break

        return recommendations

    async def get_manifest_file(self, chp_url) -> (List[str], '_', ("series_name", "file_name")):
        """
        This function will return all images from a particular chapter
        This func will call the self.get_manga_source_data
        It is called by downloadManager
        It is implemented as get_manifest_file to provide uniform interface

        """
        resp_text = await (await self.get(chp_url)).text()
        p = re.compile("var thzq=(.*);")  # get all image links from variable inside the script tag
        m = p.search(resp_text)
        if m:
            chp_links = m.group(1).split(";")[0].strip("[]").replace("'", "").split(",")
            if chp_links[-1] == "":
                chp_links.pop()
            series_name = chp_url.split("/")[4].split(".")[0]
            file_name = BeautifulSoup(resp_text, 'html.parser').find("select", {"name": "chapter_select"}).find("option", {"selected": "selected"}).text
            return chp_links, None, [series_name, file_name]
        return [], None, "", ""

    async def get_links(self, manga_session: str, page: int = 1) -> List[str]:
        resp_text = await (await self.get(manga_session)).text()
        resp_bs = BeautifulSoup(resp_text, 'html.parser')
        res = []
        for tr in resp_bs.find("div", {"class": "chapters"}).find_all("tr"):
            res.append(tr.find("div", {"class": "chapter"}).find("a")["href"])

        return res
