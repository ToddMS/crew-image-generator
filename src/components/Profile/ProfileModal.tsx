import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Divider,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { useAuth } from '../../context/AuthContext';

interface ClubPreset {
  id: number;
  preset_name: string;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [editingPreset, setEditingPreset] = useState<ClubPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    preset_name: '',
    club_name: '',
    primary_color: '#5E98C2',
    secondary_color: '#ffffff',
    is_default: false
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && user) {
      loadPresets();
    }
  }, [open, user]);

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
      } else {
        setError('Failed to load presets');
      }
    } catch (error) {
      setError('Error loading presets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      preset_name: '',
      club_name: '',
      primary_color: '#5E98C2',
      secondary_color: '#ffffff',
      is_default: presets.length === 0 // Auto-default if first preset
    });
    setLogoFile(null);
    setEditingPreset(null);
    setIsCreating(true);
  };

  const handleEdit = (preset: ClubPreset) => {
    setFormData({
      preset_name: preset.preset_name,
      club_name: preset.club_name,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      is_default: preset.is_default
    });
    setLogoFile(null);
    setEditingPreset(preset);
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('preset_name', formData.preset_name);
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
        await loadPresets();
        setIsCreating(false);
        setEditingPreset(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save preset');
      }
    } catch (error) {
      setError('Error saving preset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (presetId: number) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets/${presetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        await loadPresets();
      } else {
        setError('Failed to delete preset');
      }
    } catch (error) {
      setError('Error deleting preset');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (presetId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets/${presetId}/default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        await loadPresets();
      } else {
        setError('Failed to set default preset');
      }
    } catch (error) {
      setError('Error setting default preset');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const getLogoUrl = (filename?: string) => {
    return filename ? `${import.meta.env.VITE_API_URL}/api/club-presets/logos/${filename}` : null;
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Profile & Club Settings</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Info Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={user.profile_picture} sx={{ width: 56, height: 56 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              {user.club_name && (
                <Typography variant="body2" color="text.secondary">
                  {user.club_name}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Club Presets Section */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Club Presets ({presets.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              disabled={loading}
            >
              New Preset
            </Button>
          </Box>

          {/* Create/Edit Form */}
          {isCreating && (
            <Card sx={{ mb: 3, border: '2px solid #5E98C2' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingPreset ? 'Edit Preset' : 'Create New Preset'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Preset Name"
                      value={formData.preset_name}
                      onChange={(e) => setFormData({ ...formData, preset_name: e.target.value })}
                      placeholder="e.g., Regatta Colors, Training Kit"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Club Name"
                      value={formData.club_name}
                      onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                      placeholder="e.g., Cambridge University BC"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Primary Color
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          style={{
                            width: 50,
                            height: 50,
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                        />
                        <TextField
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Secondary Color
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          style={{
                            width: 50,
                            height: 50,
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                        />
                        <TextField
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Club Logo (optional)
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCameraIcon />}
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
                            src={getLogoUrl(editingPreset.logo_filename) || ''}
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
                <Button onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading || !formData.preset_name || !formData.club_name}
                >
                  {editingPreset ? 'Update' : 'Create'} Preset
                </Button>
              </CardActions>
            </Card>
          )}

          {/* Presets List */}
          <Grid container spacing={2}>
            {presets.map((preset) => (
              <Grid item xs={12} sm={6} md={4} key={preset.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" noWrap>
                        {preset.preset_name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleSetDefault(preset.id)}
                        color={preset.is_default ? 'primary' : 'default'}
                      >
                        {preset.is_default ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {preset.club_name}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
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
                      <Typography variant="caption" color="text.secondary">
                        Colors
                      </Typography>
                    </Box>
                    
                    {preset.logo_filename && (
                      <Box mb={2}>
                        <img
                          src={getLogoUrl(preset.logo_filename) || ''}
                          alt={`${preset.club_name} logo`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 60,
                            objectFit: 'contain',
                            borderRadius: 4
                          }}
                        />
                      </Box>
                    )}
                    
                    {preset.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => handleEdit(preset)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(preset.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {presets.length === 0 && !isCreating && (
            <Box textAlign="center" py={4}>
              <ColorLensIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No club presets yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first preset to save club colors, logos, and names for quick access.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Create Your First Preset
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;