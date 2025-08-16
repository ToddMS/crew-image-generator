import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Alert,
  Button,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { login, emailSignUp, emailSignIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setIsSignUp(false);
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => initializeGoogleSignIn(), 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(() => initializeGoogleSignIn(), 100);
    }
  };

  const initializeGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!window.google || !clientId) {
      setError('Google Sign-In is not available. Please try email login.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      use_fedcm_for_prompt: false,
    });

    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv) {
      buttonDiv.innerHTML = '';
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
      });
    }
  };

  React.useEffect(() => {
    if (tabValue === 0 && open) {
      handleGoogleLogin();
    }
  }, [tabValue, open]);

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      setError(null);
      await login(response.credential);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isSignUp) {
        await emailSignUp(email, password, name);
      } else {
        await emailSignIn(email, password);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Email auth failed:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
  };

  const handleClose = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setIsSignUp(false);
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          maxWidth: 450,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            textAlign: 'center',
            mb: 1,
          }}
        >
          Welcome to RowGram
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
          }}
        >
          Sign in to save crews and customize settings
        </Typography>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Auth Method Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }} variant="fullWidth">
          <Tab icon={<GoogleIcon />} label="Google" sx={{ textTransform: 'none' }} />
          <Tab icon={<EmailIcon />} label="Email" sx={{ textTransform: 'none' }} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {tabValue === 0 && (
          <Box>
            <div
              id="google-signin-button"
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '48px',
              }}
            ></div>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: theme.palette.text.secondary,
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              Quick and secure authentication with your Google account
            </Typography>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" onSubmit={handleEmailAuth}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Typography>

            {isSignUp && (
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: theme.palette.primary.main,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={toggleSignUpMode}
                sx={{
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mt: 4,
            p: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(94, 152, 194, 0.1)' : '#f8f9ff',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              color: theme.palette.primary.main,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            🚣‍♂️ What you get with an account:
          </Typography>

          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2,
              color: theme.palette.text.secondary,
              '& li': { mb: 0.5, fontSize: '14px' },
            }}
          >
            <li>Save and manage your crew lineups</li>
            <li>Customize your club colors and logo</li>
            <li>Generate personalized crew images</li>
            <li>Access your data from any device</li>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
