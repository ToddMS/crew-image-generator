import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';
import './AuthModal.css';

// Extend the Window interface to include Google types
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleRenderButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitializeConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleRenderButtonConfig) => void;
        };
      };
    };
  }
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess }) => {
  const { login, emailSignUp, emailSignIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        setLoading(true);
        setError(null);
        await login(response.credential);
        onSuccess?.();
        onClose();
      } catch {
        setError('Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [login, onSuccess, onClose],
  );

  // Initialize Google Sign-In when component mounts
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google Sign-In is not configured.');
      return;
    }

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => initializeGoogleSignIn(), 100);
      };
      script.onerror = () => {
        setError('Failed to load Google Sign-In. Please try again.');
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!window.google || !clientId) {
      return;
    }

    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render Google button in the designated container
      const googleButtonContainer = document.getElementById('google-signin-button');
      if (googleButtonContainer) {
        // Clear any existing content
        googleButtonContainer.innerHTML = '';

        // Render the Google button
        window.google.accounts.id.renderButton(googleButtonContainer, {
          theme: 'outline',
          size: 'large',
          text: isSignUp ? 'signup_with' : 'signin_with',
          width: googleButtonContainer.offsetWidth || 280,
          shape: 'rectangular',
        });
      }
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      setError('Failed to initialize Google Sign-In.');
    }
  }, [handleGoogleCredentialResponse, isSignUp]);

  // Re-initialize when isSignUp changes to update button text
  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn();
    }
  }, [isSignUp, initializeGoogleSignIn]);

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
    } catch (error: unknown) {
      console.error('Email auth failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
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
    onClose();
  };

  if (!open) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose}>
          ×
        </button>

        <div className="auth-modal-header">
          <h1>{isSignUp ? 'Sign up for RowGram' : 'Log in to RowGram'}</h1>
          <p>
            {isSignUp ? 'Have an account?' : 'Need an account?'}{' '}
            <button type="button" className="auth-toggle-link" onClick={toggleSignUpMode}>
              {isSignUp ? 'Sign in now' : 'Sign up now'}
            </button>
          </p>
        </div>

        <div className="auth-modal-body">
          {error && <div className="auth-error">{error}</div>}

          {/* Google Login Button - Container for Google's rendered button */}
          <div
            id="google-signin-button"
            className="google-login-btn-container"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            {/* Google button will be rendered here by Google's API */}
            {!window.google && (
              <Button
                variant="secondary"
                size="large"
                disabled={true}
                className="google-login-btn"
                style={{ width: '100%' }}
              >
                Loading Google Sign-In...
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <span>Or</span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="auth-form">
            {isSignUp && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input"
              />
            )}

            <input
              type="email"
              placeholder="Username or email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              autoComplete="username"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              className="auth-submit-btn"
            >
              {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
            </Button>
          </form>

          {!isSignUp && (
            <div className="auth-footer">
              <button type="button" className="forgot-password-link">
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
