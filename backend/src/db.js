import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

const initSql = `
CREATE TYPE IF NOT EXISTS role AS ENUM ('user', 'admin');
CREATE TYPE IF NOT EXISTS position_type AS ENUM (
  'CASH_SECURED_PUT',
  'COVERED_CALL',
  'NAKED_CALL',
  'NAKED_PUT',
  'NAKED_PUT_SELLING',
  'NAKED_CALL_SELLING'
);
CREATE TYPE IF NOT EXISTS position_direction AS ENUM ('LONG', 'SHORT');
CREATE TYPE IF NOT EXISTS position_status AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  position_type position_type NOT NULL,
  direction position_direction NOT NULL,
  strike_price NUMERIC(12, 2) NOT NULL,
  premium NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  expiration_date DATE NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE,
  status position_status NOT NULL DEFAULT 'OPEN',
  pnl_realized NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pnl_unrealized NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP
);
`;

const initializeDatabase = async () => {
  await pool.query(initSql);
};

export { db, pool, initializeDatabase };
