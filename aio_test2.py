import ssl
import certifi
import aiohttp
import asyncio

async def main():
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    async with aiohttp.ClientSession(
        connector=aiohttp.TCPConnector(ssl=ssl_context)
    ) as session:
        async with session.get("https://i1.mangakatana.com") as r:
            print(r.status)

asyncio.run(main())