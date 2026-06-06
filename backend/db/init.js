import sql from './db.js';

await sql`
    CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
`

await sql`
    CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
`

await sql`
    CREATE TABLE IF NOT EXISTS splits(
        split_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        split_name VARCHAR(255) NOT NULL,
        created_by INT REFERENCES users(user_id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
`

await sql`
    CREATE TABLE IF NOT EXISTS expenses(
        expense_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        expense_name VARCHAR(255) NOT NULL,
        expense_amount DECIMAL(10, 2) NOT NULL,
        split_id INT REFERENCES splits(split_id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
`

await sql`
    CREATE TABLE IF NOT EXISTS user_splits(
        user_id INT REFERENCES users(user_id),
        split_id INT REFERENCES splits(split_id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, split_id)
    );
`