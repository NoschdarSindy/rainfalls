from datetime import datetime
from typing import Optional

from fastapi import Request, Response
from fastapi_cache import FastAPICache


def cache_key_with_query_params(
    func,
    namespace: Optional[str] = "",
    request: Optional[Request] = None,
    response: Optional[Response] = None,
    *args,
    **kwargs,
):
    prefix = FastAPICache.get_prefix()
    cache_key = f"{prefix}:{namespace}:{func.__module__}:{func.__name__}:{args}:{kwargs}:{request._query_params if request else ''}"

    print(f"{cache_key=}")

    return cache_key


def datetime_to_posix_timestamp_seconds(dt):
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)

    # datetime.timestamp returns seconds since epoch as float, with ms after the period
    # e.g. 1640995200.123456, so we need to cast to int to get rid of the milliseconds
    return int(dt.timestamp())
