import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E98C2',
    },
    secondary: {
      main: '#4177a6',
    },
    background: {
      default: '#fafafa',
      paper: '#f8f9fa',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2d3748',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#5E98C2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5E98C2',
            },
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7DB3D3',
    },
    secondary: {
      main: '#5E98C2',
    },
    background: {
      default: '#1f1f1f',
      paper: '#2e2e2e',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0b0b0',
    },
    divider: '#4a4a4a',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2e2e2e',
          color: '#f5f5f5',
          borderColor: '#4a4a4a',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#3a3a3a',
            color: '#f5f5f5',
            '& fieldset': {
              borderColor: '#5a5a5a',
            },
            '&:hover fieldset': {
              borderColor: '#7DB3D3',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7DB3D3',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#b0b0b0',
          },
          '& .MuiOutlinedInput-input': {
            color: '#f5f5f5',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#7DB3D3',
            '&:hover': {
              backgroundColor: '#5E98C2',
            },
          },
        },
        outlined: {
          '&.MuiButton-outlinedPrimary': {
            borderColor: '#7DB3D3',
            color: '#7DB3D3',
            '&:hover': {
              borderColor: '#5E98C2',
              backgroundColor: 'rgba(125, 179, 211, 0.1)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#3a3a3a',
          color: '#f5f5f5',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5a5a5a',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7DB3D3',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7DB3D3',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2e2e2e',
          color: '#f5f5f5',
        },
      },
    },
  },
});

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('rowgram_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('rowgram_theme', newMode ? 'dark' : 'light');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
