import asyncio
from json import JSONDecodeError
import requests
from video.library import JsonLibrary
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.requests import Request
from starlette.responses import PlainTextResponse, JSONResponse, Response, FileResponse
from typing import Tuple, Dict, List
from errors.http_error import not_found_404, bad_request_400, internal_server_500
from video.downloader import Download
from scraper import Animepahe, MyAL
from video.streamer import Stream
import config
from bs4 import BeautifulSoup
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from utils.headers import get_headers
from utils.master_m3u8 import build_master_manifest
from middleware.ErrorHandlerMiddleware import ErrorHandlerMiddleware


async def search(request: Request):
    """searches for anime

    Args:
        request (Request): request object

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
            "ep_details": str
        }
    """
    anime = request.query_params.get("anime", None)

    if not anime:
        return await bad_request_400(request, msg="Pass an anime name")

    with requests.Session() as session:
        try:

            anime_details = Animepahe().search_anime(session, input_anime=anime)
            search_response: List[Dict[str, str | int]] = []

            for anime_detail in anime_details:

                search_response.append({
                    "jp_name": anime_detail.get("title", None),
                    "no_of_episodes": anime_detail.get("episodes", 0),
                    "type": anime_detail.get("type", None),
                    "status": anime_detail.get("status", None),
                    "season": anime_detail.get("season", None),
                    "year": anime_detail.get("year", None),
                    "score": anime_detail.get("score", 0),
                    "session": anime_detail.get("session", None),
                    "poster": anime_detail.get("poster", "https://www.pinterest.com/pin/762163936933748159/"),
                    "ep_details": f"{config.API_SERVER_ADDRESS}/ep_details?anime_session={anime_detail['session']}",
                })

            return JSONResponse(search_response)

        except KeyError:
            return await not_found_404(request, msg="anime not found")


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
    anime_session = request.query_params.get("anime_session", None)
    page = request.query_params.get("page", "1")

    if not anime_session:
        return await bad_request_400(request, msg="Pass anime session")

    with requests.Session() as session:
        try:
            return JSONResponse(await _episode_details(session, anime_session=anime_session, page_no=page))
        except TypeError:
            return await not_found_404(request, msg="Anime, Not yet Aired...")


async def _episode_details(session: requests.Session, anime_session: str, page_no: str) -> Dict[str, str] | TypeError:
    episodes = {"ep_details": []}

    try:
        site_scraper = Animepahe()
        episode_data = site_scraper.get_episode_sessions(session, anime_session=anime_session, page_no=page_no)

        if page_no == "1":
            episodes["description"] = await Animepahe().get_anime_description(session, anime_session)

        episodes["total_page"] = episode_data.get("last_page")
        if episode_data.get("current_page") <= episode_data.get("last_page"):
            next_page_url = episode_data.get("next_page_url", None)
            if next_page_url:
                next_page_url = next_page_url.replace(site_scraper.api_url,
                                                      f"/ep_details?anime_session={anime_session}&")
                episodes["next_page_url"] = next_page_url
            else:
                episodes["next_page_url"] = next_page_url

            prev_page_url = episode_data.get("prev_page_url", None)
            if prev_page_url:
                prev_page_url = prev_page_url.replace(site_scraper.api_url,
                                                      f"/ep_details?anime_session={anime_session}&")
                episodes["prev_page_url"] = prev_page_url
            else:
                episodes["prev_page_url"] = prev_page_url

            episode_session = episode_data.get("data", None)
            for ep in episode_session:
                episodes["ep_details"].append(
                    {ep["episode"]: {"stream_detail": f'{config.API_SERVER_ADDRESS}/stream_detail?ep_session={ep["session"]}',
                                     "snapshot": ep["snapshot"], "duration": ep["duration"]}})
            return episodes
        else:
            episodes["next_page"] = episode_data.get("next_page_url")
            episodes["previous_page"] = f"/ep_details?anime_session={anime_session}&page={episode_data['last_page']}"
            return episodes
    except TypeError:
        raise TypeError


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
    # anime_session = request.query_params.get("anime_session", None)
    episode_session = request.query_params.get("ep_session", None)

    if not episode_session:  # or episode_session is None:
        return await bad_request_400(request, msg="Pass Episode sessions")

    try:
        stream_data = Animepahe().get_episode_stream_data(episode_session=episode_session)
        resp: Dict[str, str] = {}
        for data in stream_data:
            for key, val in data.items():
                """
                    stream_dt (dict): {'quality': stream url (str)}
                """
                aud, kwik_url = val["audio"], val["kwik"]
                resp[aud] = resp.get(aud, f"{config.API_SERVER_ADDRESS}/master_manifest?kwik_url=") + f"{config.API_SERVER_ADDRESS}/manifest?kwik_url={kwik_url}-{key}" + ","
        return JSONResponse(resp)
    except JSONDecodeError:
        return await not_found_404(request, msg="Pass valid anime and episode sessions")


async def stream(request: Request):
    try:
        if request.headers.get("content-type", None) != "application/json":
            return await bad_request_400(request, msg="Invalid content type")

        jb = await request.json()

        player_name = jb.get("player", None)
        if not player_name:
            return await bad_request_400(request, msg="pass video player_name")

        manifest_url = jb.get("manifest_url", None)
        if not manifest_url:
            return await bad_request_400(request, msg="pass valid manifest url")
        msg, status_code = await play(player_name.lower(), manifest_url)
        return JSONResponse({"error": msg}, status_code=status_code)
    except JSONDecodeError:
        return await bad_request_400(request, msg="Malformed body: Invalid JSON")


