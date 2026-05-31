import User from "../../models/user.model.js";

export class UserRepository {
  async findOrCreateUser(userId, username) {
    return await User.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        username: username,
      },
    });
  }
}
