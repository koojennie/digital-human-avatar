import Course from "../../models/course.model.js";
import { generateCourseId } from "./course.utils.js";

class CourseRepository {
  async findOrCreateCourse({ moodleCourseId, fullname, shortname }) {

    return Course.findOrCreate({
      where: {
        moodle_course_id: String(moodleCourseId),
      },
      // KUNCI PERBAIKAN: Pastikan nama properti di defaults SAMA dengan nama kolom database
      defaults: {
        course_id: await generateCourseId(),
        moodle_course_id: String(moodleCourseId), // <-- Ubah dari moodleCourseId menjadi moodle_course_id
        fullname,
        shortname,
      },
    });
  }
}

export default new CourseRepository();