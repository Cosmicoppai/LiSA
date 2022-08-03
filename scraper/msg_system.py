import asyncio
import websockets
import json
from websockets.legacy.server import WebSocketServerProtocol
from typing import Dict
from download_progress import IN_PROGRESS
from websockets.exceptions import ConnectionClosed
from json import JSONDecodeError


class MsgSystemMeta(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class MsgSystem(metaclass=MsgSystemMeta):
    connected_client: WebSocketServerProtocol = None
    _instance = None
    event_loop: asyncio.ProactorEventLoop

    def __init__(self, port: int = 9000):
        self.ws_port = port

    async def run_server(self):
        async with websockets.serve(MsgSystem._server_handler, "", self.ws_port):
            print(f"Socket server started on port: {self.ws_port}")
            await asyncio.Future()  # run forever

    @classmethod
    async def _server_handler(cls, websocket: websockets):
        try:
            async for msg in websocket:
                event = json.loads(msg)
                if event.get("type", "") == "connect" and not cls.connected_client:
                    cls.connected_client = websocket
                    print("connected with: ", websocket)
                    await cls._instance.send({"type": "all_files_status", "data": IN_PROGRESS})
            cls.connected_client = None
        except ConnectionClosed:
            cls.connected_client = None
        except JSONDecodeError:
            await websocket.send("Invalid connection request, pass valid JSON")
            await websocket.close(code=1000, reason="Invalid JSON")

    @classmethod
    async def send(cls, msg: Dict[str, str]):
        await cls.connected_client.send(json.dumps(msg))


if __name__ == "__main__":
    a = MsgSystem()
    print(a.ws_port)
    print(id(MsgSystem().connected_client))
    print(id(MsgSystem().connected_client))
    print(id(MsgSystem().connected_client))
