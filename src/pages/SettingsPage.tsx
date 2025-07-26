import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdEdit, MdDelete, MdAdd, MdDownload, MdUpload } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { useAnalytics } from '../context/AnalyticsContext';
import LoginPrompt from '../components/Auth/LoginPrompt';

interface ClubPreset {
  id: number;
  preset_name: string;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const { clearAllData, exportData } = useAnalytics();
  
  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      setError('Failed to load club presets');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rowgram-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDataExported(true);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to export data');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClearAllData = () => {
    clearAllData();
    setDeleteDialogOpen(false);
    setSuccess('All analytics data cleared');
    setTimeout(() => setSuccess(null), 3000);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Sign in to manage your preferences and settings
        </Typography>
        <LoginPrompt 
          message="Sign in to access your settings"
          actionText="Access Settings"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* User Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            User Profile
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 80, height: 80 }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                {user.email}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Appearance
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Dark Mode</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Toggle between light and dark theme
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Club Presets Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Club Presets
            </Typography>
            <Button
              variant="outlined"
              startIcon={<MdAdd />}
              onClick={() => {
                // TODO: Add navigation to create preset page
                setError('Creating new presets coming soon!');
                setTimeout(() => setError(null), 3000);
              }}
            >
              Add Preset
            </Button>
          </Box>
          
          {loading ? (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Loading presets...
            </Typography>
          ) : presets.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No club presets found. Create your first preset to get started.
            </Typography>
          ) : (
            <List>
              {presets.map((preset) => (
                <ListItem key={preset.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        backgroundColor: preset.primary_color,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        backgroundColor: preset.secondary_color,
                        border: '1px solid #ddd'
                      }}
                    />
                  </Box>
                  
                  <ListItemText
                    primary={preset.club_name}
                    secondary={`${preset.preset_name} ${preset.is_default ? '(Default)' : ''}`}
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        // TODO: Add edit functionality
                        setError('Editing presets coming soon!');
                        setTimeout(() => setError(null), 3000);
                      }}
                    >
                      <MdEdit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Data Management
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">Export Data</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Download your analytics and usage data
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<MdDownload />}
                onClick={handleExportData}
              >
                Export
              </Button>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" sx={{ color: theme.palette.error.main }}>
                  Clear Analytics Data
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Remove all stored analytics and usage data
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<MdDelete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Clear Data
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            About RowGram
          </Typography>
          
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Version 1.0.0
          </Typography>
          
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            RowGram helps rowing teams create professional crew lineup images. 
            Build your crews, customize templates, and generate beautiful images for your racing teams.
          </Typography>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Clear Analytics Data</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all analytics data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAllData} color="error" variant="contained">
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;