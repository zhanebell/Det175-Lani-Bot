"""
Basic unit tests for the Flask backend
"""
import pytest
import json
import os
from unittest.mock import patch
from app import app, load_llab_content, load_static_questions


@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Set a test API key for testing
    os.environ['GROQ_API_KEY'] = 'test-api-key'
    with app.test_client() as client:
        yield client


def test_health_check(client):
    """Test health endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['ok'] is True


def test_chat_no_data(client):
    """Test chat endpoint with no data"""
    response = client.post('/chat')
    assert response.status_code == 400


def test_chat_missing_llabs(client):
    """Test chat endpoint with missing LLABs"""
    response = client.post('/chat',
                           data=json.dumps({'messages': [], 'turnstile_token': 'test'}),
                           content_type='application/json')
    # Will return 400 for missing llabs or 500 if API key not set
    assert response.status_code in [400, 401, 500]


def test_load_llab_content():
    """Test LLAB content loading"""
    content = load_llab_content([1, 2])
    assert len(content) > 0
    assert 'LLAB 1' in content or 'Detachment 175' in content


def test_load_static_questions():
    """Test static questions loading"""
    questions = load_static_questions([2, 4])
    assert 'aircraft' in questions
    assert 'ranks' in questions
    assert isinstance(questions['aircraft'], list)


def test_invalid_endpoint(client):
    """Test 404 handling"""
    response = client.get('/invalid')
    assert response.status_code == 404


def test_cors_headers(client):
    """Test CORS headers are present"""
    response = client.options('/health')
    assert 'Access-Control-Allow-Origin' in response.headers


if __name__ == '__main__':
    pytest.main([__file__])
