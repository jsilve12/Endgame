""" File to store API Endpoints related to accounts """
from fastapi import Depends, FastAPI, APIRouter


router = APIRouter()


@router.get('/navbar/pages')
async def navbar():
    return [
            {'url': '/', 'name': 'Home'},
            {'url': '/settings', 'name': 'Settings'},
            {'url': '/signup', 'name': 'Signup'},
            {'url': '/login', 'name': 'Login'},
        ]


@router.get('/navbar/name')
async def name():
    return 'Endgame'

# liches token: 66oNmGNArkYrgg1M
