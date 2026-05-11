import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatPage from "../pages/ChatPage";
import App from "../App";
import { LoginPage } from "../pages/LoginPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
