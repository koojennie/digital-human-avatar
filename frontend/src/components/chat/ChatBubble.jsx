export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[70%]
          rounded-2xl
          px-4
          py-2
          text-sm

          ${isUser ? "bg-blue-500 text-white" : "bg-zinc-200 text-black"}
        `}
      >
        {message.content}
      </div>
    </div>
  );
}
