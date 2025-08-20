import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MdGroups, MdAdd } from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';

const SimpleCrewsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout 
      title="My Crews" 
      subtitle="Manage your crew lineups"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Empty state */}
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Avatar sx={{ bgcolor: '#4a90e2', width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <MdGroups size={40} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No Crews Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Create your first crew lineup to start generating beautiful rowing team images
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<MdAdd />}
              onClick={() => navigate('/crews/create')}
              sx={{ px: 4, py: 1.5 }}
            >
              Create Your First Crew
            </Button>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default SimpleCrewsPage;