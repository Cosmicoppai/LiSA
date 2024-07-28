import json
from json import JSONDecodeError
from video.library import DBLibrary, WatchList, ReadList
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from typing import Tuple, List, Dict, Any
from errors.http_error import not_found_404, bad_request_400, internal_server_500, service_unavailable_503
from video.downloader import DownloadManager, MangaDownloader
from scraper import Animepahe, MyAL, MangaKatana, Proxy
from video.streamer import Stream
from config import ServerConfig, FileConfig
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from utils.headers import get_headers
from utils.master_m3u8 import build_master_manifest
from middleware import ErrorHandlerMiddleware, RequestValidator
import uvicorn
from starlette.routing import Mount
from urllib.parse import parse_qsl
from utils import remove_file, CustomStaticFiles
from sqlite3 import IntegrityError
from sys import modules
from glob import glob
import logging
from ebook import get_plugin


async def LiSA(request: Request):
    return Response("All servers started successfully")


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
    _type = request.query_params.get("type", "anime")

    return await getattr(modules[__name__], f"_search_{_type}")(request)


async def _search_anime(request: Request):
    anime = request.query_params.get("query", None)
    if not anime:
        return await bad_request_400(request, msg="Pass an anime name")
    total_res = int(request.query_params.get("total_res", 9))
    if total_res <= 0:
        total_res = 1
    elif total_res > 9:
        total_res = 9

    try:

        scraper = Animepahe()
        anime_details = await scraper.search_anime(input_anime=anime)

        return JSONResponse(scraper.build_search_resp(anime_details[:total_res]))

    except KeyError:
        return await not_found_404(request, msg="anime not found")

    except ValueError as err:
        logging.error(err)
        return await bad_request_400(request, msg="invalid query parameter: total_res should be type int")


async def _search_manga(request: Request):
    manga = request.query_params.get("query", None)
    page = request.query_params.get("page", 1)

    try:
        if not manga:
            return await bad_request_400(request, msg="Pass Manga name")

        page = int(page)
        if page <= 0:
            page = 1

        total_res = int(request.query_params.get("total_res", 20))
        if total_res <= 0:
            total_res = 1
        elif total_res > 20:
            total_res = 20

        return JSONResponse(await MangaKatana().search_manga(manga_name=manga, page_no=page, total_res=total_res))

    except KeyError:
        return await not_found_404(request, msg="manga not found")

    except ValueError as e:
        logging.error(e)
        return await bad_request_400(request, msg="invalid query parameter: param should be of type int")


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
    anime_id = request.query_params.get("anime_id", None)
    anime_session = request.query_params.get("anime_session", None)

    if not anime_session and not anime_id:
        return await bad_request_400(request, msg="Pass anime session or anime-id")

    scraper = Animepahe()

    if anime_id:
        redirected_url = (await scraper.get(f"{Animepahe.site_url}/a/{anime_id}")).url
        anime_session = str(redirected_url).replace(f"{Animepahe.site_url}/anime/", "")

    page = request.query_params.get("page", "1")

    try:
        return JSONResponse(await scraper.get_episode_details(anime_session=anime_session, page_no=page))
    except TypeError:
        return await not_found_404(request, msg="Anime, Not yet Aired...")
    except JSONDecodeError:
        return await not_found_404(request, msg="Anime not found")


async def get_manga_detail(request: Request):
    session = request.query_params.get("session", None)

    if not session:
        return await bad_request_400(request, msg="Pass Session")

    return JSONResponse(await MangaKatana().get_chp_session(session))


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

    if not episode_session or not anime_session:  # or episode_session is None:
        return await bad_request_400(request, msg="Pass Anime & Episode sessions")

    try:
        stream_detail = await Animepahe().get_stream_data(anime_session, episode_session)
        for audio, streams in stream_detail.items():
            master_manifest_url = f"{ServerConfig.API_SERVER_ADDRESS}/master_manifest?kwik_url="
            for stream_data in streams:
                master_manifest_url += f"{ServerConfig.API_SERVER_ADDRESS}/manifest?kwik_url={stream_data[1]}-{stream_data[0]},"

            stream_detail[audio] = master_manifest_url

        return JSONResponse(stream_detail)

    except KeyError as err:
        logging.error(err)
        return await service_unavailable_503(request, msg="Try again after sometime!")


async def stream(request: Request):
    jb = request.state.body

    player_name = jb.get("player", None)
    if not player_name:
        return await bad_request_400(request, msg="pass video player_name")

    manifest_url, _id = jb.get("manifest_url", None), jb.get("id", None)
    video_src = manifest_url or _id
    if not video_src:
        return await bad_request_400(request, msg="pass valid manifest url or video id")
    if _id:
        res = DBLibrary.get(filters={"id": _id, "type": "video"}, query=["file_location"])
        if not res:
            return JSONResponse({"error": "Invalid Id"}, status_code=400)
        video_src = res[0]["file_location"]

    msg, status_code = await play(player_name.lower(), video_src)
    return JSONResponse({"error": msg}, status_code=status_code)


