import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import { useAuth } from '../context/AuthContext';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Access denied. Admin privileges required.
        </Alert>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          This page is only accessible to administrators.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <AnalyticsDashboard />
    </Box>
  );
};

export default AnalyticsPage;
