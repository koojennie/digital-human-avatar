import User from "../../models/user.model.js";
import { generateUserId } from "./user.utils.js";

export class UserRepository {
  async findOrCreateUser({ moodleUserId, username, email, fullname }) {
    let user = await User.findOne({
      where: { moodle_user_id: String(moodleUserId) },
    });

    if (!user) {
      try {
        const userId = await generateUserId();
        user = await User.create({
          user_id: userId,
          moodle_user_id: String(moodleUserId),
          username,
          email,
          full_name: fullname,
        });
        return [user, true];
      } catch (err) {
        // Ambil data yang sudah terlanjur dibuat oleh request paralel
        user = await User.findOne({
          where: { moodle_user_id: String(moodleUserId) },
        });

        // FIX: Pastikan tetap me-return data agar tidak menghasilkan undefined/null
        return [user, false];
      }
    }

    return [user, false];
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
