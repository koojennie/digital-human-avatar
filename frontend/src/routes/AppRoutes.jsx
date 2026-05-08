import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatPage from "../pages/ChatPage";
import App from "../App";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
