import json
import logging
from datetime import datetime
from pathlib import Path

from constants import AREA, DATASET_PATH, LENGTH, REDIS_URL, SEV_INDEX, START_TIME
from redis import asyncio as aioredis
from redis.commands.json.path import Path as jsonPath

log = logging.getLogger(__name__)


def datetime_to_posix_timestamp_seconds(dt):
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)

    # datetime.timestamp returns seconds since epoch as float, with ms after period
    return int(dt.timestamp())


class WeatherEvent:
    def __init__(
        self,
        event_id,
        area,
        length,
        severity_index,
        start_time,
        timeseries,
        mean_lat,
        mean_lon,
        mean_prec,
        max_prec
    ):
        self.event_id = event_id
        self.area = area
        self.length = length
        self.severity_index = severity_index
        self.start_time = start_time
        self.timeseries = timeseries
        self.mean_lat = mean_lat
        self.mean_lon = mean_lon
        self.mean_prec = mean_prec
        self.max_prec = max_prec

    @classmethod
    def from_dict(cls, dict_):
        return cls(
            event_id=dict_["id"],
            area=dict_["area"],
            length=dict_["length"],
            severity_index=dict_["si"],
            start_time=datetime_to_posix_timestamp_seconds(dict_["start"]),
            timeseries=[
                DetailWeatherEvent.from_dict(sub_event, ix)
                for ix, sub_event in enumerate(dict_["timeseries"])
            ],
            mean_lat=dict_["meanLat"],
            mean_lon=dict_["meanLon"],
            mean_prec=dict_["meanPrec"],
            max_prec=dict_["maxPrec"]
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
            date=datetime_to_posix_timestamp_seconds(dict_["date"]),
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


class RedisJSONClient:
    def __init__(self, redis_url=REDIS_URL):
        self.aioredis = aioredis.from_url(redis_url, decode_responses=True)

    async def create_fulltext_search_index(self, name, *fields):
        """
        Creates a new index, searchable by given top-level numeric fields.
        """
        fields_string = " ".join(f"$.{field} AS {field} NUMERIC" for field in fields)
        return await self.aioredis.execute_command(
            f"FT.CREATE {name} ON JSON SCHEMA {fields_string}"
        )

    async def list_fulltext_search_indices(self):
        return await self.aioredis.execute_command("FT._LIST")

    async def add_item_as_json_document(self, key, value):
        return await self.aioredis.execute_command("JSON.SET", key, "$", value)

    async def key_exists(self, key):
        return await self.aioredis.execute_command("EXISTS", key)

    async def get_key_json(self, key):
        return await self.aioredis.json().get(key)

    async def mget_keys_json(self, keys):
        return await self.aioredis.json().mget(keys=keys, path=jsonPath.root_path())

    async def fulltext_search(self, index, query, limit):
        """
        Perform a fulltext search and return all matching documents.

        Results are returned in the following format:

        [TOTAL_COUNT, JSON_DOC_ID, [JSON_PATH, *DOCUMENT_ATTRIBUTES], JSON_DOC_ID, [JSON_PATH, *DOCUMENT_ATTRIBUTES]...]

        """

        return await self.aioredis.execute_command(
            "FT.SEARCH",
            index,
            query,
            "LIMIT",
            "0",
            limit,
        )

    async def query_events(
        self,
        filters,
        limit,
        fields=(
            "event_id",
            "area",
            "length",
            "severity_index",
            "start_time",
        ),
    ):
        self._check_query_filters(filters)  # raises ValueError on invalid filters

        query = self._make_query_from_filters(filters=filters) if filters else "*"
        data = await self.fulltext_search(index="events", query=query, limit=limit)

        count = data.pop(0)

        # we are only interested in the DOCUMENT_ATTRIBUTES,
        # see fulltext_search() function docs for more info
        data = [
            {key: value for (key, value) in json.loads(arr[1]).items() if key in fields}
            for arr in data[1::2]
        ]
        return count, data

    @staticmethod
    def _check_query_filters(filters):
        valid_fields = (AREA, LENGTH, SEV_INDEX, START_TIME)
        valid_operators = ("lt", "lte", "gt", "gte", "eq", "neq")

        if not all([len(filter_) == 3 for filter_ in filters]):
            raise ValueError(
                "Invalid query filters provided. "
                "Make sure your filters adhere to the following scheme: 'area__gte=1'"
            )

        for (field, operator, _) in filters:
            if field not in valid_fields:
                raise ValueError(
                    f"Attribute must be one of {valid_fields}, got {field} instead"
                )

            if operator not in valid_operators:
                raise ValueError(
                    f'Operator must be one of {valid_operators}, got "{operator}" instead'
                )

    @staticmethod
    def _make_query_from_filters(filters):
        predicates = []

        for (field, operator, value) in filters:

            if field == START_TIME:
                value = str(datetime_to_posix_timestamp_seconds(value))

            # Numeric filters are inclusive
            # Exclusive min or max are expressed with ( prepended to the number
            # See https://redis.io/docs/stack/search/reference/query_syntax/
            # fmt: off
            predicate_mapping = { 
                "neq": f"(-@{field}:[{value}  {value}])",
                "eq":  f"  @{field}:[{value}  {value}]",
                "lt":  f"  @{field}:[-inf    ({value}]",
                "lte": f"  @{field}:[-inf     {value}]",
                "gt":  f"  @{field}:[({value} inf]",
                "gte": f"  @{field}:[{value}  inf]",
            }
            # fmt: on

            predicates.append(predicate_mapping[operator])

        predicates_string = " ".join(predicates)
        return f"'{predicates_string}'"

    async def initialize_database(
        self, path_to_dataset=DATASET_PATH, dataset=None, force_wipe=True
    ):
        dataset = dataset or load_dataset(path_to_dataset)

        await self.aioredis.execute_command("FT.CONFIG SET MAXSEARCHRESULTS 1000000")

        if force_wipe:
            await self.aioredis.execute_command("FLUSHDB")
        else:
            # check if DB is already initialized, do nothing if it is
            ft_indices = await self.list_fulltext_search_indices()
            if bool(ft_indices):
                return

        await self.create_fulltext_search_index(
            "events", AREA, LENGTH, SEV_INDEX, START_TIME
        )

        for event in dataset:
            await self.add_item_as_json_document(
                event.event_id,
                json.dumps(event, default=lambda o: o.__dict__),
            )


def load_dataset(path_to_dataset):
    # We assume the dataset fits in memory, due to its small size.
    # For bigger datasets we could use Pandas or ijson to iterate over a larger file
    dataset = json.load(Path(path_to_dataset).open())

    # Returns a generator
    return (WeatherEvent.from_dict(event) for event in dataset)
