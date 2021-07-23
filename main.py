"""Origin for FastAPI."""

from fastapi import Depends, FastAPI, Header, HTTPException, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from .api import api, chessApi
from .website import base, login, message, accounts, chess
from .website.login import get_current_user

app = FastAPI()
app.mount('/static', StaticFiles(directory='app/static'), name='static')


app.include_router(
    base.router,
    tags=['webpage']
)
app.include_router(
    login.router,
    tags=['login']
)
app.include_router(
    accounts.router,
    tags=['accounts']
)
app.include_router(
    message.router,
    tags=['message']
)
app.include_router(
    chess.router,
    tags=['chess']
)
app.include_router(
    api.router,
    prefix='/api',
    tags=['api']
)
app.include_router(
    chessApi.router,
    prefix='/api/chess',
    tags=['api']
)
