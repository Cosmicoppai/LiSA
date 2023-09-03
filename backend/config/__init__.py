from os import environ
import json
from pathlib import Path
import logging as logger
from platform import system
from typing import Dict
from dataclasses import dataclass

"----------------------------------------------------------------------------------------------------------------------------------"
# Server Configurations


@dataclass
class ServerConfig:

    API_SERVER_ADDRESS: str
    SOCKET_SERVER_ADDRESS: str


"----------------------------------------------------------------------------------------------------------------------------------"

"----------------------------------------------------------------------------------------------------------------------------------"

# Default directories and file locations


@dataclass
class FileConfig:

    DEFAULT_DIR: Path = Path(__file__).resolve().parent.parent.joinpath("defaults/")

    CONFIG_JSON_PATH: Path = Path(__file__).resolve().parent.joinpath("config.json")

    DEFAULT_DOWNLOAD_LOCATION: Path = Path(__file__).resolve().parent.parent.parent.joinpath("downloads")


"----------------------------------------------------------------------------------------------------------------------------------"


"----------------------------------------------------------------------------------------------------------------------------------"
# Database Configuration


@dataclass(frozen=True)
class DBConfig:

    DEFAULT_SQL_DIR: Path = Path(__file__).parent.parent.joinpath("sql_queries")

    DB_PATH: str = str(Path(__file__).parent.parent.joinpath("lisa"))  # database path


"----------------------------------------------------------------------------------------------------------------------------------"

# ffmpeg extensions

_ffmpeg_exts: Dict[str, str] = {"windows": "ffmpeg.exe", "linux": "ffmpeg", "darwin": "ffmpeg"}


def parse_config_json(file_path: str | Path):
    try:
        with open(file_path, "r") as config_file:
            data = json.load(config_file)
            if data.get("download_location", None):
                FileConfig.DEFAULT_DOWNLOAD_LOCATION = Path(data["download_location"])
    except FileNotFoundError:
        ...
    except PermissionError as e:
        logger.error(e)


def update_environ():
    ffmpeg_path: Path = Path(__file__).resolve().parent.parent.joinpath(_ffmpeg_exts[system().lower()])
    if Path(ffmpeg_path).exists():
        environ["ffmpeg"] = str(ffmpeg_path)
