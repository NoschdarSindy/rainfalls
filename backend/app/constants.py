import os

REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379")
DATASET_PATH = os.environ.get("DATASET_PATH", "../dataset.json")

PRE_OVERALL = "overall"
PRE_DETAIL = "detail"

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
STDV = "standard_deviation"

PRE_O_AREA = f"{PRE_OVERALL}:{AREA}"
PRE_O_LENGTH = f"{PRE_OVERALL}:{LENGTH}"
PRE_O_SEV_INDEX = f"{PRE_OVERALL}:{SEV_INDEX}"
