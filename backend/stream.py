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
        subprocess.Popen(shlex.split(f'mpv "{file_location}" --fs=yes --ontop'))


class VlcStream(Stream):
    _PLAYER_NAME: str = "vlc"

    @staticmethod
    def play_video(file_location: str):
        subprocess.Popen(shlex.split(f'vlc "{file_location}" --fullscreen'))