async def read(request: Request):
    chp_session, _id = request.query_params.get("chp_session", None), request.query_params.get("id", None)

    if chp_session:
        return JSONResponse(await MangaKatana().get_manga_source_data(chp_session))
    elif _id:
        res = DBLibrary.get(filters={"id": _id, "type": "image"}, query=["file_location"])
        if not res:
            return JSONResponse({"error": "Invalid Id"}, status_code=400)
        img_urls = []
        for file in glob(res[0]["file_location"] + f"/*img-*[0-3]{MangaDownloader.SEGMENT_EXTENSION}"):
            file = file.lstrip(str(MangaDownloader.OUTPUT_LOC)).replace("\\", "/")
            img_urls.append(f"{ServerConfig.API_SERVER_ADDRESS}/image/manga/{file}")
        return JSONResponse(img_urls)

    return await bad_request_400(request, msg="pass chapter session or manga id")


async def download(request: Request):
    jb = request.state.body

    try:
        # if anime session or manga_session exists start batch download

        typ = "video" if (jb.get("anime_session", None) or jb.get("manifest_url", None)) else "image"

        match typ:
            case "video":
                site = "animepahe"

                if jb.get("anime_session", None):
                    await DownloadManager.schedule(typ, jb["anime_session"], site, page=jb.get("page_no", 1))

                elif jb.get("manifest_url", None):
                    await DownloadManager.schedule(typ, manifest_url=parse_qsl(jb["manifest_url"])[0][1], site=site)

            case "image":
                site = "mangakatana"

                post_processor = get_plugin(jb.get("download_as", None))

                if jb.get("manga_session", None):
                    await DownloadManager.schedule(typ, jb["manga_session"], site=site, page=jb.get("page_no", 1), post_processor=post_processor)

                elif jb.get("chp_session", None):
                    await DownloadManager.schedule(typ, manifest_url=jb["chp_session"], site=site, post_processor=post_processor)

                else:
                    return await bad_request_400(request, msg="Malformed body: pass manifest url or anime session")

            case _:
                logging.error("fuck you")

        return JSONResponse({"status": "started"})

    except ValueError as err:
        return await bad_request_400(request, msg=err.__str__())


async def pause_download(request: Request):
    try:
        task_ids = list(request.state.body.get("id", None))
        if not task_ids:
            return await bad_request_400(request, msg="download id not present")
        await DownloadManager.pause(task_ids)
        return JSONResponse({"msg": "all tasks are successfully paused"})
    except KeyError:
        return await bad_request_400(request, msg="One or more ids are invalid")
    except AttributeError as err_msg:
        return await bad_request_400(request, msg=err_msg.__str__())


async def resume_download(request: Request):
    try:
        task_ids = request.state.body.get("id", None)
        if not task_ids:
            return await bad_request_400(request, msg="download id not present")
        await DownloadManager.resume(task_ids)
        return JSONResponse({"msg": "all tasks are successfully resumed"})
    except KeyError:
        return await bad_request_400(request, msg="One or more ids are invalid")
    except AttributeError as err_msg:
        return await bad_request_400(request, msg=str(err_msg))


async def cancel_download(request: Request):
    try:
        task_ids = request.state.body.get("id", None)
        if not task_ids:
            return await bad_request_400(request, msg="download id not present")

        await DownloadManager.cancel(task_ids)
        return JSONResponse({"msg": "all tasks are successfully cancelled"})
    except KeyError:
        return await bad_request_400(request, msg="One or more ids are invalid")


def format_series(field: str, record: Dict[str, Any]) -> tuple:
    if field == 'type':
        item_type = 'manga' if record['type'] == 'image' else 'anime'
        return item_type, record
    elif field == 'series_name':
        title = ' '.join(word.capitalize() for word in record['series_name'].split('_'))
        return title, record
    elif field == 'file_name':
        return record['file_name'], record
    return record.get(field), record


def format_library_data(grouped_data: Dict[str, Any]):
    result = []
    for item_type, series in grouped_data.items():
        for title, items in series.items():
            result.append({
                'type': item_type,
                'title': title,
                'chapters' if item_type == 'manga' else 'episodes': [item for sublist in items.values() for item in sublist]
            })
    return result


