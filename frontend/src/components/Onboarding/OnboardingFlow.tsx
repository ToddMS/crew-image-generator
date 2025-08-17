import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useTheme } from '@mui/material/styles';
import {
  MdClose,
  MdPeople,
  MdSave,
  MdImage,
  MdPhoto,
  MdArrowForward,
  MdArrowBack,
} from 'react-icons/md';

const Transition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  },
);

interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ open, onClose, onComplete }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to RowGram!',
      icon: <MdPeople size={64} color={theme.palette.primary.main} />,
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
            Create Professional Crew Lineups
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            RowGram helps you manage rowing crews and generate beautiful lineup images for races,
            social media, and team records.
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Let me show you how to get started in just a few steps!
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Step 1: Create Your Crew',
      icon: <MdPeople size={64} color={theme.palette.success.main} />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Start by creating your first crew:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
            <li style={{ marginBottom: 8 }}>
              Enter your <strong>club name</strong> and <strong>race name</strong>
            </li>
            <li style={{ marginBottom: 8 }}>
              Choose your <strong>boat class</strong> (8+, 4+, 4-, etc.)
            </li>
            <li style={{ marginBottom: 8 }}>
              Give your boat a <strong>name</strong>
            </li>
            <li style={{ marginBottom: 8 }}>
              Add all crew members with their <strong>seat positions</strong>
            </li>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e8',
              borderRadius: 1,
              border: `1px solid ${theme.palette.success.main}`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
              💡 Pro Tip: Use drag & drop to reorder crew members easily!
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: 'Step 2: Save Your Crew',
      icon: <MdSave size={64} color={theme.palette.info.main} />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Save crews to your account:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
            <li style={{ marginBottom: 8 }}>
              Click the <strong>"Save Crew"</strong> button
            </li>
            <li style={{ marginBottom: 8 }}>
              Your crew will appear in the <strong>"My Crews"</strong> section
            </li>
            <li style={{ marginBottom: 8 }}>Edit or duplicate crews anytime</li>
            <li style={{ marginBottom: 8 }}>Search and filter your saved crews</li>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : '#e3f2fd',
              borderRadius: 1,
              border: `1px solid ${theme.palette.info.main}`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 500 }}>
              ⌨️ Keyboard Shortcut: Ctrl/Cmd + Enter to save quickly!
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: 'Step 3: Generate Images',
      icon: <MdImage size={64} color={theme.palette.warning.main} />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Create professional lineup images:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
            <li style={{ marginBottom: 8 }}>
              Click <strong>"Generate Image"</strong> on any crew
            </li>
            <li style={{ marginBottom: 8 }}>
              Choose from <strong>3 template styles</strong>
            </li>
            <li style={{ marginBottom: 8 }}>
              Customize <strong>colors</strong> or use saved presets
            </li>
            <li style={{ marginBottom: 8 }}>
              Add your <strong>club logo</strong> (optional)
            </li>
            <li style={{ marginBottom: 8 }}>
              Generate <strong>multiple crews at once</strong> with bulk mode
            </li>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : '#fff3e0',
              borderRadius: 1,
              border: `1px solid ${theme.palette.warning.main}`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 500 }}>
              🎨 Tip: Save color presets for consistent branding across all images!
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: 'Step 4: Download & Share',
      icon: <MdPhoto size={64} color={theme.palette.error.main} />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Access your images in the Gallery:
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
            <li style={{ marginBottom: 8 }}>
              Click <strong>"Gallery"</strong> in the header
            </li>
            <li style={{ marginBottom: 8 }}>View all your generated images</li>
            <li style={{ marginBottom: 8 }}>Filter by club, race, or crew</li>
            <li style={{ marginBottom: 8 }}>
              Download individual images or <strong>bulk ZIP files</strong>
            </li>
            <li style={{ marginBottom: 8 }}>Use bulk selection for multiple downloads</li>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#ffebee',
              borderRadius: 1,
              border: `1px solid ${theme.palette.error.main}`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 500 }}>
              📱 Perfect for social media, race programs, and team records!
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: "You're All Set!",
      icon: <MdPeople size={64} color={theme.palette.primary.main} />,
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
            Ready to Create Amazing Crews!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            You now know everything you need to manage crews and create professional lineup images
            with RowGram.
          </Typography>
          <Box
            sx={{
              p: 3,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f0f7ff',
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: theme.palette.primary.main, mb: 1 }}>
              Quick Tips for Success:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, textAlign: 'left' }}
            >
              • Use consistent naming for easy searching
              <br />
              • Save color presets for your club branding
              <br />
              • Try bulk generation for multiple crews
              <br />• Check Analytics to see your usage patterns
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Click "Get Started" to begin creating your first crew!
          </Typography>
        </Box>
      ),
    },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 500,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
          }}
        >
          <MdClose />
        </IconButton>

        <DialogContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.title}>
                <StepLabel />
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Box sx={{ mb: 3 }}>{steps[activeStep].icon}</Box>

            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
              {steps[activeStep].title}
            </Typography>

            <Box sx={{ flex: 1, width: '100%', maxWidth: 600 }}>{steps[activeStep].content}</Box>
          </Box>

          {/* Navigation */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}
          >
            <Button onClick={handleSkip} sx={{ color: theme.palette.text.secondary }}>
              Skip Tutorial
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<MdArrowBack />}
                sx={{ color: theme.palette.text.primary }}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={activeStep === steps.length - 1 ? undefined : <MdArrowForward />}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default OnboardingFlow;
