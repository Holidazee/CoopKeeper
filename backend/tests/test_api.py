import os
import sys
import tempfile
import unittest
from pathlib import Path

TEST_DB_PATH = Path(tempfile.mkdtemp()) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH.as_posix()}"

for module_name in list(sys.modules):
    if module_name == "app" or module_name.startswith("app."):
        sys.modules.pop(module_name)

from fastapi.testclient import TestClient

from app.db.database import Base, engine
from app.main import app


class CoopKeeperApiTests(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.client_context = TestClient(app)
        self.client = self.client_context.__enter__()
        self.auth_headers = self.create_auth_headers("tester", "secret123")

    def tearDown(self):
        self.client_context.__exit__(None, None, None)
        Base.metadata.drop_all(bind=engine)

    def create_auth_headers(self, username: str, password: str) -> dict[str, str]:
        signup_response = self.client.post(
            "/auth/signup",
            json={"username": username, "password": password},
        )
        self.assertEqual(signup_response.status_code, 201)
        login_response = self.client.post(
            "/auth/login",
            json={"username": username, "password": password},
        )
        self.assertEqual(login_response.status_code, 200)
        access_token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {access_token}"}

    def create_chicken(self, name: str, breed: str | None = None) -> dict:
        response = self.client.post(
            "/chickens",
            json={"name": name, "breed": breed},
            headers=self.auth_headers,
        )
        self.assertEqual(response.status_code, 201)
        return response.json()

    def create_egg(self, chicken_id: int, egg_date: str, count: int) -> dict:
        response = self.client.post(
            "/eggs",
            json={"date": egg_date, "count": count, "chicken_id": chicken_id},
            headers=self.auth_headers,
        )
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_chickens_crud_endpoints(self):
        created = self.create_chicken("Daisy", "Rhode Island Red")

        list_response = self.client.get("/chickens", headers=self.auth_headers)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json(), [created])

        get_response = self.client.get(f"/chickens/{created['id']}", headers=self.auth_headers)
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json(), created)

        update_response = self.client.put(
            f"/chickens/{created['id']}",
            json={"name": "Daisy Updated", "breed": "Leghorn"},
            headers=self.auth_headers,
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(
            update_response.json(),
            {"id": created["id"], "name": "Daisy Updated", "breed": "Leghorn"},
        )

        delete_response = self.client.delete(f"/chickens/{created['id']}", headers=self.auth_headers)
        self.assertEqual(delete_response.status_code, 204)

        missing_response = self.client.get(f"/chickens/{created['id']}", headers=self.auth_headers)
        self.assertEqual(missing_response.status_code, 404)
        self.assertEqual(missing_response.json(), {"detail": "Chicken not found"})

    def test_eggs_endpoints_and_filtering(self):
        chicken_a = self.create_chicken("Hazel", "Plymouth Rock")
        chicken_b = self.create_chicken("Maple", "Leghorn")

        egg_a1 = self.create_egg(chicken_a["id"], "2026-04-10", 2)
        egg_a2 = self.create_egg(chicken_a["id"], "2026-04-11", 1)
        egg_b1 = self.create_egg(chicken_b["id"], "2026-04-12", 3)

        list_response = self.client.get("/eggs", headers=self.auth_headers)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json(), [egg_a1, egg_a2, egg_b1])

        filtered_response = self.client.get(
            f"/eggs?chicken_id={chicken_a['id']}",
            headers=self.auth_headers,
        )
        self.assertEqual(filtered_response.status_code, 200)
        self.assertEqual(filtered_response.json(), [egg_a1, egg_a2])

        get_response = self.client.get(f"/eggs/{egg_a1['id']}", headers=self.auth_headers)
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json(), egg_a1)

        update_response = self.client.put(
            f"/eggs/{egg_a1['id']}",
            json={"date": "2026-04-13", "count": 4, "chicken_id": chicken_b["id"]},
            headers=self.auth_headers,
        )
        self.assertEqual(update_response.status_code, 200)
        updated_egg = update_response.json()
        self.assertEqual(
            updated_egg,
            {
                "id": egg_a1["id"],
                "date": "2026-04-13",
                "count": 4,
                "chicken_id": chicken_b["id"],
            },
        )

        filtered_b_response = self.client.get(
            f"/eggs?chicken_id={chicken_b['id']}",
            headers=self.auth_headers,
        )
        self.assertEqual(filtered_b_response.status_code, 200)
        self.assertEqual(filtered_b_response.json(), [updated_egg, egg_b1])

        delete_response = self.client.delete(f"/eggs/{egg_a2['id']}", headers=self.auth_headers)
        self.assertEqual(delete_response.status_code, 204)

        missing_response = self.client.get(f"/eggs/{egg_a2['id']}", headers=self.auth_headers)
        self.assertEqual(missing_response.status_code, 404)
        self.assertEqual(missing_response.json(), {"detail": "Egg not found"})

    def test_dashboard_endpoint(self):
        chicken_a = self.create_chicken("Daisy", "Rhode Island Red")
        chicken_b = self.create_chicken("Hazel", "Plymouth Rock")

        self.create_egg(chicken_a["id"], "2026-04-10", 2)
        self.create_egg(chicken_a["id"], "2026-04-11", 1)
        latest_egg = self.create_egg(chicken_b["id"], "2026-04-12", 3)

        response = self.client.get("/dashboard", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)

        dashboard = response.json()
        self.assertEqual(dashboard["total_chickens"], 2)
        self.assertEqual(dashboard["total_eggs"], 6)
        self.assertAlmostEqual(dashboard["average_eggs_per_chicken"], 3.0)
        self.assertEqual(dashboard["latest_egg_record"], latest_egg)

    def test_users_only_access_their_own_chickens_eggs_and_dashboard(self):
        chicken = self.create_chicken("Private Daisy", "Australorp")
        egg = self.create_egg(chicken["id"], "2026-04-15", 2)

        other_headers = self.create_auth_headers("otheruser", "secret456")

        chicken_list_response = self.client.get("/chickens", headers=other_headers)
        self.assertEqual(chicken_list_response.status_code, 200)
        self.assertEqual(chicken_list_response.json(), [])

        egg_list_response = self.client.get("/eggs", headers=other_headers)
        self.assertEqual(egg_list_response.status_code, 200)
        self.assertEqual(egg_list_response.json(), [])

        chicken_detail_response = self.client.get(
            f"/chickens/{chicken['id']}",
            headers=other_headers,
        )
        self.assertEqual(chicken_detail_response.status_code, 404)

        egg_detail_response = self.client.get(f"/eggs/{egg['id']}", headers=other_headers)
        self.assertEqual(egg_detail_response.status_code, 404)

        dashboard_response = self.client.get("/dashboard", headers=other_headers)
        self.assertEqual(dashboard_response.status_code, 200)
        self.assertEqual(
            dashboard_response.json(),
            {
                "total_chickens": 0,
                "total_eggs": 0,
                "average_eggs_per_chicken": 0.0,
                "latest_egg_record": None,
            },
        )


if __name__ == "__main__":
    unittest.main()
