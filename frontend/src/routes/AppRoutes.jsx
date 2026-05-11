import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatPage from "../pages/ChatPage";
import App from "../App";
import AppAdmin from "../pages/admin/AppAdmin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AppAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
