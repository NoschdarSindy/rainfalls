from datetime import datetime
from math import log10
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


def remove_tz(datestring):
    if datestring[-1].lower() == "z":
        datestring = datestring[:-1]
    return datestring


def datetime_to_posix_timestamp_seconds(dt):
    if isinstance(dt, str):
        dt = datetime.fromisoformat(remove_tz(dt))

    # datetime.timestamp returns seconds since epoch as float, with ms after the period
    # e.g. 1640995200.123456, so we need to cast to int to get rid of the milliseconds
    return int(dt.timestamp())


def calc_days_in_interval(interval):
    if len(interval) != 2:
        return 0

    if isinstance(interval[0], str):
        interval[0] = datetime.fromisoformat(remove_tz(interval[0]))

    if isinstance(interval[1], str):
        interval[1] = datetime.fromisoformat(remove_tz(interval[1]))

    return (interval[1] - interval[0]).days


def round_to_min_digits(n, min=1):
    k = 1 - int(log10(n))
    return round(n, min if k < min else k)


def extract_filters(query_params):
    return [key.split("__") + value for key, value in query_params.items()]
