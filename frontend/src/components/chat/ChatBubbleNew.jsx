import React from "react";

export default function ChatBubbleNew({ msg }) {
  const isUser = msg.role === "user";

  const rawDate = msg.created_at || msg.createdAt;
  const dateObj = new Date(rawDate);
  const timeString = isNaN(dateObj.getTime())
    ? "Baru saja"
    : dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <div className="flex flex-col items-end w-full animate-fade-in">
        <div className="max-w-[80%] flex flex-col items-end gap-1">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-br-none shadow-md shadow-blue-900/20 break-words w-full">
            <p className="text-sm leading-relaxed font-normal">{msg.content}</p>
          </div>
          <span className="text-[10px] text-white/80 font-medium mr-1 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {timeString}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 w-full max-w-[85%] animate-fade-in">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-900/30 mt-0.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
          />
        </svg>
      </div>

      <div className="flex flex-col items-start gap-1 w-full">
        <span className="text-[11px] text-white font-bold tracking-wide ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          Collexa AI
        </span>
        
        <div className="bg-white/90 backdrop-blur-sm border border-white/20 text-gray-800 p-3.5 rounded-2xl rounded-bl-none shadow-lg break-words w-full">
          <p className="text-sm leading-relaxed font-normal">{msg.content}</p>
        </div>
        
        <span className="text-[10px] text-white/80 font-medium ml-1 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {timeString}
        </span>
      </div>
    </div>
  );
}