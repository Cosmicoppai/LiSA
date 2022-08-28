from os import path
import sys

API_SERVER_ADDRESS: str

SOCKET_SERVER_ADDRESS: str

DEFAULT_DIR = path.join(getattr(sys, '_MEIPASS', path.dirname(path.dirname(path.abspath(__file__)))), "defaults/")

