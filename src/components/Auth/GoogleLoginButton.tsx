import React, { useEffect, useRef } from 'react';
import { Button, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = React.useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        // Small delay to ensure React ref is ready
        setTimeout(() => {
          initializeGoogleSignIn();
          setIsGoogleLoaded(true);
        }, 100);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!window.google) {
      return;
    }

    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not defined!');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: 250,
          text: 'signin_with',
        }
      );
    } else {
      console.error('googleButtonRef.current is null - retrying in 200ms...');
      setTimeout(() => {
        if (googleButtonRef.current && window.google) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: 250,
              text: 'signin_with',
            }
          );
        } else {
          console.error('Retry failed: googleButtonRef still null');
        }
      }, 200);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      await login(response.credential);
      onSuccess?.();
    } catch (error) {
      console.error('Login failed:', error);
      onError?.(error);
    }
  };

  const handleManualSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {isGoogleLoaded ? (
        <div ref={googleButtonRef} />
      ) : (
        <Button
          variant="outlined"
          onClick={handleManualSignIn}
          sx={{
            color: '#1976d2',
            borderColor: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          Sign in with Google
        </Button>
      )}
    </Box>
  );
};

export default GoogleLoginButton;