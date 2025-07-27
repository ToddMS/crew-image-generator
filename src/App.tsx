import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CreateCrewPage from './pages/CreateCrewPage';
import MyCrewsPage from './pages/MyCrewsPage';
import GalleryPageEnhanced from './pages/GalleryPageEnhanced';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create" element={<CreateCrewPage />} />
          <Route path="/crews" element={<MyCrewsPage />} />
          <Route path="/gallery" element={<GalleryPageEnhanced />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;