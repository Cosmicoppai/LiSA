from __future__ import annotations
import requests
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from typing import Dict, List, Tuple, Any
import config
from utils.headers import get_headers
import re
import sys
from pathlib import Path
import string
from json import JSONDecodeError


class Anime(ABC):
    site_url: str
    api_url: str
    default_poster: str = "kaicons.jpg"
    manifest_header: dict
    session: requests.Session = requests.session()
    _SCRAPERS: Dict[str, object] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._SCRAPERS[cls._SITE_NAME] = cls

    @classmethod
    def get_scraper(cls, site_name: str) -> Anime:
        return cls._SCRAPERS.get(site_name.lower(), None)

    @abstractmethod
    def search_anime(self, anime_name: str):
        ...

    @abstractmethod
    async def get_episode_sessions(self, anime_session: str):
        ...

    @abstractmethod
    def get_episode_stream_data(self, episode_session: str):
        ...

    @abstractmethod
    def get_recommendation(self, anime_session: str) -> List[Dict[str, str]]:
        ...


class Animepahe(Anime):
    _SITE_NAME: str = "animepahe"
    site_url: str = "https://animepahe.com"
    api_url: str = "https://animepahe.com/api"
    manifest_header = get_headers({"referer": "https://kwik.cx", "origin": "https://kwik.cx"})
    manifest_location = getattr(sys, '_MEIPASS', Path().resolve().parent.joinpath("uwu.m3u8"))
    manifest_filename = "uwu.m3u8"
    master_manifest_location = getattr(sys, '_MEIPASS', Path().resolve().parent.joinpath("master.m3u8"))
    master_manifest_filename = "uwu.m3u8"

    @staticmethod
    def __minify_text(text: str) -> str:
        return re.sub(r"\s+", "", text).strip()

    def __get_minified(self, path: str) -> str:
        return self.__get_minified_uri(f"{self.site_url}{path}")

    def __get_api(self, data: dict, headers: dict = get_headers()) -> str:
        return self.session.get(f"{self.api_url}", params=data, headers=headers).json()

    def search_anime(self, input_anime: str):
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

        return self.__get_api(search_params)["data"]

    def get_episode_sessions(self, anime_session: str, page_no: str = "1") -> List[Dict[str, str | int]] | None:
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

        return self.__get_api(episodes_params, episodes_headers)

    async def get_episode_details(self, anime_session: str, page_no: str) -> Dict[str, str] | TypeError | JSONDecodeError:
        episodes = {"ep_details": [], "description": {}}

        try:
            episode_data = self.get_episode_sessions(anime_session=anime_session, page_no=page_no)

            if page_no == "1":
                description = self.get_anime_description(anime_session)
                episodes["recommendation"] = f"{config.API_SERVER_ADDRESS}/recommendation?anime_session={anime_session}"

            episodes["total_page"] = episode_data.get("last_page", -1)
            if episode_data.get("current_page") <= episode_data.get("last_page", -1):
                next_page_url = episode_data.get("next_page_url", None)
                if next_page_url:
                    next_page_url = next_page_url.replace(f"{self.api_url}?",
                                                          f"/ep_details?anime_session={anime_session}&")
                    episodes["next_page_url"] = next_page_url
                else:
                    episodes["next_page_url"] = next_page_url

                prev_page_url = episode_data.get("prev_page_url", None)
                if prev_page_url:
                    prev_page_url = prev_page_url.replace(f"{self.api_url}?",
                                                          f"/ep_details?anime_session={anime_session}&")
                    episodes["prev_page_url"] = prev_page_url
                else:
                    episodes["prev_page_url"] = prev_page_url

                episode_session = episode_data.get("data", None)
                for ep in episode_session:
                    episodes["ep_details"].append(
                        {ep["episode"]: {
                            "stream_detail": f'{config.API_SERVER_ADDRESS}/stream_detail?ep_session={ep["session"]}',
                            "snapshot": ep["snapshot"], "duration": ep["duration"]}})

                if page_no == "1":
                    episodes["description"] = await description
                else:
                    del episodes["description"]
                return episodes
            else:
                episodes["next_page"] = episode_data.get("next_page_url")
                episodes[
                    "previous_page"] = f"/ep_details?anime_session={anime_session}&page={episode_data['last_page']}"
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
                'Episodes': str, 
                'Status': str, 
                'Aired': str, 
                'Season': str, 
                'Duration': str,
            }
        """

        description: Dict[str, Any] = {
            "synopsis": "", "eng_name": "", "studio": "-", "youtube_url": "", "external_links": {},
        }

        description_header = get_headers({"referer": "{}/{}".format(self.site_url, anime_session)})
        description_response = self.session.get(f"{self.site_url}/anime/{anime_session}", headers=description_header)
        if description_response.status_code != 200:
            return description

        description_bs = BeautifulSoup(description_response.text, 'html.parser')

        synopsis = description_bs.find('div', {'class': 'anime-synopsis'})
        if synopsis:
            description['synopsis'] = synopsis.text.replace('\"', '')

        scripts = description_bs.find_all("script", src=False)[0].text.split(";")

        for var in scripts:
            _var = var.strip("\n\tlet ")
            if _var[:7] == "preview":
                url = _var[_var.index("=")+1:].strip('"').strip("'").strip(" ").strip("' ").strip('" ')
                if url.find("https://www.youtube.com") == 0 or url.find("https://youtube.com") == 0 or url.find("https://youtu.be") == 0:
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

        description['eng_name'] = details.get("english", details.get("synonyms", "-"))
        description["studio"] = details.get("studio", "-")

        return description

    def get_episode_stream_data(self, episode_session: str) -> Dict[str, List[Dict[str, str]]]:
        """getting the streaming details

        Args:
            episode_session (str): session of an episode (changes after each interval)

        Returns:
            Dict[str, List[Dict[str, str]]]: stream_data {
                'data':[{'quality': {'kwik_pahewin': str(url)}}]
            }
        """
        # episode_session = self.episode_session_dict[episode_no]
        # ep_headers = get_headers(extra='play/{}/{}'.format(anime_session, episode_session))

        ep_params = {
            'm': 'links',
            'id': episode_session,
            'p': 'kwik',
        }

        return self.__get_api(ep_params)["data"]

    def get_stream_data(self, episode_session: str):
        resp: Dict[str, str] = {}

        for data in self.get_episode_stream_data(episode_session=episode_session):
            for quality, quality_data in data.items():
                """
                    stream_dt (dict): {'quality': stream url (str)}
                """
                aud, kwik_url = quality_data["audio"], quality_data["kwik"]
                resp[aud] = resp.get(aud, f"{config.API_SERVER_ADDRESS}/master_manifest?kwik_url=") + f"{config.API_SERVER_ADDRESS}/manifest?kwik_url={kwik_url}-{quality}" + ","

        return resp

    async def get_manifest_file(self, kwik_url: str) -> (str, str, str):
        hls_data = self.get_hls_playlist(kwik_url)

        uwu_url = hls_data["manifest_url"]

        return self.session.get(uwu_url, headers=get_headers(
            extra={"origin": "https://kwik.cx", "referer": "https://kwik.cx/"})).text, uwu_url.split("/uwu.m3u8")[0], hls_data["file_name"].strip(".mp4")

    async def get_recommendation(self, anime_session: str) -> List[Dict[str, str]]:

        resp = self.session.get(f"{self.site_url}/anime/{anime_session}", params=anime_session, headers=get_headers(extra={"referer": self.site_url}))

        if resp.status_code != 200:
            raise ValueError("Invalid anime session")

        rec_bs = BeautifulSoup(resp.text, 'html.parser')

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

            rec_list.append({"jp_name": title,
                             "no_of_episodes": ep,
                             "type": typ,
                             "status": status,
                             "season": season,
                             "year": year,
                             "score": 0,
                             "session": session,
                             "poster": col_2.find("img").get("data-src", f"{config.API_SERVER_ADDRESS}/default/{self.default_poster}"),
                             "ep_details": f"{config.API_SERVER_ADDRESS}/ep_details?anime_session={session}"
                             })

        return rec_list

    @staticmethod
    def _strip_split(_data: str, strip_chr: str = " ", split_chr: str = " ") -> List[str]:
        return _data.strip(strip_chr).split(split_chr)

    def build_search_resp(self, anime_details: List[Dict]) -> List[Dict]:

        search_response: List[Dict[str, str | int]] = []

        for anime_detail in anime_details:
            search_response.append({
                "jp_name": anime_detail.get("title", None),
                "no_of_episodes": anime_detail.get("episodes", 0),
                "type": anime_detail.get("type", None),
                "status": anime_detail.get("status", None),
                "season": anime_detail.get("season", None),
                "year": anime_detail.get("year", None),
                "score": anime_detail.get("score", 0),
                "session": anime_detail.get("session", None),
                "poster": anime_detail.get("poster", f"{config.API_SERVER_ADDRESS}/default/{self.default_poster}"),
                "ep_details": f"{config.API_SERVER_ADDRESS}/ep_details?anime_session={anime_detail['session']}",
            })

        return search_response

    def get_episodes(self, anime_session: str, page: int = 1) -> list:
        episode_ids = []
        data = self.__get_api({"m": "release", "sort": "episode_desc", "id": anime_session, "page": page})
        episode_ids += [x["session"] for x in data["data"]]
        if data["last_page"] > page:
            episode_ids += self.get_episodes(anime_id, page + 1)

        return episode_ids

    def get_links(self, anime_session: str, page: int = 1) -> list:
        links = []
        for episode in self.get_episodes(anime_session, page):
            data = self.__get_api(
                {"m": "links", "id": anime_session, "session": episode, "p": "kwik"}
            )
            best_q = {"id": 0, "res": 0}
            for i, x in enumerate(data["data"]):
                for xx in x:
                    if int(xx) > best_q["res"]:
                        best_q["res"] = int(xx)
                        best_q["id"] = i
            links.append(data["data"][best_q["id"]][str(best_q["res"])]["kwik"])
        return links

    def get_hls_playlist(self, kwik_url: str) -> dict:
        stream_response = self.session.get(kwik_url, headers=get_headers(extra={"referer": self.site_url}))
        if stream_response.status_code != 200:
            raise ValueError("Invalid Kwik URL")

        data = self.__minify_text(stream_response.text)
        rx = re.compile(r"returnp}\('(.*?)',(\d\d),(\d\d),'(.*?)'.split")
        title_re = re.compile(r"<title>(.*?)</title>")
        title = title_re.search(data).group(1)
        r = rx.findall(data)
        x = r[-1]
        unpacked = self.js_unpack(x[0], x[1], x[2], x[3])
        stream_re = re.compile(r"https://(.*?)uwu.m3u8")
        return {"file_name": title, "manifest_url": stream_re.search(unpacked).group(0)}

    @staticmethod
    def int2base(x, base):
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

    def js_unpack(self, p, a, c, k):
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


class MyAL:
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

    def get_top_anime(self, anime_type: str, limit: str):
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

        top_anime_response = requests.get(f'{self.site_url}/topanime.php', params=top_anime_params, headers=top_anime_headers)

        bs_top = BeautifulSoup(top_anime_response.text, 'html.parser')

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
                              "anime_detail": f'{config.API_SERVER_ADDRESS}/search?anime={title[idx].text}&total_res=1'})

        response: Dict[str, Any] = {"data": top_anime}

        try:
            next_top = bs_top.find("a", {"class": "next"}).get("href")
            response["next_top"] = f"{config.API_SERVER_ADDRESS}/top_anime{next_top}"
        except AttributeError:
            response["next_top"] = None

        try:
            prev_top = bs_top.find("a", {"class": "prev"}).get("href")
            response["prev_top"] = f"{config.API_SERVER_ADDRESS}/top_anime{prev_top}"
        except AttributeError:
            response["prev_top"] = None

        return response
