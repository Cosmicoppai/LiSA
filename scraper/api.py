from collections import defaultdict
from json import JSONDecodeError
from library import JsonLibrary
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.requests import Request
from starlette.responses import PlainTextResponse, JSONResponse
from typing import Tuple, Dict
from urllib.parse import urlparse
from errors import not_found_404, bad_request_400, internal_server_500
from downloader import Download
from scraper import Animepahe, MyAL
from stream import Stream
from selenium.common.exceptions import TimeoutException


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
    anime = request.query_params.get("anime", None)

    if not anime:
        return await bad_request_400(request, msg="Pass an anime name")

    try:
        anime_details = Animepahe().search_anime(input_anime=anime)
        anime_details = {
            "jp_name": anime_details.get("title"),
            "no_of_episodes": anime_details.get("episodes"),
            "session": anime_details.get("session"),
            "poster": anime_details.get("poster"),
        }
    except KeyError:
        return await not_found_404(request, msg="anime not found")

    try:
        episodes = _episode_details(anime_details.get("session"), "1")
    except TypeError:
        return await not_found_404(request, msg="Anime {}, Not Yet Aired...".format(anime))

    anime_description = Animepahe().get_anime_description(anime_session=anime_details["session"])

    anime_details["description"] = anime_description
    anime_details["episode_details"] = episodes

    # a function to insert the eng_name at position(index)=1
    def insert(_dict, obj, pos):
        return {
            k: v for k, v in (
                    list(_dict.items())[:pos] + list(obj.items()) + list(_dict.items())[pos:]
            )
        }

    if "eng_anime_name" in anime_details["description"]:
        eng_name = anime_details["description"]["eng_anime_name"]
        del anime_details["description"]["eng_anime_name"]

        anime_details = insert(anime_details, {"eng_name": eng_name}, 1)
    else:
        anime_details = insert(anime_details, {"eng_name": anime_details.get("jp_name")}, 1)

    return JSONResponse(anime_details)


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
    page = request.query_params.get("page", None)

    if not anime_session:
        return await bad_request_400(request, msg="Pass anime session")

    if not page:
        page = 1

    try:
        return JSONResponse(_episode_details(anime_session=anime_session, page_no=page))
    except TypeError:
        return await not_found_404(request, msg="Anime, Not yet Aired...")


def _episode_details(anime_session: str, page_no: str) -> Dict[str, str] | TypeError:
    episodes = {"ep_details": []}

    try:
        episode_data = Animepahe().get_episode_sessions(anime_session=anime_session, page_no=page_no)

        episodes["total_page"] = episode_data.get("last_page")
        if episode_data.get("current_page") <= episode_data.get("last_page"):
            next_page_url = episode_data.get("next_page_url", None)
            if next_page_url:
                next_page_url = next_page_url.replace("https://animepahe.com/api?",
                                                      "http://localhost:6969/ep_details?anime_session={}&".format(
                                                          anime_session))
                episodes["next_page_url"] = next_page_url
            else:
                episodes["next_page_url"] = next_page_url

            prev_page_url = episode_data.get("prev_page_url", None)
            if prev_page_url:
                prev_page_url = prev_page_url.replace("https://animepahe.com/api?",
                                                      "http://localhost:6969/ep_details?anime_session={}&".format(
                                                          anime_session))
                episodes["prev_page_url"] = prev_page_url
            else:
                episodes["prev_page_url"] = prev_page_url

            episode_session = episode_data.get("data", None)
            for ep in episode_session:
                episodes["ep_details"].append(
                    {ep["episode"]: {"ep_session": ep["session"], "snapshot": ep["snapshot"]}})
            return episodes
        else:
            episodes["next_page"] = episode_data.get("next_page_url")
            episodes["previous_page"] = "localhost:6969/ep_details?anime_session={}&page={}".format(anime_session,
                                                                                                    episode_data.get(
                                                                                                        "last_page"))
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
    anime_session = request.query_params.get("anime_session", None)
    episode_session = request.query_params.get("ep_session", None)

    if anime_session is None or episode_session is None:
        return await bad_request_400(request, msg="Pass Anime and Episode sessions")

    try:
        stream_data = Animepahe().get_episode_stream_data(episode_session=episode_session, anime_session=anime_session)
        resp = defaultdict(list)
        for data in stream_data:
            for key, val in data.items():
                """
                    stream_dt (dict): {'quality': stream url (str)}
                """
                aud, stream_dt = val["audio"], {key: val["kwik_pahewin"]}
                resp[aud].append(stream_dt)
        return JSONResponse(resp)
    except JSONDecodeError:
        return await not_found_404(request, msg="Pass valid anime and episode sessions")


