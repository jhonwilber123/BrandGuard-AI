import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["project"] == "Content Suite - BrandGuard AI"

def test_login_success_creator():
    response = client.post("/api/v1/auth/login", json={
        "username": "creador1",
        "password": "pwd"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "creator"

def test_login_success_approver():
    response = client.post("/api/v1/auth/login", json={
        "username": "aprobador1",
        "password": "pwd"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "approver_a"

def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "username": "invalid_user",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales incorrectas"

def test_rbac_creator_accessing_audit_endpoint():
    # Login as creator
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "creador1",
        "password": "pwd"
    })
    token = login_resp.json()["access_token"]
    
    # Intento de subir imagen a /audit (Requiere rol de aprobador)
    # Como enviamos form-data simulado sin imagen
    response = client.post(
        "/api/v1/audit/audit-image",
        headers={"Authorization": f"Bearer {token}"},
        data={"product_context": "Test Context"},
        files={"file": ("test.png", b"fake_image_bytes", "image/png")}
    )
    # Debería devolver 403 Forbidden por no tener permisos (es creador)
    assert response.status_code == 403
    assert "No tienes permisos" in response.json()["detail"]

def test_dna_generation_end_to_end():
    # Login as approver A
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "aprobador1",
        "password": "pwd"
    })
    token = login_resp.json()["access_token"]
    
    # Generate DNA
    response = client.post(
        "/api/v1/dna/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_category": "Snack de frutas liofilizadas",
            "tone_of_voice": "Alegre y ecológico",
            "target_audience": "Millennials y Gen Z",
            "core_values": "Sostenibilidad, Sabor, Salud"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "dna_id" in data
    assert "generated_manual" in data
    assert len(data["generated_manual"]) > 10

def test_content_generation_end_to_end():
    # Login as creator
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "creador1",
        "password": "pwd"
    })
    token = login_resp.json()["access_token"]
    
    # Generate content
    response = client.post(
        "/api/v1/content/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_name": "Test Pytest Product",
            "tone": "Formal y corporativo",
            "target_audience": "Millennials",
            "additional_instructions": "Prueba unitaria automatizada."
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "content_id" in data
    assert "generated_text" in data
    assert data["status"] in ["PENDING", "APPROVED", "REJECTED"]

def test_multimodal_audit_end_to_end():
    # Login as approver
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "aprobador1",
        "password": "pwd"
    })
    token = login_resp.json()["access_token"]
    
    # Simular una pequeña imagen de 1x1 píxel negro en PNG
    fake_png = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
    )

    response = client.post(
        "/api/v1/audit/audit-image",
        headers={"Authorization": f"Bearer {token}"},
        data={"product_context": "Campaña Pytest"},
        files={"file": ("fake_image.png", fake_png, "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "is_approved" in data
    assert "explanation" in data
    # Comprobar que es un booleano
    assert isinstance(data["is_approved"], bool)
