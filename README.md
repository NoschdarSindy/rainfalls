# VA

## FastAPI + Redis Prototype

### Getting started

1. Make sure you have copied the `dataset.json` file into the project directory
2. Run `make build`
3. Run `make run`
4. Check out the App at http://0.0.0.0:8080 / http://localhost:8080

You can also develop the app locally by:

1. Run `make run-local`
2. Check out the App at http://0.0.0.0:8080 / http://localhost:8080

### Making requests

In the initial draft, I implemented the following endpoints

- `/detail/{id}` - Get details for event with given ID. This includes the events timeseries
- `/area/?start=MILLISECONDS_SINCE_EPOCH&end=MILLISECONDS_SINCE_EPOCH`
- `/length/?start=MILLISECONDS_SINCE_EPOCH&end=MILLISECONDS_SINCE_EPOCH`
- `/severity/?start=MILLISECONDS_SINCE_EPOCH&end=MILLISECONDS_SINCE_EPOCH`

### How it works

This base version created 3 Timeseries in Redis:

1. `"overall:area"`
2. `"overall:length"`
3. `"overall:severity_index"`

Furthermore, we create one key value pair for each event in the dataset, where the
key is the event id and the value are the event details, including the subevent
timeseries.

The 3 Timeseries in Redis support range filtering and aggregation 🚀

### ToDo

- Implement aggregations for the timeseries (Do this on DB level for maximum speed)
- Implement caching

### Docs

- https://redis.io/commands/ts.range/
- https://fastapi.tiangolo.com/tutorial/

## Frontend

First, in the project directory run `npm i` to make sure dependencies are installed

### API Generator

An API Generator will take care of turning the endpoints in `backend/main.py` into JavaScript code.
This will make life easier because instead of constructing complex URLs for an API call we can just call a function and pass the parameters.

#### How to

- Run `make client`

This will generate the code for us inside `frontend/src/client`.
Whenever there are changes to the endpoints in `backend/main.py`, we can simply call `make client` and the frontend will have up to date code for the API.

### React.js

Run React by running `make frontend` from the project directory.
Saving changes to the React files will automatically trigger compilation so you can instantly see the results in your browser.

---

### Starting up the whole application

Alternatively, using docker you can build and run everything needed as follows:

`make build`<br>`make run`
