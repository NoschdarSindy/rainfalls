import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def mock_app():
    return TestClient(app)


def test_hello_world(mock_app):
    response = mock_app.get("/")

    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}
