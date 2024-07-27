from typing import Callable, List
from pathlib import Path
from .img_to_pdf import img_to_pdf


def get_plugin(file_format: str | None) -> Callable[[list[str] | list[Path], str], None] | None:
    match file_format:
        case "pdf":
            return img_to_pdf
        case "epub":
            ...
        case _:
            return None
