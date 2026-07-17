import { pool } from "../../utils/databaseMoodle.js";

export class MoodleRepository {
  async getQuizGrades(quizId) {
    const sql = `
      SELECT
          u.id,
          u.username,
          u.firstname,
          u.lastname,
          CONCAT(u.firstname, ' ', u.lastname) AS fullname,
          u.email,

          qa.attempt,
          qa.state,
          qa.sumgrades::float,

          q.sumgrades::float AS max_grade,
          q.grade::float AS final_grade,

          ROUND(
              ((qa.sumgrades / q.sumgrades) * q.grade)::numeric,
              2
          )::float AS score

      FROM mdl_quiz_attempts qa
      INNER JOIN mdl_user u
          ON u.id = qa.userid
      INNER JOIN mdl_quiz q
          ON q.id = qa.quiz

      WHERE qa.quiz = $1
      AND qa.state = 'finished'

      ORDER BY score DESC;
    `;

    const { rows } = await pool.query(sql, [quizId]);

    return rows;
  }
}