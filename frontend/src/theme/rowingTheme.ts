import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    rowing: {
      deepNavy: string;
      waterBlue: string;
      brightBlue: string;
      emeraldGreen: string;
      teal: string;
      oceanBlue: string;
    };
  }

  interface PaletteOptions {
    rowing?: {
      deepNavy?: string;
      waterBlue?: string;
      brightBlue?: string;
      emeraldGreen?: string;
      teal?: string;
      oceanBlue?: string;
    };
  }
}

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Montserrat", "Inter", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme: any) => ({
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.default,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)'
              : 'linear-gradient(135deg, #fafbfc 0%, #e8f4f8 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        html: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
        },
        '#root': {
          minHeight: '100vh',
        },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#4a90e2', // Bright Blue
      light: '#6ba3d0', // Water Blue
      dark: '#1e3a5f', // Deep Navy
    },
    secondary: {
      main: '#2ecc71', // Emerald Green
      light: '#16a085', // Teal
      dark: '#27ae60',
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    divider: '#e1e8ed',
    rowing: {
      deepNavy: '#1e3a5f',
      waterBlue: '#6ba3d0',
      brightBlue: '#4a90e2',
      emeraldGreen: '#2ecc71',
      teal: '#16a085',
      oceanBlue: '#3498db',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#6ba3d0', // Water Blue
      light: '#87b8d9',
      dark: '#4a90e2', // Bright Blue
    },
    secondary: {
      main: '#2ecc71', // Emerald Green
      light: '#58d68d',
      dark: '#16a085', // Teal
    },
    background: {
      default: '#0f1419',
      paper: '#1a2332',
    },
    text: {
      primary: '#ffffff',
      secondary: '#8892b0',
    },
    divider: '#2d3748',
    rowing: {
      deepNavy: '#1e3a5f',
      waterBlue: '#6ba3d0',
      brightBlue: '#4a90e2',
      emeraldGreen: '#2ecc71',
      teal: '#16a085',
      oceanBlue: '#3498db',
    },
  },
});

export default { lightTheme, darkTheme };
