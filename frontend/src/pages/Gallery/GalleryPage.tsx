import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
import { SavedImageResponse } from '../../types/image.types';
import './Gallery.css';

interface SavedImage {
  id: string;
  crewName: string;
  templateName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  dimensions?: { width: number; height: number };
  fileSize: number;
  format?: string;
  crewId?: string;
  templateId?: string;
}

const NewGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [images, setImages] = useState<SavedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [fullscreenImage, setFullscreenImage] = useState<SavedImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/crews/create') || path.includes('/create')) return 'create';
    if (path.includes('/crews')) return 'crews';
    if (path.includes('/club-presets')) return 'club-presets';
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  useEffect(() => {
    if (user) {
      loadImages();
    }
  }, [user]);

  const applyFilter = useCallback(() => {
    let filtered = [...images];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (image) =>
          image.crewName.toLowerCase().includes(query) ||
          image.templateName.toLowerCase().includes(query) ||
          (image.crewId && image.crewId.toLowerCase().includes(query)),
      );
    }

    // Sort by most recent first
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setFilteredImages(filtered);
  }, [images, searchQuery]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const loadImages = async () => {
    setLoading(true);

    try {
      const response = await ApiService.getSavedImages();
      if (response.success && response.data) {
        // Map SavedImageResponse[] to SavedImage[]
        const mappedImages: SavedImage[] = response.data.map((img: SavedImageResponse) => ({
          id: img.id.toString(),
          crewName: img.crewName || img.imageName || 'Unknown Crew',
          templateName: img.templateName || img.template_id || 'Unknown Template',
          imageUrl: img.imageUrl || img.imagePath || img.image_url || '',
          createdAt: img.createdAt || img.created_at || new Date().toISOString(),
          fileSize: img.fileSize || 0,
          format: img.format || 'png',
          dimensions: img.dimensions,
          crewId: img.crewId,
          templateId: img.template_id,
        }));
        setImages(mappedImages);
      } else {
        // Mock data for demonstration
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
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
      showSuccess('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      showError('Failed to download image. Please try again.');
    }
  };

  const handleImageSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)));
    }
  };

  const handleBatchDownload = async () => {
    const selectedImagesList = images.filter((img) => selectedImages.has(img.id));
    for (const image of selectedImagesList) {
      await handleDownload(image);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between downloads
    }
    setSelectedImages(new Set());
    showSuccess(`Downloaded ${selectedImagesList.length} images!`);
  };

  const handleDeleteImage = async (image: SavedImage) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${image.crewName}"?\n\nThis action cannot be undone.`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await ApiService.deleteSavedImage(parseInt(image.id));
      if (response.success) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
        showSuccess('Image deleted successfully!');
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Failed to delete image. Please try again.');
    }
  };

  const handleBatchDelete = () => {
    if (selectedImages.size === 0) return;
    const selectedImagesList = images.filter((img) => selectedImages.has(img.id));
    if (selectedImagesList.length > 0) {
      const confirmMessage = `Are you sure you want to delete ${selectedImagesList.length} images? This action cannot be undone.`;
      if (window.confirm(confirmMessage)) {
        selectedImagesList.forEach(async (image) => {
          try {
            await ApiService.deleteSavedImage(parseInt(image.id));
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        });
        setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));
        setSelectedImages(new Set());
        showSuccess(`Deleted ${selectedImagesList.length} images!`);
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  // Handle ESC key to close fullscreen modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };

    if (fullscreenImage) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [fullscreenImage]);

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="gallery-container">
        <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <h2>Image Gallery</h2>
            <p>Sign in to view and manage your generated crew images</p>
            <Button variant="primary" onClick={() => setShowAuthModal(true)}>
              Sign In to View Gallery
            </Button>
          </div>
        </div>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gallery-container">
        <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading your image gallery...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
      <div className="container">
        {/* Gallery Controls */}
        <div className="gallery-controls">
          <div className="gallery-search">
            <input
              type="text"
              placeholder="Search by crew name, template, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="gallery-actions">
            {selectedImages.size > 0 && (
              <>
                <Button variant="secondary" size="medium" onClick={handleBatchDownload}>
                  Download Selected ({selectedImages.size})
                </Button>
                <Button variant="danger" size="medium" onClick={handleBatchDelete}>
                  Delete Selected ({selectedImages.size})
                </Button>
              </>
            )}

            <Button
              variant="secondary"
              size="medium"
              onClick={handleSelectAll}
              style={{ minWidth: '120px' }}
            >
              {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
            </Button>

            <Button variant="primary" onClick={() => navigate('/generate')}>
              Generate New Image
            </Button>
          </div>
        </div>

        <div className="gallery-status">
          {filteredImages.length} of {images.length} images
        </div>

        {/* Gallery Content */}
        {filteredImages.length === 0 ? (
          <div className="empty-state">
            <h2>No Images Yet</h2>
            <p>Start creating beautiful crew images by generating your first image</p>
            <Button variant="primary" onClick={() => navigate('/generate')}>
              🎨 Generate Your First Image
            </Button>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`image-card ${selectedImages.has(image.id) ? 'selected' : ''}`}
                onClick={() => handleImageSelect(image.id)}
              >
                {/* Image Selection Checkbox */}
                <div className="image-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => handleImageSelect(image.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="image-preview">
                  <img src={image.imageUrl} alt={`${image.crewName}`} />
                </div>

                <div className="image-info">
                  <div className="image-title">{image.crewName}</div>
                  <div className="image-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenImage(image);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="modal-overlay" onClick={() => setFullscreenImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{fullscreenImage.crewName}</div>
                <button className="modal-close" onClick={() => setFullscreenImage(null)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <img
                  src={fullscreenImage.imageUrl}
                  alt={`${fullscreenImage.crewName} - ${fullscreenImage.templateName}`}
                  className="fullscreen-image"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default NewGalleryPage;
