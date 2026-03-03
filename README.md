# Milkman Monorepo - Rajan Dairy

## Structure
- `backend/` Django + DRF API
- `frontend/` React + Vite + Tailwind web app

## Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py seed_rajan_dairy
python manage.py runserver
```

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Default URLs
- Backend: `http://127.0.0.1:8000/`
- Frontend: `http://127.0.0.1:5173/`

## CI Pipeline
- Workflow: `.github/workflows/ci.yml`
- Runs on push and pull requests.
- Backend job: `python manage.py check` + `python manage.py test`
- Frontend job: `npm install` + `npm run build`
