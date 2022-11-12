.PHONY: serve-local
serve-local:
	uvicorn main:app --reload  --app-dir app/ --port 8080

.PHONY: build
build:
	docker-compose build

.PHONY: serve
serve:
	docker-compose up