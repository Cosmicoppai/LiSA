import io
from abc import ABC, abstractmethod
from os import system
from typing import Dict, List
import subprocess
import asyncio
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

    @classmethod
    @abstractmethod
    async def play_video(cls, file_location: str):
        ...

    @staticmethod
    async def _play_video(cmd: List[str]) -> Exception:
        video_player_process = await asyncio.create_subprocess_exec(*cmd)
        _, stderr = await video_player_process.communicate()

        if stderr:
            stderr = io.TextIOWrapper(io.BytesIO(stderr).read())

        if video_player_process.returncode != 0:
            raise subprocess.CalledProcessError(video_player_process.returncode, stderr)


class MpvStream(Stream):
    _PLAYER_NAME: str = "mpv"

    @classmethod
    async def play_video(cls, file_location: str):
        await cls._play_video(shlex.split(f'mpv "{file_location}" --fs=yes --ontop'))


class VlcStream(Stream):
    _PLAYER_NAME: str = "vlc"

    @classmethod
    async def play_video(cls, file_location: str):
        await cls._play_video(shlex.split(f'vlc "{file_location}" --fullscreen'))


