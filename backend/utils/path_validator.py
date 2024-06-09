from platform import system
from sys import modules
from typing import List

_WINDOWS_INVALID_CHAR = ["/", "\\", "<", ">", ".", ":", '"', "|", "?", "*"]
_WINDOWS_INVALID_ENDINGS = ". "
_LINUX_INVALID_CHAR = ["/", ]
_LINUX_INVALID_ENDINGS = ""
_DARWIN_INVALID_CHAR = [":", "/"]
_DARWIN_INVALID_ENDINGS = ":/"


def validate_path(paths: List[str]) -> List[str]:
    invalid_chars: List[str] = getattr(modules[__name__], f"_{system().upper()}_INVALID_CHAR")
    invalid_endings: str = getattr(modules[__name__], f"_{system().upper()}_INVALID_ENDINGS")

    for idx, path in enumerate(paths):
        path = path.replace(" ", "-").rstrip(invalid_endings)
        for illegal_char in invalid_chars:
            path = path.replace(illegal_char, "")
        paths[idx] = path

    return paths
