import { BrowserRouter, Routes, Route, Router } from "react-router-dom";

import App from "../App";
import { ProtectedRoute } from "./ProtectedAdminRoute";
import { ChatProvider } from "../context/ChatContext";
import { SpeechProvider } from "../hooks/useSpeech";
import ChatPage from "../pages/ChatPage";
import { LoginPage } from "../pages/LoginPage";
import AppAdmin from "../pages/admin/AppAdmin";

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

        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AppAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
