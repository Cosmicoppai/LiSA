from abc import ABC, abstractmethod
from os import system
from typing import Dict
import subprocess
import shlex


class Stream(ABC):
    players: Dict[str, object] = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.players[cls._PLAYER_NAME] = cls

    @classmethod
    def play(cls, player_name: str, file_location: str):
        if player_name not in cls.players:
            raise ValueError("Bad player type {}".format(player_name))
        return cls.players[player_name].play_video(file_location)

    @staticmethod
    @abstractmethod
    def play_video(file_location: str):
        ...


class MpvStream(Stream):
    _PLAYER_NAME: str = "mpv"

    @staticmethod
    def play_video(file_location: str):
        try:
            subprocess.Popen(shlex.split(f'mpv "{file_location}" --fs=yes --ontop'))
        except subprocess.CalledProcessError as error:
            raise error


class VlcStream(Stream):
    _PLAYER_NAME: str = "vlc"

    @staticmethod
    def play_video(file_location: str):
        try:
            subprocess.Popen(shlex.split(f'vlc "{file_location}" --fs=yes --ontop'))
        except subprocess.CalledProcessError as error:
            raise error


if __name__ == "__main__":
    MpvStream().play("T:\\gg\\GG\\downloads\\AnimePahe_Rainbow_-_Nisha_Rokubou_no_Shichinin_-_01_FroZen.mp4")
