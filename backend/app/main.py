import logging
from typing import List, Optional
from urllib.parse import parse_qs as parse_querystring

from constants import DATASET_PATH, ONE_HOUR_IN_SECONDS, REDIS_URL
from fastapi import FastAPI, Query, Request, Response
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from models import RedisJSONClient
from utils import cache_key_with_query_params

import datetime as dt
import pandas as pd


log = logging.getLogger(__name__)
app = FastAPI(title="Gummistiefel B")

redis_client = RedisJSONClient(redis_url=REDIS_URL)


@app.on_event("startup")
async def startup_event():
    await redis_client.initialize_database(
        path_to_dataset=DATASET_PATH,
        force_wipe=False,
    )

    FastAPICache.init(RedisBackend(redis_client.aioredis), prefix="cache")


@app.get("/")
async def hello_world():
    return {"Hello": "World"}


@app.get("/detail/{id}")
async def detail(id: int):
    data = await redis_client.get_key_json(key=id)

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
    limit: Optional[int] = 999999,
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
        count, data = await redis_client.query_events(
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
# not beeing cached yet
async def overview(field: str, start: str = "1970-01-01", end: str = "2018-01-01", bins: int = 20): 
    try:
        count, data = await redis_client.query_events(
            filters=[["start_time", "gte", start], 
                        ["start_time", "lt", end],
                        ["severity_index", "gt", 0]],
            limit=999999,
            fields=["start_time", field],
        )
    except Exception as exc:
        log.error(str(exc))
        return Response(f"Overview over field '{field}' from {start} to {end} with {str(bins)} intervals not possible. Check the console for details.\n{str(exc)}", status_code=400)
    
    limit = count/bins
    stat_values = []
    for i in range(bins):
        stat_data = data[int(i*limit):int((i+1)*limit)]
        stat_df = pd.DataFrame(stat_data)
        stat_df["start_time"] = pd.to_datetime(stat_data[0]["start_time"], unit="ms")
        stat_values.append({
            "mean": stat_df.mean(numeric_only=True)[field],
            "quantile": stat_df.quantile(0.99, numeric_only=True)[field],
            "start_time": pd.to_datetime(stat_data[0]["start_time"], unit="ms")
        })
    
    all_data = pd.DataFrame(data)
    outlier_q = all_data.quantile(0.999)
    outlier_df = all_data[all_data[field] > outlier_q[field]]
    outlier_df.rename({field : "value"}, axis="columns", inplace=True)

    return {"stat": stat_values, "outliers": outlier_df.to_dict(orient="records") }