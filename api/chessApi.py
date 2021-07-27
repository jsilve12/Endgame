""" File to store API chess Endpoints related to accounts """
from fastapi import Depends, FastAPI, APIRouter
from ..utils import get_cursor, use_cursor

router = APIRouter()


@router.get('/random')
async def name():
    return use_cursor(get_cursor(), f'''
        WITH id AS (
            WITH count AS (
                SELECT count(*) AS count FROM positions
            )
            SELECT floor(random()*count+1) AS index FROM count
        )
        SELECT fen
        FROM positions
        JOIN id ON TRUE
        WHERE positions.id=id.index;'''
    )[0]['fen']