async def library(request: Request):
    """

    Args:
        request: Request object consist of client request data

    Returns: JSONResponse Consist of all the files in the library for GET request

    """
    if request.method == "DELETE":
        try:
            _id = int(request.query_params["id"])
            if DBLibrary.data[_id]["status"] != "downloaded":  # if file hasn't been downloaded, raise key-error
                raise KeyError

            file_location = DBLibrary.data[_id]["file_location"]
            DBLibrary.delete(_id)
            remove_file(file_location)
            return Response(status_code=204)
        except KeyError or TypeError:
            return await bad_request_400(request, msg="missing or invalid query parameter: 'id'")

    status = request.query_params.get("status", "downloaded")
    if status == "downloading":
        status = ["started", "scheduled", "paused"]

    return JSONResponse(format_library_data(
        DBLibrary.group_by(group_fields=['type', 'series_name', 'file_name'], filters={"status": status},
                           format_func=format_series)
    ))


async def play(player_name: str, manifest_url: str) -> Tuple[str | None, int]:
    try:
        await Stream.play(player_name, manifest_url)
        return None, 200
    except Exception as error:
        return str(error), 400


async def top(request: Request):
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
    _type = request.query_params.get("type", "anime")
    _category = request.query_params.get("c", None)
    _limit = request.query_params.get("limit", "0")

    if not _category:
        return await bad_request_400(request, msg="Pass valid Category")

    match _type:
        case "anime":
            if _category.lower() not in MyAL.anime_types_dict:
                return await bad_request_400(request, msg="Pass valid anime Category")
            top_resp = await MyAL().get_top_anime(anime_type=_category, limit=_limit)

        case "manga":
            if _category.lower() not in MyAL.manga_types_dict:
                return await bad_request_400(request, msg="Pass valid Manga Category")
            top_resp = await MyAL().get_top_manga(manga_type=_category, limit=_limit)
        case _:
            return await bad_request_400(request, msg="Pass valid type")

    if not top_resp["data"]:
        return await not_found_404(request, msg="limit out of range")

    return JSONResponse(top_resp)


async def get_master_manifest(request: Request):
    kwik_urls = request.query_params.get("kwik_url", None)
    if not kwik_urls:
        return await bad_request_400(request, msg="kwik url not present")

    kwik_urls = kwik_urls.split(",")
    if kwik_urls[-1] == "":
        kwik_urls.pop()

    return Response(build_master_manifest(kwik_urls),
                    media_type="application/vnd.apple.mpegurl",
                    headers={"Content-Disposition": "attachment; filename=uwu.m3u8"})


async def get_manifest(request: Request):
    kwik_url = request.query_params.get("kwik_url", None)
    if not kwik_url:
        return await bad_request_400(request, msg="kwik url not present")

    try:

        response, uwu_root_domain, _ = await Animepahe().get_manifest_file(kwik_url)

        return Response(
            response.replace(uwu_root_domain, f"{ServerConfig.API_SERVER_ADDRESS}/proxy?url={uwu_root_domain}"),
            media_type="application/vnd.apple.mpegurl",
            headers={"Content-Disposition": "attachment; filename=uwu.m3u8"})

    except ValueError as err_msg:
        return await bad_request_400(request, msg=str(err_msg))


async def proxy(request: Request):
    """
    This function will proxy request for manifest files, encryption key and video(ts) frames

    """
    actual_url = request.query_params.get("url", None)
    if not actual_url:
        await bad_request_400(request, msg="url not present")

    content, headers = await Proxy.get(actual_url, headers=get_headers(
        extra={"origin": "https://kwik.cx", "referer": "https://kwik.cx/", "accept": "*/*"}))
    return Response(content, headers=headers)


async def get_recommendation(request: Request):
    _type = request.query_params.get("type", "anime")

    if _type.lower() == "anime":
        return await _anime_recommendation(request)
    return await _manga_recommendation(request)


async def _anime_recommendation(request: Request):
    anime_session = request.query_params.get("anime_session", None)
    if not anime_session:
        return await bad_request_400(request, msg="Pass Anime session")

    try:
        return JSONResponse(await Animepahe().get_recommendation(anime_session))

    except ValueError as err_msg:
        return bad_request_400(request, msg=str(err_msg))

    except AttributeError or IndexError:
        return service_unavailable_503(request, msg="Try Again After Sometime")


async def _manga_recommendation(request: Request):
    manga_session = request.query_params.get("manga_session", None)
    if not manga_session:
        return await bad_request_400(request, msg="Pass Manga Session")

    return JSONResponse(await MangaKatana().get_recommendation(manga_session))


