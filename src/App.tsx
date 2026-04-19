
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DarkModeProvider } from "@/hooks/useDarkMode";
import { NotificationProvider } from "@/hooks/useNotifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import HealthChat from "./pages/HealthChat";
import History from "./pages/History";
import HealthMonitor from "./pages/HealthMonitor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Transcript from "./pages/Transcript";
import TranscriptSetup from "./pages/TranscriptSetup";
import TranscriptLive from "./pages/TranscriptLive";
import TranscriptSummary from "./pages/TranscriptSummary";
import TranscriptDetail from "./pages/TranscriptDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DarkModeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Login />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/diagnosis" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <HealthChat />
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  } />
                  <Route path="/monitor" element={
                    <ProtectedRoute>
                      <HealthMonitor />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/transcript" element={
                    <ProtectedRoute>
                      <Transcript />
                    </ProtectedRoute>
                  } />
                  <Route path="/transcript/setup" element={
                    <ProtectedRoute>
                      <TranscriptSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/transcript/live" element={
                    <ProtectedRoute>
                      <TranscriptLive />
                    </ProtectedRoute>
                  } />
                  <Route path="/transcript/summary" element={
                    <ProtectedRoute>
                      <TranscriptSummary />
                    </ProtectedRoute>
                  } />
                  <Route path="/transcript/:transcriptId" element={
                    <ProtectedRoute>
                      <TranscriptDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </DarkModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
