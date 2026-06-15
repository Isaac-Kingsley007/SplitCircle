# SplitCircle

SplitCircle is a full-stack web app for creating shared expense groups, adding friends, recording expenses, and calculating an equal split between members.

It is built with a React frontend, an Express backend, and PostgreSQL for persistent data.

## Table of Contents

- [About the App](#about-the-app)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [How SplitCircle Works](#how-splitcircle-works)
- [API Overview](#api-overview)
- [Database Tables](#database-tables)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## About the App

SplitCircle helps users manage expenses with friends or groups.

A user can create a split, add other existing users to it, add expenses, and see the total amount and equal amount per member. Split creators can manage the split, while joined users can view split details and leave the split.

Current codebase scope: authentication, split creation, member management, expense management, access control, and equal split calculation. A dedicated in-app chat or discussion thread is not included yet.

Typical use cases include:

- Group dinners
- Trips with friends
- Shared rent or household expenses
- Event expenses
- Any situation where people need to divide costs equally

## Features

- User signup and signin
- Session-based authentication
- Create new expense splits
- View splits created by the current user
- View splits joined by the current user
- Add existing users to a split
- Add expenses with name and amount
- View total split amount
- View equal amount per user
- Remove users from a split
- Remove expenses from a split
- Leave a joined split
- Delete a split as the creator
- Protected backend routes
- PostgreSQL-backed sessions

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- PostgreSQL
- postgres.js
- express-session
- connect-pg-simple
- bcryptjs
- Zod
- Helmet
- CORS
- Morgan
- Compression
- express-rate-limit

### Package Management

- pnpm workspace

## Project Structure

```txt
splitapp/
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml

  backend/
    app.js
    package.json
    db/
      db.js
      init.js
    lib/
      hasAccess.js
    middleware/
      auth.js
    routes/
      auth.js
      splits.js

  frontend/
    package.json
    vite.config.ts
    index.html
    src/
      main.tsx
      App.tsx
      route.ts
      types.ts
      lib/
        server.ts
      pages/
        SignIn.tsx
        SignUp.tsx
        Split.tsx
      components/
        AddExpense.tsx
        AddUser.tsx
        CreateSplit.tsx
        DeleteOrLeaveSplit.tsx
        ExpenseTile.tsx
        Logout.tsx
        SplitCard.tsx
        UserTile.tsx
```

## Prerequisites

Install these before running the project:

- Node.js
- pnpm
- PostgreSQL database

Check your installed versions:

```bash
node --version
pnpm --version
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
SESSION_SECRET=replace_this_with_a_long_random_secret
PORT=3000
NODE_ENV=development
```

### Backend Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by the backend. |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies. Use a long random value. |
| `PORT` | No | Backend port. Defaults to `3000`. |
| `NODE_ENV` | No | Use `development` locally and `production` in production. |

The backend database client is currently configured with SSL verification in `backend/db/db.js`:

```js
ssl: "verify-full"
```

If you use a cloud PostgreSQL provider, this is usually expected. If you use a local PostgreSQL database without SSL, adjust the database configuration for your local environment.

### Frontend Variables

The frontend uses this default API URL:

```txt
http://localhost:3000/api
```

You can override it by creating a `.env` file inside the `frontend` folder:

```env
VITE_BASE_URL=http://localhost:3000/api
```

## Database Setup

The backend includes a database initialization script that creates the required tables.

From the project root, run:

```bash
pnpm --filter backend init-db
```

This creates:

- `users`
- `splits`
- `expenses`
- `user_splits`
- `session`

## Running the App

Install dependencies from the project root:

```bash
pnpm install
```

Initialize the database:

```bash
pnpm --filter backend init-db
```

Start both frontend and backend:

```bash
pnpm dev
```

The app runs at:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3000
API:      http://localhost:3000/api
```

You can also run each side separately:

```bash
pnpm dev:backend
pnpm dev:frontend
```

## Available Scripts

### Root Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Runs the workspace dev scripts in parallel. |
| `pnpm dev:frontend` | Starts the Vite frontend. |
| `pnpm dev:backend` | Starts the Express backend with nodemon. |

### Backend Scripts

Run these from the root with `pnpm --filter backend <script>`.

| Command | Description |
| --- | --- |
| `pnpm --filter backend dev` | Starts the backend using nodemon. |
| `pnpm --filter backend start` | Starts the backend using Node. |
| `pnpm --filter backend init-db` | Creates the required database tables. |

### Frontend Scripts

Run these from the root with `pnpm --filter frontend <script>`.

| Command | Description |
| --- | --- |
| `pnpm --filter frontend dev` | Starts the Vite development server. |
| `pnpm --filter frontend build` | Type-checks and builds the frontend. |
| `pnpm --filter frontend lint` | Runs ESLint. |
| `pnpm --filter frontend preview` | Previews the production frontend build. |

## How SplitCircle Works

### Authentication Flow

Users create an account with a username and password. Passwords are hashed with `bcryptjs` before being stored in PostgreSQL.

After signin, the backend stores the logged-in user's ID in an Express session:

```js
req.session.userId = user.user_id;
```

The session is stored in PostgreSQL using `connect-pg-simple`, and the frontend sends requests with cookies enabled.

### Split Flow

1. A logged-in user creates a split.
2. The creator becomes the owner of that split.
3. The creator can add existing users to the split.
4. The creator can add expenses to the split.
5. SplitCircle calculates the total expense amount.
6. SplitCircle calculates the equal amount per member.
7. Joined users can view the split and leave it.
8. The creator can remove expenses, remove users, or delete the split.

### Access Rules

SplitCircle uses two access levels:

| Access Level | Who Has It | What It Allows |
| --- | --- | --- |
| Read access | Split creator and joined users | View split details. |
| Write access | Split creator only | Add/remove users, add/remove expenses, delete the split. |

The access helpers live in:

```txt
backend/lib/hasAccess.js
```

### Equal Split Calculation

The backend calculates:

```txt
amount_per_user = total_expenses / number_of_users_in_split
```

The value is rounded to 2 decimal places. If no users are attached to the split yet, the amount per user is returned as `0`.

## API Overview

The backend API is served under:

```txt
/api
```

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Checks whether the backend is running. |

### Auth Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/auth/is_authenticated` | Returns whether the current user has an active session. |
| `POST` | `/api/auth/signup` | Creates a new user. |
| `POST` | `/api/auth/signin` | Signs in a user and creates a session. |
| `POST` | `/api/auth/signout` | Destroys the current session. |

#### Signup Body

```json
{
  "user_name": "john_doe",
  "password": "password123"
}
```

#### Signin Body

```json
{
  "user_name": "john_doe",
  "password": "password123"
}
```

Username rules:

- Minimum 5 characters
- Maximum 255 characters
- Letters, numbers, and underscores only

Password rules:

- Minimum 8 characters
- Maximum 255 characters

### Split Routes

All split routes require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/splits/created-splits-data` | Lists splits created by the current user. |
| `GET` | `/api/splits/joined-splits-data` | Lists splits joined by the current user. |
| `GET` | `/api/splits/split/:splitId` | Gets split details, expenses, users, total amount, and per-user amount. |
| `GET` | `/api/splits/access-level/:splitId` | Returns read/write access for the current user. |
| `POST` | `/api/splits/create-split` | Creates a new split. |
| `POST` | `/api/splits/add-user-to-split` | Adds an existing user to a split. |
| `POST` | `/api/splits/add-expense` | Adds an expense to a split. |
| `PATCH` | `/api/splits/remove-user-from-split` | Removes a user from a split. |
| `PATCH` | `/api/splits/remove-expense` | Removes an expense from a split. |
| `PATCH` | `/api/splits/leave-split` | Removes the current user from a joined split. |
| `DELETE` | `/api/splits/delete-split` | Deletes a split. |

#### Create Split Body

```json
{
  "split_name": "Weekend Trip"
}
```

#### Add User Body

```json
{
  "split_id": 1,
  "user_name": "john_doe"
}
```

#### Add Expense Body

```json
{
  "split_id": 1,
  "expense_name": "Dinner",
  "expense_amount": 45.5
}
```

#### Remove User Body

```json
{
  "split_id": 1,
  "user_name": "john_doe"
}
```

#### Remove Expense Body

```json
{
  "split_id": 1,
  "expense_id": 10
}
```

#### Leave Split Body

```json
{
  "split_id": 1
}
```

#### Delete Split Body

```json
{
  "split_id": 1
}
```

## Database Tables

### `users`

Stores registered users.

| Column | Description |
| --- | --- |
| `user_id` | Primary key. |
| `user_name` | Unique username. |
| `password` | Hashed password. |
| `created_at` | User creation timestamp. |

### `splits`

Stores split groups.

| Column | Description |
| --- | --- |
| `split_id` | Primary key. |
| `split_name` | Split name. |
| `created_by` | User ID of the split creator. |
| `created_at` | Split creation timestamp. |

### `expenses`

Stores expenses added to splits.

| Column | Description |
| --- | --- |
| `expense_id` | Primary key. |
| `expense_name` | Expense label. |
| `expense_amount` | Expense amount. |
| `split_id` | Related split ID. |
| `created_at` | Expense creation timestamp. |

### `user_splits`

Stores users attached to splits.

| Column | Description |
| --- | --- |
| `user_id` | Related user ID. |
| `split_id` | Related split ID. |
| `created_at` | Join timestamp. |

The pair `user_id` and `split_id` is the primary key, so the same user cannot be added to the same split twice.

### `session`

Stores Express session data.

| Column | Description |
| --- | --- |
| `sid` | Session ID. |
| `sess` | Session data. |
| `expire` | Session expiration timestamp. |

## Development Notes

- The frontend API helper is in `frontend/src/lib/server.ts`.
- API requests use `credentials: "include"` so cookies are sent with requests.
- The backend CORS origin is currently set to `http://localhost:5173`.
- Protected split routes use `backend/middleware/auth.js`.
- Request validation is handled with Zod.
- Passwords are hashed with bcrypt.
- The backend applies rate limiting to `/api/` routes.
- The session cookie is `httpOnly`.
- In production, the session cookie is marked secure when `NODE_ENV=production`.
- The backend signout route is `/api/auth/signout`; keep frontend logout calls aligned with that route.

## Troubleshooting

### The frontend cannot connect to the backend

Check that the backend is running on port `3000` and that the frontend `VITE_BASE_URL` points to:

```txt
http://localhost:3000/api
```

### Requests fail with CORS errors

The backend currently allows:

```txt
http://localhost:5173
```

If the frontend runs on a different port, update the CORS origin in `backend/app.js`.

### You get `Unauthorized`

Signin first. Split routes require an active session cookie.

### A user cannot be added to a split

Only existing users can be added. Create the user's account first, then add that username to the split.

### Database initialization fails

Check:

- `DATABASE_URL` is correct.
- The database exists.
- The database user has permission to create tables.
- Your database SSL settings match `backend/db/db.js`.

### Sessions are not saved

Make sure the `session` table exists by running:

```bash
pnpm --filter backend init-db
```

Also make sure `SESSION_SECRET` is set in `backend/.env`.

## Future Improvements

- Add comments or discussion threads inside each split.
- Track which user paid each expense.
- Calculate settlement balances between individual users.
- Add multiple currency support.
- Add automated tests for backend routes and frontend flows.
- Add deployment documentation for production hosting.

## Summary

SplitCircle is a simple shared expense management app. It lets people create groups, gather members, add expenses, and see the equal split amount for everyone in the group.
