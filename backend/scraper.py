import requests
import undetected_chromedriver as uc
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import Dict, List, Tuple, Any
import config


class Anime(ABC):
    site_url: str
    api_url: str
    file_name: str
    video_extension: str = "mp4"

    @abstractmethod
    def search_anime(self, session, anime_name: str):
        ...

    @abstractmethod
    async def get_episode_sessions(self, session, anime_session: str):
        ...

    @abstractmethod
    def get_episode_stream_data(self, episode_session: str, anime_session: str):
        ...

    def get_headers(self, extra: str = "") -> Dict[str, str]:
        return {
            "referer": "{}/{}".format(self.site_url, extra),
            "accept-language": "en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        }


class Animepahe(Anime):
    site_url: str = "https://animepahe.com"
    api_url: str = "https://animepahe.com/api?"
    file_name: str = None  # variable will be assign while scraping for kwik f link

    def __init__(self):
        self.chrome_driver_path = Path("./chromedriver.exe").parent.absolute().joinpath("chromedriver.exe").__str__()
        self.cookies: Dict[str, str] = {}

    def search_anime(self, session, input_anime):
        """A scraper for searching an anime user requested

        Args:
            session: request session object
            input_anime (str): name of the anime user entered

        Returns:
            json: response with the most significant match
        """
        search_headers = self.get_headers()

        search_params = {
            'm': 'search',
            'q': input_anime,
        }

        return session.get(f"{self.site_url}/api", params=search_params, headers=search_headers).json()["data"][0]

    def get_episode_sessions(self, session, anime_session: str, page_no: str = "1") -> List[Dict[str, str | int]] | None:
        """scraping the sessions of all the episodes of an anime

        Args:
            session: request session object
            anime_session (str): session of an anime (changes after each interval)
            page_no (str, optional): Page number when the episode number is greater than 30. Defaults to "1".

        Returns:
            List[Dict[str, str | int]] | None: Json with episode details
        """
        episodes_headers = self.get_headers(extra=anime_session)

        episodes_params = {
            'm': 'release',
            'id': anime_session,
            'sort': 'episode_asc',
            'page': page_no,
        }

        return session.get(f"{self.site_url}/api", params=episodes_params, headers=episodes_headers).json()

    async def get_anime_description(self, session, anime_session: str) -> Dict[str, str]:
        """scraping the anime description

        Args:
            session: request session object
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
        description_header = self.get_headers(extra=anime_session)
        description_response = session.get(f"{self.site_url}/anime/{anime_session}", headers=description_header)

        description_bs = BeautifulSoup(description_response.text, 'html.parser')

        description = {}

        synopsis = description_bs.find('div', {'class': 'anime-synopsis'}).text.replace('\"', '')
        description['Synopsis'] = synopsis

        anime_info = description_bs.find('div', {'class': 'anime-info'}).find_all('p')
        details = []
        for x in anime_info:
            details.append(x.text.replace('\n', ''))
        for i in range(len(details)):
            if 'English' in details[i]:
                description['eng_anime_name'] = details[i][9:]
            if 'Type' in details[i]:
                description['Type'] = details[i][6:]
            if 'Episodes' in details[i]:
                description['Episodes'] = details[i][10:]
            if 'Status' in details[i]:
                description['Status'] = details[i][7:]
            if 'Aired' in details[i]:
                description['Aired'] = details[i][6:].replace('to', ' to')
            if 'Season' in details[i]:
                description['Season'] = details[i][8:]
            if 'Duration' in details[i]:
                description['Duration'] = details[i][10:]

        return description

    def get_episode_stream_data(self, episode_session: str, anime_session: str) -> Dict[str, List[Dict[str, str]]]:
        """getting the streaming details

        Args:
            episode_session (str): session of an episode (changes after each interval)
            anime_session (str): session of an anime (changes after each interval)

        Returns:
            Dict[str, List[Dict[str, str]]]: stream_data {
                'data':[{'quality': {'kwik_pahewin': str(url)}}]
            }
        """
        # episode_session = self.episode_session_dict[episode_no]
        ep_headers = self.get_headers(extra='play/{}/{}'.format(anime_session, episode_session))

        ep_params = {
            'm': 'links',
            'id': episode_session,
            'p': 'kwik',
        }

        stream_data = requests.get(f"{self.site_url}/api", params=ep_params, headers=ep_headers).json()
        return stream_data["data"]

    def get_kwik_f_link(self, pahewin_url: str) -> str:
        """scraping the f link from the pahewin url

        Args:
            pahewin_url (str): https://pahe.win/*****

        Returns:
            str (url): The f link format: https://kwik.cx/f/*******
        """
        kwik_f_headers = self.get_headers()

        kwik_f_response = requests.get(pahewin_url, headers=kwik_f_headers)

        bs_f = BeautifulSoup(kwik_f_response.text, 'html.parser')

        kwik_f_link = bs_f.find('a', {'class': 'redirect'})['href']

        return kwik_f_link

    def get_kwik_f_page(self, kwik_f_url: str) -> str:
        """

        Args:
            kwik_f_url (str): from get_kwik_f_link()

        Returns:
            str: page source of f link
        """
        options = webdriver.ChromeOptions()
        # options.headless = True
        options.add_argument('--log-level=1')
        options.add_argument("--disable-blink-features=AutomationControlled")
        # options.add_argument("start-maximized")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-gpu")
        # options.add_experimental_option("excludeSwitches", ["enable-automation"])
        # options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--window-size=1,1")
        options.add_argument(
            'user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')

        driver = uc.Chrome(options=options, use_subprocess=True, driver_executable_path=self.chrome_driver_path)
        driver.set_window_size(1, 1)
        driver.set_window_position(999, 999)
        driver.get(kwik_f_url)
        WebDriverWait(driver, 20).until(lambda _driver: 'animepahe' in _driver.title.lower())
        self.cookies = driver.get_cookies()
        page_source = driver.page_source  # return page html
        driver.close()
        self.file_name = BeautifulSoup(page_source, 'html.parser').find('h1', {"class": "title"}).text.replace(" ",
                                                                                                               "").strip()
        return page_source

    def extract_download_details(self, kwik_f_page: str, kwik_f_url: str) -> Tuple[str, str]:
        """Extract download details

        Args:
            kwik_f_page (str): from get_kwik_f_page()
            kwik_f_url (str): https://kwik.cx/f/******

        Returns:
            Tuple[str, str]: response url and a file_name
        """
        bs_d = BeautifulSoup(kwik_f_page, 'html.parser')

        form_tag = bs_d.find_all('form', {'method': 'POST'})
        token = bs_d.find_all('input', {'name': '_token'})

        kwik_d_link = form_tag[0]["action"]
        data = f"_token={token[0]['value']}"
        headers = self.get_headers()
        headers["referer"] = kwik_f_url
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        headers[
            "accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
        headers["cookie"] = self._get_cookies()
        resp = requests.post(kwik_d_link, headers=headers, data=data, stream=True)
        if self.file_name[-4:] != ".mp4":
            self.file_name += ".mp4"
        # return video_url and page title without spaces
        return resp.url, self.file_name

    def _get_cookies(self) -> str:
        cookies = ""
        for cookie in self.cookies:
            cookies += f"{cookie['name']}={cookie['value']};"
        return cookies


class MyAL:
    anime_types_dict = {
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
        top_anime_headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        }

        top_anime_params = {
            'type': self.anime_types_dict[anime_type],
            'limit': limit,
        }

        top_anime_response = requests.get('https://myanimelist.net/topanime.php', params=top_anime_params,
                                          headers=top_anime_headers)

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

        for i in range(len(ranks)):
            rank = ranks[i]
            if ranks[i] == "-":
                rank = "na"
            top_anime.append({"rank": rank, "img_url": imgs[i], "title": title[i].text, "anime_type": a_type[i],
                              "episodes": episodes[i].replace('eps', ''), "score": score[i].text})

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
