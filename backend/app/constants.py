import os

APP_PATH = os.path.dirname(os.path.realpath(__file__))
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379")
DATASET_PATH = os.environ.get("DATASET_PATH", f"{APP_PATH}/../../dataset.json")

ONE_HOUR_IN_SECONDS = 3600

AREA = "area"
LENGTH = "length"
LAT = "latitude"
LONG = "longitude"
LAT_MAX = "latitude_max"
LONG_MAX = "longitude_max"
PREC_MAX = "precipitation_max"
PREC_MEAN = "precipitation_mean"
SEV_INDEX = "severity_index"
SIZE = "size"
START_TIME = "start_time"
STDV = "standard_deviation"
