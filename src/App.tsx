import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CreateCrewPage from './pages/CreateCrewPage';
import MyCrewsPage from './pages/MyCrewsPage';
import GenerateImagesPage from './pages/GenerateImagesPage';
import ClubPresetsPage from './pages/ClubPresetsPage';
import GalleryPageEnhanced from './pages/GalleryPageEnhanced';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/create" element={<CreateCrewPage />} />
            <Route path="/crews" element={<MyCrewsPage />} />
            <Route path="/generate" element={<GenerateImagesPage />} />
            <Route path="/club-presets" element={<ClubPresetsPage />} />
            <Route path="/gallery" element={<GalleryPageEnhanced />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MainLayout>
      </NotificationProvider>
    </Router>
  );
}

export default App;