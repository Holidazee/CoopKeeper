from datetime import date

from sqlalchemy import select

from app.auth import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models import Chicken, Egg, User

SAMPLE_USER = {
    "username": "sampleuser",
    "password": "samplepass",
}

SAMPLE_CHICKENS = [
    {
        "name": "Sample Daisy",
        "breed": "Rhode Island Red",
        "eggs": [
            {"date": date(2026, 4, 10), "count": 2},
            {"date": date(2026, 4, 11), "count": 1},
        ],
    },
    {
        "name": "Sample Hazel",
        "breed": "Plymouth Rock",
        "eggs": [
            {"date": date(2026, 4, 10), "count": 1},
            {"date": date(2026, 4, 12), "count": 2},
        ],
    },
]


def seed_sample_data() -> dict[str, int]:
    Base.metadata.create_all(bind=engine)

    created_chickens = 0
    created_eggs = 0

    with SessionLocal() as session:
        user = session.scalar(select(User).where(User.username == SAMPLE_USER["username"]))
        if user is None:
            user = User(
                username=SAMPLE_USER["username"],
                password_hash=hash_password(SAMPLE_USER["password"]),
            )
            session.add(user)
            session.flush()

        for chicken_data in SAMPLE_CHICKENS:
            chicken = session.scalar(
                select(Chicken).where(
                    Chicken.name == chicken_data["name"],
                    Chicken.user_id == user.id,
                )
            )

            if chicken is None:
                chicken = Chicken(
                    name=chicken_data["name"],
                    breed=chicken_data["breed"],
                    user_id=user.id,
                )
                session.add(chicken)
                session.flush()
                created_chickens += 1

            for egg_data in chicken_data["eggs"]:
                existing_egg = session.scalar(
                    select(Egg).where(
                        Egg.chicken_id == chicken.id,
                        Egg.user_id == user.id,
                        Egg.date == egg_data["date"],
                        Egg.count == egg_data["count"],
                    )
                )
                if existing_egg is None:
                    session.add(
                        Egg(
                            date=egg_data["date"],
                            count=egg_data["count"],
                            chicken_id=chicken.id,
                            user_id=user.id,
                        )
                    )
                    created_eggs += 1

        session.commit()

    return {
        "created_chickens": created_chickens,
        "created_eggs": created_eggs,
    }


if __name__ == "__main__":
    result = seed_sample_data()
    print(
        "Sample data ready "
        f"(created {result['created_chickens']} chickens, {result['created_eggs']} egg records)."
    )
