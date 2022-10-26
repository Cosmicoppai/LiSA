import requests
import zipfile
import tarfile
import os
from platform import system
import subprocess
from logging import info as INFO
from logging import error as ERROR
from typing import List
import sys
from pathlib import Path
from video.downloader.msg_system import MsgSystem


def _setup():
    try:

        subprocess.run(["ffmpeg", "--help"], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)

    except FileNotFoundError:
        ERROR("ffmpeg not found, downloading will commence")

        _EXTRACT_DIR = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent)

        exts = {"Windows": ".zip", "Darwin": ".zip", "Linux": ".tar.xz"}

        supported_systems = {"Windows": "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip",
                             "Darwin": "https://evermeet.cx/ffmpeg/get/zip",
                             "Linux": "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"}

        _sys = system()
        if _sys not in supported_systems:
            raise Exception("unsupported system")

        response = requests.get(supported_systems[_sys], stream=True, allow_redirects=True)

        download_folder = _EXTRACT_DIR.joinpath(f"ffmpeg{exts[_sys]}")

        with open(download_folder, "wb") as zip_file:
            total_length = int(response.headers["Content-Length"])
            _data = {"file_name": "ffmpeg", "total_size": total_length, "downloaded": 0}
            MsgSystem.in_pipe.send({"type": "started", "data": _data})
            for data in response.iter_content(total_length // 15):
                zip_file.write(data)
                _data["downloaded"] += len(data)
                MsgSystem.in_pipe.send({"type": "file_update", "data": _data})

        INFO("downloading completed \n Extracting files")

        """
        Extract the files on the respective system and add the file location to the PATH
        """

        getattr(sys.modules[__name__], "extract_on_%s" % _sys.lower())(download_folder, _EXTRACT_DIR)


def extract_on_linux(file_location: str, extract_dir: str):
    update_linux_path(_decompress_tar(file_location, extract_dir))


def extract_on_windows(file_location: str, extract_dir: str):
    update_windows_path(_decompress_zip(file_location, extract_dir))


def extract_on_darwin(file_location: str, extract_dir: str):
    update_darwin_path(_decompress_zip(file_location, extract_dir))


def _decompress_tar(tarfile_location: str, extract_dir: str) -> str:
    with tarfile.open(tarfile_location) as file_ref:
        file_ref.extractall(extract_dir)
        return _extract_file_path(file_ref)


def _decompress_zip(zipfile_location: str, extract_dir: str) -> str:
    with zipfile.ZipFile(zipfile_location, "r") as file_ref:
        file_ref.extractall(extract_dir)
        return _extract_file_path(file_ref)


def _extract_file_path(file_ref: zipfile.ZipFile | tarfile.TarFile) -> str:
    for info in file_ref.infolist():
        _ = info.filename.split("/")
        if _.pop() in ["ffmpeg.exe", "ffmpeg"]:  # if the file is the desired executable
            return getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent.joinpath("/".join(_)))


def update_windows_path(exe_location: str):
    subprocess.call(["powershell", "-command", "& { . scripts/setup.ps1; Add-Path %s }" % exe_location])


def update_linux_path(file_location: str):
    ...


def update_darwin_path(file_location: str):
    ...


def add_file_to_path(cmd: str | List[str]):
    subprocess.call(cmd)
