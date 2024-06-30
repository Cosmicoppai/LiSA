from __future__ import annotations

import aiohttp
import asyncio
import m3u8
from os import path, makedirs
from Crypto.Cipher import AES
from multiprocessing import connection, Process, Pipe
import subprocess
from scraper import Animepahe, Anime, Manga
from pathlib import Path
from config import FileConfig
from .msg_system import MsgSystem
from video.library import DBLibrary, Library
from time import perf_counter
from utils import DB, remove_folder, get_path
import logging
from typing import List, Dict, Any, Tuple
from utils.headers import get_headers
from utils import validate_path
from sys import exc_info
from abc import ABC, abstractmethod
import traceback
from yarl import URL


def _parse_resume_info(raw_file_data: str = "", file_path: str | Path = None):

    if file_path:
        with open(file_path, "r") as f:
            raw_file_data = f.read()

    lines = raw_file_data.split("\n")
    lines = filter(lambda line: line.startswith("SEGMENT"), lines)
    return tuple(int(line.split(" ")[1]) for line in lines)


def _write_resume_info(file_name, segment_number):
    with open(file_name, "a") as file:
        file.write(f"SEGMENT {segment_number}\n")


def _decrypt_worker(pipe_output, resume_file_path: str, progress_tracker):
    while True:
        pipe_message = pipe_output.recv()

        # Break if a None object is encountered as this means that
        # no more segments will be added to the pipe,
        if pipe_message is None:
            break

        segment, key, file_name, segment_number, speed = pipe_message
        if key != b"":
            decrypted_segment = AES.new(key, AES.MODE_CBC).decrypt(segment[1])
        else:
            decrypted_segment = segment[1]

        if segment_number == 0 or segment_number == "0":
            decrypted_segment = segment[0] + decrypted_segment

        with open(file_name, "wb+") as file:
            file.write(decrypted_segment)

        # Update the resume info.
        _write_resume_info(resume_file_path, segment_number)

        # Increment the progress.
        progress_tracker.increment_done(speed)


class ProgressTracker:
    def __init__(self, file_data: dict, done: int = 0, msg_pipe_input: connection.Connection = None):
        self.msg_pipe_input = msg_pipe_input
        self.done = done
        self.file_data = file_data
        self.send_update()

    def increment_done(self, speed: int | float = 0) -> None:
        self.done += 1
        self.file_data["downloaded"] = self.done
        self.file_data["speed"] = speed
        if self.done != self.file_data["total_size"]:
            self.send_update()

    def send_update(self) -> None:
        if self.msg_pipe_input:  # if pipe exists, pass the msg
            self.msg_pipe_input.send({"data": self.file_data, "type": "downloads"})


