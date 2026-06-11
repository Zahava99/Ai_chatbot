import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import useAuthStore from "@/stores/useAuthStore";

// ── Layout ──
import AppLayout from "@/components/layout/AppLayout";
import RoleGuard from "@/components/common/RoleGuard";

// ── Auth ──
import SplashScreen from "@/features/auth/pages/splash";
import LoginPage from "@/features/auth/pages/login";
import RegisterPage from "@/features/auth/pages/register";
import ForgotPasswordPage from "@/features/auth/pages/forgotPassword";
import OnboardingPage from "@/features/auth/pages/onboarding";
import ChangePasswordPage from "@/features/auth/pages/changePassword";

// ── Dashboard ──
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// ── Documents ──
import DocumentListPage from "@/features/documents/pages/DocumentListPage";
import UploadDocumentPage from "@/features/documents/pages/UploadDocumentPage";
import UploadProcessingPage from "@/features/documents/pages/UploadProcessingPage";
import DocumentDetailPage from "@/features/documents/pages/DocumentDetailPage";
import DocumentPreviewPage from "@/features/documents/pages/DocumentPreviewPage";
import ChunkViewerPage from "@/features/documents/pages/ChunkViewerPage";
import ReindexPage from "@/features/documents/pages/ReindexPage";

// ── Subjects ──
import SubjectListPage from "@/features/subjects/pages/SubjectListPage";
import SubjectDetailPage from "@/features/subjects/pages/SubjectDetailPage";
import LecturerSubjectListPage from "@/features/subjects/pages/LecturerSubjectListPage";
import LecturerSubjectDetailPage from "@/features/subjects/pages/LecturerSubjectDetailPage";

// ── Chat ──
import ChatPage from "@/features/chat/pages/ChatPage";

// ── Sessions ──
import SessionsPage from "@/features/sessions/pages/SessionsPage";

// ── Research ──
import ResearchDashboardPage from "@/features/research/pages/ResearchDashboardPage";

// ── Benchmark ──
import BenchmarkConfigPage from "@/features/benchmark/pages/BenchmarkConfigPage";
import EmbeddingComparisonPage from "@/features/benchmark/pages/EmbeddingComparisonPage";
import ChunkStrategyPage from "@/features/benchmark/pages/ChunkStrategyPage";
import FineTunedVsRAGPage from "@/features/benchmark/pages/FineTunedVsRAGPage";
import RAGASResultPage from "@/features/benchmark/pages/RAGASResultPage";
import ExperimentHistoryPage from "@/features/benchmark/pages/ExperimentHistoryPage";

// ── Analytics ──
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";

// ── Dataset / Evaluation ──
import TestsetManagementPage from "@/features/dataset/pages/TestsetManagementPage";
import EvaluationResultPage from "@/features/dataset/pages/EvaluationResultPage";

// ── Admin ──
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import SystemSettingsPage from "@/features/admin/pages/SystemSettingsPage";
import UserManagementPage from "@/features/admin/pages/UserManagementPage";
import LecturerManagementPage from "@/features/admin/pages/LecturerManagementPage";
import StudentManagementPage from "@/features/admin/pages/StudentManagementPage";
import AdminDocumentListPage from "@/features/admin/pages/AdminDocumentListPage";
import AdminDocumentDetailPage from "@/features/admin/pages/AdminDocumentDetailPage";
import AdminChunkViewerPage from "@/features/admin/pages/AdminChunkViewerPage";

// ── Legacy notebook (keep existing) ──
import MainPage from "@/features/chatbot/pages/mainPage";
import NotebookPage from "@/features/chatbot/pages/notebookPage";

