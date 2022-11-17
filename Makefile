.PHONY: serve-local
serve-local:
	python -m uvicorn main:app --reload  --app-dir backend/ --port 8080

.PHONY: build
build:
	docker-compose build

.PHONY: serve
serve:
	docker-compose up

.PHONY: frontend
frontend:
	npm run frontend

.PHONY: client
client:
	npm run generate-client


