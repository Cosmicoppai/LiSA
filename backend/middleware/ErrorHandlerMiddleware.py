from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.middleware.base import RequestResponseEndpoint
from aiohttp import ClientResponseError
from errors.http_error import service_unavailable_503
import logging


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            return await call_next(request)
        except ClientResponseError as err:
            logging.error(err)
            return await service_unavailable_503(request, msg="Remote server unreachable, please check your internet connection or try again after sometime")
