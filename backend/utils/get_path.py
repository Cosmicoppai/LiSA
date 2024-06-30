from os import environ, pathsep, path

_path_env = environ.get('PATH')

_path_dirs = _path_env.split(pathsep)


def get_path(binary_name: str, default_path: str) -> str:
    for directory in _path_dirs:
        binary_path = path.join(directory, binary_name)
        if path.isfile(binary_path):
            return binary_path
    return default_path


if __name__ == "__main__":
    print(get_path("ffmpeg", "./ffmpeg"))
