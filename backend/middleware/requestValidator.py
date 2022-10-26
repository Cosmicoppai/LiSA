from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.middleware.base import RequestResponseEndpoint
from requests import ConnectionError
from errors.http_error import bad_request_400
from json import JSONDecodeError
from logging import info


class requestValidator(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            if request.method == "POST":
                if request.headers.get("content-type", None) == "application/json":
                    request.state.body = await request.json()
            return await call_next(request)
        except JSONDecodeError as msg:
            info(msg)
            return await bad_request_400(request, msg="Malformed body: Invalid JSON")

        except RuntimeError as exc:
            if str(exc) == "No response returned." and await request.is_disconnected():
                return Response(status_code=204)
            raise
