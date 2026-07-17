import { MoodleServices } from "./moodle.service.js";

const moodleService = new MoodleServices();

export const getQuizGrades = async (req, res) => {
  try {
    const { quizId } = req.params;

    const grades = await moodleService.getQuizGrades({
      quizId: Number(quizId),
    });

    return res.status(200).json({
      success: true,
      data: grades,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};