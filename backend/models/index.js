// models/index.js

import User from "./user.model.js";
import Conversation from "./conversation.model.js";
import Message from "./message.model.js";
import Course from "./course.model.js";

const db = {
  User,
  Conversation,
  Message,
  Course,
};

// Register associations
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

export default db;