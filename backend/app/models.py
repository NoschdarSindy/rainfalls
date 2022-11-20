import json
import logging
from datetime import datetime
from pathlib import Path

import aioredis
from aioredis.exceptions import ResponseError
from constants import *

log = logging.getLogger(__name__)


def datetime_to_posix_timestamp_milliseconds(dt):
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)

    # datetime.timestamp returns seconds since epoch as float, with ms after period
    return int(dt.timestamp() * 1000)


class WeatherEvent:
    def __init__(
        self,
        event_id,
        area,
        length,
        severity_index,
        start_time,
        start_time_ms,
        timeseries,
    ):
        self.event_id = event_id
        self.area = area
        self.length = length
        self.severity_index = severity_index
        self.start_time = start_time
        self.start_time_ms = start_time_ms
        self.timeseries = timeseries

    @classmethod
    def from_dict(cls, dict_):
        return cls(
            event_id=dict_["id"],
            area=dict_["area"],
            length=dict_["length"],
            severity_index=dict_["si"],
            start_time=datetime_to_posix_timestamp_milliseconds(dict_["start"]),
            start_time_ms=dict_["start_time_ms"],
            timeseries=[
                DetailWeatherEvent.from_dict(sub_event, ix)
                for ix, sub_event in enumerate(dict_["timeseries"])
            ],
        )


class DetailWeatherEvent:
    def __init__(
        self,
        event_id,
        sequence_id,
        area,
        date,
        latitude,
        longitude,
        latitude_max,
        longitude_max,
        precipitation_max,
        precipitation_mean,
        severity_index,
        size,
        standard_deviation,
    ):
        self.event_id = event_id
        self.sequence_id = sequence_id
        self.area = area
        self.date = date
        self.latitude = latitude
        self.latitude_max = latitude_max
        self.longitude = longitude
        self.longitude_max = longitude_max
        self.precipitation_max = precipitation_max
        self.precipitation_mean = precipitation_mean
        self.severity_index = severity_index
        self.size = size
        self.standard_deviation = standard_deviation

    @classmethod
    def from_dict(cls, dict_, sequence_id):
        return cls(
            event_id=dict_["index"],
            sequence_id=sequence_id,
            area=dict_["area"],
            date=datetime_to_posix_timestamp_milliseconds(dict_["date"]),
            latitude=dict_["lat"],
            latitude_max=dict_["latMax"],
            longitude=dict_["lon"],
            longitude_max=dict_["lonMax"],
            precipitation_max=dict_["maxPrec"],
            precipitation_mean=dict_["meanPre"],
            severity_index=dict_["si"],
            size=dict_["size"],
            standard_deviation=dict_["stdv"],
        )


class RedisTimeSeriesClient:
    def __init__(self, redis_url=REDIS_URL):
        self.redis = aioredis.from_url(redis_url, decode_responses=True)

    async def create_timeseries(self, key):
        """
        Create a timeseries using the specified redis key.

        A timeseries is a collection of (timestamp, value) tuples. We will create
        one timeseries for each of the top level features, i.e:
        ['area', 'length', 'severity_index'], where the timestamp represents the
        start time of the event and the value will hold the concrete top level feature
        value for the event.

        We'll use the duplicate policy known as "first," which ignores
        duplicate pairs of timestamp and values if we add them.

        NOTE there is a performance cost to writes using this policy.
        """

        try:
            await self.redis.execute_command(
                "TS.CREATE",
                key,
                "DUPLICATE_POLICY",
                "first",
            )
        except ResponseError as e:
            # Time series probably already exists
            # In this case nothing happens, since we use DUPLICATE_POLICY: first
            log.info(f"Could not create timeseries {key}, error: {e}")

    async def add_items_to_timeseries(self, *items):
        """
        Adds a new item to an existing redis timeseries.

        Each item is made up of a timestamp and a value.
        One redis timeseries holds many such key value pairs.
        """
        return await self.redis.execute_command("TS.MADD", *items)

    async def add_item_normal_key_value_pair(self, key, value):
        # Obsolote, we now load subevents (aka timeseries) as JSON documents in redis
        return await self.redis.execute_command("SADD", key, value)

    async def add_item_as_json_document(self, key, value):
        return await self.redis.execute_command("JSON.SET", key, "$", value)

    async def key_exists(self, key):
        return await self.redis.execute_command("EXISTS", key)

    async def get_key(self, key):
        return await self.redis.get(key)

    async def get_timeseries_key(self, key):
        return await self.redis.execute_command("TS.GET", key)

    async def get_key_json(self, key):
        return await self.redis.execute_command("JSON.GET", key)

    async def get_overall_range(self, key, start, end):
        return await self.redis.execute_command("TS.RANGE", key, start, end)

    async def initialize_database(self, path_to_dataset=DATASET_PATH, force_wipe=True):
        weather_events = load_dataset(path_to_dataset)

        if force_wipe:
            await self.redis.execute_command("FLUSHDB")
        else:
            # check if DB is already initialized, do nothing if it is
            if (
                await self.key_exists(PRE_O_AREA)
                and await self.key_exists(PRE_O_LENGTH)
                and await self.key_exists(PRE_O_SEV_INDEX)
            ):
                return

        await self.create_timeseries(PRE_O_AREA)
        await self.create_timeseries(PRE_O_LENGTH)
        await self.create_timeseries(PRE_O_SEV_INDEX)

        db_objects = set()  # Set of 3-D Tuples (redis_key, timestamp, value)
        for event in weather_events:
            id_timestamp = event.start_time_ms  # unique timestamp we can use as ID

            db_objects.add((PRE_O_AREA, id_timestamp, event.area))
            db_objects.add((PRE_O_LENGTH, id_timestamp, event.length))
            db_objects.add((PRE_O_SEV_INDEX, id_timestamp, event.severity_index))

            # We add subevent timeseries as normal keys, otherwise we blow up the DB
            # (seriously, I tried it an ended up with > 2 Million Keys and 11GB)
            await self.add_item_as_json_document(
                id_timestamp,
                json.dumps(event, default=lambda o: o.__dict__),
            )

        # Add timeseries data to redis in chunks of 100
        db_objects = list(db_objects)
        len_ = len(db_objects)
        chunk_size = 100

        for ix in range(0, len_, chunk_size):
            chunk = db_objects[ix : min(ix + chunk_size, len_)]
            chunk_flat = [item for tuple_ in chunk for item in tuple_]

            await self.add_items_to_timeseries(*chunk_flat)


def load_dataset(path_to_dataset):
    # We assume the dataset fits in memory, due to its small size.
    # For bigger datasets we could use Pandas or ijson to iterate over a larger file
    dataset = json.load(Path(path_to_dataset).open())

    # Returns a generator
    return (WeatherEvent.from_dict(event) for event in dataset.values())
