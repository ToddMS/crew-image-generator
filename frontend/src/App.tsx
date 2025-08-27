import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateCrewPage from './pages/CreateCrews/CreateCrewPage';
import MyCrewsPage from './pages/MyCrews/MyCrewsPage';
import GenerateImagesPage from './pages/Generate/GenerateImagesPage';
import ViewTemplatesPage from './pages/Templates/ViewTemplatesPage';
import ClubPresetsPage from './pages/ClubPresets/ClubPresetsPage';
import NewGalleryPage from './pages/Gallery/GalleryPage';
import NewSettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/crews/create" element={<CreateCrewPage />} />
            <Route path="/create" element={<CreateCrewPage />} />
            <Route path="/crews" element={<MyCrewsPage />} />
            <Route path="/club-presets" element={<ClubPresetsPage />} />
            <Route path="/generate" element={<GenerateImagesPage />} />
            <Route path="/templates" element={<ViewTemplatesPage />} />
            <Route path="/gallery" element={<NewGalleryPage />} />
            <Route path="/settings" element={<NewSettingsPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
