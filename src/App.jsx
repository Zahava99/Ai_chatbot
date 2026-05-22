import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/login";
import RegisterPage from "@/features/auth/pages/register";
import MainPage from "@/features/chatbot/pages/mainPage";
import NotebookPage from "@/features/chatbot/pages/notebookPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/notebook" element={<NotebookPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
