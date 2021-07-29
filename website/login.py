""" Core Login Pages """
import os
import requests
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
from .__init__ import templates


# Globals
SECRET_KEY = "82a5501a0d4b1c679940857082d9baf53422dc89601f5c33486d7ac37ae214dc" # Fix
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Classes
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None


class UserInDB(User):
    hashed_password: str


# FastAPI context
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
router = APIRouter()

# Functions
def verify_password(plain_password: str, hashed_password: str):
    """ Verifies the stored password is equivalent to the one enterd

    args:
        plain_password (str): Password sent by the User
        hashed_password (str): Password received from the Database

    returns: boolean
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    """ Salts and hashes a password a password

    args:
        password (str): Password to be hashed

    returns:
        hashed and salted password
    """
    return pwd_context.hash(password)

def get_user(email: str):
    """ Gets a user from the database

    args:
        email: Email of the user to fetch

    returns: All the users data
    """
    return use_cursor(
        get_cursor(),
        'SELECT * FROM account WHERE email = %s',
        (email, )
    )

def authenticate_user(username: str, password: str):
    """ Authenticates a user

    args:
        username:
        password:

    returns: User or false

    """
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user[0]['password']):
        return False
    return user[0]

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """ Takes information and an lifespan (timedelta) and returns a jwt

    args:
        data: Data to place in the token
        expire_delta: TTL

    returns: JWT
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str):
    """ Gets the current user, from the JWT

    args:
        token: JWT returned by the server

    returns: user
    """
    credentials_exception = RedirectResponse(url='/login', status_code=status.HTTP_303_SEE_OTHER)
    if not token:
        return credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return credentials_exception
    except JWTError:
        return credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user


# Endpoints
@router.get('/login', response_class=HTMLResponse)
async def login(request: Request, error: str = None):
    return templates.TemplateResponse('login.html', {'request': request, 'error': error})


@router.post('/token', response_model=Token)
async def login_form(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        response = RedirectResponse(url='/login?error=Incorrect Email or Password', status_code=status.HTTP_303_SEE_OTHER)
        return response
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email']}, expires_delta=access_token_expires
    )
    response = RedirectResponse(url='/', status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie('token', value=access_token, httponly=True, max_age=1800, expires=1800)
    return response


@router.get('/signup', response_class=HTMLResponse)
async def signup(request: Request):
    return templates.TemplateResponse('signup.html', {'request': request})


@router.post('/signup')
async def signup_form(Email: str = Form(...), Password: str = Form(...), Confirm_Password: str = Form(...)):
    hashed = get_password_hash(Password)
    use_cursor(get_cursor(), 'INSERT INTO account(email, password) VALUES(%s, %s); COMMIT;', (Email, hashed))
    return RedirectResponse('/', status_code=HTTP_302_FOUND)


@router.post('/user/exists/{email}')
async def exists(email: str):
    return get_user(email) is not None


@router.get('/authorize/lichess')
async def lichess():
    token = oauth.

# EOF
