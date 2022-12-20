import json
import re

import constants
from fastapi.openapi.utils import get_openapi
from main import app

with open("../../frontend/src/client/openapi.json", "w+") as f:
    json.dump(
        get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
        ),
        f,
    )

constants_dict = {
    k: v for k, v in constants.__dict__.items() if re.match(r"^[A-Z_0-9]+$", k)
}
with open("../../frontend/src/client/_constants.json", "w+") as f:
    json.dump(constants_dict, f, indent=2)
