from shutil import rmtree
from os import remove
from typing import List


def remove_folder(file_location: str):
    try:
        rmtree(file_location)
    except FileNotFoundError or NotADirectoryError:
        ...


def remove_file(file_location: str | List[str]):
    """
    written in such a way, to maintain backward compatability
    """
    try:
        if isinstance(file_location, list):
            for file in file_location:
                remove(file)
        else:
            remove(file_location)
    except FileNotFoundError:
        ...
