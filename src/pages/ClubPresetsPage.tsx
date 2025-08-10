import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdAdd, MdEdit, MdDelete, MdStar, MdStarBorder, MdUpload, MdSwapHoriz } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import LoginPrompt from '../components/Auth/LoginPrompt';

interface ClubPreset {
  id: number;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
}

interface FormData {
  club_name: string;
  primary_color: string;
  secondary_color: string;
  is_default: boolean;
}

const ClubPresetsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError } = useNotification();

  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ClubPreset | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<ClubPreset | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData>({
    club_name: '',
    primary_color: '#5E98C2',
    secondary_color: '#ffffff',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);


  const loadPresets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      } else {
        showError('Failed to load club presets');
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      showError('Failed to load club presets');
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (filename: string) => {
    return `${import.meta.env.VITE_API_URL}/api/club-presets/logos/${filename}`;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Logo file must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      setLogoFile(file);
    }
  };

  const resetForm = () => {
    setFormData({
      club_name: '',
      primary_color: '#5E98C2',
      secondary_color: '#ffffff',
      is_default: false
    });
    setLogoFile(null);
    setEditingPreset(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('club_name', formData.club_name);
      formDataToSend.append('primary_color', formData.primary_color);
      formDataToSend.append('secondary_color', formData.secondary_color);
      formDataToSend.append('is_default', formData.is_default.toString());

      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const url = editingPreset 
        ? `${import.meta.env.VITE_API_URL}/api/club-presets/${editingPreset.id}`
        : `${import.meta.env.VITE_API_URL}/api/club-presets`;
      
      const method = editingPreset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        showSuccess(editingPreset ? 'Preset updated successfully!' : 'Preset created successfully!');
        resetForm();
        loadPresets();
        
        trackEvent('club_preset_saved', {
          action: editingPreset ? 'update' : 'create',
          club_name: formData.club_name,
          has_logo: !!logoFile
        });
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to save preset');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
      showError('Failed to save preset');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (preset: ClubPreset) => {
    setEditingPreset(preset);
    setFormData({
      club_name: preset.club_name,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      is_default: preset.is_default
    });
    setIsCreating(true);
  };

  const handleDelete = async (preset: ClubPreset) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets/${preset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        showSuccess('Preset deleted successfully!');
        loadPresets();
        trackEvent('club_preset_deleted', {
          club_name: preset.club_name
        });
      } else {
        showError('Failed to delete preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      showError('Failed to delete preset');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setPresetToDelete(null);
    }
  };

  const handleSetDefault = async (presetId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets/${presetId}/default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        showSuccess('Default preset updated!');
        loadPresets();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to set default preset');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      showError('Failed to set default preset');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (preset: ClubPreset) => {
    setPresetToDelete(preset);
    setDeleteConfirmOpen(true);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Club Presets
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Create and manage your club's colors and logos for consistent image generation
        </Typography>
        <LoginPrompt 
          message="Sign in to create and manage your club presets"
          actionText="Manage Club Presets"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 1 }}>
          Club Presets
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Create and manage your club's colors and logos for consistent image generation
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setIsCreating(true)}
          disabled={loading}
        >
          Create New Preset
        </Button>
      </Box>


      {/* Create/Edit Form */}
      {isCreating && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingPreset ? 'Edit Preset' : 'Create New Preset'}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Club Name"
                  value={formData.club_name}
                  onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                  placeholder="e.g., Oxford University Boat Club"
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>Colors</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                    {/* Primary Color */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Primary</Typography>
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      />
                      <TextField
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        size="small"
                        sx={{ width: 80, '& .MuiInputBase-input': { textAlign: 'center', fontSize: '0.75rem' } }}
                      />
                    </Box>

                    {/* Swap Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const temp = formData.primary_color;
                          setFormData({ 
                            ...formData, 
                            primary_color: formData.secondary_color,
                            secondary_color: temp
                          });
                        }}
                        sx={{
                          color: theme.palette.text.secondary,
                          minWidth: 30,
                          height: 30,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main
                          }
                        }}
                      >
                        <MdSwapHoriz size={18} />
                      </IconButton>
                    </Box>

                    {/* Secondary Color */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Secondary</Typography>
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      />
                      <TextField
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        size="small"
                        sx={{ width: 80, '& .MuiInputBase-input': { textAlign: 'center', fontSize: '0.75rem' } }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>Club Logo</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<MdUpload />}
                  >
                    {logoFile ? logoFile.name : editingPreset?.logo_filename ? 'Change Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleLogoUpload}
                    />
                  </Button>
                  {editingPreset?.logo_filename && !logoFile && (
                    <Box mt={1}>
                      <img
                        src={getLogoUrl(editingPreset.logo_filename)}
                        alt="Current logo"
                        style={{ maxWidth: 100, maxHeight: 100, borderRadius: 8 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    />
                  }
                  label="Set as default preset"
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button onClick={resetForm}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || !formData.club_name}
            >
              {editingPreset ? 'Update' : 'Create'} Preset
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Presets List */}
      {loading && presets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading presets...</Typography>
        </Box>
      ) : presets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            No Club Presets Yet
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
            Create your first club preset to get started with consistent branding
          </Typography>
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => setIsCreating(true)}
          >
            Create Your First Preset
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {presets.map((preset) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={preset.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {preset.club_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {preset.is_default && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleSetDefault(preset.id)}
                        color={preset.is_default ? 'primary' : 'default'}
                        title="Set as default"
                        sx={{ p: 0.5, minWidth: 'auto', width: 'auto' }}
                      >
                        {preset.is_default ? <MdStar size={18} /> : <MdStarBorder size={18} />}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        backgroundColor: preset.primary_color,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        backgroundColor: preset.secondary_color,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {preset.primary_color} / {preset.secondary_color}
                    </Typography>
                  </Box>
                  
                  <Box mb={1.5}>
                    {preset.logo_filename ? (
                      <img
                        src={getLogoUrl(preset.logo_filename)}
                        alt={`${preset.club_name} logo`}
                        style={{ maxWidth: '100%', maxHeight: 60, borderRadius: 6 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          border: `2px dashed ${theme.palette.divider}`,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.palette.action.hover,
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            fontSize: '0.65rem'
                          }}
                        >
                          No Icon Saved
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<MdEdit />}
                    onClick={() => handleEdit(preset)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<MdDelete />}
                    onClick={() => confirmDelete(preset)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Club Preset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{presetToDelete?.club_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={() => presetToDelete && handleDelete(presetToDelete)}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubPresetsPage;