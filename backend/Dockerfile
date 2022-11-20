FROM python:3.10-slim-buster

WORKDIR /backend

ENV PYTHONUNBUFFERED=true
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1 
ENV PATH="$POETRY_HOME/bin:$PATH"
ENV PATH="/backend/.venv/bin:$PATH"

RUN pip install poetry

COPY ./dataset.json /backend/dataset.json
COPY ./backend /backend

RUN poetry install --no-interaction --no-root -vvv

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--app-dir", "/backend/app/"]