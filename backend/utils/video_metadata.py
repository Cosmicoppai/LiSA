from math import ceil


# 16:9 aspect ratio resolution

def get_video_resolution(progressive_resolution: int) -> (int, int):  # width, height
    return ceil(16 / 9 * progressive_resolution), progressive_resolution


def get_bandwith(width: int, height: int, fps: int = 30, bpp: float = 0.1) -> int:
    return ceil(width*height*fps*bpp/1000)


def get_metadata(progressive_resolution: int) -> (str, int):
    video_res = get_video_resolution(progressive_resolution)
    bandwith = get_bandwith(video_res[0], video_res[1])

    return video_res, bandwith
