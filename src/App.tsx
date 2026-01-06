import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardPage } from './pages/DashboardPage';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { TaskDetail } from './pages/TaskDetail';
import { AllTasksPage } from './pages/AllTasksPage';
import { AllTodosPage } from './pages/AllTodosPage';
import './index.css';

// Primary red color for the theme
const PRIMARY_COLOR = '#e53935';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          colorError: '#ff4d4f',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Button: {
            colorPrimary: PRIMARY_COLOR,
            algorithm: true,
          },
          Input: {
            algorithm: true,
          },
          Select: {
            algorithm: true,
          },
          DatePicker: {
            algorithm: true,
          },
          Modal: {
            algorithm: true,
          },
          Card: {
            algorithm: true,
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Projects />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProjectDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TaskDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AllTasksPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/todos"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AllTodosPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

