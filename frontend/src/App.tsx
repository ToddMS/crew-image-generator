import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/RowgramThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardPage from './pages/DashboardPage';
import CreateCrewPage from './pages/CreateCrewPage';
import MyCrewsPage from './pages/MyCrewsPage';
import GenerateImagesPage from './pages/GenerateImagesPage';
import ClubPresetsPage from './pages/ClubPresetsPage';
import GalleryPage from './pages/GalleryPage';
import SettingsPage from './pages/SettingsPage';
import TemplateCustomizerPage from './pages/TemplateCustomiserPage';

function App() {
  return (
    <CustomThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/crews/create" element={<CreateCrewPage />} />
              <Route path="/crews" element={<MyCrewsPage />} />
              <Route path="/generate" element={<GenerateImagesPage />} />
              <Route path="/templates/create" element={<TemplateCustomizerPage />} />
              <Route path="/club-presets" element={<ClubPresetsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
