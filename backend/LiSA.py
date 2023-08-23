import logging
from video.downloader.msg_system import MsgSystem
from threading import Thread
from sys import stdout, argv
import asyncio
from utils import DB
from config import ServerConfig, parse_config_json, update_environ, FileConfig
from api import start_api_server
from multiprocessing import Pipe, Manager, freeze_support
from video.downloader import DownloadManager
from video.library import Library
from scraper import Scraper


def run_api_server(port: int = 8000):
    ServerConfig.API_SERVER_ADDRESS = f"http://localhost:{port}"
    print(
        f"server started on port: {port} \n You can access API SERVER on {ServerConfig.API_SERVER_ADDRESS}"
    )
    start_api_server(port=port)


if __name__ == "__main__":
    freeze_support()
    try:
        logging.basicConfig(stream=stdout, level=logging.ERROR)
        DB.migrate()  # migrate the database
        DB()  # initialize the highest id

        Library.data = Manager().dict()  # update the dict into manager dict
        Library.load_datas()  # load data of all tables in-mem

        """
        update configs and environment variables
        """
        parse_config_json(FileConfig.CONFIG_JSON_PATH)
        update_environ()

        # For your development cosmic, you don't need to change your testing port number
        PORT = int(argv[1]) if (len(argv) >= 2 and argv[1]) else 6969

        t1 = Thread(target=run_api_server, args=(PORT,))
        t1.daemon = True
        t1.start()

        # initialize DownloadManager

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        DownloadManager()

        MsgSystem.out_pipe, MsgSystem.in_pipe = Pipe()
        msg_system = MsgSystem()
        loop.create_task(msg_system.send_updates())

        loop.run_until_complete(msg_system.run_server())  # run socket server
    except KeyboardInterrupt:
        DB.connection.close()
