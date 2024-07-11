from typing import Callable
from pathlib import Path


def get_plugin(file_format: str | None) -> Callable[[str | Path], str] | None:
    if not file_format:
        return None
