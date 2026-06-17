import sql from './db.js';

async function initDb() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                user_name VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS splits(
                split_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                split_name VARCHAR(255) NOT NULL,
                created_by INT REFERENCES users(user_id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS expenses(
                expense_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                expense_name VARCHAR(255) NOT NULL,
                expense_amount DECIMAL(10, 2) NOT NULL,
                split_id INT REFERENCES splits(split_id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS user_splits(
                user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                split_id INT REFERENCES splits(split_id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                PRIMARY KEY (user_id, split_id)
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS session (
                "sid" varchar NOT NULL COLLATE "default",
                sess json NOT NULL,
                expire timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);
        `;

        await sql`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'session_pkey'
                ) THEN
                    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
                END IF;
            END $$;
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `;

        console.log('Database initialization completed');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}

async function runInitDb() {
    let exitCode = 0;

    try {
        await initDb();
    } catch {
        exitCode = 1;
    } finally {
        await sql.end();
        process.exit(exitCode);
    }
}

runInitDb();

export default initDb;
