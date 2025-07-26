import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  MdPersonAdd,
  MdImage,
  MdPhotoLibrary,
  MdArrowForward,
  MdCheckCircle,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import OnboardingFlow from '../components/Onboarding/OnboardingFlow';
import { useOnboarding } from '../context/OnboardingContext';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();

  const handleOnboardingComplete = () => {
    completeOnboarding();
    // Navigate to create crew page after onboarding
    setTimeout(() => {
      navigate('/create');
    }, 500);
  };

  const steps = [
    {
      label: 'Create Your Crew',
      description: 'Start by creating a crew lineup with boat type, club name, race name, and crew members.',
      icon: <MdPersonAdd size={24} />,
      action: () => navigate('/create'),
      actionText: 'Create Crew'
    },
    {
      label: 'Generate Images',
      description: 'Turn your crew lineup into beautiful, shareable images using our templates.',
      icon: <MdImage size={24} />,
      action: () => navigate('/generate'),
      actionText: 'Generate Images'
    },
    {
      label: 'View & Download',
      description: 'Browse your generated images in the gallery and download them individually or in bulk.',
      icon: <MdPhotoLibrary size={24} />,
      action: () => navigate('/gallery'),
      actionText: 'View Gallery'
    }
  ];

  const features = [
    {
      title: 'Multiple Boat Types',
      description: 'Support for 8+, 4+, 4-, 4x, 2-, 2x, and 1x boats'
    },
    {
      title: 'Custom Templates',
      description: 'Choose from multiple image templates for your crew lineups'
    },
    {
      title: 'Club Branding',
      description: 'Add your club colors and logo to personalize your images'
    },
    {
      title: 'Bulk Generation',
      description: 'Generate images for multiple crews at once to save time'
    },
    {
      title: 'Easy Sharing',
      description: 'Download individual images or bulk ZIP files for sharing'
    },
    {
      title: 'Cloud Storage',
      description: 'Your crews and images are saved securely to your account'
    }
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 3 }}>
            <Avatar
              src={user.profile_picture}
              alt={user.name}
              sx={{ width: 64, height: 64 }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                Welcome back, {user.name?.split(' ')[0]}!
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Ready to create some amazing crew lineups?
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome to RowGram
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Create beautiful crew lineup images for rowing teams
            </Typography>
          </Box>
        )}
        
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          🚣‍♂️ Your Complete Crew Lineup Solution
        </Typography>
      </Paper>

      {/* How It Works */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {step.icon}
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {index + 1}. {step.label}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={step.action}
                    endIcon={<MdArrowForward />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {step.actionText}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Features */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Features
          </Typography>
          
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <MdCheckCircle 
                    size={32} 
                    color={theme.palette.success.main} 
                    style={{ marginBottom: 8 }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Start */}
      {user && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Create your crew lineup and generate beautiful images in minutes
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create')}
              startIcon={<MdPersonAdd />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Create Your Crew
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={shouldShowOnboarding}
        onClose={() => completeOnboarding()}
        onComplete={handleOnboardingComplete}
      />
    </Box>
  );
};

export default DashboardPage;