"""FastAPI application — Digital Notice Board backend."""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Notice
from schemas import NoticeCreate, NoticeUpdate, NoticeOut, LoginRequest, Token
from auth import authenticate_admin, create_token, require_admin

load_dotenv()


# --- Lifespan: auto-create tables on startup ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Digital Notice Board", version="1.0.0", lifespan=lifespan)


# --- CORS ---

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health check ---

@app.get("/health")
def health():
    return {"status": "ok"}


# --- Auth ---

@app.post("/login", response_model=Token)
def login(body: LoginRequest):
    if not authenticate_admin(body.username, body.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    return Token(access_token=create_token(body.username))


# --- Public notices ---

@app.get("/notices", response_model=list[NoticeOut])
def list_notices(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    include_expired: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Public endpoint. Returns non-expired notices sorted: pinned → urgent → newest."""
    query = db.query(Notice)

    # Filter expired (unless admin requests all)
    if not include_expired:
        now = datetime.now(timezone.utc)
        query = query.filter(
            or_(Notice.expires_at.is_(None), Notice.expires_at > now)
        )

    # Optional category filter
    if category:
        query = query.filter(Notice.category == category)

    # Optional text search
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(Notice.title.ilike(pattern), Notice.body.ilike(pattern))
        )

    # Sort: pinned first, then urgent, then newest
    query = query.order_by(
        Notice.is_pinned.desc(),
        (Notice.priority == "Urgent").desc(),
        Notice.created_at.desc(),
    )

    return query.all()


# --- Admin CRUD ---

@app.post("/notices", response_model=NoticeOut, status_code=201)
def create_notice(
    body: NoticeCreate,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    notice = Notice(**body.model_dump())
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@app.put("/notices/{notice_id}", response_model=NoticeOut)
def update_notice(
    notice_id: int,
    body: NoticeUpdate,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    notice = db.query(Notice).get(notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(notice, key, val)
    db.commit()
    db.refresh(notice)
    return notice


@app.delete("/notices/{notice_id}", status_code=204)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    notice = db.query(Notice).get(notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
