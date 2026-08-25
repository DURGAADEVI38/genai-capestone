from fastapi.testclient import TestClient
from app.main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'healthy'


def test_unresolved_vpn_chat_creates_ticket():
    with TestClient(app) as client:
        response = client.post('/api/chat', json={
            'employee_id': 1,
            'message': 'My VPN is still not working, please create a ticket',
        })

    assert response.status_code == 200
    body = response.json()
    assert body['agent_type'] == 'ticket_agent'
    assert body['source_documents'] == []
    assert 'IT-' in body['agent_response']