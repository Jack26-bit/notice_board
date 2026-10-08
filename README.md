# Digital Notice Board

A full-stack notice board application where admins publish announcements and viewers see them in a live feed. Built with **React** (Vite) + **FastAPI** + **PostgreSQL**.

## Features

- **Public feed** — Card layout with search, category filters, auto-refresh (30s polling)
- **Urgent notices** — Red accent + badge for high-priority items
- **Pinned notices** — Pin icon, always shown at the top
- **"NEW" badges** — Highlights notices created since the viewer's last visit
- **Dark mode** — Toggle between light and dark themes
- **TV Mode** — Full-screen, large-text display for lobby screens
- **Admin panel** — Create, edit, delete notices behind JWT auth
- **Responsive** — Mobile-first design

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18, Vite, React Router    |
| Backend  | Python, FastAPI, SQLAlchemy     |
| Database | PostgreSQL (Render)             |
| Auth     | JWT (python-jose)               |

## Project Structure

```
notice-board/
  backend/
    main.py          # FastAPI app with all endpoints
    database.py      # SQLAlchemy engine & session
    models.py        # Notice ORM model
    schemas.py       # Pydantic request/response schemas
    auth.py          # JWT helpers & admin auth
    seed.py          # Inserts 6 sample notices
    requirements.txt
    .env.example
  frontend/
    src/
      components/    # Navbar, NoticeFeed, NoticeCard, Login, AdminPanel, NoticeForm
      api.js         # Fetch wrapper for API calls
      App.jsx        # Root component with routing
      App.css        # Full stylesheet (CSS variables, themes)
    .env.example
  README.md
```

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (local or hosted)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
# Edit .env with your DATABASE_URL and secrets

# Run the server
uvicorn main:app --reload --port 8000

# (Optional) Seed sample data
python seed.py
```

The API docs are available at **http://localhost:8000/docs**.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Run the dev server
npm run dev
```

The app runs at **http://localhost:5173**.

## Environment Variables

### Backend

| Variable         | Description                           | Example                                      |
|------------------|---------------------------------------|----------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string          | `postgresql://user:pass@host:5432/dbname`    |
| `JWT_SECRET`     | Secret key for signing JWTs           | `a-long-random-string`                       |
| `ADMIN_USERNAME` | Admin login username                  | `admin`                                      |
| `ADMIN_PASSWORD` | Admin login password                  | `securepassword123`                          |
| `FRONTEND_URL`   | Frontend origin for CORS              | `https://notice-board-frontend.onrender.com` |

### Frontend

| Variable       | Description                 | Example                                      |
|----------------|-----------------------------|----------------------------------------------|
| `VITE_API_URL` | Backend API base URL        | `https://notice-board-api.onrender.com`      |

## Deploying to Render

### 1. Create a PostgreSQL Database

1. Go to **Render Dashboard → New → PostgreSQL**
2. Choose the free tier, pick a name and region
3. After creation, copy the **External Database URL**

### 2. Deploy the Backend (Web Service)

1. **New → Web Service** → connect your repo
2. **Root Directory**: `notice-board/backend`
3. **Runtime**: Python 3
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Environment Variables**:
   - `DATABASE_URL` = (paste the External Database URL)
   - `JWT_SECRET` = (generate a random string)
   - `ADMIN_USERNAME` = your admin username
   - `ADMIN_PASSWORD` = your admin password
   - `FRONTEND_URL` = (you'll fill this after deploying the frontend)

### 3. Deploy the Frontend (Static Site)

1. **New → Static Site** → connect your repo
2. **Root Directory**: `notice-board/frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com`
6. Add a **Rewrite Rule**: `/* → /index.html` (for React Router)

### 4. Update CORS

Go back to the backend service and set `FRONTEND_URL` to your frontend's Render URL (e.g., `https://notice-board-frontend.onrender.com`).

### 5. Seed Data (Optional)

SSH or use Render Shell to run:
```bash
cd notice-board/backend
python seed.py
```

## Default Demo Credentials

**Admin**
- **Username**: `admin`
- **Password**: `admin123`

**Student**
- **Email**: `demo@student.com`
- **Password**: `student123`

## API Endpoints

| Method | Path              | Auth    | Description                     |
|--------|-------------------|---------|---------------------------------|
| GET    | `/health`         | Public  | Health check                    |
| POST   | `/login`          | Public  | Admin login                     |
| POST   | `/register`       | Public  | Register a new student          |
| POST   | `/student/login`  | Public  | Student login                   |
| GET    | `/me`             | Student | Get current student profile     |
| GET    | `/notices`        | Auth    | List notices (Student or Admin) |
| POST   | `/notices`        | Admin   | Create a notice                 |
| PUT    | `/notices/{id}`   | Admin   | Update a notice                 |
| DELETE | `/notices/{id}`   | Admin   | Delete a notice                 |

**Query params** for `GET /notices`:
- `category` — filter by Exam, Event, Holiday, or General
- `q` — search title and body
- `include_expired` — set `true` to include expired notices (used by admin)
