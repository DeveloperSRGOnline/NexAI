import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ChatPage from './pages/Chat/ChatPage';
import LibraryPage from './pages/Library/LibraryPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import PromptsPage from './pages/Prompts/PromptsPage';
import SettingsPage from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
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
