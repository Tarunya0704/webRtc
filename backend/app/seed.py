"""Idempotent seed script: default demo user plus sample upcoming/recent meetings.

Run with: python -m app.seed
"""
from datetime import datetime, timedelta

from app.config import settings
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.meeting import Meeting, MeetingStatus, MeetingType
from app.models.user import User
from app.services.meeting_service import generate_unique_code


def get_or_create_default_user(db) -> User:
    user = db.query(User).filter(User.email == settings.default_user_email).first()
    if user:
        return user

    user = User(
        email=settings.default_user_email,
        name=settings.default_user_name,
        hashed_password=hash_password(settings.default_user_password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_meetings(db, host: User) -> None:
    if db.query(Meeting).filter(Meeting.host_id == host.id).count() > 0:
        return

    now = datetime.utcnow()

    upcoming_specs = [
        ("Weekly Product Sync", "Review sprint progress and blockers.", now + timedelta(days=1, hours=2), 30),
        ("Design Review: Onboarding Flow", "Walk through new onboarding mockups.", now + timedelta(days=2, hours=5), 45),
        ("Client Demo - Acme Corp", "Showcase Q3 feature releases to Acme stakeholders.", now + timedelta(days=4), 60),
    ]
    for title, description, scheduled_at, duration in upcoming_specs:
        db.add(
            Meeting(
                code=generate_unique_code(db),
                title=title,
                description=description,
                meeting_type=MeetingType.scheduled,
                status=MeetingStatus.scheduled,
                host_id=host.id,
                scheduled_at=scheduled_at,
                duration_minutes=duration,
                created_at=now,
            )
        )
        db.flush()

    recent_specs = [
        ("1:1 with Manager", now - timedelta(days=1, hours=3), 25),
        ("All Hands Meeting", now - timedelta(days=3), 55),
        ("Sprint Retrospective", now - timedelta(days=5, hours=1), 40),
    ]
    for title, ended_at, duration in recent_specs:
        started_at = ended_at - timedelta(minutes=duration)
        db.add(
            Meeting(
                code=generate_unique_code(db),
                title=title,
                description=None,
                meeting_type=MeetingType.instant,
                status=MeetingStatus.ended,
                host_id=host.id,
                duration_minutes=duration,
                started_at=started_at,
                ended_at=ended_at,
                created_at=started_at,
            )
        )
        db.flush()

    db.commit()


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = get_or_create_default_user(db)
        seed_meetings(db, user)
        print("Seed complete. Default user: {}".format(settings.default_user_email))
    finally:
        db.close()


if __name__ == "__main__":
    run()
