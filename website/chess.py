""" Chess Website Pages """
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os


from .__init__ import templates


router = APIRouter()


@router.get('/', response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse('chess.html', {'request': request})
