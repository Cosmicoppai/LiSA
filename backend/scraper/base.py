import asyncio
from abc import ABC
import aiohttp
from utils.headers import get_headers
import logging
from random import choice
from typing import Tuple
from multidict import CIMultiDictProxy


class Scraper(ABC):
    session: aiohttp.ClientSession = None
    api_url: str = None
    content: bytes = None

    @classmethod
    async def set_session(cls):
        if not cls.session:
            cls.session = aiohttp.ClientSession()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        if self.session:
            await self.session.close()

    @classmethod
    async def get_api(cls, data: dict, headers: dict = get_headers()) -> dict:
        return await (await cls.get(cls.api_url, data, headers)).json()

    @classmethod
    async def get(cls, url: str, data=None, headers: dict = get_headers()) -> aiohttp.ClientResponse:
        if not cls.session:
            await Scraper.set_session()

        data = {} or data
        err, tries = None, 0

        while tries < 10:
            try:
                async with cls.session.get(url=url, params=data, headers=headers) as resp:
                    if resp.status != 200:
                        err = f"request failed with status: {resp.status}\n err msg: {resp.content}"
                        logging.error(f"{err}\nRetrying...")
                        raise aiohttp.ClientResponseError(None, None, message=err)

                    cls.content = await resp.read()  # read whole resp, before closing the connection
                    return resp
            except (aiohttp.ClientOSError, asyncio.TimeoutError, aiohttp.ServerDisconnectedError, aiohttp.ServerTimeoutError):
                await asyncio.sleep(choice([5, 4, 3, 2, 1]))  # randomly await
                tries += 1
                continue

        raise aiohttp.ClientResponseError(None, None, message=err)


class Proxy(Scraper):
    @classmethod
    async def get(cls, url: str, data=None, headers=None) -> Tuple[bytes, CIMultiDictProxy[str]]:
        resp = await super().get(url, data, headers)
        return cls.content, resp.headers
