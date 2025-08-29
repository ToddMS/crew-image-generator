import React, { useState, useCallback } from 'react';
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

  const handleGoogleSignIn = useCallback(() => {
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
      setError('Failed to initialize Google Sign-In.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });

      const hiddenDiv = document.createElement('div');
      hiddenDiv.style.position = 'absolute';
      hiddenDiv.style.top = '-9999px';
      hiddenDiv.style.left = '-9999px';
      document.body.appendChild(hiddenDiv);

      window.google.accounts.id.renderButton(hiddenDiv, {
        theme: 'outline',
        size: 'large',
        text: isSignUp ? 'signup_with' : 'signin_with',
      });

      setTimeout(() => {
        const googleButton = hiddenDiv.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          googleButton.click();
        } else {
          // Fallback: Try to find any clickable element in the rendered button
          const anyButton = hiddenDiv.querySelector(
            '[role="button"], button, div[jsname]',
          ) as HTMLElement;
          if (anyButton) {
            anyButton.click();
          } else {
            setError('Google Sign-In is temporarily unavailable. Please use email login.');
          }
        }

        setTimeout(() => {
          if (document.body.contains(hiddenDiv)) {
            document.body.removeChild(hiddenDiv);
          }
        }, 1000);
      }, 1000);
    } catch {
      setError('Failed to initialize Google Sign-In.');
    }
  }, [handleGoogleCredentialResponse, isSignUp]);

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

          {/* Google Login Button */}
          <Button
            variant="secondary"
            size="large"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="google-login-btn"
          >
            <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isSignUp ? ' Sign up with Google' : ' Login with Google'}
          </Button>

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
