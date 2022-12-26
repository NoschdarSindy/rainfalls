import pytest
import pytest_asyncio
from app.constants import REDIS_TEST_URL
from app.models import RedisJSONClient, WeatherEvent


@pytest.fixture()
def json_data():
    return {
        1: {
            "id": 1,
            "area": 1,
            "length": 1,
            "si": 1,
            "start": "2022-01-01T00:00:00+00:00",
            "timeseries": [],
            "meanLat": 1,
            "meanLon": 1,
            "meanPrec": 1,
            "maxPrec": 1,
        },
        2: {
            "id": 2,
            "area": 2,
            "length": 2,
            "si": 2,
            "start": "2022-02-02T00:00:00+00:00",
            "timeseries": [],
            "meanLat": 2,
            "meanLon": 2,
            "meanPrec": 2,
            "maxPrec": 2,
        },
        3: {
            "id": 3,
            "area": 3,
            "length": 3,
            "si": 3,
            "start": "2022-03-03T00:00:00+00:00",
            "timeseries": [],
            "meanLat": 3,
            "meanLon": 3,
            "meanPrec": 3,
            "maxPrec": 3,
        },
        4: {
            "id": 4,
            "area": 4,
            "length": 4,
            "si": 4,
            "start": "2022-04-04T00:00:00+00:00",
            "timeseries": [],
            "meanLat": 4,
            "meanLon": 4,
            "meanPrec": 4,
            "maxPrec": 4,
        },
        5: {
            "id": 5,
            "area": 5,
            "length": 5,
            "si": 5,
            "start": "2022-05-05T00:00:00+00:00",
            "timeseries": [],
            "meanLat": 5,
            "meanLon": 5,
            "meanPrec": 5,
            "maxPrec": 5,
        },
    }


@pytest.fixture()
def dataset(json_data):
    return (WeatherEvent.from_dict(event) for event in json_data.values())


@pytest_asyncio.fixture()
async def redis_test_client(dataset):
    client = RedisJSONClient(redis_url=REDIS_TEST_URL)

    await client.initialize_database(dataset=dataset)

    yield client

    await client.aioredis.close()


@pytest.mark.asyncio
async def test_query_no_filters(redis_test_client, json_data, dataset):

    count, result = await redis_test_client.query_events(
        filters=[],
        limit=99999,
    )

    assert count == len(json_data.keys())

    print (result)

    assert result == [
        {
            "event_id": 1,
            "area": 1,
            "length": 1,
            "severity_index": 1,
            "start_time": 1640995200,
        },
        {
            "event_id": 2,
            "area": 2,
            "length": 2,
            "severity_index": 2,
            "start_time": 1643760000,
        },
        {
            "event_id": 3,
            "area": 3,
            "length": 3,
            "severity_index": 3,
            "start_time": 1646265600,
        },
        {
            "event_id": 4,
            "area": 4,
            "length": 4,
            "severity_index": 4,
            "start_time": 1649030400,
        },
        {
            "event_id": 5,
            "area": 5,
            "length": 5,
            "severity_index": 5,
            "start_time": 1651708800,
        },
    ]


@pytest.mark.asyncio
async def test_query_no_filters_with_limit(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[],
        limit=1,
    )

    assert count == 5

    assert result == [
        {
            "event_id": 1,
            "area": 1,
            "length": 1,
            "severity_index": 1,
            "start_time": 1640995200,
        },
    ]


@pytest.mark.asyncio
async def test_query_no_filters_with_fields(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[], limit=9999, fields=["event_id"]
    )

    assert count == 5

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
        {"event_id": 3},
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_gt(redis_test_client):
    ##########
    # > , gt #
    ##########

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "gt", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_gte(redis_test_client):
    ############
    # >= , gte #
    ############

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "gte", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 3

    assert result == [
        {"event_id": 3},
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_lt(redis_test_client):
    ##########
    # < , lt #
    ##########

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "lt", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_lte(redis_test_client):
    ############
    # <= , lte #
    ############

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "lte", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 3

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_eq(redis_test_client):
    ###########
    # == , eq #
    ###########

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "eq", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_neq(redis_test_client):
    ############
    # != , neq #
    ############

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "eq", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_multi_filter_same_attribute(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "gt", 2], ["severity_index", "lt", 4]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_multi_filter_different_attribute(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["severity_index", "gt", 2], ["area", "lt", 4]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_gt(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "gt", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    # assert count == 2

    assert result == [
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_gte(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "gte", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 3

    assert result == [
        {"event_id": 3},
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_lt(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "lt", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_lte(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "lte", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 3

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_eq(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "eq", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


@pytest.mark.asyncio
async def test_query_simple_filter_datetime_neq(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[["start_time", "neq", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 4

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
        {"event_id": 4},
        {"event_id": 5},
    ]


@pytest.mark.asyncio
async def test_query_multi_filter_datetime(redis_test_client):

    count, result = await redis_test_client.query_events(
        filters=[
            ["start_time", "gt", "2022-01-01T00:00:00+00:00"],
            ["start_time", "lt", "2022-05-05T00:00:00+00:00"],
        ],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 3

    assert result == [
        {"event_id": 2},
        {"event_id": 3},
        {"event_id": 4},
    ]
