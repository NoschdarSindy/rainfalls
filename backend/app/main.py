import datetime as dt
import logging
from typing import List, Optional
from urllib.parse import parse_qs as parse_querystring

import numpy as np
import pandas as pd
from constants import DATASET_PATH, ONE_HOUR_IN_SECONDS
from fastapi import FastAPI, Query, Request, Response
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from models import DataFrameDBClient
from utils import cache_key_with_query_params, datetime_to_posix_timestamp_seconds, calc_days_between_timestamps, round_to_min_digits

log = logging.getLogger(__name__)
app = FastAPI(title="Gummistiefel B")

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
    filters = [key.split("__") + value for key, value in query_params.items()]

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


@app.get("/overview/{field}/{start}/{end}/{bins}")
@app.get("/overview/{field}/{start}/{end}/")
@app.get("/overview/{field}/{bins}")
@app.get("/overview/{field}/")
@cache(expire=ONE_HOUR_IN_SECONDS, key_builder=cache_key_with_query_params)
async def overview(
    field: str, start: str = "1970-01-01", end: str = "2018-01-01", bins: int = 20
):
    try:
        count, data = db_client.query_events(
            filters=[
                ["start_time", "gte", start],
                ["start_time", "lt", end],
                ["severity_index", "gt", 0],
            ],
            limit=999999,
            fields=["start", field],
        )
    except Exception as exc:
        log.error(str(exc))
        return Response(
            f"Overview over field '{field}' from {start} to {end} with {str(bins)} intervals not possible. Check the console for details.\n{str(exc)}",
            status_code=400,
        )

    limit = count // bins
    stat_values = []

    for i in range(bins):
        stat_data = data[i * limit : (i + 1) * limit]
        stat_df = pd.DataFrame(stat_data)
        stat_df["start_time"] = stat_data[0]["start"]
        stat_values.append(
            {
                "mean": stat_df.mean(numeric_only=True)[field],
                "quantile": stat_df.quantile(0.99, numeric_only=True)[field],
                "start_time": stat_data[0]["start"],
            }
        )

    all_data = pd.DataFrame(data)
    outlier_q = all_data.quantile(0.999, numeric_only=True)
    outlier_df = all_data.loc[all_data[field] > outlier_q[field]]
    outlier_df = outlier_df.rename({field: "value"}, axis="columns")

    return {"stat": stat_values, "outliers": outlier_df.to_dict("records")}

@app.get("/stats/{startA}--{endA}/{startB}--{endB}/")
#@cache(expire=ONE_HOUR_IN_SECONDS, key_builder=cache_key_with_query_params)
async def stats(startA: str, endA: str, startB: str, endB: str):
    try:
        data = db_client.df
    except Exception as exc:
        log.error(str(exc))
        return Response(
            f"Access to Statistics not possible. Check the console for details.\n{str(exc)}",
            status_code=400,
        )

    intervalA = data[data["start_time"] >= datetime_to_posix_timestamp_seconds(startA)]
    intervalA = intervalA[intervalA["start_time"] < datetime_to_posix_timestamp_seconds(endA)]

    intervalB = data[data["start_time"] >= datetime_to_posix_timestamp_seconds(startB)]
    intervalB = intervalB[intervalB["start_time"] < datetime_to_posix_timestamp_seconds(endB)]

    intervalAData = intervalA.mean(numeric_only=True).round(5)
    intervalBData = intervalB.mean(numeric_only=True).round(5)

    intervalAData["total_events"] = len(intervalA.index)
    intervalBData["total_events"] = len(intervalB.index)

    intervalAData["events_per_day"] = round(intervalAData["total_events"] / calc_days_between_timestamps(startA, endA), 5)
    intervalBData["events_per_day"] = round(intervalBData["total_events"] / calc_days_between_timestamps(startB, endB), 5)

    totalMax = {}
    intervalASeries = []
    intervalBSeries = []

    for field in ["severity_index", "length", "area", "total_events", "events_per_day"]:
        valueA = round_to_min_digits(intervalAData[field])
        valueB = round_to_min_digits(intervalBData[field])
        totalMax[field] = max(valueA, valueB)
        intervalASeries.append(valueA),
        intervalBSeries.append(valueB)

    return {
        "max": totalMax,
        "series": {
            "intervalA": intervalASeries,
            "intervalB": intervalBSeries
        }        
    }