function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const authReady = useAuthStore((s) => s.authReady);

  // On app boot, rehydrate the user from GET /api/v1/auth/me.
  // We intentionally don't render routes until this settles so that
  // RoleGuard never sees a null user mid-flight and incorrectly redirects.
  useEffect(() => {
    fetchUser();
  }, []);

  if (!authReady) {
    // Minimal full-screen spinner while we confirm the session
    return (
      <ThemeProvider>
        <div className="flex h-screen items-center justify-center bg-app">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public / Auth ── */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* ── Legacy notebook routes ── */}
          <Route path="/" element={<MainPage />} />
          <Route path="/notebook" element={<NotebookPage />} />

          {/* ── App (with sidebar layout) ── */}
          <Route element={<AppLayout />}>

            {/* ── Accessible by all authenticated roles ── */}
            {/* <Route element={<RoleGuard />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route> */}

            {/* ── Lecturer + Admin only ── */}
            <Route element={<RoleGuard allowed={["researcher", "admin"]} />}>
              {/* Documents */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents_upload" element={<UploadDocumentPage />} />
              <Route path="/documents_upload/processing" element={<UploadProcessingPage />} />
              <Route path="/documents_upload/:id" element={<DocumentDetailPage />} />
              <Route path="/documents_upload/:id/preview" element={<DocumentPreviewPage />} />
              <Route path="/documents_upload/:id/chunks" element={<ChunkViewerPage />} />
              <Route path="/documents_upload/:id/reindex" element={<ReindexPage />} />

              {/* Subjects */}
              <Route path="/subjects" element={<LecturerSubjectListPage />} />
              <Route path="/subjects/:id" element={<LecturerSubjectDetailPage />} />

              {/* Sessions */}
              {/* <Route path="/sessions" element={<SessionsPage />} /> */}

              {/* Research */}
              {/* <Route path="/research" element={<ResearchDashboardPage />} /> */}

              {/* Benchmark */}
              {/* <Route path="/benchmark"             element={<BenchmarkConfigPage />} />
              <Route path="/benchmark/embeddings"  element={<EmbeddingComparisonPage />} />
              <Route path="/benchmark/chunks"      element={<ChunkStrategyPage />} />
              <Route path="/benchmark/finetuned"   element={<FineTunedVsRAGPage />} />
              <Route path="/benchmark/results"     element={<RAGASResultPage />} />
              <Route path="/benchmark/history"     element={<ExperimentHistoryPage />} /> */}

              {/* Analytics */}
              {/* <Route path="/analytics" element={<AnalyticsPage />} /> */}

              {/* Dataset */}
              {/* <Route path="/dataset"            element={<TestsetManagementPage />} />
              <Route path="/dataset/evaluation" element={<EvaluationResultPage />} /> */}

              {/* Settings */}
              <Route path="/settings" element={<SystemSettingsPage />} />
            </Route>

            {/* ── Admin only ── */}
            <Route element={<RoleGuard allowed={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/lectures" element={<LecturerManagementPage />} />
              <Route path="/admin/students" element={<StudentManagementPage />} />
              <Route path="/admin/subjects" element={<SubjectListPage />} />
              <Route path="/admin/subjects/:id" element={<SubjectDetailPage />} />
              <Route path="/admin/documents" element={<AdminDocumentListPage />} />
              <Route path="/admin/documents/:id" element={<AdminDocumentDetailPage />} />
              <Route path="/admin/documents/:id/chunks" element={<AdminChunkViewerPage />} />
              {/* Sessions */}
              <Route path="/sessions" element={<SessionsPage />} />

              {/* Research */}
              <Route path="/research" element={<ResearchDashboardPage />} />

              {/* Benchmark */}
              <Route path="/benchmark" element={<BenchmarkConfigPage />} />
              <Route path="/benchmark/embeddings" element={<EmbeddingComparisonPage />} />
              <Route path="/benchmark/chunks" element={<ChunkStrategyPage />} />
              <Route path="/benchmark/finetuned" element={<FineTunedVsRAGPage />} />
              <Route path="/benchmark/results" element={<RAGASResultPage />} />
              <Route path="/benchmark/history" element={<ExperimentHistoryPage />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Dataset */}
              <Route path="/dataset" element={<TestsetManagementPage />} />
              <Route path="/dataset/evaluation" element={<EvaluationResultPage />} />
            </Route>

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
