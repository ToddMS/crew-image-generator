import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Avatar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MdGroups, MdCheck } from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';

const SimpleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [crewName, setCrewName] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');

  const handleSubmit = () => {
    if (crewName && clubName && raceName) {
      navigate('/crews');
    }
  };

  return (
    <DashboardLayout 
      title="Create New Crew" 
      subtitle="Set up a crew lineup for image generation"
    >
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: '#4a90e2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <MdGroups size={32} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Crew Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding basic information about your crew
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Crew Name"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                fullWidth
                placeholder="e.g., Men's Senior 8+"
                required
              />
              <TextField
                label="Club Name"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                fullWidth
                placeholder="e.g., Thames Rowing Club"
                required
              />
              <TextField
                label="Race/Event Name"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                fullWidth
                placeholder="e.g., Head of the River Race"
                required
              />

              <Alert severity="info">
                This is a simplified demo version. The full crew creation wizard with boat types and member management is in development.
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/crews')}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!crewName || !clubName || !raceName}
                  endIcon={<MdCheck />}
                  sx={{ flex: 1 }}
                >
                  Create Crew
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default SimpleCreatePage;