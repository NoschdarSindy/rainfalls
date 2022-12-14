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

    query_params = parse_querystring(str(request.query_params))

    query_params.pop("limit", None)
    query_params.pop("fields", None)

    fields = fields or ["area", "length", "severity_index"]
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