class Downloader(ABC):

    SEGMENT_EXTENSION: str
    OUTPUT_EXTENSION: str
    MANIFEST_FILE_NAME: str = "uwu"
    MANIFEST_FILE_EXTENSION: str
    SEGMENT_DIR: Path = Path(__file__).resolve().parent.parent.joinpath("segments")
    OUTPUT_LOC: Path = FileConfig.DEFAULT_DOWNLOAD_LOCATION
    RESUME_FILENAME: str = "resumeinfo.yuk"

    def __init__(
            self,
            file_data: dict,
            library_data: Tuple[Library, dict],
            msg_system_in_pipe: Pipe = None,
            resume_code=None,
            max_workers: int = 8,
            hooks: dict = None,
            headers: dict = get_headers()
    ) -> None:

        self._max_workers = max_workers
        self.file_data = file_data  # {id: int, file_name: str, total_size: None, downloaded: None}
        self.library, self.lib_data = library_data
        self.OUTPUT_LOC: Path = Path(file_data["output_dir"])
        self.SEGMENT_DIR: Path = Path(file_data["segment_dir"])
        self.msg_system_in_pipe = msg_system_in_pipe
        self._resume_code = resume_code or self.file_data["file_name"]
        self.resume_file_path = path.join(self.SEGMENT_DIR, f"{self.RESUME_FILENAME}")
        self._hooks = hooks
        self.key: bytes | None = None
        self.headers = headers
        self.num_of_segments: int = 0

        if not self.OUTPUT_LOC.exists():
            makedirs(self.OUTPUT_LOC)

        logging.info("successfully initialized")

    def run(self):
        self.library.data = self.lib_data
        logging.info("starting download")
        asyncio.run(self._run())

    @abstractmethod
    async def _download_worker(self, download_queue: asyncio.Queue, client: aiohttp.ClientSession,
                               decrypt_pipe_input=None, downloader: Downloader = None):
        ...

    @abstractmethod
    async def _run(self):
        ...

    def parse_resume_info(self) -> List[str]:

        if path.isfile(self.resume_file_path):
            with open(self.resume_file_path) as file:
                resume_info = _parse_resume_info(file.read())
            logging.info(f"Resume data found for {self._resume_code}.")
        else:
            with open(self.resume_file_path, "w+"):
                ...
            resume_info = []
            logging.info(f"No resume data found for {self._resume_code}")

            self.update_db_record("started", 0, self.num_of_segments)

        return resume_info

    def update_db_record(self, status: str, downloaded: int, total_size: int):
        self.file_data["total_size"] = total_size
        self.file_data["downloaded"] = downloaded
        self.file_data["status"] = status
        self.library.update(self.file_data["id"], {"status": self.file_data["status"], "total_size": total_size})
        if status == "started":
            self.file_data["speed"] = 0
        self.msg_system_in_pipe.send({"data": self.file_data, "type": "downloads"})

    @staticmethod
    def read_manifest(file_path: str) -> str | List[str]:
        with open(file_path, "r") as f:
            return f.read()

    @staticmethod
    def write_manifest(file_path: str, manifest: str | List[str]):
        with open(file_path, "w") as manifest_file:
            manifest_file.write(manifest)  # write manifest data to disk


