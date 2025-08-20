import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { 
  MdSettings, 
  MdPerson, 
  MdPalette, 
  MdExpandMore,
  MdSave,
  MdDarkMode,
  MdNotifications
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/RowgramThemeContext';
import { useNotification } from '../context/NotificationContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess } = useNotification();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [clubName, setClubName] = useState(user?.club_name || '');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveProfile = () => {
    showSuccess('Profile settings saved successfully!');
  };

  const handleSaveClubSettings = () => {
    showSuccess('Club settings saved successfully!');
  };

  if (!user) {
    return (
      <DashboardLayout title="Settings" subtitle="Manage your account and preferences">
        <LoginPrompt 
          message="Sign in to manage your settings" 
          actionText="Manage Settings"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Manage your account, preferences, and club settings"
    >
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            {/* Profile Settings */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdPerson />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      disabled
                      helperText="Email cannot be changed after registration"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<MdSave />}
                      onClick={handleSaveProfile}
                      sx={{ mt: 1 }}
                    >
                      Save Profile
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Club Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdPalette />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Club Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Club Name"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g., Thames Rowing Club"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Club colors and logo upload coming soon! For now, you can set these in individual templates.
                    </Alert>
                    <Button
                      variant="contained"
                      startIcon={<MdSave />}
                      onClick={handleSaveClubSettings}
                    >
                      Save Club Settings
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* App Preferences */}
            <Accordion>
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdSettings />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>App Preferences</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={isDarkMode} 
                        onChange={toggleTheme} 
                        icon={<MdDarkMode />}
                        checkedIcon={<MdDarkMode />}
                      />
                    }
                    label="Dark Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={emailNotifications} 
                        onChange={(e) => setEmailNotifications(e.target.checked)} 
                        icon={<MdNotifications />}
                        checkedIcon={<MdNotifications />}
                      />
                    }
                    label="Email Notifications (Coming Soon)"
                    disabled
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Account Actions */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Account Actions
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Need to delete your account or export your data? Contact us for assistance.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  For account deletion or data export requests, please contact support at support@rowgram.com
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;