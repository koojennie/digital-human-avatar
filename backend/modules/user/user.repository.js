import User from "../../models/user.model.js";
import { generateUserId } from "./user.utils.js";

export class UserRepository {
  async findOrCreateUser({ moodleUserId, username, email, fullname }) {
    const userId = await generateUserId();

    return await User.findOrCreate({
      where: {
        moodle_user_id: String(moodleUserId),
      },
      defaults: {
        user_id: userId,
        moodle_user_id: String(moodleUserId),
        username,
        email,
        full_name: fullname,
      },
    });
  }

  async findUserByEmail(email) {
    return User.findOne({ where: { email: email } });
  }
  async findUserByUsername(username) {
    return User.findOne({ where: { username: username } });
  }
  async findUserByMoodleId(id) {
    return User.findOne({ where: { moodle_user_id: id } });
  }
  async findUserById(id) {
    return User.findByPk(id);
  }
}
