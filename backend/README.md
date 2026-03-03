# Milkman Backend (Rajan Dairy)

Django + DRF backend for Rajan Dairy subscription platform.

## Stack
- Python 3.12+
- Django 5+
- Django REST Framework
- SQLite (development)
- JWT auth with SimpleJWT

## Setup
1. Create and activate virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy env file:
   ```bash
   cp .env.example .env
   ```
4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Seed Rajan Dairy data:
   ```bash
   python manage.py seed_rajan_dairy
   ```
6. Run server:
   ```bash
   python manage.py runserver
   ```
7. Run API tests:
   ```bash
   python manage.py test
   ```

## Environment Variables
- `DJANGO_SECRET_KEY`: Required in production (`DEBUG=False`).
- `DEBUG`: `True` for local dev, `False` for production.
- `ALLOWED_HOSTS`: Comma-separated hosts.
- `CORS_ALLOW_ALL_ORIGINS`: Keep `False` in production.
- `CORS_ALLOWED_ORIGINS`: Comma-separated allowed frontend origins.
- `CSRF_TRUSTED_ORIGINS`: Comma-separated trusted origins.
- `JWT_ACCESS_MINUTES`: Access token lifetime in minutes.
- `JWT_REFRESH_DAYS`: Refresh token lifetime in days.
- `SECURE_SSL_REDIRECT`: Force HTTPS redirect in production.
- `SESSION_COOKIE_SECURE`: Secure session cookie flag.
- `CSRF_COOKIE_SECURE`: Secure CSRF cookie flag.

## Sample admin user creation command
Interactive:
```bash
python manage.py createsuperuser --email admin@rajandairy.com
```

Non-interactive:
```bash
python manage.py shell -c "from accounts.models import CustomUser; CustomUser.objects.create_superuser('admin@rajandairy.com','Admin@12345')"
```

## API Endpoints
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET/POST/PUT/PATCH/DELETE /api/categories/`
- `GET/POST/PUT/PATCH/DELETE /api/products/`
- `GET/POST/PATCH /api/subscriptions/`
- `GET /api/subscriptions/admin/all/` (admin only)
- `GET/POST /api/orders/`
- `GET /api/orders/admin/all/` (admin only)
- `POST /api/payment/`

## Key Business Rules
- Role-based access (`ADMIN`, `CUSTOMER`).
- Customers cannot modify category/product admin resources.
- Duplicate active subscription for the same user+product is blocked.
- Date validations on subscription creation.
- Dummy payment marks subscription as `Paid` and activates it.
- Dummy payment marks orders as `Paid` and confirms them.
- Product images are stored under `media/products/`.
