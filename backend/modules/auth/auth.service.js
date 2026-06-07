import { UserRepository } from "../user/user.repository.js";

export class AuthService {
  userRepository = new UserRepository();
  async validateUserById(userId) {
    return this.userRepository.findUserById(userId);
  }
}
