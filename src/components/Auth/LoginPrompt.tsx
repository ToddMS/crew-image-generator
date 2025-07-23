import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import SaveIcon from '@mui/icons-material/Save';
import AuthModal from './AuthModal';

interface LoginPromptProps {
  message?: string;
  actionText?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ 
  message = "Sign in to save crews to your account",
  actionText = "Save Crew"
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Card sx={{ 
        maxWidth: 400, 
        mx: 'auto', 
        mt: 4, 
        p: 2, 
        textAlign: 'center',
        backgroundColor: '#f8f9ff',
        border: '1px solid #e8eaff'
      }}>
        <CardContent>
          <SaveIcon sx={{ fontSize: 48, color: '#5E98C2', mb: 2 }} />
          
          <Typography variant="h6" sx={{ mb: 2, color: '#1a1a1a' }}>
            {message}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
            Create an account or sign in to save and manage your crew lineups across all your devices.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => setShowAuthModal(true)}
            sx={{
              backgroundColor: '#5E98C2',
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#4a7da3',
              },
            }}
          >
            Sign In to {actionText}
          </Button>
        </CardContent>
      </Card>

      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default LoginPrompt;