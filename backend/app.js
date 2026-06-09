import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, sequelize } from "./utils/supabaseClient.js";

import './models/index.js';
import routes from "./routes/index.js";

// Load environment variables before using them
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

app.use(cookieParser());

// Daftarkan routes SEBELUM middleware 404 dan error handler
app.use("/api/v1", routes); //here the routes

// not found routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "Not Found",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const startServer = async () => {
  // First, establish the database connection
  await connectDB();
  // Then, synchronize the models to create/alter tables
  // await sequelize.sync({ alter: true });
  // console.log("✅ Database Sync!");
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  })
    .on("error", (err) => {
      console.error("Failed to start server:", err.message);
      process.exit(1);
    });
};

startServer();
