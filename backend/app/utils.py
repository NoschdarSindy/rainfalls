from datetime import datetime
from typing import Optional

from fastapi import Request, Response
from fastapi_cache import FastAPICache
from math import log10


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


def calc_days_between_timestamps(t1, t2):
    if isinstance(t1, str):
        t1 = datetime.fromisoformat(t1)
    
    if isinstance(t2, str):
        t2 = datetime.fromisoformat(t2)
    
    return (t2 - t1).days

def round_to_min_digits(n):
    k = 1 - int(log10(n))
    return round(n, 1 if k < 1 else k)