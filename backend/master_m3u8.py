from video_metadata import get_metadata
from typing import List

master_m3u8 = """#EXTM3U\n#EXT-X-VERSION:3\n"""


def build_master_manifest(kwik_urls: List[str]) -> str:
    m3u8 = master_m3u8
    for kwik_url in kwik_urls:
        link, p_res = kwik_url.split("-")
        video_res, bandwith = get_metadata(int(p_res))
        m3u8 += f"#EXT-X-STREAM-INF:BANDWITH={bandwith},RESOLUTION={video_res[0]}x{video_res[1]}\n{link}\n"

    return m3u8






test_m3u8 = """
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=509952,RESOLUTION=1920x1080
https://cache.387e6278d8e06083d813358762e0ac63.com/d7aa5eb1-1fe2-11ed-bba9-a0369ffdf038.m3u8?videoid=222853064047
#EXT-X-STREAM-INF:BANDWIDTH=388096,RESOLUTION=1280x720
https://cache.387e6278d8e06083d813358762e0ac63.com/96435c19-1fe2-11ed-9d81-246e963a41ed.m3u8?videoid=222853064047
#EXT-X-STREAM-INF:BANDWIDTH=295936,RESOLUTION=854x480
https://cache.387e6278d8e06083d813358762e0ac63.com/4ae513b5-1fe2-11ed-b2f7-a0369ffb3308.m3u8?videoid=222853064047
"""