class MangaDownloader(Downloader):
    SEGMENT_EXTENSION: str = ".jpg"
    MANIFEST_FILE_EXTENSION: str = ".txt"
    OUTPUT_LOC: Path = FileConfig.DEFAULT_DOWNLOAD_LOCATION.joinpath("manga")

    def __init__(
            self,
            img_urls: List[str],
            file_data: dict,
            library_data: Tuple[Library, dict],
            msg_system_in_pipe: Pipe = None,
            resume_code=None,
            max_workers: int = 8,
            hooks: dict = None,
            headers: dict = get_headers()
    ) -> None:

        self.img_urls = img_urls
        super().__init__(file_data, library_data, msg_system_in_pipe, resume_code, max_workers, hooks, headers)
        self.progress_tracker: ProgressTracker
        self.num_of_segments: int = len(img_urls)
        self.total_size = 0

    async def _download_worker(self, download_queue: asyncio.Queue, client: aiohttp.ClientSession,
                               decrypt_pipe_input=None, downloader: Downloader = None):
        while True:
            segment_data = await download_queue.get()
            file_name, img_url, img_num = segment_data
            start_time = perf_counter()
            try:
                async with client.get(URL(img_url, encoded=True)) as resp:

                    resp_data: bytes = await resp.read()

                    with open(file_name, "wb+") as file:
                        file.write(resp_data)

                    # Increment the progress.
                    self.progress_tracker.increment_done(len(resp_data) // (perf_counter() - start_time))

                    # Update the resume info.
                    _write_resume_info(self.resume_file_path, img_num)

                    self.total_size += len(resp_data)

            except asyncio.TimeoutError:
                await download_queue.put(segment_data)
                logging.info(f"Retrying segment-{img_num}")
            except Exception as e:
                logging.error(e)
                traceback.format_exception(*exc_info())
                await download_queue.put(segment_data)
                logging.info(f"Retrying segment-{img_num}")

            download_queue.task_done()

    def run(self):
        self.library.data = self.lib_data
        asyncio.run(self._run())

    async def _run(self):
        # The download queue that will be used by download workers
        download_queue: asyncio.Queue = asyncio.Queue()

        timeout = aiohttp.ClientTimeout(25)
        client = aiohttp.ClientSession(headers=self.headers, timeout=timeout, raise_for_status=True)

        resume_info = self.parse_resume_info()

        assert self.num_of_segments != 0

        img_list = tuple(
            filter(lambda seg: seg[0] not in resume_info, enumerate(self.img_urls))
        )
        self._max_workers = min(self._max_workers,
                                self.num_of_segments)  # create max workers according to remaining segments

        self.progress_tracker = ProgressTracker(self.file_data, len(resume_info), self.msg_system_in_pipe)

        # Populate the download queue.
        for img_number, img in img_list:
            await download_queue.put(
                (
                    self.OUTPUT_LOC.joinpath(f"img-{img_number}{self.SEGMENT_EXTENSION}"),
                    img,
                    img_number,
                )
            )

        # Start the workers but wrapping the coroutines into tasks.
        logging.info(f"Starting {self._max_workers} download workers.")
        workers = [
            asyncio.create_task(
                self._download_worker(download_queue, client)
            )
            for _ in range(self._max_workers)
        ]
        # Wait for the download workers to finish.
        await download_queue.join()

        logging.info("Downloading finished")

        # Cancel all download workers.
        for worker in workers:
            worker.cancel()

        await client.close()  # CLose the http session.

        self.update_db_record("downloaded", self.num_of_segments, self.total_size)

        remove_folder(self.SEGMENT_DIR)  # remove segments

    @staticmethod
    def read_manifest(file_path: str) -> str | List[str]:
        with open(file_path, "r") as file:
            # This grabs the entire file as a string and split on new_line
            return file.read().strip().split("\n")

    @staticmethod
    def write_manifest(file_path: str, manifest: str | List[str]):
        with open(file_path, "w") as file:
            for img_url in manifest:
                print(img_url, file=file)


class VideoDownloader(Downloader):
    SEGMENT_EXTENSION: str = ".ts"
    OUTPUT_EXTENSION: str = ".mp4"
    MANIFEST_FILE_EXTENSION: str = ".m3u8"
    CONCAT_FILE_NAME: str = "concat_info.txt"
    OUTPUT_LOC: Path = FileConfig.DEFAULT_DOWNLOAD_LOCATION.joinpath("anime")

    def __init__(
            self,
            m3u8_str: str,
            file_data: dict,
            library_data: Tuple[Library, dict],
            msg_system_in_pipe: Pipe = None,
            resume_code=None,
            max_workers: int = 8,
            hooks: dict = None,
            headers: dict = get_headers()
    ) -> None:
        self._m3u8: m3u8.M3U8 = m3u8.loads(m3u8_str)
        super().__init__(file_data, library_data, msg_system_in_pipe, resume_code, max_workers, hooks, headers)
        self._output_file = self.OUTPUT_LOC.joinpath(f"{self.file_data['file_name']}{self.OUTPUT_EXTENSION}")
        self.seg_maps: Dict[str, bytes] = {}

    async def _get_map_seg(self, client: aiohttp.ClientSession, segment: m3u8.model.Segment) -> bytes:
        if segment.init_section:
            "return media segment (EXT-X-MAP)"
            return self.seg_maps.setdefault(segment.init_section.uri, await (await client.get(segment.init_section.uri)).read())
        return b''

    async def _download_worker(self, download_queue: asyncio.Queue, client: aiohttp.ClientSession,
                               decrypt_pipe_input=None, downloader: Downloader = None):
        while True:
            segment_data = await download_queue.get()
            file_name, segment, segment_number = segment_data
            try:
                _key = self.get_key(client, segment)  # get key to decrypt segment
                _map_seg = self._get_map_seg(client, segment)  # get the media segment data
                start_time = perf_counter()

                async with client.get(segment.uri) as resp:
                    resp_data: bytes = await resp.read()

                    decrypt_pipe_input.send(
                        ((await _map_seg, resp_data), await _key, file_name, segment_number,
                         resp.content_length // (perf_counter() - start_time)))

            except asyncio.TimeoutError:
                await download_queue.put(segment_data)
                logging.info(f"Retrying segment-{segment_number}")
            except Exception as e:
                logging.error(e)
                await download_queue.put(segment_data)
                logging.info(f"Retrying segment-{segment_number}")
            download_queue.task_done()

    def _merge_segments(self, input_file: str | Path, output_file: str | Path = None) -> int:  # will return length of output_file
        # Run the command to merge the downloaded files.

        if not output_file:
            output_file = self._output_file

        # check if exe present in backend folder else fallback to default option
        ffmpeg_loc = get_path("ffmpeg", Path(__file__).parent.parent.parent.parent.joinpath("./ffmpeg"))

        cmd = [
            ffmpeg_loc,
            '-f', 'concat',
            '-safe', '0',
            '-i', str(input_file),
            '-c', 'copy',
            str(output_file),
            '-hide_banner',
            '-loglevel', 'warning'
        ]

        subprocess.run(cmd, check=True, shell=False)

        remove_folder(self.SEGMENT_DIR)  # remove segments
        logging.info("Merging completed")
        return path.getsize(output_file)

    def _write_concat_info(self, segment_count: int) -> int:
        logging.info("merging started")
        # Write the concat info needed by ffmpeg to a file.
        concat_file: Path = self.SEGMENT_DIR.joinpath(self.CONCAT_FILE_NAME)
        with open(concat_file, "w+") as file:
            for segment_number in range(segment_count):
                f = "file " + f"segment-{segment_number}{self.SEGMENT_EXTENSION}\n"
                file.write(f)
        return self._merge_segments(concat_file)

    def run(self):
        self.library.data = self.lib_data
        asyncio.run(self._run())

    async def _run(self):
        # The download queue that will be used by download workers
        download_queue: asyncio.Queue = asyncio.Queue()

        # Pipe that will be used to the download workers to send the downloaded
        # data to the decrypt process for decryption and for writing to the disk.

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
            stream = m3u8.loads(await resp.text())
        else:
            stream = self._m3u8

        self.num_of_segments = len(stream.segments)

        resume_info = self.parse_resume_info()

        assert self.num_of_segments != 0  # no of streams is not equal to 0

        self.SEGMENT_EXTENSION = f".{stream.segments.uri[0].split('.')[-1]}"  # parse the segment extension from the link

        segment_list = tuple(
            filter(lambda seg: seg[0] not in resume_info, enumerate(stream.segments))
        )
        self._max_workers = min(self._max_workers,
                                self.num_of_segments)  # create max workers according to remaining segments

        progress_tracker = ProgressTracker(self.file_data, len(resume_info), self.msg_system_in_pipe)

        # Start the process that will decrypt and write the files to disk.
        decrypt_process = Process(
            target=_decrypt_worker,
            args=(decrypt_pipe_output, self.resume_file_path, progress_tracker),
            daemon=True,
        )
        decrypt_process.start()

        logging.info("Decrypt process started")

        # Populate the download queue.
        for segment_number, segment in segment_list:
            await download_queue.put(
                (
                    path.join(
                        self.SEGMENT_DIR,
                        f"segment-{segment_number}{self.SEGMENT_EXTENSION}",
                    ),
                    segment,
                    segment_number,
                )
            )

        # Start the workers but wrapping the coroutines into tasks.
        logging.info(f"Starting {self._max_workers} download workers.")
        workers = [
            asyncio.create_task(
                self._download_worker(download_queue, client, decrypt_pipe_input, self)
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
        file_size = self._write_concat_info(self.num_of_segments)

        self.update_db_record("downloaded", self.num_of_segments, file_size)

    async def get_key(self, client, segment):
        if self.key:
            return self.key

        if segment.key:
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
            hooks: dict = None,
            headers: dict = None
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
            hooks: dict = None,
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
    _Scrapers = {"video": Anime, "image": Manga}
    _DOWNLOADER = {"video": VideoDownloader, "image": MangaDownloader}
    _DEF_SITE = {"video": "animepahe", "image": "mangakatana"}
    _TaskData: Dict[int, Dict[str, Any]] = {}
    DownloadTaskQueue: asyncio.Queue = asyncio.Queue()  # all download tasks will be put into this queue

    """
    _TaskData : {id: {"process": Process Object, "status": str, task_data: List[str], "file_name": str}}
    """

    def __init__(self, no_of_workers: int = 4):
        """
        __init__ function will populate the active tasks from database
        """
        # start n task_workers to process items from DownloadTaskQueue
        loop = asyncio.get_event_loop()
        self.task_workers = [loop.create_task(self.workers()) for _ in range(no_of_workers)]
        loop.create_task(self._schedule_pending_downloads())

    @staticmethod
    def _check_ids(ids: List[int]):
        for _id in ids:
            if _id not in DownloadManager._TaskData:
                raise KeyError("Invalid id")

    @staticmethod
    async def __get_manifest__(scraper: Anime | Manga, session: str, manifest_url: str, page: int = 1) -> tuple[Any] | List[Any]:

        if session:
            manifest_data = await asyncio.gather(*[scraper.get_manifest_file(link) for link in await scraper.get_links(session, page)])
        else:
            manifest_data = [(await scraper.get_manifest_file(manifest_url))]

        return manifest_data

    @classmethod
    async def workers(cls):
        while True:
            task_id = await DownloadManager.DownloadTaskQueue.get()
            manifest, file_data, headers = cls._TaskData[task_id]["task_data"]

            task_status = cls._TaskData[task_id]["status"]
            if task_status != Status.scheduled:  # if task is in not in scheduled state
                if task_status == Status.cancelled:  # if task is in cancelled state, remove from the _Task Dict
                    del cls._TaskData[file_data["id"]]

            else:
                # start download as a new process
                logging.info(f"Task received with id {task_id} of type {file_data['type']}")

                try:

                    target = cls._DOWNLOADER[file_data["type"]](manifest, file_data=file_data, msg_system_in_pipe=MsgSystem.in_pipe,
                                                                headers=headers, library_data=(DBLibrary, DBLibrary.data))

                    p = Process(target=target.run)
                    p.start()
                    cls._TaskData[task_id]["process"] = p
                    cls._TaskData[task_id]["status"] = Status.started
                    while p.is_alive():
                        await asyncio.sleep(10)

                    if p.exitcode == 0:  # if task ended successfully
                        del cls._TaskData[file_data["id"]]  # remove task_data
                except Exception as e:
                    logging.info(f"Download process failed with error {e}")
                    logging.error(traceback.format_exception(*exc_info()))

    @classmethod
    async def _schedule_pending_downloads(cls):
        await cls.create_task_from_db(DBLibrary.get({"status": "downloaded"}, negate=True))  # re-start already started download

    @classmethod
    async def create_task_from_db(cls, _tasks):
        tasks = []
        for row in _tasks:
            file_data = {"id": row["id"], "type": row["type"], "status": row["status"], "file_name": row["file_name"],
                         "total_size": row["total_size"],
                         "downloaded": 0}

            scraper_typ = cls._Scrapers[row["type"]]

            manifest_file_path = row["manifest_file_path"]

            try:
                manifest = cls._DOWNLOADER[row["type"]].read_manifest(manifest_file_path)
                def_site = cls._DEF_SITE[row["type"]]
                header = scraper_typ.get_scraper(row.get("site", def_site)).manifest_header
                tasks.append(cls._schedule_download(row["type"], [row["series_name"], row["file_name"]],
                                                    header, file_data, manifest=manifest))
            except FileNotFoundError:
                logging.error("manifest file not found, deleting record...")
                DBLibrary.delete(row["id"])

        await asyncio.gather(*tasks)  # schedule all remaining tasks

    @classmethod
    async def schedule(cls, typ: str, session: str = None, manifest_url: str = None, site: str = "animepahe", page: int = 1):

        scraper = cls._Scrapers[typ].get_scraper(site)()
        if not scraper:
            raise AttributeError("Site not supported")

        manifest_datas = await cls.__get_manifest__(scraper, session, manifest_url, page)

        await asyncio.gather(
            *[cls._schedule_download(typ, data[2], scraper.manifest_header, manifest=data[0]) for data in manifest_datas])

    @classmethod
    async def _schedule_download(cls, typ: str, _file_name: List[str], header: str, file_data: dict = None, manifest: str = None) -> None:

        downloader = cls._DOWNLOADER[typ]
        series_name, seg_name = validate_path(_file_name)
        seg_dir: Path = downloader.SEGMENT_DIR.joinpath(series_name).joinpath(seg_name)
        manifest_file_path: Path = seg_dir.joinpath(f"{downloader.MANIFEST_FILE_NAME}{downloader.MANIFEST_FILE_EXTENSION}")

        if not seg_dir.exists():
            makedirs(seg_dir)  # create seg directory
            downloader.write_manifest(manifest_file_path, manifest)

        """
        Create recursive folder in-case of manga (downloads/manga_name/chp_name).
        Create recursive folder with actual file (downloads/anime_name/ep_name.mp4)
        """
        ext = downloader.OUTPUT_EXTENSION if typ == "video" else ""
        output_dir: Path = downloader.OUTPUT_LOC.joinpath(series_name).joinpath(f"{seg_name}")

        if file_data:
            file_data["downloaded"] = len(_parse_resume_info(file_path=seg_dir.joinpath(downloader.RESUME_FILENAME)))
        else:
            file_data = cls.create_data(_file_name, typ, manifest_file_path.__str__(),
                                        output_dir.joinpath(f"{_file_name[1]}{ext}").__str__())

        if MsgSystem.in_pipe:
            MsgSystem.in_pipe.send({"data": file_data, "type": "downloads"})  # send msg to update about the status

        file_data["output_dir"] = output_dir.__str__()
        file_data["segment_dir"] = seg_dir.__str__()

        # add task_data and metadata for tracking and scheduling
        cls._TaskData[file_data["id"]] = {"status": Status.scheduled, "file_name": seg_name, "task_data": (manifest, file_data, header)}
        await cls.DownloadTaskQueue.put(file_data["id"])  # put task in download queue

    @classmethod
    def create_data(cls, _file_name: List[str], typ: str, manifest_file_path: str, output_file: str) -> Dict[str, str | int]:
        """
        This function will save the metaData into DB and serialize it into python dict.
        This dict will act as the base format while saving the status into database.
        """
        _id = DB.get_id()

        DBLibrary.create({"id": _id, "type": typ, "series_name": _file_name[0], "file_name": _file_name[1], "status": "scheduled",
                          "total_size": 0, "manifest_file_path": manifest_file_path,
                          "file_location": output_file})

        return {"id": _id, "type": typ, "status": "scheduled", "file_name": _file_name[1],
                "total_size": None, "downloaded": None}

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

        _process: Process = task.get("process", None)

        if _process:
            _process.kill()  # kill the process

        # remove record from DB
        DBLibrary.delete(task_id)

        # remove related files
        remove_folder(cls._TaskData[task_id]["task_data"][1]["segment_dir"])

        # remove from cls._TaskData
        del cls._TaskData[task_id]


class Status:
    scheduled = 1
    started = 2
    paused = 3
    cancelled = 4
