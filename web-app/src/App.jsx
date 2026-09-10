import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';
import ChatPage from './pages/Chat/ChatPage';
import LibraryPage from './pages/Library/LibraryPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import PromptsPage from './pages/Prompts/PromptsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import useAuthStore from './store/authStore';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public auth route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected application routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChatPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
