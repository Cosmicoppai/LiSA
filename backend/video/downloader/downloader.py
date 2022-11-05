from __future__ import annotations

import aiohttp
import asyncio
import m3u8
import os
import requests
from Crypto.Cipher import AES
from multiprocessing import connection, Process, Pipe
import subprocess
from scraper import Animepahe, Anime
from pathlib import Path
from config import FileConfig
from .msg_system import MsgSystem
from video.library import DBLibrary, Library
from time import perf_counter
from utils import DB, remove_folder
import logging
from typing import List, Dict, Any, Tuple

SEGMENT_DIR = Path(__file__).resolve().parent.parent.joinpath("segments")
OUTPUT_DIR = FileConfig.DEFAULT_DOWNLOAD_LOCATION
SEGMENT_EXTENSION = ".ts"
RESUME_EXTENSION = ".resumeinfo.yuk"
OUTPUT_EXTENSION = ".mp4"
CONCAT_FILE_NAME = "concat_info.txt"
MANIFEST_FILE_NAME = "uwu"
MANIFEST_FILE_EXTENSION = ".m3u8"


def _parse_resume_info(raw_file_data):
    lines = raw_file_data.split("\n")
    lines = filter(lambda line: line.startswith("SEGMENT"), lines)
    return tuple(int(line.split(" ")[1]) for line in lines)


def _write_resume_info(file_name, segment_number):
    with open(file_name, "a") as file:
        file.write(f"SEGMENT {segment_number}\n")


def _merge_segments(output_file_name) -> int:  # will return length of output_file
    # Run the command to merge the downloaded files.
    seg_output_dir: Path = SEGMENT_DIR.joinpath(output_file_name)
    input_file: Path = seg_output_dir.joinpath(CONCAT_FILE_NAME)
    output_file: Path = OUTPUT_DIR.joinpath(f"{output_file_name}{OUTPUT_EXTENSION}")
    if not Path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    cmd = f"ffmpeg -f concat -safe 0 -i {input_file} -c copy {output_file} -hide_banner -loglevel warning"

    subprocess.run(
        cmd, check=True
    )
    remove_folder(seg_output_dir)  # remove segments
    logging.info("Merging completed")
    return os.path.getsize(output_file)


def _decrypt_worker(pipe_output, resume_file_path: str, progress_tracker):
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


def _write_concat_info(segment_count: int, output_file_name: str) -> int:
    logging.info("merging started")
    # Write the concat info needed by ffmpeg to a file.
    with open(os.path.join(SEGMENT_DIR.joinpath(output_file_name), CONCAT_FILE_NAME), "w+") as file:
        for segment_number in range(segment_count):
            f = "file " + f"segment-{segment_number}{SEGMENT_EXTENSION}\n"
            file.write(f)
    return _merge_segments(output_file_name)


