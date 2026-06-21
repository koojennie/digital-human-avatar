import Course from "../../models/course.model.js";

export const generateCourseId = async (transaction = null) => {
  const lastCourse = await Course.findOne({
    order: [["created_at", "DESC"]],
    transaction 
  });

  const lastNumber = lastCourse
    ? parseInt(lastCourse.course_id.replace("CRS-", ""), 10)
    : 0;

  return `CRS-${String(lastNumber + 1).padStart(4, "0")}`;
};
