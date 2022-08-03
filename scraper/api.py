from json import JSONDecodeError
from library import JsonLibrary
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from typing import Tuple, Dict
from urllib.parse import urlparse
from errors import not_found_404, bad_request_400, internal_server_500
from stream import Stream


async def index(request: Request):
    return PlainTextResponse(content="Welcome to LiSA")


async def search(request: Request):
    """searches for anime

    Args:
        request (Request): accessing the app instance

    Query Params:
        anime (str): name of anime to search

    Returns:
        JSONResponse: anime details {
            "jp_anime_name":str,
            "eng_anime_name":str,
            "no_of_episodes":int,
            "session":str,
            "poster":str(url),
            "total_pages":int,
            "description": {
                "Type": str, "Episodes": str, "Status": str, "Aired":str, "Season":str, "Duration":str,
            },
            "episode_details": {
                ep_details : [{
                    episode_no (str) : {
                        "ep_session":str, "snapshot":str(url)
                    }, ...
                }]
                "next_page": str(url) or None, 
                "previous_page": str(url) or None,
            }
        }
    """
    ...


async def get_ep_details(request: Request):
    """get episodes details page number wise

    Args:
        request (Request): accessing the app instance

    Query Params:
        anime_session (str): anime session
        page (int): page number

    Returns:
        JSONResponse: episodes {
            "ep_details": [{
                "episode_number": {"ep_session":str, "snapshot":str}, ...,
            }]
            "next_page": str(url) or None, 
            "previous_page": str(url) or None,
        }
    """
    ...


async def get_stream_details(request: Request):
    """getting episode details

    Args:
        request (Request): accessing the app instance

    Query Params:
        anime_session (str): anime session
        episode_session (str): episode session

    Returns:
        JSONResponse: episode details {
            "quality_audio":{"kwik_pahewin":str(url)}, ...
        }
    """
    ...


async def stream(request: Request):
    ...


async def download(request: Request):
    ...


async def library(request: Request):
    return JSONResponse(JsonLibrary().get_all())


def play(player_name: str, video_url: str) -> Tuple[str, int]:
    try:
        Stream.play(player_name, video_url)
        return None, 200
    except OSError as error:
        return error.__str__(), 500


routes = [
    Route("/", endpoint=index, methods=["GET"]),
    Route("/search", endpoint=search, methods=["GET"]),
    Route("/ep_details", endpoint=get_ep_details, methods=["GET"]),
    Route("/stream_details", endpoint=get_stream_details, methods=["GET"]),
    Route("/stream", endpoint=stream, methods=["POST"]),
    Route("/download", endpoint=download, methods=["POST"]),
    Route("/library", endpoint=library, methods=["GET"]),
]

exception_handlers = {
    400: bad_request_400,
    404: not_found_404,
    500: internal_server_500
}

app = Starlette(
    debug=True,
    routes=routes,
    exception_handlers=exception_handlers,
    on_startup=[JsonLibrary().load_data],
    # on_shutdown=[JsonLibrary().save]
)
