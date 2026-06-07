import express from "express";
import { AuthController } from "../modules/auth/auth.controller.js";

const router = express.Router();

const authControler = new AuthController();

router.post("/login", authControler.login);

export default router;
