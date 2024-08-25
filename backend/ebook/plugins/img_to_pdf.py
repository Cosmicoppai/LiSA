import img2pdf
from typing import List
from pathlib import Path
from .base import Plugin


class ImgToPdf(Plugin):
    ext: str = "pdf"

    @classmethod
    def convert(cls, file_list: List[str] | List[Path], output_filename: str) -> None:
        with open(output_filename, "wb") as f:
            f.write(img2pdf.convert(file_list))
