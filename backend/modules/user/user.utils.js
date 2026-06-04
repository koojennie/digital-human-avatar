import User from "../../models/user.model.js";

export const generateUserId = async () => {
  const lastUser = await User.findOne({
    order: [["created_at", "DESC"]],
  });

  const lastNumber = lastUser
    ? parseInt(lastUser.user_id.replace("USR-", ""))
    : 0;

  return `USR-${String(lastNumber + 1).padStart(4, "0")}`;
};