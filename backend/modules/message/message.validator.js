export function validateCreateMessage(payload) {
  const { content, type, voice, role } = payload;

  if (!role) throw new Error("Role is required");
  
  const allowedRoles = ["user", "assistant"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  if (type === "voice" && !voice) {
    throw new Error("Voice is required");
  }

  if (type !== "voice" && !content) {
    throw new Error("Content is required");
  }
}
