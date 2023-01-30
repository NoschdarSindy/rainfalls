import logging
from datetime import datetime
from typing import List, Optional
from urllib.parse import parse_qs as parse_querystring

import pandas as pd
from constants import DATASET_PATH, ONE_HOUR_IN_SECONDS
from fastapi import FastAPI, Query, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from models import DataFrameDBClient
from utils import (
    cache_key_with_query_params,
    calc_days_in_interval,
    datetime_to_posix_timestamp_seconds,
    extract_filters,
    round_to_min_digits,
)

log = logging.getLogger(__name__)
app = FastAPI(title="Gummistiefel B")
app.add_middleware(GZipMiddleware)

db_client = DataFrameDBClient()


@app.on_event("startup")
async def startup_event():
    db_client.initialize_database_from_path(dataset_path=DATASET_PATH)
    FastAPICache.init(InMemoryBackend(), prefix="cache")


@app.get("/")
async def hello_world():
    return {"Hello": "World"}


@app.get("/detail/{id}")
async def detail(id: int):
    data = db_client.get_event_by_id(event_id=id)

    if data is None:
        return Response(f"Event with ID {id} was not found", status_code=404)

    return data


@app.get("/query", response_class=JSONResponse)
@cache(expire=ONE_HOUR_IN_SECONDS, key_builder=cache_key_with_query_params)
async def query(
    request: Request,
    response: Response,
    filter_params: Optional[str] = "",
    fields: Optional[List[str]] = Query(None),
    limit: Optional[int] = None,
):
    """
    Query the Database on the Fulltext Search index and return the specified fields
    of all matching documents. Optionally limit the results.


    Example URL:
    /query?length__lte=1&severity_index__gt=0&fields=area&fields=length&limit=200

    Will parse to:
    filters = [[length, lte, 1], [severity_index, gt, 0]]
    fields  = [area, length]
    limit   = 200
    """

    query_string = filter_params or str(request.query_params)
    query_params = parse_querystring(query_string)

    query_params.pop("limit", None)
    query_params.pop("fields", None)

    fields = fields or ["event_id", "area", "length", "severity_index", "start_time"]
    filters = extract_filters(query_params)

    try:
        count, data = db_client.query_events(
            filters=filters,
            limit=limit,
            fields=fields,
        )
    except Exception as exc:
        log.error(str(exc))
        response.status_code = 400
        return {"error": f"Invalid query. Check the console for details.\n{str(exc)}"}

    return {"count": count, "results": data}


@app.get("/spider")
@cache(expire=ONE_HOUR_IN_SECONDS, key_builder=cache_key_with_query_params)
async def spider(
    request: Request,
    response: Response,
    start: Optional[str] = "",
    end: Optional[str] = "",
    filter_params: Optional[str] = "",
):

    query_string = filter_params or str(request.query_params)
    query_params = parse_querystring(query_string)

    filters = [key.split("__") + value for key, value in query_params.items()]

    try:
        _, data = db_client.query_events(
            filters=filters,
            limit=None,
            fields=["start_time", "area", "length", "severity_index"],
        )
    except Exception as exc:
        log.error(str(exc))
        response.status_code = 400
        return {"error": f"Invalid query. Check the console for details.\n{str(exc)}"}

    df = pd.DataFrame(data)

    start = start or datetime.fromtimestamp(df.iloc[0]["start_time"])
    end = end or datetime.fromtimestamp(df.iloc[-1]["start_time"])

    df = df[df["start_time"] >= datetime_to_posix_timestamp_seconds(start)]
    df = df[df["start_time"] < datetime_to_posix_timestamp_seconds(end)]
    df = df.drop(columns=["start_time"])
    df = df.mean(numeric_only=True).round(5)
    df["events_per_day"] = round(len(df.index) / calc_days_in_interval([start, end]), 5)
    df = df.apply(round_to_min_digits)

    return df.to_dict()


@app.get("/overview-histogram")
@cache(expire=ONE_HOUR_IN_SECONDS, key_builder=cache_key_with_query_params)
def overview_histogram(
    request: Request,
    response: Response,
    filter_params: Optional[str] = "",
):

    # Query data based on filters, as we do in the other endpoints
    query_string = filter_params or str(request.query_params)
    query_params = parse_querystring(query_string)

    filters = extract_filters(query_params)
    fields = ["start"]

    try:
        _, df = db_client.query_events(
            filters=filters,
            fields=fields,
            limit=None,
            return_df=True,
        )
    except Exception as exc:
        log.error(str(exc))
        response.status_code = 400
        return {"error": f"Invalid query. Check the console for details.\n{str(exc)}"}

    from calendar import month_name, monthrange
    from collections import defaultdict

    # nested defaultdict, so we can do things like `time_counts[1979]["January"][12] += 1`
    # without worrying about (nested) keys not existing yet
    time_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    # initialize time_counts dict so days without rain events get a 0 column
    first_event, last_event = df.iloc[0], df.iloc[-1]

    for year in range(first_event.start.year, last_event.start.year + 1):
        for month in range(1, 13):
            _, max_day = monthrange(year, month)
            for day in range(1, max_day + 1):
                time_counts[year][month][day] = 0

    # df.iterrows()   takes ~ 8 seconds on whole df
    # df.itertuples() takes ~ 3 seconds on whole df
    # df.to_dict()    takes ~ 1 seconds on whole df
    for row in df.to_dict("records"):
        year = row["start"].year
        month = row["start"].month
        day = row["start"].day

        time_counts[year][month][day] += 1

    return time_counts
