import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdGroups, 
  MdAdd,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdImageSearch,
  MdSportsKabaddi,
  MdEmojiEvents,
  MdPerson
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { ApiService } from '../services/api.service';
import { useNotification } from '../context/NotificationContext';
import { Crew } from '../types/crew.types';


const NewMyCrewsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();

  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCrews();
    
    // Show success message if coming from crew creation
    if (location.state?.message) {
      showSuccess(location.state.message);
      // Clear the state to prevent showing message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showSuccess]);

  const loadCrews = async () => {
    try {
      const response = await ApiService.getCrews();
      if (response.error) {
        showError(response.error);
      } else {
        setCrews(response.data || []);
      }
    } catch (error) {
      showError('Failed to load crews');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, crew: Crew) => {
    setAnchorEl(event.currentTarget);
    setSelectedCrew(crew);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCrew(null);
  };

  const handleEditClick = () => {
    if (selectedCrew) {
      setEditName(selectedCrew.name);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSave = async () => {
    if (!selectedCrew || !editName.trim()) return;

    try {
      const updatedCrew = { ...selectedCrew, name: editName.trim() };
      const response = await ApiService.updateCrew(selectedCrew.id, updatedCrew);
      if (response.error) {
        showError(response.error);
      } else {
        await loadCrews();
        showSuccess('Crew name updated successfully');
        setEditDialogOpen(false);
        setSelectedCrew(null);
      }
    } catch (error) {
      showError('Failed to update crew');
    }
  };

  const handleDelete = async () => {
    if (!selectedCrew) return;

    try {
      const response = await ApiService.deleteCrew(selectedCrew.id);
      if (response.error) {
        showError(response.error);
      } else {
        await loadCrews();
        showSuccess(`Deleted crew: ${selectedCrew.name}`);
        setDeleteDialogOpen(false);
        setSelectedCrew(null);
      }
    } catch (error) {
      showError('Failed to delete crew');
    }
  };

  const CrewCard = ({ crew }: { crew: Crew }) => (
    <Card 
      sx={{ 
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 244, 248, 0.3) 100%)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header with menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: '#4a90e2', width: 48, height: 48 }}>
              <MdSportsKabaddi size={24} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                {crew.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <MdGroups size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  {crew.clubName}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={(e) => handleMenuOpen(e, crew)}
            sx={{ mt: -1 }}
          >
            <MdMoreVert />
          </IconButton>
        </Box>

        {/* Boat type and race */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              label={`${crew.boatType.value} - ${crew.boatType.name}`}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MdEmojiEvents size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {crew.raceName}
            </Typography>
          </Box>
        </Box>

        {/* Crew members preview */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Crew Members ({crew.crewNames.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {crew.crewNames.slice(0, 4).map((name, index) => (
              <Chip 
                key={index}
                label={name || `Seat ${index + 1}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {crew.crewNames.length > 4 && (
              <Chip 
                label={`+${crew.crewNames.length - 4} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Box>

        {/* Coach */}
        {crew.coachName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <MdPerson size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              Coach: {crew.coachName}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<MdImageSearch />}
            onClick={() => navigate('/generate', { state: { selectedCrewIds: [crew.id] } })}
            sx={{ flex: 1 }}
          >
            Generate Images
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/crews/${crew.id}/edit`)}
          >
            Edit
          </Button>
        </Box>

        {/* Created date */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Created {crew.createdAt ? new Date(crew.createdAt as string).toLocaleDateString() : 'Unknown'}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout title="My Crews" subtitle="Loading your crews...">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Loading crews...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Crews" 
      subtitle={`Manage your ${crews.length} crew lineup${crews.length !== 1 ? 's' : ''}`}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {crews.length === 0 ? (
          /* Empty state */
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#4a90e2', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <MdGroups size={40} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                No Crews Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                Create your first crew lineup to start generating beautiful rowing team images
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<MdAdd />}
                onClick={() => navigate('/crews/create')}
                sx={{ px: 4, py: 1.5 }}
              >
                Create Your First Crew
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Crews grid */
          <Grid container spacing={3}>
            {crews.map((crew) => (
              <Grid item xs={12} sm={6} lg={4} key={crew.id}>
                <CrewCard crew={crew} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <Fab 
          color="primary" 
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            background: 'linear-gradient(135deg, #4a90e2 0%, #2ecc71 100%)',
          }}
          onClick={() => navigate('/crews/create')}
        >
          <MdAdd size={24} />
        </Fab>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>
            <MdEdit size={16} style={{ marginRight: 8 }} />
            Edit Name
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <MdDelete size={16} style={{ marginRight: 8 }} />
            Delete Crew
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Crew Name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Crew Name"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Crew</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedCrew?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default NewMyCrewsPage;