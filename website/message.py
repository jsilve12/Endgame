""" Core Messaging Pages """
import os
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, status, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from ..utils import get_cursor, use_cursor
from .__init__ import templates


# FastAPI context
router = APIRouter()


# Functions
@router.get('/messages', response_class=HTMLResponse)
async def messages(request: Request):
    return templates.TemplateResponse('messages.html', {'request': request})
