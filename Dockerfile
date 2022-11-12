FROM python:3.10-slim-buster

WORKDIR /app

ENV PYTHONUNBUFFERED=true
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1 
ENV PATH="$POETRY_HOME/bin:$PATH"
ENV PATH="/app/.venv/bin:$PATH"
RUN pip install poetry

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./pyproject.toml ./poetry.lock* /app/
COPY ./app /app

RUN poetry install --no-interaction --no-root -vvv

COPY dataset.json /app/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]