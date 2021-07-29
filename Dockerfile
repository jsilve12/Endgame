FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-alpine3.10

COPY requirements.txt /FastAPI/requirements.txt
RUN apk update && apk add --no-cache postgresql-dev gcc libffi-dev python3-dev musl-dev
RUN pip3 install -r /FastAPI/requirements.txt

COPY package.json /app/package.json
COPY webpack.config.js /app/webpack.config.js
RUN apk add --no-cache nodejs npm
RUN npm install

COPY . /app/
RUN ./node_modules/.bin/webpack --mode development
WORKDIR /
CMD uvicorn app.main:app
