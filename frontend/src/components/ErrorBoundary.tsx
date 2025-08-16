import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => window.location.reload()} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: theme.palette.error.main }}>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
          We encountered an unexpected error. Please try refreshing the page.
        </Typography>
        {error && (
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              fontFamily: 'monospace',
              color: theme.palette.text.secondary,
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </Typography>
        )}
        <Button variant="contained" onClick={onRetry} sx={{ minWidth: 120 }}>
          Refresh Page
        </Button>
      </Paper>
    </Box>
  );
};

export default ErrorBoundary;