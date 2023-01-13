import json
import logging
from typing import Optional

import pandas as pd
from constants import AREA, DATASET_PATH, LENGTH, SEV_INDEX, START_TIME
from utils import datetime_to_posix_timestamp_seconds

log = logging.getLogger(__name__)


class DataFrameDBClient:
    def __init__(self, df: Optional[pd.DataFrame] = None):
        self._df = df

    @property
    def df(self):
        assert self._df is not None, (
            "Dataset has not been loaded yet, "
            "please run 'initialize_database_from_path() first'"
        )

        return self._df.copy(deep=True)

    def get_event_by_id(self, event_id: int):
        matches = self.df.loc[self.df["event_id"] == event_id].to_dict("records")
        return matches[0] if matches else None

    def query_events(
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

        # make a copy of the DataFrame for manipulation
        filtered_df = self.df

        # fmt: off
        operator_map = {
            "lt":  lambda df, field, value: df[df[field] <  value],
            "lte": lambda df, field, value: df[df[field] <= value],
            "gt":  lambda df, field, value: df[df[field] >  value],
            "gte": lambda df, field, value: df[df[field] >= value],
            "eq":  lambda df, field, value: df[df[field] == value],
            "neq": lambda df, field, value: df[df[field] != value],
        }
        # fmt: on

        value_type_map = {
            "start": lambda value: pd.to_datetime(value, format="%Y-%m-%dT%H:%M:%S"),
            "start_time": lambda value: datetime_to_posix_timestamp_seconds(value),
            "event_id": lambda value: int(value),
        }

        for (field, operator, value) in filters:

            # ensure proper value types, otherwise pandas won't do the comparisons
            value_transformer = value_type_map.get(field, lambda value: float(value))
            value = value_transformer(value)

            # filter the DataFrame
            filter_func = operator_map[operator]
            filtered_df = filter_func(filtered_df, field, value)

        count_before_limit = len(filtered_df.index)

        if limit is not None:
            filtered_df = filtered_df.iloc[:limit]

        # apply fields filter so we only return relevant result fields
        filtered_df = filtered_df[[*fields]]

        return count_before_limit, filtered_df.to_dict("records")

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

    def initialize_database_from_path(self, dataset_path=DATASET_PATH):
        if self._df is None:
            self._df = pd.read_pickle(
                dataset_path,
                compression={"method": "gzip", "compresslevel": 1},
            )