async def watchlist(request: Request):
    try:
        if request.method == "GET":
            return JSONResponse({"data": WatchList.get_all()})

        elif request.method == "POST":
            jb = request.state.body
            anime_id = int(jb["anime_id"])
            ep_details = f"{ServerConfig.API_SERVER_ADDRESS}/ep_details?anime_id={anime_id}"
            WatchList.create({"anime_id": anime_id, "jp_name": jb["jp_name"], "no_of_episodes": jb["no_of_episodes"], "type": jb["type"], "status": jb["status"],
                              "season": jb["season"], "year": jb["year"], "score": jb["score"], "poster": jb["poster"], "ep_details": ep_details})

            return JSONResponse(content="Anime successfully added in watch later", status_code=201)

        # id validation is bypassed by choice
        WatchList.delete(int(request.query_params["anime_id"]))
        return Response(status_code=204)
    except KeyError as _msg:
        logging.error(_msg)
        return await bad_request_400(request, msg=f"Invalid request: {_msg} not present")
    except ValueError as err:
        logging.error(err)
        return await bad_request_400(request, msg=f"Invalid anime ID")
    except IntegrityError as err:
        logging.error(err)
        return await bad_request_400(request, msg=f"Record already exists")


async def readlist(request: Request):
    try:
        if request.method == "GET":
            resp = []
            for data in ReadList.get_all():
                data["manga_detail"] = f"{ServerConfig.API_SERVER_ADDRESS}/manga_detail?session={data['session']}"
                data["genres"] = json.loads(data["genres"])
                resp.append(data)

            return JSONResponse({"data": resp})

        elif request.method == "POST":
            jb = request.state.body

            manga_session = jb["session"]
            total_chps = jb["total_chps"]
            status = jb["status"]
            genres = json.dumps(jb["genres"])
            poster = jb["poster"]

            """
            manga_session format will be https://mangakatana.com/manga/cheese-in-the-trap.1
            """
            meta_data: List[str] = manga_session.split("/manga/")
            if len(meta_data) != 2 or "." not in meta_data[-1]:
                return await bad_request_400(request, msg="Invalid Manga ID")

            title, manga_id = meta_data[-1].split(".")
            ReadList.create({"manga_id": manga_id, "title": title, "total_chps": total_chps, "status": status, "genres": genres, "poster": poster, "session": manga_session})
            return JSONResponse(content="Manga successfully added in Read later", status_code=201)

        # id validation is bypassed by choice
        ReadList.delete(request.query_params["manga_id"])
        return Response(status_code=204)
    except KeyError as _msg:
        return await bad_request_400(request, msg=f"Invalid request: {_msg} not present")
    except IntegrityError as err:
        logging.error(err)
        return await bad_request_400(request, msg=f"Record already exists")


routes = [
    Route("/", endpoint=LiSA, methods=["GET"]),
    Route("/search", endpoint=search, methods=["GET"]),
    Route("/top", endpoint=top, methods=["GET"]),
    Route("/ep_details", endpoint=get_ep_details, methods=["GET"]),
    Route("/manga_detail", endpoint=get_manga_detail, methods=["GET"]),
    Route("/recommendation", endpoint=get_recommendation, methods=["GET"]),
    Route("/stream_detail", endpoint=get_stream_details, methods=["GET"]),
    Route("/stream", endpoint=stream, methods=["POST"]),
    Route("/read", endpoint=read, methods=["GET"]),
    Route("/download", endpoint=download, methods=["POST"]),
    Route("/download/pause", endpoint=pause_download, methods=["POST"]),
    Route("/download/resume", endpoint=resume_download, methods=["POST"]),
    Route("/download/cancel", endpoint=cancel_download, methods=["POST"]),
    Route("/library", endpoint=library, methods=["GET", "DELETE"]),
    Route("/master_manifest", endpoint=get_master_manifest, methods=["GET"]),
    Route("/manifest", endpoint=get_manifest, methods=["GET"]),
    Route("/proxy", endpoint=proxy, methods=["GET"]),
    Route("/watchlist", endpoint=watchlist, methods=["GET", "POST", "DELETE"]),
    Route("/readlist", endpoint=readlist, methods=["GET", "POST", "DELETE"]),
    Mount('/default', app=CustomStaticFiles(directory=FileConfig.DEFAULT_DIR), name="static"),
    Mount("/image", app=CustomStaticFiles(directory=FileConfig.DEFAULT_DOWNLOAD_LOCATION), name="image-router"),
]

exception_handlers = {
    400: bad_request_400,
    404: not_found_404,
    500: internal_server_500
}

middleware = [
    Middleware(CORSMiddleware, allow_methods=["*"], allow_headers=["*"], allow_origins=["*"], allow_credentials=True),
    Middleware(RequestValidator),
    Middleware(ErrorHandlerMiddleware)
]

app = Starlette(
    debug=True,
    routes=routes,
    exception_handlers=exception_handlers,
    middleware=middleware,
)


def start_api_server(port: int):
    uvicorn.run(app, port=port)
