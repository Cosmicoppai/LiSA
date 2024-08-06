from typing import Type
from .img_to_pdf import ImgToPdf
from .base import Plugin


def get_plugin(file_format: str | None) -> Type[Plugin] | None:
    match file_format:
        case "pdf":
            return ImgToPdf
        case _:
            return None
