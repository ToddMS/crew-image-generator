import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CardMedia,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  MdImage, 
  MdDownload, 
  MdDelete,
  MdMoreVert,
  MdAdd,
  MdFullscreen,
  MdDateRange
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';

interface SavedImage {
  id: string;
  crewName: string;
  templateName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  format: string;
}

const GalleryPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<SavedImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all');

  useEffect(() => {
    if (user) {
      loadImages();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadImages = async () => {
    try {
      // Mock data for now
      setImages([]);
    } catch (error) {
      showError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, image: SavedImage) => {
    setAnchorEl(event.currentTarget);
    setSelectedImage(image);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedImage(null);
  };

  const handleDownload = async (image: SavedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.crewName}-${image.templateName}.${image.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Image downloaded successfully');
    } catch (error) {
      showError('Failed to download image');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      const response = await ApiService.deleteSavedImage(parseInt(selectedImage.id));
      if (response.error) {
        showError(response.error);
      } else {
        setImages(prev => prev.filter(img => img.id !== selectedImage.id));
        showSuccess('Image deleted successfully');
      }
    } catch (error) {
      showError('Failed to delete image');
    } finally {
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <DashboardLayout title="Gallery" subtitle="View and manage your generated images">
        <LoginPrompt 
          message="Sign in to view your image gallery" 
          actionText="View Gallery"
        />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Gallery" subtitle="View and manage your generated images">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Gallery" 
      subtitle={`View and manage your generated images (${images.length} total)`}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header Actions */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              size="small"
            >
              All Images ({images.length})
            </Button>
            <Button
              variant={filter === 'recent' ? 'contained' : 'outlined'}
              onClick={() => setFilter('recent')}
              size="small"
            >
              Recent
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => navigate('/generate')}
            sx={{ px: 3 }}
          >
            Generate New Image
          </Button>
        </Box>

        {images.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <MdImage size={40} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                No Images Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                Start creating beautiful crew images by selecting a crew and template
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<MdAdd />}
                onClick={() => navigate('/generate')}
                sx={{ px: 4, py: 1.5 }}
              >
                Generate Your First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card 
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                >
                  {/* Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.thumbnailUrl || image.imageUrl}
                    alt={`${image.crewName} - ${image.templateName}`}
                    sx={{ 
                      cursor: 'pointer',
                      objectFit: 'cover'
                    }}
                    onClick={() => setFullscreenImage(image)}
                  />
                  
                  <CardContent sx={{ pb: 1 }}>
                    {/* Title and Menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
                        {image.crewName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, image)}
                        sx={{ mt: -0.5 }}
                      >
                        <MdMoreVert />
                      </IconButton>
                    </Box>

                    {/* Template and Date */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Template: {image.templateName}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <MdDateRange size={14} />
                      {formatDate(image.createdAt)}
                    </Typography>

                    {/* Image Info */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${image.dimensions.width}×${image.dimensions.height}`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={formatFileSize(image.fileSize)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>

                  {/* Quick Actions */}
                  <Box sx={{ p: 1, pt: 0, display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<MdDownload />}
                      onClick={() => handleDownload(image)}
                      variant="outlined"
                    >
                      Download
                    </Button>
                    <IconButton
                      onClick={() => setFullscreenImage(image)}
                      size="small"
                      sx={{ border: 1, borderColor: 'divider' }}
                    >
                      <MdFullscreen />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedImage && handleDownload(selectedImage)}>
            <MdDownload style={{ marginRight: 8 }} />
            Download
          </MenuItem>
          <MenuItem onClick={() => setFullscreenImage(selectedImage)}>
            <MdFullscreen style={{ marginRight: 8 }} />
            View Fullscreen
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
            <MdDelete style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Image</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedImage?.crewName} - {selectedImage?.templateName}"? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fullscreen Image Dialog */}
        <Dialog 
          open={Boolean(fullscreenImage)} 
          onClose={() => setFullscreenImage(null)}
          maxWidth="lg"
          fullWidth
        >
          {fullscreenImage && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {fullscreenImage.crewName} - {fullscreenImage.templateName}
                  </Typography>
                  <Button
                    startIcon={<MdDownload />}
                    onClick={() => handleDownload(fullscreenImage)}
                    variant="outlined"
                  >
                    Download
                  </Button>
                </Box>
              </DialogTitle>
              <DialogContent>
                <img
                  src={fullscreenImage.imageUrl}
                  alt={`${fullscreenImage.crewName} - ${fullscreenImage.templateName}`}
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip label={`${fullscreenImage.dimensions.width} × ${fullscreenImage.dimensions.height}`} />
                  <Chip label={formatFileSize(fullscreenImage.fileSize)} />
                  <Chip label={fullscreenImage.format.toUpperCase()} />
                  <Chip label={formatDate(fullscreenImage.createdAt)} />
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default GalleryPage;