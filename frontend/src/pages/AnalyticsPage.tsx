import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { MdBarChart, MdDashboard } from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout title="Analytics" subtitle="View usage statistics and insights">
        <LoginPrompt 
          message="Sign in to view your analytics" 
          actionText="View Analytics"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Analytics" 
      subtitle="Usage statistics and insights for your crew images"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <MdBarChart size={40} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Analytics Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Track your image generation activity, popular templates, crew performance, and usage insights.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              We're working on comprehensive analytics including generation statistics, template popularity, and engagement metrics.
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<MdDashboard />}
              onClick={() => navigate('/')}
              sx={{ px: 4, py: 1.5 }}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;