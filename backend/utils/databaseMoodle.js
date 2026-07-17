import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.MOODLE_DB_HOST,
  port: process.env.MOODLE_DB_PORT,
  user: process.env.MOODLE_DB_USER,
  password: process.env.MOODLE_DB_PASSWORD,
  database: process.env.MOODLE_DB_NAME,
});