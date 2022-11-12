# VA

## FastAPI + Redis Prototype

### Getting started

1. Make sure you have copied the `dataset.json` file into the project directory
2. Run `make build`
3. Run `make serve`
4. Check out the App at http://0.0.0.0:8080 / http://localhost:8080

You can also develop the app locally by:

1. Run `docker-compose up redis`
2. Change `REDIS_URL` in code from `redis://redis:6379` to `redis://127.0.0.1:6379`
3. Run `make serve-local`
4. Check out the App at http://0.0.0.0:8080 / http://localhost:8080

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
