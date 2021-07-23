""" File to store API chess Endpoints related to accounts """
from fastapi import Depends, FastAPI, APIRouter


router = APIRouter()


@router.get('/random')
async def name():
    return '4k3/6KP/8/8/8/8/7p/8 w - - 0 1'
