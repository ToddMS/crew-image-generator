import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import { useAuth } from '../context/AuthContext';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Redirect if not admin
  if (!isAdmin()) {
    navigate('/');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: '1200px', mx: 'auto' }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<IoArrowBack />}
            sx={{ 
              color: theme.palette.text.primary,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Back to Home
          </Button>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            Analytics Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Analytics Content */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
        <AnalyticsDashboard />
      </Box>
    </Box>
  );
};

export default AnalyticsPage;