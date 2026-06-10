import Course from "../../models/course.model.js";

export const generateCourseId = async () => {
  const lastCourse = await Course.findOne({
    order: [["created_at", "DESC"]],
  });

  const lastNumber = lastCourse
    ? parseInt(lastCourse.course_id.replace("CRS", ""))
    : 0;

  return `CRS-${String(lastNumber + 1).padStart(4, "0")}`;
};