async def _download_worker(downloader: Downloader, download_queue: asyncio.Queue, decrypt_pipe_input,
                           client: aiohttp.ClientSession):
    while True:
        segment_data = await download_queue.get()
        file_name, segment, segment_number = segment_data
        _key = downloader.get_key(client, segment)  # get key to decrypt segment
        start_time = perf_counter()
        try:
            async with client.get(segment.uri) as resp:
                resp_data: bytes = await resp.read()
                key = await _key

                decrypt_pipe_input.send(
                    (resp_data, key, file_name, segment_number, resp.content_length // (perf_counter() - start_time)))
        except asyncio.TimeoutError:
            await download_queue.put(segment_data)
            logging.info(f"Retrying segment-{segment_number}")
        except Exception as e:
            logging.error(e)
            await download_queue.put(segment_data)
            logging.info(f"Retrying segment-{segment_number}")
        download_queue.task_done()


class ProgressTracker:
    def __init__(self, file_data: dict, total: int, done: int = 0, msg_pipe_input: connection.Connection = None):
        self.msg_pipe_input = msg_pipe_input
        self.total = total
        self.done = done
        self.file_data = file_data
        self.file_data["total_size"] = self.total
        self.file_data["downloaded"] = 0
        self.send_status("started")

    def increment_done(self, speed: int = 0) -> None:
        self.done += 1
        self.file_data["downloaded"] = self.done
        self.file_data["speed"] = speed
        self.send_status()

    def send_status(self, _typ: str = "file_update") -> None:
        if self.msg_pipe_input:  # if pipe exists, pass the msg
            msg = {"type": _typ, "data": self.file_data}
            self.msg_pipe_input.send(msg)


class Downloader:

    def __init__(
            self,
            m3u8_str: str,
            file_data: dict,
            library_data: Tuple[Library, dict],
            msg_system_in_pipe: Pipe = None,
            resume_code=None,
            max_workers: int = 8,
            hooks: dict = {},
            headers: dict = {}
    ) -> None:
        self._m3u8: m3u8.M3U8 = m3u8.M3U8(m3u8_str)
        self._max_workers = max_workers
        self.file_data = file_data  # {id: int, file_name: str, total_size: None, downloaded: None}
        self.library, self.lib_data = library_data
        self._output_file_name = self.file_data["file_name"].replace(" ", "-")
        self.msg_system_in_pipe = msg_system_in_pipe
        self._resume_code = resume_code or self._output_file_name
        self._hooks = hooks
        self.key: bytes | None = None
        self.file_dir = SEGMENT_DIR.joinpath(self._output_file_name)
        self.headers = headers

    def run(self):
        self.library.data = self.lib_data
        asyncio.run(self._run())

    async def _run(self):
        # The download queue that will be used by download workers
        download_queue: asyncio.Queue = asyncio.Queue()

        # Pipe that will be used to the download workers to send the downloaded
        # data to the decrypt process for decryption and for writing to the
        # disk.
        decrypt_pipe_output, decrypt_pipe_input = Pipe()
        timeout = aiohttp.ClientTimeout(25)
        client = aiohttp.ClientSession(headers=self.headers, timeout=timeout, raise_for_status=True)

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
            logging.info(f"Resume data found for {self._resume_code}.")
        else:
            with open(resume_file_path, "w+"):
                ...
            resume_info = []
            logging.info(f"No resume data found for {self._resume_code}")

            # update total_size
            self.library.update(self.file_data["id"], {"total_size": len(stream.segments), "status": "started"})

        assert len(stream.segments) != 0

        segment_list = tuple(
            filter(lambda seg: seg[0] not in resume_info, enumerate(stream.segments))
        )
        self._max_workers = min(self._max_workers,
                                len(segment_list))  # create max workers according to remaining segments

        progress_tracker = ProgressTracker(self.file_data, len(stream.segments), len(resume_info),
                                           self.msg_system_in_pipe)

        # Start the process that will decrypt and write the files to disk.
        decrypt_process = Process(
            target=_decrypt_worker,
            args=(decrypt_pipe_output, resume_file_path, progress_tracker),
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
        logging.info(f"Starting {self._max_workers} download workers.")
        workers = [
            asyncio.create_task(
                _download_worker(self, download_queue, decrypt_pipe_input, client)
            )
            for _ in range(self._max_workers)
        ]
        # Wait for the download workers to finish.
        await download_queue.join()

        logging.info("Downloading finished")

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
        file_size = _write_concat_info(
            len(stream.segments), self._output_file_name
        )

        self.library.update(self.file_data["id"], {"status": "downloaded", "total_size": file_size})

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
            max_workers: int = 8,
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
            max_workers: int = 8,
            hooks: dict = {},
    ):
        with open(file_path, "r") as file:
            _m3u8 = file.read()
        return cls(_m3u8, output_file_name, resume_code, max_workers, hooks)


class DownloadManagerMeta(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class DownloadManager(metaclass=DownloadManagerMeta):
    _TaskData: Dict[int, Dict[str, Any]] = {}
    DownloadTaskQueue: asyncio.Queue = asyncio.Queue()  # all download tasks will be put into this queue

    """
    _TaskData : {id: {"process": Process Object, "status": str, task_data: List[str], "file_name": str}}
    """

    def __init__(self, no_of_workers: int = 1):
        """
        __init__ function will populate the active tasks from database
        """
        # start 3 task_workers to process items from DownloadTaskQueue
        loop = asyncio.get_event_loop()
        self.task_workers = [loop.create_task(self.workers()) for _ in range(no_of_workers)]
        loop.create_task(self._schedule_pending_downloads())

    @staticmethod
    def _check_ids(ids: List[int]):
        for _id in ids:
            if _id not in DownloadManager._TaskData:
                raise KeyError("Invalid id")

    @staticmethod
    async def __get_manifest__(scraper: Anime, anime_session: str, manifest_url: str, page: int = 1) -> str:
        if anime_session:
            tasks = [scraper.get_manifest_file(link) for link in scraper.get_links(anime_session, page)]
            manifest_data = await asyncio.gather(*tasks)
        else:
            manifest_data = [(await scraper.get_manifest_file(manifest_url))]

        return manifest_data

    @classmethod
    async def workers(cls) -> bool:
        while True:
            task_id = await DownloadManager.DownloadTaskQueue.get()
            manifest, file_data, headers = cls._TaskData[task_id]["task_data"]

            task_status = cls._TaskData[task_id]["status"]
            if task_status != Status.scheduled:  # if task is in paused state
                if task_status == status.cancelled:  # if task is in cancelled state, remove from the _Task Dict
                    del cls._TaskData[file_data["id"]]

            else:
                # start download as a new process
                print(f"Task received with id {task_id}")
                p = Process(target=Downloader(m3u8_str=manifest, file_data=file_data,
                                              msg_system_in_pipe=MsgSystem.in_pipe, headers=headers, library_data=(DBLibrary, Library.data)).run)
                p.start()
                cls._TaskData[task_id]["process"] = p
                cls._TaskData[task_id]["status"] = Status.started
                while p.is_alive():
                    await asyncio.sleep(10)

                if p.exitcode == 0:  # if task ended successfully
                    del cls._TaskData[file_data["id"]]  # remove task_data


    @classmethod
    async def _schedule_pending_downloads(cls):
        await cls.create_task_from_db(DBLibrary.get({"status": "scheduled"}))

    @classmethod
    async def create_task_from_db(cls, _tasks):
        tasks = []
        for row in _tasks:
            manifest_file_path = row["manifest_file_path"]

            try:
                with open(manifest_file_path, 'r') as manifest_file:
                    file_data = {"id": row["id"], "file_name": row["file_name"], "total_size": row["total_size"],
                                 "downloaded": len(_parse_resume_info(row["manifest_file_path"]))}
                    header = Anime.get_scraper(row.get("site", "animepahe")).manifest_header
                    tasks.append(cls._schedule_download(manifest_file.read(), row["file_name"], header, file_data))
            except FileNotFoundError:
                DBLibrary.delete(row["id"])

        await asyncio.gather(*tasks)  # schedule all remaining tasks

    @classmethod
    async def schedule(cls, anime_session: str = None, manifest_url: str = None, site: str = "animepahe",
                       page: int = 1):

        scraper = Anime.get_scraper(site)()
        if not scraper:
            raise AttributeError("Site not supported")

        manifest_datas = await cls.__get_manifest__(scraper, anime_session, manifest_url, page)

        await asyncio.gather(
            *[cls._schedule_download(data[0], data[2], scraper.manifest_header) for data in manifest_datas])

    @classmethod
    async def _schedule_download(cls, manifest, file_name, header, file_data: dict = None) -> None:

        seg_dir = SEGMENT_DIR.joinpath(file_name)
        manifest_file_path = seg_dir.joinpath(f"{MANIFEST_FILE_NAME}{MANIFEST_FILE_EXTENSION}")

        if not Path.exists(seg_dir):  # if manifest file doesn't exist
            os.makedirs(seg_dir)  # create seg directory
            with open(manifest_file_path, "w") as manifest_file:
                manifest_file.write(manifest)  # write manifest data to disk

        if not file_data:
            file_data = cls.create_data(file_name, manifest_file_path.__str__())

        if MsgSystem.in_pipe:
            MsgSystem.in_pipe.send({"type": "scheduled", "data": file_data})  # send msg to update about the status

        # add task_data and metadata for tracking and scheduling
        cls._TaskData[file_data["id"]] = {"status": Status.scheduled,
                                          "file_name": file_name, "task_data": (manifest, file_data, header)}
        await cls.DownloadTaskQueue.put(file_data["id"])  # put task in download queue

    @staticmethod
    def create_data(file_name: str, manifest_file_path: str) -> Dict[str, str | int]:
        """
        This function will save the metaData into DB and serialize it into python dict.
        This dict will act as the base format while saving the status into database.
        """
        _id = DB.get_id()
        file_location = OUTPUT_DIR.joinpath(f"{file_name}{OUTPUT_EXTENSION}")

        DBLibrary.create({"id": _id, "file_name": file_name, "status": "scheduled", "total_size": 0,
                          "manifest_file_path": manifest_file_path,
                          "file_location": file_location.__str__()})

        return {"id": _id, "file_name": file_name, "total_size": None, "downloaded": None}

    @classmethod
    async def pause(cls, task_ids: List[int]):
        cls._check_ids(task_ids)
        for task_id in task_ids:
            task = cls._TaskData[task_id]
            if task["status"] not in [Status.scheduled, Status.started]:
                raise AttributeError("Task doesn't have pause method")
        await asyncio.gather(*[cls._pause(task_id) for task_id in task_ids])

    @classmethod
    async def _pause(cls, task_id: int):
        task = cls._TaskData[task_id]
        status = task["status"]
        if status == Status.started:
            cls._TaskData[task_id]["process"].kill()  # kill the process
        cls._TaskData[task_id]["status"] = Status.paused
        DBLibrary.update(task_id, {"status": "paused"})

    @classmethod
    async def resume(cls, task_ids: List[int]):
        cls._check_ids(task_ids)
        for task_id in task_ids:
            task = cls._TaskData[task_id]
            if task["status"] != Status.paused:
                raise AttributeError(f"Task with {task_id} doesn't have resume method")
        await asyncio.gather(*[cls._resume(task_id) for task_id in task_ids])

    @classmethod
    async def _resume(cls, task_id: int):
        cls._TaskData[task_id]["status"] = Status.scheduled
        await DownloadManager.DownloadTaskQueue.put(task_id)
        DBLibrary.update(task_id, {"status": "scheduled"})

    @classmethod
    async def cancel(cls, task_ids: List[int]):
        cls._check_ids(task_ids)
        await asyncio.gather(*[cls._cancel(task_id) for task_id in task_ids])

    @classmethod
    async def _cancel(cls, task_id: int):
        task = cls._TaskData[task_id]

        task["process"].kill()  # kill the process

        # remove record from DB
        DBLibrary.delete(task_id)

        # remove related files
        remove_folder(SEGMENT_DIR.joinpath(cls._TaskData[task_id]["file_name"]))


class Status:
    scheduled = 1
    started = 2
    paused = 3
    cancelled = 4
