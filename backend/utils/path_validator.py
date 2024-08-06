from os import path
from platform import system
from sys import modules
from typing import List
import re

_WINDOWS_INVALID_CHAR = r'[<>:"/\\|?*\t]'
_WINDOWS_INVALID_ENDINGS = r'[. ]'
_LINUX_INVALID_CHAR = r'[/\t]'
_LINUX_INVALID_ENDINGS = r''
_DARWIN_INVALID_CHAR = r'[:/\t]'
_DARWIN_INVALID_ENDINGS = r'[:/]'


def validate_path(paths: List[str]) -> List[str]:
    os_type = system().upper()
    invalid_chars_pattern = getattr(modules[__name__], f"_{os_type}_INVALID_CHAR")
    invalid_endings_pattern = getattr(modules[__name__], f"_{os_type}_INVALID_ENDINGS")

    validated_paths = []
    for _path in paths:
        directory, filename = path.split(_path)
        filename = re.sub(invalid_chars_pattern, '', filename)
        filename = re.sub(r'[ \t]', '-', filename)
        filename = re.sub(f'{invalid_endings_pattern}+$', '', filename)
        max_length = 255 - len(directory) - 1
        if len(filename) > max_length:
            name, ext = path.splitext(filename)
            filename = name[:max_length - len(ext)] + ext

        validated_path = path.join(directory, filename)
        validated_paths.append(validated_path)
    return validated_paths
