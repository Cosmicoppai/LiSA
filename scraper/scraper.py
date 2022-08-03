from typing import Dict


class Anime(ABC):
    site_url: str

    @abstractmethod
    def search_anime(self, anime_name: str):
        ...

    @abstractmethod
    def get_episode_sessions(self, anime_session: str):
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
