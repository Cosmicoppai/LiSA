import logging
from video.downloader.msg_system import MsgSystem
from threading import Thread
from sys import stdout
import asyncio
from utils import DB
import config
from api import start_api_server
from multiprocessing import Pipe
from video.downloader import DownloadManager


def run_api_server(port: int = 8000):
    config.API_SERVER_ADDRESS = f"http://localhost:{port}"
    print(f"server started on port: {port} \n You can access API SERVER on {config.API_SERVER_ADDRESS}")
    start_api_server(port=port)


if __name__ == "__main__":
    try:
        logging.basicConfig(stream=stdout, level=logging.ERROR)
        DB.migrate()  # migrate the database
        DB()  # initialize the highest id
        t1 = Thread(target=run_api_server, args=(6969, ))
        t1.daemon = True
        t1.start()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        MsgSystem.out_pipe, MsgSystem.in_pipe = Pipe()
        msg_system = MsgSystem()
        loop.create_task(msg_system.send_updates())

        # initialize DownloadManager
        DownloadManager()

        loop.run_until_complete(msg_system.run_server())  # run socket server
    except KeyboardInterrupt:
        DB.connection.close()
