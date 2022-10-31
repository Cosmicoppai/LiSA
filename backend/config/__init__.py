import os
import sys
import json
from functools import lru_cache
from pathlib import Path
import logging as logger
from platform import system

"----------------------------------------------------------------------------------------------------------------------------------"
# Server Configurations

API_SERVER_ADDRESS: str

SOCKET_SERVER_ADDRESS: str

"----------------------------------------------------------------------------------------------------------------------------------"

"----------------------------------------------------------------------------------------------------------------------------------"

# Default directories and file locations

DEFAULT_DIR = Path(__file__).resolve().parent.parent.joinpath("defaults/")

CONFIG_JSON_PATH = Path(__file__).resolve().parent.joinpath("config.json")

DEFAULT_DOWNLOAD_LOCATION: Path = Path(__file__).resolve().parent.parent.parent.joinpath("downloads")

"----------------------------------------------------------------------------------------------------------------------------------"


"----------------------------------------------------------------------------------------------------------------------------------"
# Database Configuration

DEFAULT_SQL_DIR: Path = Path(__file__).parent.parent.joinpath("sql_queries")

DB_PATH: str = str(Path(__file__).parent.parent.joinpath("lisa"))  # database path

"----------------------------------------------------------------------------------------------------------------------------------"

# ffmpeg extensions

_ffmpeg_exts = {"windows": "ffmpeg.exe", "linux": "ffmpeg", "darwin": "ffmpeg"}


@lru_cache
def parse_config_json(file_path: str):
    global DEFAULT_DOWNLOAD_LOCATION
    try:
        with open(file_path, "r") as config_file:
            data = json.load(config_file)
            if data.get("download_location", None):
                DEFAULT_DOWNLOAD_LOCATION = Path(data["download_location"])
    except FileNotFoundError:
        ...
    except PermissionError as e:
        logger.error(e)


def update_environ():
    ffmpeg_path = Path(__file__).resolve().parent.parent.joinpath(_ffmpeg_exts[system().lower()])
    os.environ["ffmpeg"] = ffmpeg_path


parse_config_json(CONFIG_JSON_PATH)
