export function validateCreateMessage(payload) {
  if (!payload.content) {
    throw new Error("Content is required");
  }

  if (!payload.role) {
    throw new Error("Role is required");
  }

  const allowedRoles = ["user", "assistant"];

  if (!allowedRoles.includes(payload.role)) {
    throw new Error("Invalid role");
  }
}