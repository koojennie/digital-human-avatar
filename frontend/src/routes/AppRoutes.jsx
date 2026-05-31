import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatPage from "../pages/ChatPage";
import App from "../App";
import AppAdmin from "../pages/admin/AppAdmin";
import { SpeechProvider } from "../hooks/useSpeech";
import { ChatProvider } from "../context/ChatContext";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SpeechProvider>
              <ChatProvider>
                <App />
              </ChatProvider>
            </SpeechProvider>
          }
        />
        <Route
          path="/chat"
          element={
            <SpeechProvider>
              <ChatProvider>
                <ChatPage />
              </ChatProvider>
            </SpeechProvider>
          }
        />

        <Route path="/admin" element={<AppAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
