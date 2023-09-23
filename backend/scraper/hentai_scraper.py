from __future__ import annotations
from abc import abstractmethod
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from config import ServerConfig
from utils.headers import get_headers
import re
from .base import Scraper