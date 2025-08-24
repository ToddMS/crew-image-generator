import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/themes.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/RowgramThemeContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { OnboardingProvider } from './context/OnboardingContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <OnboardingProvider>
            <App />
          </OnboardingProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </CustomThemeProvider>
  </StrictMode>,
);
