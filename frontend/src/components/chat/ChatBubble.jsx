export default function ChatBubble({ msg, loadingResponseAI }) {
  const isUser = msg.role === "user";

 const rawDate = msg.created_at || msg.createdAt;
  const dateObj = new Date(rawDate);
  
  const timeString = isNaN(dateObj.getTime()) 
    ? "Baru saja" 
    : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Base classes for the bubble and timestamp
  const bubbleBaseClasses =
    "max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-lg break-words";
  const timeClasses = "text-xs text-gray-500 mt-1.5";

  // Component for User's message
  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div
          className={`${bubbleBaseClasses} bg-blue-600 text-white rounded-br-lg`}
        >
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
        <span className={`${timeClasses} mr-2`}>
          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    );
  }

  // Component for Assistant's message
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-start gap-3">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1 border border-indigo-200">
          <span className="text-indigo-500 font-bold text-sm">AI</span>
        </div>
        <div className={`${bubbleBaseClasses} bg-white text-gray-800 rounded-bl-lg`}>
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      </div>
      <span className={`${timeClasses} ml-11`}>
        {/* {new Date(msg.createdAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })} */}
        {timeString}
      </span>
    </div>
  );
}