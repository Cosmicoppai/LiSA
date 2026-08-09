import aiohttp
import asyncio

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://i1.mangakatana.com") as resp:
            print(resp.status)

asyncio.run(main())
