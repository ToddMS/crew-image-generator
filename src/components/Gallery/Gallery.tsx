import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
  Card,
  CardMedia,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { MdDelete, MdClose, MdImage } from 'react-icons/md';
import { ApiService } from '../../services/api.service';

interface SavedImage {
  id: number;
  crew_id: number;
  user_id: number;
  image_name: string;
  template_id: string;
  primary_color?: string;
  secondary_color?: string;
  image_filename: string;
  image_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

interface GalleryProps {
  crewId: string;
  refreshTrigger?: number;
}

const Gallery: React.FC<GalleryProps> = ({ crewId, refreshTrigger }) => {
  const theme = useTheme();
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadSavedImages = async () => {
    if (!crewId) return;
    
    setLoading(true);
    try {
      const response = await ApiService.getSavedImages(crewId);
      if (response.data && !response.error) {
        setSavedImages(response.data);
      }
    } catch (error) {
      console.error('Error loading saved images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedImages();
  }, [crewId, refreshTrigger]);

  const handleImageClick = (image: SavedImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleDeleteImage = async (imageId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await ApiService.deleteSavedImage(imageId);
      if (!response.error) {
        setSavedImages(prev => prev.filter(img => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setDialogOpen(false);
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const getImageUrl = (imageUrl: string) => {
    const fullUrl = `${import.meta.env.VITE_API_URL}${imageUrl}`;
    return fullUrl;
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          mt: 2
        }}
      >
        <CircularProgress size={24} />
        <Typography sx={{ ml: 2, color: theme.palette.text.secondary }}>
          Loading gallery...
        </Typography>
      </Box>
    );
  }

  if (savedImages.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center',
          py: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          mt: 2
        }}
      >
        <MdImage size={48} color={theme.palette.text.disabled} />
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            mt: 1
          }}
        >
          No saved images yet. Generate and save images to see them here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: '1.1rem'
        }}
      >
        Saved Images ({savedImages.length})
      </Typography>
      
      <Grid container spacing={2}>
        {savedImages.map((image) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={image.id}>
            <Card
              sx={{
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                  '& .delete-button': {
                    opacity: 1,
                  }
                }
              }}
              onClick={() => handleImageClick(image)}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 120,
                  objectFit: 'cover',
                  backgroundColor: theme.palette.grey[100]
                }}
                image={getImageUrl(image.image_url)}
                alt={image.image_name}
              />
              
              <IconButton
                className="delete-button"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.8)',
                  }
                }}
                onClick={(e) => handleDeleteImage(image.id, e)}
              >
                <MdDelete size={16} />
              </IconButton>
              
              <Box sx={{ p: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {image.image_name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    display: 'block'
                  }}
                >
                  Template {image.template_id}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Full Size Image Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: '12px'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }
            }}
          >
            <MdClose />
          </IconButton>
          
          <DialogContent sx={{ p: 0 }}>
            {selectedImage && (
              <Box>
                <img
                  src={getImageUrl(selectedImage.image_url)}
                  alt={selectedImage.image_name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                    {selectedImage.image_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Template {selectedImage.template_id} • Created {new Date(selectedImage.created_at).toLocaleDateString()}
                  </Typography>
                  {selectedImage.primary_color && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Colors:
                      </Typography>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          backgroundColor: selectedImage.primary_color,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      {selectedImage.secondary_color && (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            backgroundColor: selectedImage.secondary_color,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Gallery;