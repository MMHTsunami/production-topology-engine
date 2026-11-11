import os

os.environ["DATABASE_URL"] = "sqlite://"

from fastapi.testclient import TestClient
from sqlalchemy import text

from backend.main import app
from backend.database import SessionLocal, init_db


def setup_test_db():
    """Initialize the test database"""
    init_db()


def test_equipment_ports_and_connections_round_trip() -> None:
    setup_test_db()
    client = TestClient(app)
    
    source = client.post(
        "/api/equipment",
        json={"name": "Console", "categories": ["audio"]},
    )
    destination = client.post(
        "/api/equipment",
        json={"name": "Switch", "categories": ["video"]},
    )
    assert source.status_code == 201
    assert destination.status_code == 201

    source_port = client.post(
        "/api/ports",
        json={
            "equipment_id": source.json()["id"],
            "name": "Dante Out",
            "direction": "output",
            "signal": "Dante",
            "category": "audio",
        },
    )
    destination_port = client.post(
        "/api/ports",
        json={
            "equipment_id": destination.json()["id"],
            "name": "Dante In",
            "direction": "input",
            "signal": "Dante",
            "category": "video",
        },
    )
    assert source_port.status_code == 201
    assert destination_port.status_code == 201

    # This should fail due to different categories
    connection = client.post(
        "/api/connections",
        json={
            "source_port_id": source_port.json()["id"],
            "destination_port_id": destination_port.json()["id"],
            "label": "Primary link",
            "cable_type": "Cat6",
        },
    )
    assert connection.status_code == 422
    assert len(client.get("/api/equipment").json()) == 2


def test_connection_validation_and_cascade_delete() -> None:
    setup_test_db()
    client = TestClient(app)
    
    equipment = client.post(
        "/api/equipment",
        json={"name": "Router", "categories": ["it"]},
    ).json()
    port = client.post(
        "/api/ports",
        json={
            "equipment_id": equipment["id"],
            "name": "Ethernet 1",
            "direction": "bidirectional",
            "category": "it",
        },
    ).json()

    invalid = client.post(
        "/api/connections",
        json={
            "source_port_id": port["id"],
            "destination_port_id": port["id"],
        },
    )
    assert invalid.status_code == 422

    deleted = client.delete(f"/api/equipment/{equipment['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/ports/{port['id']}").status_code == 404


def test_swagger_and_connection_cascade() -> None:
    setup_test_db()
    client = TestClient(app)
    
    assert client.get("/docs").status_code == 200
    assert client.get("/api/health").json() == {"status": "ok"}

    source = client.post(
        "/api/equipment",
        json={"name": "Source", "categories": ["audio"]},
    ).json()
    destination = client.post(
        "/api/equipment",
        json={"name": "Destination", "categories": ["audio"]},
    ).json()
    source_port = client.post(
        "/api/ports",
        json={
            "equipment_id": source["id"],
            "name": "Out",
            "direction": "output",
            "category": "audio",
        },
    ).json()
    destination_port = client.post(
        "/api/ports",
        json={
            "equipment_id": destination["id"],
            "name": "In",
            "direction": "input",
            "category": "audio",
        },
    ).json()
    linked = client.post(
        "/api/connections",
        json={
            "source_port_id": source_port["id"],
            "destination_port_id": destination_port["id"],
        },
    )
    assert linked.status_code == 201

    assert client.delete(f"/api/equipment/{source['id']}").status_code == 204
    remaining_ids = {
        connection["id"] for connection in client.get("/api/connections").json()
    }
    assert linked.json()["id"] not in remaining_ids


def test_signal_path_same_category_requirement() -> None:
    """Test that ports must be in the same category to connect"""
    setup_test_db()
    client = TestClient(app)
    
    audio_equip = client.post(
        "/api/equipment",
        json={"name": "Audio Mixer", "categories": ["audio"]},
    ).json()
    video_equip = client.post(
        "/api/equipment",
        json={"name": "Video Switch", "categories": ["video"]},
    ).json()
    
    audio_port = client.post(
        "/api/ports",
        json={
            "equipment_id": audio_equip["id"],
            "name": "Out",
            "direction": "output",
            "category": "audio",
        },
    ).json()
    video_port = client.post(
        "/api/ports",
        json={
            "equipment_id": video_equip["id"],
            "name": "In",
            "direction": "input",
            "category": "video",
        },
    ).json()
    
    # Should fail due to different categories
    connection = client.post(
        "/api/connections",
        json={
            "source_port_id": audio_port["id"],
            "destination_port_id": video_port["id"],
        },
    )
    assert connection.status_code == 422
    assert "same category" in connection.json()["detail"].lower()


