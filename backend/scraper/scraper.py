from __future__ import annotations
import aiohttp
import asyncio
from abc import abstractmethod
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple, Any
from config import ServerConfig
from utils.headers import get_headers
import re
import string
from json import JSONDecodeError
from .base import Scraper
from utils import DB
from video.downloader.msg_system import MsgSystem


class Anime(Scraper):
    _SITE_NAME: str = None
    site_url: str
    api_url: str
    default_poster: str = "kaicons.jpg"
    manifest_header: dict
    _SCRAPERS: Dict[str, object] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._SCRAPERS[cls._SITE_NAME] = cls

    @classmethod
    def get_scraper(cls, site_name: str) -> Anime:
        return cls._SCRAPERS.get(site_name.lower(), None)

    @abstractmethod
    async def search_anime(self, anime_name: str):
        ...

    @abstractmethod
    async def get_episode_sessions(self, anime_session: str):
        ...

    @abstractmethod
    async def get_stream_data(self, anime_session: str, episode_session: str):
        ...

    @abstractmethod
    async def get_recommendation(self, anime_session: str) -> List[Dict[str, str]]:
        ...


class Animepahe(Anime):
    _SITE_NAME: str = "animepahe"
    site_url: str = "https://animepahe.ru"
    api_url: str = "https://animepahe.ru/api"
    manifest_header = get_headers({"referer": "https://kwik.cx", "origin": "https://kwik.cx"})

    @classmethod
    async def get(cls, url: str, data=None, headers: dict = get_headers()) -> aiohttp.ClientResponse:
        if not cls.session:

            cookie_req_data = {"type": "cookie_request", "site_url": cls.site_url, "user_agent": headers["user-agent"]}
            if MsgSystem.in_pipe:
                MsgSystem.in_pipe.send({"data": cookie_req_data})
                while True:
                    await asyncio.sleep(0.25)
                    if MsgSystem.in_pipe.poll():
                        cookies = MsgSystem.in_pipe.recv()
                        if cookies:
                            await cls.set_session(cookies)
                        break

        return await super().get(url, data, headers)

    @staticmethod
    def __minify_text(text: str) -> str:
        # remove all whitespace from text
        return re.sub(r"\s+", "", text).strip()

    async def search_anime(self, input_anime: str):
        """A scraper for searching an anime user requested

        Args:
            input_anime (str): name of the anime user entered

        Returns:
            json: response with the most significant match
        """

        search_params = {
            'm': 'search',
            'q': input_anime,
        }

        return {"response": (await self.get_api(search_params))["data"], "prev": None, "next": None}

    async def get_episode_sessions(self, anime_session: str, page_no: str = "1") -> dict:
        """scraping the sessions of all the episodes of an anime

        Args:
            anime_session (str): session of an anime (changes after each interval)
            page_no (str, optional): Page number when the episode number is greater than 30. Defaults to "1".

        Returns:
            List[Dict[str, str | int]] | None: Json with episode details
        """
        episodes_headers = get_headers({"referer": "{}/{}".format(self.site_url, anime_session)})

        episodes_params = {
            'm': 'release',
            'id': anime_session,
            'sort': 'episode_asc',
            'page': page_no,
        }

        return await self.get_api(episodes_params, episodes_headers)

    async def get_episode_details(self, anime_session: str, page_no: str) -> Dict[
                                                                                 str, str] | TypeError | JSONDecodeError:
        episodes = {"ep_details": []}

        try:
            episode_data = await self.get_episode_sessions(anime_session=anime_session, page_no=page_no)

            if page_no == "1":
                description = self.get_anime_description(anime_session)
                episodes[
                    "recommendation"] = f"{ServerConfig.API_SERVER_ADDRESS}/recommendation?anime_session={anime_session}"

            episodes["total_page"] = episode_data.get("last_page", 0)
            next_page_url = episode_data.get("next_page_url", None)
            if next_page_url:
                next_page_url = next_page_url.replace(f"{self.api_url}?",
                                                      f"{ServerConfig.API_SERVER_ADDRESS}/ep_details?anime_session={anime_session}&")
            episodes["next_page_url"] = next_page_url

            prev_page_url = episode_data.get("prev_page_url", None)
            if prev_page_url:
                prev_page_url = prev_page_url.replace(f"{self.api_url}?",
                                                      f"{ServerConfig.API_SERVER_ADDRESS}/ep_details?anime_session={anime_session}&")
            episodes["prev_page_url"] = prev_page_url

            episode_session = episode_data.get("data", None)
            for ep in episode_session:
                episodes["ep_details"].append(
                    {ep["episode"]: {
                        "stream_detail": f'{ServerConfig.API_SERVER_ADDRESS}/stream_detail?ep_session={ep["session"]}&anime_session={anime_session}',
                        "snapshot": ep["snapshot"], "duration": ep["duration"]}})

            if page_no == "1":
                episodes["description"] = await description
                cur = DB.connection.cursor()
                res = cur.execute("SELECT * FROM watchlist WHERE anime_id=?", (episodes["description"]["anime_id"],))
                episodes["mylist"] = True if res.fetchone() else False

            return episodes
        except TypeError:
            raise TypeError
        except JSONDecodeError:
            raise JSONDecodeError

    async def get_anime_description(self, anime_session: str) -> Dict[str, str]:
        """scraping the anime description

        Args:
            anime_session (str): session of an anime (changes after each interval)

        Returns:
            Dict[str, str]: description {
                'Synopsis': str, 
                'eng_anime_name': str, 
                'Type': str,
                'Status': str, 
                'Aired': str, 
                'Season': str, 
                'Duration': str,
                'Studio': str,
                'Youtube url': str,
                'External Links': Dict[str, str]
            }
        """

        description: Dict[str, Any] = {
            "synopsis": "", "eng_name": "", "studio": "-", "youtube_url": "", "external_links": {}
        }

        description_header = get_headers({"referer": "{}/{}".format(self.site_url, anime_session)})

        description_bs = BeautifulSoup(
            await (await self.get(f"{self.site_url}/anime/{anime_session}", headers=description_header)).text(),
            'html.parser')

        bookmark_href = description_bs.find("a", {"class": "fa-link"}).get("href", "0")

        description["anime_id"] = int(bookmark_href.replace("/a/", ""))

        synopsis = description_bs.find('div', {'class': 'anime-synopsis'})
        if synopsis:
            description['synopsis'] = synopsis.text.replace('\"', '')

        scripts = description_bs.find_all("script", src=False)[0].text.split(";")

        for var in scripts:
            _var = var.strip("\n\tlet ")
            if _var[:7] == "preview":
                url = _var[_var.index("=") + 1:].strip('"').strip("'").strip(" ").strip("' ").strip('" ')
                if url.find("https://www.youtube.com") == 0 or url.find("https://youtube.com") == 0 or url.find(
                        "https://youtu.be") == 0:
                    description["youtube_url"] = url
                else:
                    description["youtube_url"] = None
                break

        details: Dict[str, Any] = {}

        for info in description_bs.find('div', {'class': 'anime-info'}).find_all('p'):

            if info.has_attr("class"):
                if info["class"][0] == 'external-links':
                    for link in info.find_all("a", href=True):
                        description["external_links"][link.text] = f'https:{link["href"]}'
                    continue

            key, value = info.text.replace("\n", "").split(":", 1)
            details[key.lower()] = value

        description["eng_name"] = details.get("english", details.get("synonyms", None))
        description["type"] = details.get("type", "TV")
        description["status"] = details.get("status", "Finished Airing")
        description["aired"] = details.get("aired", None).replace("to", " to")
        description['season'], description["year"] = details.get("season", "None None").split()
        description["duration"] = details.get("duration", "0").strip()
        description["themes"] = details.get("themes", "None").split()
        description["studio"] = details.get("studio", None)

        return description

    async def get_stream_data(self, anime_session: str, episode_session: str) -> Dict[str, List[Tuple[str, str]]]:
        """getting the streaming details

        Args:
            anime_session (str): Anime session
            episode_session (str): session of an episode (changes after each interval)

        Returns:
            Dict[str, List[Dict[str, str]]]: stream_data {
                'data':[{'quality': {'kwik_pahewin': str(url)}}]
            }
        """

        resp: Dict[str, List[Tuple[str, str]] | List] = {}

        streaming_page = await self.get(f"{self.site_url}/play/{anime_session}/{episode_session}",
                                        headers=get_headers({"referer": "{}/{}".format(self.site_url,
                                                                                       anime_session)}))
        streaming_page = await streaming_page.text()

        for data in BeautifulSoup(streaming_page, 'html.parser').find("div", {"id": "resolutionMenu"}).find_all(
                "button"):
            quality, kwik_url, aud = data["data-resolution"], data["data-src"], data["data-audio"]
            """
                stream_dt (dict): {'quality': stream url (str)}
            """

            # assign empty list if aud not present else append (quality, kwik_url)
            resp.setdefault(aud, []).append((quality, kwik_url))
        return resp

    async def get_manifest_file(self, kwik_url: str) -> ('manifest_file', 'uwu_root_domain', 'file_name'):
        hls_data = await self.get_hls_playlist(kwik_url)

        uwu_url = hls_data["manifest_url"]

        return await (await self.get(uwu_url, headers=self.manifest_header)).text(), \
            re.split(r'(owo|uwu)\.m3u8', uwu_url)[0], \
            [hls_data["file_name"].split("_-")[0].lstrip("AnimePahe_"), hls_data["file_name"].strip(".mp4")]

    async def get_recommendation(self, anime_session: str) -> List[Dict[str, str]]:

        try:

            resp = await self.get(f"{self.site_url}/anime/{anime_session}", {"anime_session": anime_session},
                                  headers=get_headers(extra={"referer": self.site_url}))

            resp = await resp.text()

        except aiohttp.ClientResponseError:
            raise ValueError("Invalid anime session")

        rec_bs = BeautifulSoup(resp, 'html.parser')

        col_2s = rec_bs.find_all("div", {"class": 'col-2'})
        col_9s = rec_bs.find_all("div", {"class": 'col-9'})

        if len(col_2s) > 10:
            col_2s, col_9s = col_2s[:10], col_9s[:10]

        rec_list = []

        for idx, col_2 in enumerate(col_2s):
            col_9 = col_9s[idx]

            data = col_9.text.strip().split("\n")
            title = data[0]
            m_data = self._strip_split(data[1], split_chr="-")
            typ = m_data[0].strip()
            m_data = self._strip_split(m_data[1])
            ep = m_data[0]
            status = self._strip_split(m_data[2], strip_chr="(")[0]
            season, year = self._strip_split(data[2])

            session = self._strip_split(col_2.find("a", href=True)["href"], strip_chr="/", split_chr="/")[1]
            poster = col_2.find("img").get("data-src",
                                           f"{ServerConfig.API_SERVER_ADDRESS}/default/{self.default_poster}").replace(
                ".th.jpg", ".jpg")

            rec_list.append({"jp_name": title,
                             "no_of_episodes": ep,
                             "type": typ,
                             "status": status,
                             "season": season,
                             "year": year,
                             "score": 0,
                             "session": session,
                             "poster": poster,
                             "ep_details": f"{ServerConfig.API_SERVER_ADDRESS}/ep_details?anime_session={session}"
                             })

        return rec_list

    @staticmethod
    def _strip_split(_data: str, strip_chr: str = " ", split_chr: str = " ") -> List[str]:
        return _data.strip(strip_chr).split(split_chr)

    def build_search_resp(self, anime_details: List[Dict]) -> List[Dict]:

        search_response: List[Dict[str, str | int]] = []

        for anime_detail in anime_details:
            search_response.append({
                "title": anime_detail.get("title", None),
                "no_of_episodes": anime_detail.get("episodes", 0),
                "type": anime_detail.get("type", None),
                "status": anime_detail.get("status", None),
                "season": anime_detail.get("season", None),
                "year": anime_detail.get("year", None),
                "score": anime_detail.get("score", 0),
                "session": anime_detail.get("session", None),
                "poster": anime_detail.get("poster",
                                           f"{ServerConfig.API_SERVER_ADDRESS}/default/{self.default_poster}"),
                "ep_details": f"{ServerConfig.API_SERVER_ADDRESS}/ep_details?anime_session={anime_detail['session']}",
                "anime_id": anime_detail.get("id", None)
            })

        return search_response

    async def __get_episodes(self, anime_session: str, page: int = 1) -> list:
        return [x["session"] for x in
                (await self.get_api({"m": "release", "sort": "episode_desc", "id": anime_session, "page": page}))[
                    "data"]]

    async def get_links(self, anime_session: str, page: int = 1, aud: str = "jap") -> list:
        links = []

        stream_datas = await asyncio.gather(
            *[self.get_stream_data(anime_session, episode) for episode in
              await self.__get_episodes(anime_session, page)])
        for stream_datas in stream_datas:
            best_quality: Tuple = (0, "")
            for _stream_data in stream_datas[aud]:
                best_quality = _stream_data if best_quality[0] < _stream_data[0] else ...
            links.append(best_quality[1])
        return links

    async def get_hls_playlist(self, kwik_url: str) -> dict:
        try:
            stream_response = await self.get(kwik_url, headers=get_headers(extra={"referer": self.site_url}))
            stream_response = await stream_response.text()
        except aiohttp.ClientResponseError:
            raise ValueError("Invalid Kwik URL")

        data = self.__minify_text(stream_response)
        rx = re.compile(r"returnp}\('(.*?)',(\d*),(\d*),'(.*?)'.split")
        title_re = re.compile(r"<title>(.*?)</title>")
        title = title_re.search(data).group(1)
        r = rx.findall(data)
        x = r[-1]
        unpacked = self.js_unpack(x[0], x[1], x[2], x[3])
        stream_re = re.compile(r"https://(.*?)(owo|uwu).m3u8")
        return {"file_name": title, "manifest_url": stream_re.search(unpacked).group(0)}

    @staticmethod
    def int2base(x, base) -> str:
        digs = string.digits + string.ascii_letters
        if x < 0:
            sign = -1
        elif x == 0:
            return digs[0]
        else:
            sign = 1
        x *= sign
        digits = []
        while x:
            digits.append(digs[int(x % base)])
            x = int(x / base)
        if sign < 0:
            digits.append("-")
        digits.reverse()
        return "".join(digits)

    def js_unpack(self, p, a, c, k) -> str:
        k = k.split("|")
        a = int(a)
        c = int(c)
        d = {}
        while c > 0:
            c -= 1
            d[self.int2base(c, a)] = k[c]
        for x in d:
            if d[x] == "":
                d[x] = x
            p = re.sub(f"\\b{x}\\b", d[x], p)
        return p
