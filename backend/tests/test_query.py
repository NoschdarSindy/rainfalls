import pandas as pd
import pytest
from app.models import DataFrameDBClient


@pytest.fixture()
def json_data():
    return {
        1: {
            "event_id": 1,
            "area": 1,
            "length": 1,
            "severity_index": 1,
            "start": "2022-01-01T00:00:00+00:00",
            "start_time": 1640995200,
            "timeseries": [],
            "meanLat": 1,
            "meanLon": 1,
            "meanPrec": 1,
            "maxPrec": 1,
        },
        2: {
            "event_id": 2,
            "area": 2,
            "length": 2,
            "severity_index": 2,
            "start": "2022-02-02T00:00:00+00:00",
            "start_time": 1643760000,
            "timeseries": [],
            "meanLat": 2,
            "meanLon": 2,
            "meanPrec": 2,
            "maxPrec": 2,
        },
        3: {
            "event_id": 3,
            "area": 3,
            "length": 3,
            "severity_index": 3,
            "start": "2022-03-03T00:00:00+00:00",
            "start_time": 1646265600,
            "timeseries": [],
            "meanLat": 3,
            "meanLon": 3,
            "meanPrec": 3,
            "maxPrec": 3,
        },
        4: {
            "event_id": 4,
            "area": 4,
            "length": 4,
            "severity_index": 4,
            "start": "2022-04-04T00:00:00+00:00",
            "start_time": 1649030400,
            "timeseries": [],
            "meanLat": 4,
            "meanLon": 4,
            "meanPrec": 4,
            "maxPrec": 4,
        },
        5: {
            "event_id": 5,
            "area": 5,
            "length": 5,
            "severity_index": 5,
            "start": "2022-05-05T00:00:00+00:00",
            "start_time": 1651708800,
            "timeseries": [],
            "meanLat": 5,
            "meanLon": 5,
            "meanPrec": 5,
            "maxPrec": 5,
        },
    }


@pytest.fixture()
def data_frame(json_data):
    return pd.DataFrame.from_dict(json_data, orient="index")


@pytest.fixture()
def db_client(data_frame):
    return DataFrameDBClient(df=data_frame)


def test_db_client(db_client):
    assert len(db_client.df) == 5
    assert db_client.get_event_by_id(3) == {
        "event_id": 3,
        "area": 3,
        "length": 3,
        "severity_index": 3,
        "start": "2022-03-03T00:00:00+00:00",
        "start_time": 1646265600,
        "timeseries": [],
        "meanLat": 3,
        "meanLon": 3,
        "meanPrec": 3,
        "maxPrec": 3,
    }


def test_query_no_filters(db_client, json_data):

    count, result = db_client.query_events(
        filters=[],
        limit=99999,
    )

    assert count == len(json_data.keys())

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


def test_query_no_filters_with_limit(db_client):

    count, result = db_client.query_events(
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


def test_query_no_filters_with_fields(db_client):

    count, result = db_client.query_events(filters=[], limit=9999, fields=["event_id"])

    assert count == 5

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
        {"event_id": 3},
        {"event_id": 4},
        {"event_id": 5},
    ]


def test_query_simple_filter_gt(db_client):
    ##########
    # > , gt #
    ##########

    count, result = db_client.query_events(
        filters=[["severity_index", "gt", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 4},
        {"event_id": 5},
    ]


def test_query_simple_filter_gte(db_client):
    ############
    # >= , gte #
    ############

    count, result = db_client.query_events(
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


def test_query_simple_filter_lt(db_client):
    ##########
    # < , lt #
    ##########

    count, result = db_client.query_events(
        filters=[["severity_index", "lt", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
    ]


def test_query_simple_filter_lte(db_client):
    ############
    # <= , lte #
    ############

    count, result = db_client.query_events(
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


def test_query_simple_filter_eq(db_client):
    ###########
    # == , eq #
    ###########

    count, result = db_client.query_events(
        filters=[["severity_index", "eq", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


def test_query_simple_filter_neq(db_client):
    ############
    # != , neq #
    ############

    count, result = db_client.query_events(
        filters=[["severity_index", "eq", 3]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


def test_query_multi_filter_same_attribute(db_client):

    count, result = db_client.query_events(
        filters=[["severity_index", "gt", 2], ["severity_index", "lt", 4]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


def test_query_multi_filter_different_attribute(db_client):

    count, result = db_client.query_events(
        filters=[["severity_index", "gt", 2], ["area", "lt", 4]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


def test_query_simple_filter_datetime_gt(db_client):

    count, result = db_client.query_events(
        filters=[["start_time", "gt", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    # assert count == 2

    assert result == [
        {"event_id": 4},
        {"event_id": 5},
    ]


def test_query_simple_filter_datetime_gte(db_client):

    count, result = db_client.query_events(
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


def test_query_simple_filter_datetime_lt(db_client):

    count, result = db_client.query_events(
        filters=[["start_time", "lt", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 2

    assert result == [
        {"event_id": 1},
        {"event_id": 2},
    ]


def test_query_simple_filter_datetime_lte(db_client):

    count, result = db_client.query_events(
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


def test_query_simple_filter_datetime_eq(db_client):

    count, result = db_client.query_events(
        filters=[["start_time", "eq", "2022-03-03T00:00:00+00:00"]],
        limit=9999,
        fields=["event_id"],
    )

    assert count == 1

    assert result == [
        {"event_id": 3},
    ]


def test_query_simple_filter_datetime_neq(db_client):

    count, result = db_client.query_events(
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


def test_query_multi_filter_datetime(db_client):

    count, result = db_client.query_events(
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