def test_signal_path_bidirectional_compatibility() -> None:
    """Test that bidirectional ports can only connect to other bidirectional ports"""
    setup_test_db()
    client = TestClient(app)
    
    equip1 = client.post(
        "/api/equipment",
        json={"name": "Device 1", "categories": ["it"]},
    ).json()
    equip2 = client.post(
        "/api/equipment",
        json={"name": "Device 2", "categories": ["it"]},
    ).json()
    
    # Create bidirectional port
    bidir_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip1["id"],
            "name": "Ethernet 1",
            "direction": "bidirectional",
            "category": "it",
        },
    ).json()
    
    # Create output port
    output_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip2["id"],
            "name": "Ethernet Out",
            "direction": "output",
            "category": "it",
        },
    ).json()
    
    # Should fail: bidirectional to output
    connection1 = client.post(
        "/api/connections",
        json={
            "source_port_id": bidir_port["id"],
            "destination_port_id": output_port["id"],
        },
    )
    assert connection1.status_code == 422
    assert "bidirectional" in connection1.json()["detail"].lower()
    
    # Create input port
    input_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip2["id"],
            "name": "Ethernet In",
            "direction": "input",
            "category": "it",
        },
    ).json()
    
    # Should fail: output to bidirectional
    connection2 = client.post(
        "/api/connections",
        json={
            "source_port_id": output_port["id"],
            "destination_port_id": bidir_port["id"],
        },
    )
    assert connection2.status_code == 422
    assert "bidirectional" in connection2.json()["detail"].lower()


def test_signal_path_bidirectional_to_bidirectional() -> None:
    """Test that bidirectional ports can connect to each other"""
    setup_test_db()
    client = TestClient(app)
    
    equip1 = client.post(
        "/api/equipment",
        json={"name": "Router 1", "categories": ["it"]},
    ).json()
    equip2 = client.post(
        "/api/equipment",
        json={"name": "Router 2", "categories": ["it"]},
    ).json()
    
    bidir_port1 = client.post(
        "/api/ports",
        json={
            "equipment_id": equip1["id"],
            "name": "Ethernet 1",
            "direction": "bidirectional",
            "category": "it",
        },
    ).json()
    bidir_port2 = client.post(
        "/api/ports",
        json={
            "equipment_id": equip2["id"],
            "name": "Ethernet 1",
            "direction": "bidirectional",
            "category": "it",
        },
    ).json()
    
    # Should succeed: bidirectional to bidirectional
    connection = client.post(
        "/api/connections",
        json={
            "source_port_id": bidir_port1["id"],
            "destination_port_id": bidir_port2["id"],
        },
    )
    assert connection.status_code == 201


def test_signal_path_output_to_input() -> None:
    """Test that output ports can connect to input ports in the same category"""
    setup_test_db()
    client = TestClient(app)
    
    equip1 = client.post(
        "/api/equipment",
        json={"name": "Console", "categories": ["audio"]},
    ).json()
    equip2 = client.post(
        "/api/equipment",
        json={"name": "Speaker", "categories": ["audio"]},
    ).json()
    
    output_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip1["id"],
            "name": "Line Out",
            "direction": "output",
            "category": "audio",
        },
    ).json()
    input_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip2["id"],
            "name": "Line In",
            "direction": "input",
            "category": "audio",
        },
    ).json()
    
    # Should succeed
    connection = client.post(
        "/api/connections",
        json={
            "source_port_id": output_port["id"],
            "destination_port_id": input_port["id"],
        },
    )
    assert connection.status_code == 201


def test_signal_path_prevents_input_to_output() -> None:
    """Test that input ports cannot connect to output ports"""
    setup_test_db()
    client = TestClient(app)
    
    equip1 = client.post(
        "/api/equipment",
        json={"name": "Speaker", "categories": ["audio"]},
    ).json()
    equip2 = client.post(
        "/api/equipment",
        json={"name": "Console", "categories": ["audio"]},
    ).json()
    
    input_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip1["id"],
            "name": "Line In",
            "direction": "input",
            "category": "audio",
        },
    ).json()
    output_port = client.post(
        "/api/ports",
        json={
            "equipment_id": equip2["id"],
            "name": "Line Out",
            "direction": "output",
            "category": "audio",
        },
    ).json()
    
    # Should fail: input port cannot be source
    connection = client.post(
        "/api/connections",
        json={
            "source_port_id": input_port["id"],
            "destination_port_id": output_port["id"],
        },
    )
    assert connection.status_code == 422
    assert "source port must be an output" in connection.json()["detail"].lower()
