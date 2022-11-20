import json
import logging
from typing import Union
import os

from constants import DATASET_PATH, PRE_O_AREA, PRE_O_LENGTH, PRE_O_SEV_INDEX, REDIS_URL
from fastapi import FastAPI
from models import RedisTimeSeriesClient


log = logging.getLogger(__name__)
app = FastAPI(title="Gummistiefel B")
redis_ts = RedisTimeSeriesClient(redis_url=REDIS_URL)


@app.on_event("startup")
async def startup_event():
    await redis_ts.initialize_database(
        path_to_dataset=DATASET_PATH,
        force_wipe=False,
    )


@app.get("/")
async def hello_world():
    return {"Hello": "World"}


@app.get("/detail/{id}")
async def detail(id: int):
    data = await redis_ts.get_key_json(key=id)
    return json.loads(data)


@app.get("/area")
async def area(
    start: Union[int, None] = 1451606400000,  # 01.01.2016
    end: Union[int, None] = 1483228799000,  # 31.12.2016
):
    data = await redis_ts.get_overall_range(key=PRE_O_AREA, start=start, end=end)
    return data


@app.get("/length")
async def length(
    start: Union[int, None] = 1451606400000,  # 01.01.2016
    end: Union[int, None] = 1483228799000,  # 31.12.2016
):
    data = await redis_ts.get_overall_range(key=PRE_O_LENGTH, start=start, end=end)
    return data


@app.get("/severity")
async def severity(
    start: Union[int, None] = 1451606400000,  # 01.01.2016
    end: Union[int, None] = 1483228799000,  # 31.12.2016
):
    data = await redis_ts.get_overall_range(key=PRE_O_SEV_INDEX, start=start, end=end)
    return data
