import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { SpeechProvider } from "./hooks/useSpeech";
import "./index.css";
import { ChatProvider } from "./context/ChatContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SpeechProvider>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </SpeechProvider>
  </React.StrictMode>
);