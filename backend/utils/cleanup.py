from shutil import rmtree
from os import remove


def remove_folder(file_location: str):
    try:
        rmtree(file_location)
    except FileNotFoundError or NotADirectoryError:
        ...


def remove_file(file_location: str):
    try:
        remove(file_location)
    except FileNotFoundError:
        ...