async def download(request: Request):
    # pahewin = request.query_params.get("pw")  # get pahewin url from query parameter
    try:
        if request.headers.get("content-type", None) != "application/json":
            return await bad_request_400(request, msg="Invalid content type")

        jb = await request.json()

        video_url = jb.get("video_url", None)
        if not video_url:
            return await bad_request_400(request, msg="Malformed body: pass valid Pahewin url")

        file_name = jb.get("file_name", None)
        if not file_name or file_name[-3:] != Animepahe.video_extension:
            return await bad_request_400(request, msg="Malformed body: pass valid filename")

        await Download().start_download(url=video_url, file_name=file_name)
        return JSONResponse({"status": "started"})

    except JSONDecodeError:
        return await bad_request_400(request, msg="Malformed body: Invalid JSON")


def get_video_url_and_name(pahewin: str) -> Tuple[str, str]:
    animepahe = Animepahe()
    f_link = animepahe.get_kwik_f_link(pahewin_url=pahewin)
    return animepahe.extract_download_details(animepahe.get_kwik_f_page(f_link), f_link)


async def library(request: Request):
    """

    Args:
        request: Request object consist of client request data

    Returns: JSONResponse Consist of all the files in the library

    """
    return JSONResponse(JsonLibrary().get_all())


async def play(player_name: str, manifest_url: str) -> Tuple[str, int]:
    try:
        await Stream.play(player_name, manifest_url)
        return None, 200
    except Exception as error:
        return str(error), 400


async def top_anime(request: Request):
    """Get top anime

    Args:
        request (Request): accessing the app instance

    Query Params:
        type (str): either of ['airing', 'upcoming', 'tv', 'movie', 'ova', 'ona', 'special', 'by_popularity', 'favorite']
        limit (str):

    Returns:
        JSONResponse: top_response {
            "<rank>" : {
                "img_url" : (str)url,
                "title" : (str),
                "anime_type" : (str),
                "episodes" : (str),
                "score" : (str),
            },
            ...
            "next_top":"api_server_address/top_anime?type=anime_type&limit=limit"
        }
    """
    anime_type = request.query_params.get("type", None)
    limit = request.query_params.get("limit", "0")

    if not anime_type or anime_type.lower() not in MyAL.anime_types_dict:
        return await bad_request_400(request, msg="Pass valid anime type")

    top_anime_response = MyAL().get_top_anime(anime_type=anime_type, limit=limit)

    if not top_anime_response["next_top"] and not top_anime_response["prev_top"]:
        return await not_found_404(request, msg="limit out of range")

    return JSONResponse(top_anime_response)


async def get_master_manifest(request: Request):
    kwik_urls = request.query_params.get("kwik_url", None)
    if not kwik_urls:
        return await bad_request_400(request, msg="kwik url not present")

    kwik_urls = kwik_urls.split(",")
    if kwik_urls[-1] == "":
        kwik_urls.pop()

    with open("master.m3u8", "w+") as f:
        try:
            f.write(build_master_manifest(kwik_urls))
        except ValueError as err_msg:
            return await bad_request_400(request, msg=str(err_msg))

    return FileResponse(Animepahe.master_manifest_location, media_type="application/vnd.apple.mpegurl", filename=Animepahe.master_manifest_filename)


async def get_manifest(request: Request):
    kwik_url = request.query_params.get("kwik_url", None)
    if not kwik_url:
        return await bad_request_400(request, msg="kwik url not present")

    try:

        response, uwu_root_domain = await Animepahe().get_manifest_file(kwik_url)

        with open(Animepahe.manifest_location, "w+") as f:
            f.write(response.replace(uwu_root_domain, f"{config.API_SERVER_ADDRESS}/proxy?url={uwu_root_domain}"))

        return FileResponse(Animepahe.manifest_location, media_type="application/vnd.apple.mpegurl", filename=Animepahe.manifest_filename)
    except ValueError as err_msg:
        return await bad_request_400(request, msg=str(err_msg))


async def proxy(request: Request):
    """
    This function will proxy request for manifest files, encryption key and video(ts) frames

    """
    actual_url = request.query_params.get("url", None)
    if not actual_url:
        await bad_request_400(request, msg="url not present")

    resp = requests.get(actual_url, headers=get_headers(extra={"origin": "https://kwik.cx", "referer": "https://kwik.cx/", "accept": "*/*"}))
    return Response(resp.content, headers=resp.headers)


routes = [
    Route("/search", endpoint=search, methods=["GET"]),
    Route("/top_anime", endpoint=top_anime, methods=["GET"]),
    Route("/ep_details", endpoint=get_ep_details, methods=["GET"]),
    Route("/stream_detail", endpoint=get_stream_details, methods=["GET"]),
    Route("/stream", endpoint=stream, methods=["POST"]),
    Route("/download", endpoint=download, methods=["POST"]),
    Route("/library", endpoint=library, methods=["GET"]),
    Route("/master_manifest", endpoint=get_master_manifest, methods=["GET"]),
    Route("/manifest", endpoint=get_manifest, methods=["GET"]),
    Route('/proxy', endpoint=proxy, methods=["GET"])
]

exception_handlers = {
    400: bad_request_400,
    404: not_found_404,
    500: internal_server_500
}

middleware = [
    Middleware(ErrorHandlerMiddleware),
    Middleware(CORSMiddleware, allow_methods=["*"], allow_headers=["*"], allow_origins=["*"], allow_credentials=True)
]

app = Starlette(
    debug=True,
    routes=routes,
    exception_handlers=exception_handlers,
    middleware=middleware,
    on_startup=[JsonLibrary().load_data],
)
