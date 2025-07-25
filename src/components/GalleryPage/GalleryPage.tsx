import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Collapse,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdDelete, MdClose, MdImage, MdSearch, MdClear, MdExpandLess, MdExpandMore, MdDownload } from 'react-icons/md';
import { ApiService } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';

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
  crew_name?: string;
  race_name?: string;
  club_name?: string;
}

interface Crew {
  id: string;
  name: string;
  clubName: string;
  raceName: string;
  boatType: {
    id: number;
    value: string;
    seats: number;
    name: string;
  };
}

interface GalleryPageProps {
  refreshTrigger?: number;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [allImages, setAllImages] = useState<SavedImage[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crewFilter, setCrewFilter] = useState('');
  const [raceFilter, setRaceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load crews first
      const crewsResponse = await ApiService.getCrews();
      if (crewsResponse.data && !crewsResponse.error) {
        setCrews(crewsResponse.data);
        
        // Load all images for all crews
        const imagePromises = crewsResponse.data.map(async (crew: Crew) => {
          const imagesResponse = await ApiService.getSavedImages(crew.id);
          if (imagesResponse.data && !imagesResponse.error) {
            return imagesResponse.data.map((img: SavedImage) => ({
              ...img,
              crew_name: crew.name,
              race_name: crew.raceName,
              club_name: crew.clubName,
            }));
          }
          return [];
        });
        
        const allImagesArrays = await Promise.all(imagePromises);
        const flatImages = allImagesArrays.flat();
        
        // Sort by creation date (newest first)
        flatImages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setAllImages(flatImages);
      }
    } catch (error) {
      console.error('Error loading gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Refresh when images are generated
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadAllData();
    }
  }, [refreshTrigger]);

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
        setAllImages(prev => prev.filter(img => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setDialogOpen(false);
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleDownloadImage = async (image: SavedImage, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const imageUrl = getImageUrl(image.image_url);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.image_name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const getImageUrl = (imageUrl: string) => {
    return `${import.meta.env.VITE_API_URL}${imageUrl}`;
  };

  // Get unique values for filters
  const uniqueCrews = [...new Set(allImages.map(img => img.crew_name))].filter(Boolean);
  const uniqueRaces = [...new Set(allImages.map(img => img.race_name))].filter(Boolean);

  // Filter images
  const filteredImages = allImages.filter(image => {
    const crewMatches = !crewFilter || image.crew_name === crewFilter;
    const raceMatches = !raceFilter || image.race_name === raceFilter;
    const searchMatches = !searchTerm || 
      image.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.crew_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.race_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.club_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return crewMatches && raceMatches && searchMatches;
  });

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Please sign in to view your gallery
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={48} />
        <Typography sx={{ ml: 2, color: theme.palette.text.secondary }}>
          Loading your gallery...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Collapsible Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 2,
        cursor: 'pointer',
        py: 2
      }}
      onClick={() => setExpanded(!expanded)}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 500,
            mr: 2
          }}
        >
          My Gallery ({filteredImages.length} images)
        </Typography>
        <IconButton size="large">
          {expanded ? <MdExpandLess size={32} /> : <MdExpandMore size={32} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch color={theme.palette.primary.main} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <MdClear size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Race</InputLabel>
          <Select
            value={raceFilter}
            onChange={(e) => setRaceFilter(e.target.value)}
            label="Filter by Race"
            size="small"
          >
            <MenuItem value="">All Races</MenuItem>
            {uniqueRaces.map(race => (
              <MenuItem key={race} value={race}>{race}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Crew</InputLabel>
          <Select
            value={crewFilter}
            onChange={(e) => setCrewFilter(e.target.value)}
            label="Filter by Crew"
            size="small"
          >
            <MenuItem value="">All Crews</MenuItem>
            {uniqueCrews.map(crew => (
              <MenuItem key={crew} value={crew}>{crew}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(crewFilter || raceFilter || searchTerm) && (
          <IconButton
            onClick={() => {
              setCrewFilter('');
              setRaceFilter('');
              setSearchTerm('');
            }}
            sx={{ color: theme.palette.text.secondary }}
          >
            <MdClear />
          </IconButton>
        )}
      </Box>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MdImage size={64} color={theme.palette.text.disabled} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.secondary,
              mt: 2
            }}
          >
            {allImages.length === 0 
              ? "No images yet. Generate and save images to see them here." 
              : "No images match your filters."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredImages.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
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
                    height: 180,
                    objectFit: 'cover',
                    backgroundColor: theme.palette.grey[100]
                  }}
                  image={getImageUrl(image.image_url)}
                  alt={image.image_name}
                />
                
                {/* Action buttons */}
                <Box
                  className="action-buttons"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.8)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.9)',
                      }
                    }}
                    onClick={(e) => handleDownloadImage(image, e)}
                  >
                    <MdDownload size={18} />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(244, 67, 54, 0.8)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.9)',
                      }
                    }}
                    onClick={(e) => handleDeleteImage(image.id, e)}
                  >
                    <MdDelete size={18} />
                  </IconButton>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {image.image_name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mb: 0.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    {image.crew_name} • {image.race_name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Chip
                      label={`Template ${image.template_id}`}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.7rem'
                      }}
                    >
                      {new Date(image.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Full Size Image Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
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
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                    {selectedImage.image_name}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                    {selectedImage.crew_name} • {selectedImage.race_name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={`Template ${selectedImage.template_id}`} />
                    <Chip label={selectedImage.club_name} variant="outlined" />
                    <Chip 
                      label={new Date(selectedImage.created_at).toLocaleDateString()} 
                      variant="outlined" 
                    />
                  </Box>
                  
                  {selectedImage.primary_color && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Colors:
                      </Typography>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          backgroundColor: selectedImage.primary_color,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      {selectedImage.secondary_color && (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
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
      </Collapse>
    </Box>
  );
};

export default GalleryPage;