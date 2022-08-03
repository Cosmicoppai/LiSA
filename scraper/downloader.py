import asyncio
import aiohttp
from typing import List, Dict
from string import ascii_letters
from random import choice
import logging
import traceback
from sys import exc_info, stdout
import os
from msg_system import MsgSystem
from pathlib import Path
from download_progress import IN_PROGRESS
from library import JsonLibrary

CHUNK_SIZE: int = 26214400  # chunk size of 25 mb

HEADERS = {
    'user-agent': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) '
                   'AppleWebKit/537.36 (KHTML, like Gecko) '
                   'Chrome/45.0.2454.101 Safari/537.36'),
    "origin": "https://kwik.cx",
    "referer": "https://kwik.cx",
}


class DownloadMeta(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class Download:
    chunk_size = CHUNK_SIZE
    event_loop = asyncio.get_event_loop()
    msg_system = MsgSystem()
    download_location = Path().resolve().parent.joinpath("downloads")

    async def download(self, url: str, file_name: str) -> bool:

        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=None)

        try:
            async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
                async with session.get(url, headers=HEADERS, timeout=None) as resp:
                    if resp.status != 200:
                        raise Exception("Bad Status: " + str(resp.status))

                    # add file_name in Dict to track download status
                    IN_PROGRESS[file_name] = {"file_size": resp.content_length, "downloaded": 0}
                    asyncio.run_coroutine_threadsafe(self.send_download_status(file_name, IN_PROGRESS[file_name], "new_file"), self.msg_system.event_loop)

                    # create file
                    file_location = self.download_location.joinpath(file_name).absolute()
                    with open(file_location, "wb") as file:
                        async for chunk in resp.content.iter_chunked(self.chunk_size):
                            IN_PROGRESS[file_name]["downloaded"] += file.write(chunk)
                            asyncio.run_coroutine_threadsafe(self.send_download_status(file_name, IN_PROGRESS[file_name]), self.msg_system.event_loop)
            JsonLibrary().add({file_name: {"total_size": resp.content_length, "location": file_location.__str__()}})
            del IN_PROGRESS[file_name]  # delete the download status
            return True

        except Exception as e:
            logging.info(f"Exception {e} failed on {url}")
            temp = traceback.format_exception(*exc_info())
            logging.error(''.join(temp))
            return False

    async def start_download(self, url: str, file_name: str) -> None:
        self.event_loop.create_task(self.download(url, file_name))

    async def send_download_status(self, file_name: str, data: Dict[str, int], _typ: str = "file_update"):
        if self.msg_system.connected_client:  # send msg if any client is connected
            msg = {"type": _typ, "data": {file_name: data}}
            await self.msg_system.send(msg)

# if __name__ == "__main__":
#     loop = asyncio.new_event_loop()
#     Download.event_loop = loop
#     url = "https://eu-991.files.nextcdn.org/get/02/65cada3812fc15c12b16bdedc925bac64a3a4e6c2d7dc48667126a7a44167c7b?file=AnimePahe_Renmei_Kuugun_Koukuu_Mahou_Ongakutai_Luminous_Witches_-_04_720p_SubsPlease.mp4&token=cGf7Cc27hKWwcD46ITijdA&expires=1658706589"
#     file_name = "AnimePahe_Kimi_no_Na_wa.mp4"
#     d = Download()
#     print(asyncio.run(d.download(url, file_name)))
