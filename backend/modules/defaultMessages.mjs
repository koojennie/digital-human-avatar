export const sendDefaultMessages = async ({ userMessage }) => {
  if (userMessage.toLowerCase().includes("halo")) {
    return [
      {
        text: "Halo Jennie! Ada yang bisa saya bantu dengan materi kuliah hari ini?",
        facialExpression: "smile",
        animation: "TalkingOne",
      }
    ];
  }
  return false; 
};