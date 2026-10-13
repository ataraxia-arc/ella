# GRXX INTELLIGENCE

Intelligent Inventory. Effortless Control.

A premium inventory workspace: React frontend, Laravel REST API, and MySQL. Each account only sees its own products. Dashboard totals are calculated from those records (inventory value = price × quantity).

## What you need on Windows

Install these, then reopen VS Code so the terminals can see them:

1. [PHP 8.2 or newer](https://windows.php.net/download/) — add `php` to PATH. Enable `pdo_mysql`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `fileinfo`, and `bcmath` in `php.ini`.
2. [Composer](https://getcomposer.org/download/)
3. [Node.js 20+](https://nodejs.org/)
4. [MySQL 8](https://dev.mysql.com/downloads/installer/) (or MariaDB)
5. VS Code

## 1. Create the database

In MySQL:

```sql
CREATE DATABASE grxx_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

If your MySQL user is not `root` with an empty password, edit `backend/.env` after the next step (`DB_USERNAME`, `DB_PASSWORD`).

## 2. Backend

```powershell
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

The API listens at `http://localhost:8000`.

Leave this terminal open.

## 3. Frontend

Open a second terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The browser title is **GRXX INTELLIGENCE**.

Use `localhost`, not a mix of `localhost` and `127.0.0.1`, so the login cookie is accepted.

## Try the product

1. Choose **Get Started** and create an account (full name, email, password, confirm password).
2. Open **Products** and add:

   | Field | Value |
   | --- | --- |
   | Name | Wireless Keyboard |
   | SKU | KB-001 |
   | Category | Electronics |
   | Price | 1500 |
   | Quantity | 20 |
   | Low-stock threshold | 5 |

3. Open **Dashboard**. You should see 1 product, 20 units, and an inventory value of **30000.00**.
4. Edit the quantity to 15. The value becomes **22500.00**.
5. Delete the product. The dashboard returns to zero.
6. Sign out, create a second account, and confirm it cannot see the first account’s products.
7. Visit `/dashboard` while signed out. You should land on the sign-in page.

## API

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |
| POST | `/api/logout` | Required |
| GET | `/api/user` | Required |
| GET | `/api/dashboard/stats` | Required |
| GET | `/api/products` | Required |
| POST | `/api/products` | Required |
| GET | `/api/products/{id}` | Required, owner only |
| PUT | `/api/products/{id}` | Required, owner only |
| DELETE | `/api/products/{id}` | Required, owner only |

Passwords are hashed. A request for another user’s product returns 404.

Before login or registration, the React app requests `/sanctum/csrf-cookie` and sends cookies with every call.

## Tests

PHPUnit uses an in-memory SQLite database so you can run the suite without touching MySQL. The application itself uses MySQL.

```powershell
cd backend
php artisan test
```

`tests/Feature/InventoryTest.php` covers registration, duplicate email, login and logout, protected routes, the 30,000.00 / 22,500.00 value cases, delete, and account isolation.

## Project layout

```text
grxx-intelligence/
  frontend/     React + Vite + Tailwind + React Router
  backend/      Laravel 12 + Sanctum + Eloquent
```

Database name: `grxx_intelligence`.
