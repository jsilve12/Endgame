""" Core Accounts Pages """
import os
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, Form, status, Cookie, Depends, Response, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from starlette.status import HTTP_302_FOUND
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from ..utils import get_cursor, use_cursor
from .login import get_current_user
from .__init__ import templates


# FastAPI context
router = APIRouter()

# Functions
def account_info(userid):
    return use_cursor(get_cursor(), 'select * from account where id=%s', (userid, ))


# Endpoints
@router.get('/profile/{userid}', response_class=HTMLResponse)
async def profile(request: Request, userid: int):
    info = account_info(userid)
    if not info:
        raise HTTPException(status_code=404, detail='User not found')
    return templates.TemplateResponse('profile.html', {'request': request, 'info': info[0]})


@router.get('/settings', response_class=HTMLResponse)
async def response(request: Request, token: str = Cookie(None)):
    info = await get_current_user(token)
    if type(info) is not list:
        return info
    return templates.TemplateResponse('settings.html', {'request': request, 'info': info[0]})


@router.post('/settings')
async def change_settings(request: Request, token: str = Cookie(None), name: str = Form(...), email = Form(...), profile = Form(...)):
    info = await get_current_user(token)
    if type(info) is not list:
        return info
    use_cursor(
        get_cursor(),
        'UPDATE account SET email = %s, name = %s, profile = %s WHERE id = %s::INTEGER; COMMIT;',
        (email, name, profile, info[0].get('id'))
    )
    newinfo = await get_current_user(token)
    return templates.TemplateResponse('settings.html', {'request': request, 'info': newinfo[0]})


# EOF
