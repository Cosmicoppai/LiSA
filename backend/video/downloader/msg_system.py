import asyncio
import websockets
import json
from websockets.legacy.server import WebSocketServerProtocol
from websockets.exceptions import ConnectionClosed
from json import JSONDecodeError
import config
from multiprocessing.connection import Connection
from typing import Any, Dict
from video.library import DBLibrary


class MsgSystemMeta(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class MsgSystem(metaclass=MsgSystemMeta):
    connected_client: WebSocketServerProtocol = None
    _instance = None
    out_pipe: Connection = None
    in_pipe: Connection = None

    def __init__(self, port: int = 9000):
        config.SOCKET_SERVER_ADDRESS = f"ws://localhost:{port}"
        self.ws_port = port

    async def run_server(self):
        async with websockets.serve(MsgSystem._server_handler, "", self.ws_port):
            print(f"Socket server started on port: {self.ws_port}\n You can access SOCKET SERVER on {config.SOCKET_SERVER_ADDRESS}")
            await asyncio.Future()  # run forever
            self.in_pipe.send(None)  # cancel send_updates task
            self.in_pipe.close()

    @classmethod
    async def _server_handler(cls, websocket: websockets):
        try:
            async for msg in websocket:
                event = json.loads(msg)
                if event.get("type", "") == "connect" and not cls.connected_client:
                    cls.connected_client = websocket
                    print(f"connected with {websocket}")
            cls.connected_client = None
        except ConnectionClosed:
            cls.connected_client = None
        except JSONDecodeError:
            await websocket.send("Invalid connection request, pass valid JSON")
            await websocket.close(code=1000, reason="Invalid JSON")

    @classmethod
    async def send_updates(cls):
        while True:
            await asyncio.sleep(0.25)
            if cls.out_pipe.poll():  # poll for msg
                msg: Dict[str, Any] = cls.out_pipe.recv()
                if not msg:
                    break
                if cls.connected_client:  # send msg if any client is connected
                    await cls.connected_client.send(json.dumps(msg))
