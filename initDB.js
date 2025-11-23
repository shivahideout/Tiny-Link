import { pool } from "./db.js";

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      url TEXT NOT NULL,
      clicks INT DEFAULT 0,
      last_clicked TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("Table created!");
  pool.end();
}

createTable();
