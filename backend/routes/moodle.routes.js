import express from "express";
import { getQuizGrades } from "../modules/moodle/moodle.controller.js";

const router = express.Router();

router.get("/quiz/:quizId/grades", getQuizGrades);

export default router;