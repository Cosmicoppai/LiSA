import logging
from video.downloader.msg_system import MsgSystem
from threading import Thread
from sys import stdout
import asyncio
from video.library import JsonLibrary
import config
from api import start_api_server


def run_api_server(port: int = 8000):
    config.API_SERVER_ADDRESS = f"http://localhost:{port}"
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    print(f"server started on port: {port} \n You can access API SERVER on {config.API_SERVER_ADDRESS}")
    start_api_server(port=port)


if __name__ == "__main__":
    try:
        logging.basicConfig(stream=stdout, level=logging.ERROR)
        p1 = Thread(target=run_api_server, args=(6969, ))
        p1.daemon = True
        p1.start()
        event_loop = asyncio.new_event_loop()  # get new event loop
        asyncio.set_event_loop(event_loop)
        msg_system = MsgSystem()
        msg_system.event_loop = event_loop  # assign event loop
        event_loop.run_until_complete(msg_system.run_server())  # run socket server
    except KeyboardInterrupt:
        JsonLibrary().save()
