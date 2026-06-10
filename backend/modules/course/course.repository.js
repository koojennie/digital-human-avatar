import Course from "../../models/course.model.js";
import { generateCourseId } from "./course.utils.js";

class CourseRepository {
  async findOrCreateCourse({ moodleCourseId, fullname, shortname }) {
    const courseId = await generateCourseId();

    return Course.findOrCreate({
      where: {
        moodle_course_id: String(moodleCourseId),
      },

      defaults: {
        course_id: courseId,
        moodleCourseId: String(moodleCourseId),
        fullname,
        shortname,
        
      },
    });
  }
}

export default new CourseRepository();
