import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";

// ── Layout ──
import AppLayout from "@/components/layout/AppLayout";

// ── Auth ──
import SplashScreen       from "@/features/auth/pages/splash";
import LoginPage          from "@/features/auth/pages/login";
import RegisterPage       from "@/features/auth/pages/register";
import ForgotPasswordPage from "@/features/auth/pages/forgotPassword";
import OnboardingPage     from "@/features/auth/pages/onboarding";

// ── Dashboard ──
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// ── Documents ──
import DocumentListPage     from "@/features/documents/pages/DocumentListPage";
import UploadDocumentPage   from "@/features/documents/pages/UploadDocumentPage";
import UploadProcessingPage from "@/features/documents/pages/UploadProcessingPage";
import DocumentDetailPage   from "@/features/documents/pages/DocumentDetailPage";
import DocumentPreviewPage  from "@/features/documents/pages/DocumentPreviewPage";
import ChunkViewerPage      from "@/features/documents/pages/ChunkViewerPage";
import ReindexPage          from "@/features/documents/pages/ReindexPage";

// ── Subjects ──
import SubjectListPage   from "@/features/subjects/pages/SubjectListPage";
import SubjectDetailPage from "@/features/subjects/pages/SubjectDetailPage";

// ── Chat ──
import ChatPage from "@/features/chat/pages/ChatPage";

// ── Sessions ──
import SessionsPage from "@/features/sessions/pages/SessionsPage";

// ── Research ──
import ResearchDashboardPage from "@/features/research/pages/ResearchDashboardPage";

// ── Benchmark ──
import BenchmarkConfigPage     from "@/features/benchmark/pages/BenchmarkConfigPage";
import EmbeddingComparisonPage from "@/features/benchmark/pages/EmbeddingComparisonPage";
import ChunkStrategyPage       from "@/features/benchmark/pages/ChunkStrategyPage";
import FineTunedVsRAGPage      from "@/features/benchmark/pages/FineTunedVsRAGPage";
import RAGASResultPage         from "@/features/benchmark/pages/RAGASResultPage";
import ExperimentHistoryPage   from "@/features/benchmark/pages/ExperimentHistoryPage";

// ── Analytics ──
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";

// ── Dataset / Evaluation ──
import TestsetManagementPage from "@/features/dataset/pages/TestsetManagementPage";
import EvaluationResultPage  from "@/features/dataset/pages/EvaluationResultPage";

// ── Admin ──
import SystemSettingsPage    from "@/features/admin/pages/SystemSettingsPage";
import UserManagementPage    from "@/features/admin/pages/UserManagementPage";
import LecturerManagementPage from "@/features/admin/pages/LecturerManagementPage";
import StudentManagementPage  from "@/features/admin/pages/StudentManagementPage";

// ── Legacy notebook (keep existing) ──
import MainPage     from "@/features/chatbot/pages/mainPage";
import NotebookPage from "@/features/chatbot/pages/notebookPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public / Auth ── */}
          <Route path="/splash"         element={<SplashScreen />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/onboarding"     element={<OnboardingPage />} />

          {/* ── Legacy notebook routes ── */}
          <Route path="/"        element={<MainPage />} />
          <Route path="/notebook" element={<NotebookPage />} />

          {/* ── App (with sidebar layout) ── */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />

            {/* Documents */}
            <Route path="/documents"                    element={<DocumentListPage />} />
            <Route path="/documents/upload"             element={<UploadDocumentPage />} />
            <Route path="/documents/processing"         element={<UploadProcessingPage />} />
            <Route path="/documents/:id"                element={<DocumentDetailPage />} />
            <Route path="/documents/:id/preview"        element={<DocumentPreviewPage />} />
            <Route path="/documents/:id/chunks"         element={<ChunkViewerPage />} />
            <Route path="/documents/:id/reindex"        element={<ReindexPage />} />

            {/* Subjects */}
            <Route path="/subjects"     element={<SubjectListPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailPage />} />

            {/* Chat */}
            <Route path="/chat" element={<ChatPage />} />

            {/* Sessions */}
            <Route path="/sessions" element={<SessionsPage />} />

            {/* Research */}
            <Route path="/research" element={<ResearchDashboardPage />} />

            {/* Benchmark */}
            <Route path="/benchmark"             element={<BenchmarkConfigPage />} />
            <Route path="/benchmark/embeddings"  element={<EmbeddingComparisonPage />} />
            <Route path="/benchmark/chunks"      element={<ChunkStrategyPage />} />
            <Route path="/benchmark/finetuned"   element={<FineTunedVsRAGPage />} />
            <Route path="/benchmark/results"     element={<RAGASResultPage />} />
            <Route path="/benchmark/history"     element={<ExperimentHistoryPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Dataset */}
            <Route path="/dataset"            element={<TestsetManagementPage />} />
            <Route path="/dataset/evaluation" element={<EvaluationResultPage />} />

            {/* Admin */}
            <Route path="/settings"        element={<SystemSettingsPage />} />
            <Route path="/admin/users"     element={<UserManagementPage />} />
            <Route path="/lectures"        element={<LecturerManagementPage />} />
            <Route path="/students"        element={<StudentManagementPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
