from abc import ABC, abstractmethod
from typing import List
from pathlib import Path


class Plugin(ABC):
    ext: str

    @classmethod
    @abstractmethod
    def convert(cls, file_list: List[str] | List[Path], output_filename: str):
        ...
