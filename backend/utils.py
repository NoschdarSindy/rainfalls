from datetime import datetime
from logging import getLogger

log = getLogger(__name__)


def iso_timestamp_to_milliseconds_since_epoch(timestamp: str) -> int:
    return int(datetime.fromisoformat(timestamp).timestamp() * 1000)


def transform_dataset_unique_timestamps(dataset: dict) -> dict:
    """
    Add a new field start_ms_timestamp to each event in the dataset and use it as ID.

    The field start_ms_timestamp represents the event start time in milliseconds since
    UNIX epoch.

    Since the original start times are binned by the hour, we add small millisecond
    increments to duplicated timestamps in order to make them unique.
    """
    dataset_unique_timestamps = {}

    for event in dataset.values():
        timestamp = event["start"]
        transformed_timestamp = iso_timestamp_to_milliseconds_since_epoch(timestamp)

        while transformed_timestamp in dataset_unique_timestamps:
            transformed_timestamp += 1

        transformed_event = {**event, "start_time_ms": transformed_timestamp}
        dataset_unique_timestamps[transformed_timestamp] = transformed_event

    duped_times = len(set((e["start"] for e in dataset.values())))
    unique_times = len(dataset_unique_timestamps)
    log.debug(f"Started with {len(dataset)} unique IDs in the dataset")
    log.debug(f"Started with {duped_times} unique start timestamps")
    log.debug(f"Ended with {unique_times} unique timestamps IDs in the new dataset")

    return dataset_unique_timestamps
