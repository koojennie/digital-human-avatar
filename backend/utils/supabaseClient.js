import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { createClient } from "@supabase/supabase-js";


dotenv.config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB_NAME,
  process.env.POSTGRES_DB_USER,
  process.env.POSTGRES_DB_PASS,
  {
    host: process.env.POSTGRES_DB_HOST,
    port: process.env.POSTGRES_DB_PORT,
    dialect: "postgres",
    logging: false,
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Database connected via Sequelize...");
  } catch (err) {
    console.error("Database connection error: ", err.message);
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export { sequelize, connectDB, supabase };
