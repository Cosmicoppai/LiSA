from starlette.exceptions import HTTPException
from starlette.responses import HTMLResponse
from starlette.requests import Request


async def bad_request_400(request: Request, exc: HTTPException = HTTPException(400), msg: str = "400 Bad Request"):
    return HTMLResponse(content=msg, status_code=exc.status_code)


async def not_found_404(request: Request, exc: HTTPException = HTTPException(404), msg: str = "404 Not Found"):
    return HTMLResponse(content=msg, status_code=exc.status_code)


async def internal_server_500(request: Request, exc: HTTPException = HTTPException(500),
                              msg: str = "500 Internal Server"):
    return HTMLResponse(content=msg, status_code=exc.status_code)
