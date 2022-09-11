from __future__ import annotations

import aiohttp
import asyncio
import m3u8
import os
import shutil
import requests
from Crypto.Cipher import AES
from multiprocessing import connection, Process, Pipe
import subprocess
from scraper import Animepahe, Anime
import sys
from pathlib import Path
import config
from utils.headers import get_headers
from .msg_system import MsgSystem
from .download_progress import IN_PROGRESS, LAST_PACKET_DATA
from video.library import JsonLibrary
from time import perf_counter
from datetime import datetime as dt


SEGMENT_DIR = getattr(sys, '_MEIPASS', Path(__file__).resolve().parent.parent.joinpath("segments"))
OUTPUT_DIR = config.DEFAULT_DOWNLOAD_LOCATION
SEGMENT_EXTENSION = ".ts"
RESUME_EXTENSION = ".resumeinfo.yuk"
OUTPUT_EXTENSION = ".mp4"
CONCAT_FILE_NAME = "concat_info.txt"


def _parse_resume_info(raw_file_data):
    lines = raw_file_data.split("\n")
    lines = filter(lambda line: line.startswith("SEGMENT"), lines)
    return tuple(int(line.split(" ")[1]) for line in lines)


def _write_resume_info(file_name, segment_number):
    with open(file_name, "a") as file:
        file.write(f"SEGMENT {segment_number}\n")


def _merge_segments(output_file_name):
    # Run the command to merge the downloaded files.
    output_dir: Path = SEGMENT_DIR.joinpath(output_file_name)
    input_file: Path = output_dir.joinpath(CONCAT_FILE_NAME)
    output_file: Path = OUTPUT_DIR.joinpath(f"{output_file_name}{OUTPUT_EXTENSION}")
    cmd = f"ffmpeg -f concat -safe 0 -i {input_file} -c copy {output_file} -hide_banner -loglevel warning"

    subprocess.run(
        cmd, check=True
    )
    _remove_segments(output_dir)

    JsonLibrary().add({"file_name": f"{output_file_name}{OUTPUT_EXTENSION}", "total_size": os.path.getsize(output_file),
                       "location": output_file.__str__(), "created_on": dt.now().__str__()})
    del IN_PROGRESS[output_file_name]  # delete the download status


def _remove_segments(segment_folder: str):
    if os.path.isdir(segment_folder):
        shutil.rmtree(segment_folder)


def _decrypt_worker(pipe_output, resume_file_path: str, progress_tracker, in_progress):
    global IN_PROGRESS
    IN_PROGRESS = in_progress
    while True:
        pipe_message = pipe_output.recv()

        # Break if a None object is encountered as this means that
        # no more segments will be added to the pipe,
        if pipe_message is None:
            break

        segment, key, file_name, segment_number, speed = pipe_message
        if key != b"":
            decrypted_segment = AES.new(key, AES.MODE_CBC).decrypt(segment)
        else:
            decrypted_segment = segment

        with open(file_name, "wb+") as file:
            file.write(decrypted_segment)

        # Update the resume info.
        _write_resume_info(resume_file_path, segment_number)

        # Increment the progress.
        progress_tracker.increment_done(speed)


def _write_concat_info(segment_count: int, output_file_name: str):
    print("merging started")
    # Write the concat info needed by ffmpeg to a file.
    with open(os.path.join(SEGMENT_DIR.joinpath(output_file_name), CONCAT_FILE_NAME), "w+") as file:
        for segment_number in range(segment_count):
            f = "file " + f"segment-{segment_number}{SEGMENT_EXTENSION}\n"
            file.write(f)
    _merge_segments(output_file_name)
    print("Merging completed")


