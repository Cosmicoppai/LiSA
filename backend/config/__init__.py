import sys
import json
from functools import lru_cache
from pathlib import Path

API_SERVER_ADDRESS: str

SOCKET_SERVER_ADDRESS: str

DEFAULT_DIR = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent.joinpath("defaults/"))

CONFIG_JSON_PATH = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.joinpath("config.json"))

DEFAULT_DOWNLOAD_LOCATION: Path = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent.parent.joinpath("downloads"))


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


parse_config_json(CONFIG_JSON_PATH)
