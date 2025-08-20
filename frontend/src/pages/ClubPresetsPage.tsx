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
import { MdPalette, MdAdd, MdSettings } from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';

const ClubPresetsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout title="Club Presets" subtitle="Manage your club's preset templates and colors">
        <LoginPrompt 
          message="Sign in to manage club presets" 
          actionText="Manage Presets"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Club Presets" 
      subtitle="Manage your club's preset templates and branding"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <MdPalette size={40} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Club Presets Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              This feature will allow you to create and manage preset templates with your club's branding, 
              colors, and logos for consistent image generation.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              In the meantime, you can create custom templates in the Template Builder and use them across all your crews.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<MdAdd />}
                onClick={() => navigate('/templates/create')}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Template
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<MdSettings />}
                onClick={() => navigate('/settings')}
                sx={{ px: 4, py: 1.5 }}
              >
                Club Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ClubPresetsPage;