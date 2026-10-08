"""Seed script — inserts 6 sample notices for demo purposes."""

from datetime import datetime, timedelta, timezone
from database import engine, Base, SessionLocal
from models import Notice, User


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing notices and users
    db.query(Notice).delete()
    db.query(User).delete()

    from auth import get_password_hash
    demo_user = User(
        name="Demo Student",
        email="demo@student.com",
        password_hash=get_password_hash("student123")
    )
    db.add(demo_user)

    now = datetime.now(timezone.utc)

    notices = [
        Notice(
            title="Mid-Term Exam Schedule Released",
            body="The mid-term examination schedule for all departments has been published. "
                 "Please check the examination portal for your individual timetable and seating arrangement.",
            category="Exam",
            priority="Normal",
            is_pinned=False,
            created_at=now - timedelta(hours=3),
        ),
        Notice(
            title="⚠️ Campus Closed Due to Weather Alert",
            body="Due to severe weather warnings, the campus will remain closed tomorrow. "
                 "All classes and labs are cancelled. Online sessions will continue as scheduled.",
            category="General",
            priority="Urgent",
            is_pinned=False,
            created_at=now - timedelta(minutes=45),
        ),
        Notice(
            title="Annual Cultural Fest — Registrations Open",
            body="Spectrum 2026 is here! Register your team for dance, music, drama, and art competitions. "
                 "Early bird registrations close this Friday. Don't miss out!",
            category="Event",
            priority="Normal",
            is_pinned=True,
            created_at=now - timedelta(days=1),
        ),
        Notice(
            title="Diwali Holiday Schedule",
            body="The institute will observe Diwali holidays from October 20 to October 25. "
                 "Hostel mess will remain operational with a limited menu.",
            category="Holiday",
            priority="Normal",
            is_pinned=False,
            created_at=now - timedelta(days=2),
        ),
        Notice(
            title="Library Extended Hours This Week",
            body="The central library will stay open until 11 PM this week to support exam preparation. "
                 "Please carry your student ID for entry after 8 PM.",
            category="General",
            priority="Normal",
            is_pinned=False,
            created_at=now - timedelta(hours=6),
            expires_at=now + timedelta(hours=2),   # Expires soon!
        ),
        Notice(
            title="Guest Lecture: AI in Healthcare",
            body="Dr. Priya Sharma from AIIMS will deliver a guest lecture on 'Applications of AI in Modern Healthcare' "
                 "in Auditorium B on Friday at 3 PM. All students are welcome.",
            category="Event",
            priority="Normal",
            is_pinned=False,
            created_at=now - timedelta(hours=12),
        ),
    ]

    db.add_all(notices)
    db.commit()
    db.close()
    print(f"✅ Seeded {len(notices)} notices.")


if __name__ == "__main__":
    seed()
