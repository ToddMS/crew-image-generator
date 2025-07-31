import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { MdImage, MdGroup } from 'react-icons/md';
import GalleryPage from '../components/GalleryPage/GalleryPage';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';

const GalleryPageEnhanced: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Gallery
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Sign in to view your generated crew images
        </Typography>
        <LoginPrompt 
          message="Sign in to view your generated crew images"
          actionText="View Gallery"
        />
      </Box>
    );
  }

  return (
    <Box>

      {/* Gallery Component */}
      <GalleryPage refreshTrigger={refreshTrigger} />
    </Box>
  );
};

export default GalleryPageEnhanced;