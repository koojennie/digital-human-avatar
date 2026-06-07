import User from "../../models/user.model.js";

class AuthRepository {
  async findUserByEmail(email) {
    return User.findOne({ where: { email: email } });
  }
  async findUserByUsername(username) {
    return User.findOne({ where: { username: username } });
  }
}

export default new AuthRepository();


