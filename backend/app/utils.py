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
    return cache_key
