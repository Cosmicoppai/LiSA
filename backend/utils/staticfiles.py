from starlette.staticfiles import StaticFiles, PathLike
from os import makedirs, path
import typing
from logging import error


class CustomStaticFiles(StaticFiles):
    def __init__(
        self,
        *,
        directory: typing.Optional[PathLike] = None,
        packages: typing.Optional[
            typing.List[typing.Union[str, typing.Tuple[str, str]]]
        ] = None,
        html: bool = False,
        check_dir: bool = True,
    ) -> None:

        self.directory = directory
        self.packages = packages
        self.all_directories = self.get_directories(directory, packages)
        self.html = html
        self.config_checked = False
        if check_dir and directory is not None and not path.isdir(directory):
            error(f"Directory '{directory}' does not exist")
            makedirs(directory)