async def get_video_url(request: Request):
    try:
        if request.headers.get("content-type", None) != "application/json":
            return await bad_request_400(request, msg="Invalid content type")
        jb = await request.json()

        pahewin_url = jb.get("pahewin_url", None)
        if not pahewin_url:
            return await bad_request_400(request, msg="Invalid JSON body: pass valid pahewin url")

        parsed_url = urlparse(pahewin_url)
        # if url is invalid return await bad_request_400(request, msg="Invalid pahewin url")
        if not all([parsed_url.scheme, parsed_url.netloc]) or "https://pahe.win" not in pahewin_url:
            return await bad_request_400(request, msg="Invalid pahewin url")

        try:
            video_url, file_name = get_video_url_and_name(pahewin_url)
            return JSONResponse({"video_url": video_url, "file_name": file_name}, status_code=200)
        except TypeError:
            return await not_found_404(request, msg="Invalid url")
        except TimeoutException:
            return await internal_server_500(request, msg="Try again after sometime")

    except JSONDecodeError:
        return await bad_request_400(request, msg="Malformed JSON body: pass valid pahewin url")


async def stream(request: Request):
    try:
        if request.headers.get("content-type", None) != "application/json":
            return await bad_request_400(request, msg="Invalid content type")

        jb = await request.json()

        player_name = jb.get("player", None)
        if not player_name:
            return await bad_request_400(request, msg="pass video player_name")

        video_url = jb["video_url"]
        msg, status_code = play(player_name.lower(), video_url)
        return JSONResponse({"error": msg}, status_code=status_code)
    except JSONDecodeError or KeyError:
        return await bad_request_400(request, msg="Malformed body: Pass a valid video_url")


async def download(request: Request):
    # pahewin = request.query_params.get("pw")  # get pahewin url from query parameter
    try:
        if request.headers.get("content-type", None) != "application/json":
            return await bad_request_400(request, msg="Invalid content type")

        jb = await request.json()

        video_url = jb.get("video_url", None)
        if not video_url:
            return await not_found_400(request, msg="Malformed body: pass valid Pahewin url")

        file_name = jb.get("file_name", None)
        if not file_name:
            return await not_found_400(request, msg="Malformed body: pass valid Pahewin url")

        await Download().start_download(url=video_url, file_name=file_name)
        return JSONResponse({"status": "started"})

    except JSONDecodeError:
        return await not_found_400(request, msg="Malformed body: Invalid JSON")


def get_video_url_and_name(pahewin: str) -> Tuple[str, str]:
    animepahe = Animepahe()
    f_link = animepahe.get_kwik_f_link(pahewin_url=pahewin)
    return animepahe.extract_download_details(animepahe.get_kwik_f_page(f_link), f_link)


async def library(request: Request):
    return JSONResponse(JsonLibrary().get_all())


def play(player_name: str, video_url: str) -> Tuple[str, int]:
    try:
        Stream.play(player_name, video_url)
        return None, 200
    except OSError as error:
        return error.__str__(), 500


async def top_anime(request: Request):
    """Get top anime

    Args:
        request (Request): accessing the app instance

    Query Params:
        type (str): either of ['airing', 'upcoming', 'tv', 'movie', 'ova', 'ona', 'special', 'by_popularity', 'favorite']
        limit (str):
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
            "next_top":"http://localhost:6969/top_anime?type=anime_type&limit=limit"
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


routes = [
    Route("/", endpoint=index, methods=["GET"]),
    Route("/search", endpoint=search, methods=["GET"]),
    Route("/top_anime", endpoint=top_anime, methods=["GET"]),
    Route("/ep_details", endpoint=get_ep_details, methods=["GET"]),
    Route("/stream_details", endpoint=get_stream_details, methods=["GET"]),
    Route("/get_video_url", endpoint=get_video_url, methods=["POST"]),
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
