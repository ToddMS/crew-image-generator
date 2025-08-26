import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
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
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [images, setImages] = useState<SavedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<SavedImage | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    image: SavedImage;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

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

  useEffect(() => {
    applyFilter();
  }, [images, filter]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getSavedImages();
      if (response.success && response.data) {
        console.log('Frontend received images:', response.data.map(img => ({ id: img.id, imageUrl: img.imageUrl, thumbnailUrl: img.thumbnailUrl })));
        setImages(response.data);
      } else {
        // Mock data for demonstration
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...images];

    switch (filter) {
      case 'recent':
        filtered = filtered
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
        break;
      case 'favorites':
        // Filter favorites if we had that data
        break;
      case 'all':
      default:
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    setFilteredImages(filtered);
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
    setContextMenu(null);
  };

  const handleDelete = async (image: SavedImage) => {
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
    } finally {
      setShowDeleteDialog(false);
      setSelectedImage(null);
      setContextMenu(null);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, image: SavedImage) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      image,
    });
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
      minute: '2-digit',
    });
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="gallery-container">
        <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🖼️</div>
            <h2>Image Gallery</h2>
            <p>Sign in to view and manage your generated crew images</p>
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
              Sign In to View Gallery
            </button>
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
        <div className="gallery-header">
          <h1>Gallery</h1>
          <p>
            View, manage, and download your generated crew images ({filteredImages.length} images)
          </p>
        </div>

        {/* Gallery Controls */}
        <div className="gallery-controls">
          <div className="gallery-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Images ({images.length})
            </button>
            <button
              className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
          </div>

          <div className="gallery-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
            </div>
            <button className="generate-btn" onClick={() => navigate('/generate')}>
              ➕ Generate New Image
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        {filteredImages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎨</div>
            <h2>No Images Yet</h2>
            <p>Start creating beautiful crew images by generating your first image</p>
            <button className="btn btn-primary" onClick={() => navigate('/generate')}>
              🎨 Generate Your First Image
            </button>
          </div>
        ) : (
          <div className={`gallery-grid ${viewMode}-view`}>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`image-card ${viewMode}-view`}
                onContextMenu={(e) => handleContextMenu(e, image)}
              >
                <div className={`image-preview ${viewMode}-view`}>
                  <img
                    src={image.imageUrl}
                    alt={`${image.crewName} - ${image.templateName}`}
                    onClick={() => setFullscreenImage(image)}
                  />
                  <div className="image-overlay">
                    <button
                      className="overlay-btn"
                      onClick={() => setFullscreenImage(image)}
                      title="View Fullscreen"
                    >
                      🔍
                    </button>
                    <button
                      className="overlay-btn"
                      onClick={() => handleDownload(image)}
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>

                <div className={`image-info ${viewMode}-view`}>
                  <div className="image-title">
                    {image.crewName}
                    <button className="image-menu-btn" onClick={(e) => handleContextMenu(e, image)}>
                      ⋮
                    </button>
                  </div>
                  <div className="image-subtitle">Template: {image.templateName}</div>
                  <div className="image-meta">
                    <span className="image-meta-icon">📅</span>
                    {formatDate(image.createdAt)}
                  </div>
                  <div className="image-tags">
                    <span className="image-tag">
                      {image.dimensions?.width || 1080}×{image.dimensions?.height || 1080}
                    </span>
                    <span className="image-tag">{formatFileSize(image.fileSize)}</span>
                    <span className="image-tag">{image.format?.toUpperCase() || 'PNG'}</span>
                  </div>
                  <div className="image-actions">
                    <button
                      className="image-action-btn primary"
                      onClick={() => handleDownload(image)}
                    >
                      ⬇️ Download
                    </button>
                    <button
                      className="image-action-btn secondary icon-only"
                      onClick={() => setFullscreenImage(image)}
                      title="View Fullscreen"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="context-menu"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              position: 'fixed',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="context-menu-item"
              onClick={() => setFullscreenImage(contextMenu.image)}
            >
              🔍 View Fullscreen
            </div>
            <div className="context-menu-item" onClick={() => handleDownload(contextMenu.image)}>
              ⬇️ Download
            </div>
            <div className="context-menu-divider"></div>
            <div
              className="context-menu-item danger"
              onClick={() => {
                setSelectedImage(contextMenu.image);
                setShowDeleteDialog(true);
                setContextMenu(null);
              }}
            >
              🗑️ Delete
            </div>
          </div>
        )}

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="modal-overlay" onClick={() => setFullscreenImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  {fullscreenImage.crewName} - {fullscreenImage.templateName}
                </div>
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
                <div className="image-details">
                  <span className="detail-chip">
                    {fullscreenImage.dimensions?.width || 1080} × {fullscreenImage.dimensions?.height || 1080}
                  </span>
                  <span className="detail-chip">{formatFileSize(fullscreenImage.fileSize)}</span>
                  <span className="detail-chip">{fullscreenImage.format?.toUpperCase() || 'PNG'}</span>
                  <span className="detail-chip">{formatDate(fullscreenImage.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && selectedImage && (
          <>
            <div className="modal-overlay" onClick={() => setShowDeleteDialog(false)}></div>
            <div className="confirmation-dialog">
              <div className="dialog-header">
                <div className="dialog-title">Delete Image</div>
              </div>
              <div className="dialog-content">
                Are you sure you want to delete "{selectedImage.crewName} -{' '}
                {selectedImage.templateName}"? This action cannot be undone.
              </div>
              <div className="dialog-actions">
                <button className="dialog-btn cancel" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </button>
                <button className="dialog-btn confirm" onClick={() => handleDelete(selectedImage)}>
                  Delete
                </button>
              </div>
            </div>
          </>
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
