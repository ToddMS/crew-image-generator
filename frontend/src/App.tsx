import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/RowgramThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateCrewPage from './pages/CreateCrews/CreateCrewPage';
import MyCrewsPage from './pages/MyCrews/MyCrewsPage';
import GeneratePage from './pages/GeneratePage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import NewGalleryPage from './pages/NewGalleryPage';
import NewSettingsPage from './pages/NewSettingsPage';
import NewTemplateBuilderPage from './pages/NewTemplateBuilderPage';

function App() {
  return (
    <CustomThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/crews/create" element={<CreateCrewPage />} />
              <Route path="/create" element={<CreateCrewPage />} />
              <Route path="/crews" element={<MyCrewsPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/create" element={<NewTemplateBuilderPage />} />
              <Route path="/gallery" element={<NewGalleryPage />} />
              <Route path="/settings" element={<NewSettingsPage />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
