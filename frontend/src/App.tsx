import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CreateCrewPage from './pages/CreateCrewPage';
import MyCrewsPage from './pages/MyCrewsPage';
import GenerateImagesPage from './pages/GenerateImagesPage';
import ClubPresetsPage from './pages/ClubPresetsPage';
import GalleryPage from './pages/GalleryPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TemplateCustomizerPage from './pages/TemplateCustomiserPage';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/crew-image-generator">
        <NotificationProvider>
          <MainLayout showHeader={false}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/create" element={<CreateCrewPage />} />
              <Route path="/crews" element={<MyCrewsPage />} />
              <Route path="/generate" element={<GenerateImagesPage />} />
              <Route path="/club-presets" element={<ClubPresetsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/template-builder" element={<TemplateCustomizerPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </MainLayout>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
