import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Card sx={{ 
        maxWidth: 400, 
        mx: 'auto', 
        mt: 4, 
        p: 2, 
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[3]
      }}>
        <CardContent>
          <SaveIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            {message}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            Create an account or sign in to save and manage your crew lineups across all your devices.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => setShowAuthModal(true)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
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