async def _download_worker(downloader: Downloader, download_queue: asyncio.Queue, decrypt_pipe_input, client: aiohttp.ClientSession):

    while True:
        segment_data = await download_queue.get()
        file_name, segment, segment_number = segment_data
        _key = downloader.get_key(client, segment)  # get key to decrypt segment
        start_time = perf_counter()
        try:
            async with client.get(segment.uri) as resp:
                resp_data: bytes = await resp.read()
                key = await _key

                decrypt_pipe_input.send((resp_data, key, file_name, segment_number, resp.content_length//(perf_counter()-start_time)))
        except asyncio.TimeoutError:
            await download_queue.put(segment_data)
            print(f"Retrying segment-{segment_number}")
        download_queue.task_done()


class ProgressTracker:
    def __init__(self, file_name: str, total: int, done: int = 0, msg_pipe_input: connection.Connection = None):
        self.msg_pipe_input = msg_pipe_input
        self.total = total
        self.done = done
        self.file_name = file_name
        IN_PROGRESS[self.file_name] = {"file_size": self.total, "downloaded": self.done, "speed": 0}
        self.send_status("new_file")

    def increment_done(self, speed: int = 0) -> None:
        self.done += 1
        IN_PROGRESS[self.file_name]["downloaded"] = self.done
        IN_PROGRESS[self.file_name]["speed"] = speed
        self.send_status()

    def send_status(self, _typ: str = "file_update") -> None:
        msg = {"type": _typ, "data": {self.file_name: IN_PROGRESS[self.file_name]}}
        self.msg_pipe_input.send(msg)


class Downloader:

    def __init__(
        self,
        m3u8_str: str,
        output_file_name: str,
        resume_code=None,
        max_workers: int = 5,
        hooks: dict = {},
    ) -> None:
        self._m3u8: m3u8.M3U8 = m3u8.M3U8(m3u8_str)
        self._max_workers = max_workers
        self._output_file_name = output_file_name.replace(" ", "-")
        self._resume_code = resume_code or self._output_file_name
        self._hooks = hooks
        self.key: bytes | None = None
        self.file_dir = SEGMENT_DIR.joinpath(self._output_file_name)

    async def run(self):
        # The download queue that will be used by download workers
        download_queue: asyncio.Queue = asyncio.Queue()

        # Pipe that will be used to the download workers to send the downloaded
        # data to the decrypt process for decryption and for writing to the
        # disk.
        decrypt_pipe_output, decrypt_pipe_input = Pipe()
        timeout = aiohttp.ClientTimeout(25)
        client = aiohttp.ClientSession(headers=get_headers({"referer": "https://kwik.cx", "origin": "https://kwik.cx"}), timeout=timeout, raise_for_status=True)

        # Check if the m3u8 file passed in has multiple streams, if this is the
        # case then select the stream with the highest "bandwidth" specified.
        if len(self._m3u8.playlists):
            if self._hooks.get("playlist_selector", None):
                stream_uri = self._hooks["playlist_selector"](self._m3u8.playlists).uri
            else:
                stream_uri = max(
                    *self._m3u8.playlists, key=lambda p: p.stream_info.bandwidth
                ).uri
            resp = await client.get(stream_uri)
            stream = m3u8.M3U8(await resp.text())
        else:
            stream = self._m3u8

        # Make sure the SEGMENT_DIR exists.
        try:
            os.makedirs(self.file_dir)
        except FileExistsError:
            ...

        resume_file_path = os.path.join(
            self.file_dir, f"{self._resume_code}{RESUME_EXTENSION}"
        )
        if os.path.isfile(resume_file_path):
            with open(resume_file_path) as file:
                resume_info = _parse_resume_info(file.read())
            print(f"Resume data found for {self._resume_code}.")
        else:
            with open(resume_file_path, "w+") as file:
                ...
            resume_info = []
            print(f"No resume data found for {self._resume_code}")

        assert len(stream.segments) != 0

        segment_list = tuple(
            filter(lambda seg: seg[0] not in resume_info, enumerate(stream.segments))
        )
        self._max_workers = min(self._max_workers, len(segment_list))  # create max workers according to rem segments

        progress_tracker = ProgressTracker(self._output_file_name, len(stream.segments), len(resume_info), MsgSystem.in_pipe)

        # Start the process that will decrypt and write the files to disk.
        decrypt_process = Process(
            target=_decrypt_worker,
            args=(decrypt_pipe_output, resume_file_path, progress_tracker, IN_PROGRESS),
            daemon=True,
        )
        decrypt_process.start()

        # Populate the download queue.
        for segment_number, segment in segment_list:
            await download_queue.put(
                (
                    os.path.join(
                        self.file_dir,
                        f"segment-{segment_number}{SEGMENT_EXTENSION}",
                    ),
                    segment,
                    segment_number,
                )
            )

        # Start the workers but wrapping the coroutines into tasks.
        print(f"Starting {self._max_workers} download workers.")
        workers = [
            asyncio.create_task(
                _download_worker(self, download_queue, decrypt_pipe_input, client)
            )
            for _ in range(self._max_workers)
        ]
        # Wait for the download workers to finish.
        await download_queue.join()

        print("Downloading finished")

        # After all the tasks in the download queue are finished,
        # put a None into the decrypt pip to stop the decrypt process.
        decrypt_pipe_input.send(None)
        decrypt_pipe_input.close()

        # Cancel all download workers.
        for worker in workers:
            worker.cancel()

        await client.close()  # CLose the http session.

        # Wait for the process to finish.
        decrypt_process.join()

        # Write the concat info and invoke ffmpeg to concatenate the files.
        _write_concat_info(
            len(stream.segments), self._output_file_name
        )

    async def get_key(self, client, segment):
        if self.key:
            return self.key

        if segment.key is not None and segment.key != "":
            key_resp = await client.get(segment.key.uri)
            self.key = await key_resp.read()
        else:
            self.key = b""
        return self.key

    @classmethod
    async def from_url(
        cls,
        url: str,
        output_file_name: str,
        resume_code=None,
        max_workers: int = 3,
        hooks: dict = {},
        headers: dict = {}
    ):
        client = aiohttp.ClientSession(headers=headers)
        resp = await client.get(url)
        resp_text = await resp.text()
        await client.close()
        return cls(resp_text, output_file_name, resume_code, max_workers, hooks)

    @classmethod
    async def from_file(
        cls,
        file_path: str,
        output_file_name: str,
        resume_code=None,
        max_workers: int = 3,
        hooks: dict = {},
    ):
        with open(file_path, "r") as file:
            _m3u8 = file.read()
        return cls(_m3u8, output_file_name, resume_code, max_workers, hooks)


class BatchDownloader:

    def __init__(self, scraper: Anime, anime_id: str, page: int = 1):
        self.scraper = scraper()
        self.anime_id = anime_id
        self.page = page

    async def run(self):
        for link in self.scraper.get_links(self.anime_id, self.page):
            manifest, _, file_name = await self.scraper.get_manifest_file(link)
            await Downloader(m3u8_str=manifest, output_file_name=file_name).run()


async def start_download(anime_session: str = None, kwik_url: str = None, site: str = "animepahe", page: int = 1):
    loop = asyncio.get_event_loop()
    if anime_session:
        loop.create_task(BatchDownloader(Animepahe, anime_session, page).run())
    elif kwik_url:
        scraper = Anime.get_scraper(site)
        manifest, _, file_name = await scraper().get_manifest_file(kwik_url)
        loop.create_task(Downloader(m3u8_str=manifest, output_file_name=file_name).run())
