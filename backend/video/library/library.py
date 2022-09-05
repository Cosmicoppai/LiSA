"""

This file will handle the saving and extraction of metadata about downloaded files.

Example: {file_name: {total_size: int, location: str}}

"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any
import json
import sys
from pathlib import Path


class Library(ABC):
    data: List[Dict[str, Dict[str, Any]]] = []
    data_changed: bool = False  # to  track addition of data

    @classmethod
    @abstractmethod
    def get_all(cls) -> List[Dict[str, Dict[str, Any]]]:
        ...

    @classmethod
    @abstractmethod
    def save(cls) -> bool:
        ...

    @classmethod
    @abstractmethod
    def add(cls, _data: Dict[str, Dict[str, Any]]) -> None:
        ...

    @classmethod
    @abstractmethod
    def load_data(cls):
        ...


class JsonLibrary(Library):
    file_location: str = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.joinpath("library.json"))

    @classmethod
    def get_all(cls) -> List[Dict[str, Dict[str, Any]]]:
        return cls.data

    @classmethod
    def save(cls) -> bool:
        if cls.data_changed:  # if new data has been added
            print("saving data")
            with open(cls.file_location, 'w') as j_file:
                j_file.write(json.dumps(cls.data, indent=4))
            print("Data successfully saved")

            cls.data = []  # reset the in-memory data
            cls.data_changed = False
        return True

    @classmethod
    def add(cls, _data: Dict[str, Dict[str, Any]]) -> None:
        cls.data.append(_data)
        if not cls.data_changed:
            cls.data_changed = True

    @classmethod
    def load_data(cls):
        print("loading data")
        try:
            with open(cls.file_location, 'r') as j_file:
                cls.data = json.load(j_file)
        except FileNotFoundError:
            with open(cls.file_location, 'w') as j_file:
                j_file.write("[]")
                cls.data = []
