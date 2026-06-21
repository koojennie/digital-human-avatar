import ConversationDTO from "./conversation.dto.js";
import conversationRepository from "./conversation.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { MoodleServices } from "../moodle/moodle.service.js";
import { generateConversationId } from "./conversation.utils.js";
import courseRepository from "../course/course.repository.js";

class ConversationService {
  userRepository = new UserRepository();
  moodleService = new MoodleServices();

  async initalizeSession(payload) {
    const { moodleUserId, moodleCourseId } = payload;

    if (!moodleUserId) {
      throw new Error("moodleUserId is required");
    }

    if (!moodleCourseId) {
      throw new Error("moodleCourseId is required");
    }

    // Get user from Moodle
    const responseMoodle = await this.moodleService.getUserMoodleByUserId({
      moodleUserId: moodleUserId,
    });

    const moodleUser = responseMoodle[0];

    if (!moodleUser) {
      throw new Error("User not found in Moodle");
    }

    const responseCourse = await this.moodleService.getCourseMoodleByCourseId({
      courseId: moodleCourseId,
    });

    const moodleCourse = responseCourse.courses[0];

    if (!moodleCourse) {
      throw new Error("Course not found in Moodle");
    }

    const moodleProfile = {
      moodleUserId: moodleUser.id,
      username: moodleUser.username,
      email: moodleUser.email,
      fullname: moodleUser.fullname,
    };

    // Find or create internal user
    const [userRecord] =
      await this.userRepository.findOrCreateUser(moodleProfile);

    const [courseRecord] = await courseRepository.findOrCreateCourse({
      moodleCourseId: moodleCourse.id,

      fullname: moodleCourse.fullname,

      shortname: moodleCourse.shortname,
    });

    // IMPORTANT:
    // Use internal user_id (USR-0001)
    // NOT moodle user id (3)
    const existingConversation = await conversationRepository.findActiveSession(
      {
        user_id: userRecord.user_id,
        course_id: courseRecord.course_id,
      },
    );

    if (existingConversation) {
      return {
        success: true,
        isNewSession: false,
        user: {
          userId: userRecord.user_id,
          moodleUserId: userRecord.moodle_user_id,
          username: userRecord.username,
          fullname: userRecord.full_name,
          email: userRecord.email,
        },

        course: {
          courseId: courseRecord.course_id,
          moodleCourseId: courseRecord.moodle_course_id,
          fullname: courseRecord.fullname,
          shortname: courseRecord.shortname,
        },
        conversation: ConversationDTO.toResponse(existingConversation),
      };
    }

    const conversationId = await generateConversationId();

    const titleConversation = `New Conversation with ${moodleProfile.username}`;

    let newConversation;
    
    try {
      newConversation = await conversationRepository.createConversation({
        conversation_id: conversationId,
        user_id: userRecord.dataValues.user_id,
        course_id: courseRecord.dataValues.course_id,
        title: titleConversation,
        metadata: {},
      });
    } catch (error) {
      console.log("[error] ", error);
    }

    return {
      success: true,
      isNewSession: true,
      user: {
        userId: userRecord.user_id,
        moodleUserId: userRecord.moodle_user_id,
        username: userRecord.username,
        fullname: userRecord.full_name,
        email: userRecord.email,
      },
      course: {
        courseId: courseRecord.course_id,
        moodleCourseId: courseRecord.moodle_course_id,
        fullname: courseRecord.fullname,
        shortname: courseRecord.shortname,
      },
      conversation: ConversationDTO.toResponse(newConversation),
    };
  }

  async getConversationById(id, userId) {
    const conversation = await conversationRepository.findConversationById(id);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.user_id !== userId) {
      throw new Error("Unauthorized access to conversation");
    }

    return ConversationDTO.toResponse(conversation);
  }

  async getUserConversations(userId) {
    const conversations =
      await conversationRepository.findAllConversationByUser(userId);
    return ConversationDTO.toListResponse(conversations);
  }

  async renameConversation(id, userId, title) {
    const conversation = await conversationRepository.findConversationById(id);

    if (!conversation) throw Error("Conversation not found");
    if (conversation.user_id !== userId)
      throw Error("Unauthorized access to conversation");

    const updated = await conversationRepository.updateConversation(id, {
      title,
    });
    return ConversationDTO.toResponse(updated);
  }

  async deleteConversation(id, userId) {
    const conversation = await conversationRepository.findById(id);

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.user_id !== userId) throw new Error("Unauthorized");

    await conversationRepository.delete(id);
    return true;
  }

  async touchConversation(id) {
    await conversationRepository.touchConversation(id);
  }
}

export default new ConversationService();
