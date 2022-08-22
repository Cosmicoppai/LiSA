from .video_metadata import get_metadata
from typing import List

master_m3u8 = """#EXTM3U\n#EXT-X-VERSION:3\n"""


def build_master_manifest(kwik_urls: List[str]) -> str:
    m3u8 = master_m3u8
    try:
        for kwik_url in kwik_urls:
            link, p_res = kwik_url.split("-")
            video_res, bandwith = get_metadata(int(p_res))
            m3u8 += f"#EXT-X-STREAM-INF:BANDWITH={bandwith},RESOLUTION={video_res[0]}x{video_res[1]}\n{link}\n"
    except ValueError:
        raise ValueError("Invalid kwik_url")

    return m3u8
