/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
    const connectionString = "postgres://postgres:03011997Cnj@@db.dhvujedotuiazbseughf.supabase.co:5432/postgres";

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to database successfully!");

        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240306_operation_logs.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await client.query(sql);
        console.log("Migration executed successfully!");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

run();
