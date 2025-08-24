import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
import { Crew } from '../../types/crew.types';
import './MyCrews.css';

const boatClassHasCox = (boatClass: string) => boatClass === '8+' || boatClass === '4+';

interface SavedCrew extends Crew {
  boatClub: string;
  boatName: string;
  boatClass: string;
  crewMembers: Array<{ seat: string; name: string }>;
}

const MyCrewsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [savedCrews, setSavedCrews] = useState<SavedCrew[]>([]);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());
  const [showGeneratePanel, setShowGeneratePanel] = useState<boolean>(false);
  const [expandedCrewMembers, setExpandedCrewMembers] = useState<Set<string>>(new Set());

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/crews/create') || path.includes('/create')) return 'create';
    if (path.includes('/crews')) return 'crews';
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  useEffect(() => {
    loadCrews();
  }, [user]);

  useEffect(() => {
    const state = location.state as { successMessage?: string } | null;
    if (state?.successMessage) {
      setSuccessMessage(state.successMessage);
      navigate(location.pathname, { replace: true });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location.state, navigate, location.pathname]);

  const loadCrews = useCallback(async () => {
    if (!user) {
      setSavedCrews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.getCrews();
      if (result.data) {
        const transformedCrews = result.data.map((crew) => {
          const getSeatLabel = (idx: number, totalRowers: number, hasCox: boolean) => {
            if (hasCox && idx === 0) return 'C';
            const rowerIdx = hasCox ? idx - 1 : idx;

            if (totalRowers === 8) {
              const seats = ['S', '7', '6', '5', '4', '3', '2', 'B'];
              return seats[rowerIdx];
            } else if (totalRowers === 4) {
              const seats = ['S', '3', '2', 'B'];
              return seats[rowerIdx];
            } else if (totalRowers === 2) {
              const seats = ['S', 'B'];
              return seats[rowerIdx];
            } else if (totalRowers === 1) {
              return 'S';
            }
            return `${rowerIdx + 1}`;
          };

          const totalRowers = crew.boatType.seats;
          const hasCox = boatClassHasCox(crew.boatType.value);

          return {
            ...crew,
            boatClub: crew.clubName,
            boatName: crew.name,
            boatClass: crew.boatType.value,
            crewMembers: crew.crewNames.map((name, idx) => ({
              seat: getSeatLabel(idx, totalRowers, hasCox),
              name,
            })),
          };
        });
        setSavedCrews(transformedCrews);

      } else if (result.error) {
        setError('Failed to load crews. Please try again.');
        setSavedCrews([]);
      }
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crews. Please try again.');
      setSavedCrews([]);
    } finally {
      setLoading(false);
    }
  }, [user]);


  const getSortedCrews = () => {
    const crewsCopy = [...savedCrews];

    switch (sortBy) {
      case 'recent':
        return crewsCopy.sort(
          (a, b) =>
            new Date(String(b.created_at || b.createdAt || 0)).getTime() -
            new Date(String(a.created_at || a.createdAt || 0)).getTime(),
        );

      case 'club':
        return crewsCopy.sort((a, b) => a.boatClub.localeCompare(b.boatClub));

      case 'race':
        return crewsCopy.sort((a, b) => a.raceName.localeCompare(b.raceName));

      case 'boat_class':
        return crewsCopy.sort((a, b) => a.boatClass.localeCompare(b.boatClass));

      default:
        return crewsCopy;
    }
  };

  const distributeCrewsIntoColumns = (crews: SavedCrew[], columnCount: number = 3) => {
    const columns: SavedCrew[][] = Array.from({ length: columnCount }, () => []);
    
    crews.forEach((crew, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(crew);
    });
    
    return columns;
  };

  const handleDeleteCrew = async (index: number) => {
    const crew = savedCrews[index];
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${crew.boatName}"?\n\nThis action cannot be undone.`
    );
    
    if (!isConfirmed) {
      return;
    }
    
    try {
      await ApiService.deleteCrew(crew.id);
      setSavedCrews((prev) => prev.filter((_, idx) => idx !== index));

      showSuccess(`Crew "${crew.boatName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting crew:', error);
      showError('Failed to delete crew. Please try again.');
      setError('Failed to delete crew. Please try again.');
    }
  };

  const handleEditCrew = (index: number) => {
    const crew = savedCrews[index];
    navigate('/create', {
      state: {
        editingCrew: {
          id: crew.id,
          boatClass: crew.boatClass,
          clubName: crew.boatClub,
          raceName: crew.raceName,
          boatName: crew.boatName,
          crewNames: crew.crewMembers
            .filter((member: { seat: string; name: string }) => member.seat !== 'Cox')
            .map((member: { seat: string; name: string }) => member.name),
          coxName:
            crew.crewMembers.find((member: { seat: string; name: string }) => member.seat === 'Cox')
              ?.name || '',
        },
      },
    });
  };

  const handleCrewSelection = (crewId: string, checked: boolean) => {
    const newSelected = new Set(selectedCrews);
    if (checked) {
      newSelected.add(crewId);
    } else {
      newSelected.delete(crewId);
    }
    setSelectedCrews(newSelected);

    if (newSelected.size > 0 && !showGeneratePanel) {
      setShowGeneratePanel(true);
    }
  };

  const handleBulkDelete = async () => {
    const crewsToDelete = Array.from(selectedCrews)
      .map((crewId) => savedCrews.find((crew) => crew.id === crewId))
      .filter((crew) => crew !== undefined);

    if (crewsToDelete.length === 0) return;

    const crewNames = crewsToDelete.map(crew => crew.boatName).join(', ');
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${crewsToDelete.length} crew${crewsToDelete.length > 1 ? 's' : ''}?\n\nCrews: ${crewNames}\n\nThis action cannot be undone.`
    );
    
    if (!isConfirmed) {
      return;
    }

    try {
      await Promise.all(crewsToDelete.map((crew) => ApiService.deleteCrew(crew.id)));

      setSavedCrews((prev) => prev.filter((crew) => !selectedCrews.has(crew.id)));

      showSuccess(
        `Successfully deleted ${crewsToDelete.length} crew${crewsToDelete.length > 1 ? 's' : ''}!`,
      );

      setSelectedCrews(new Set());
    } catch (error) {
      console.error('Error in bulk delete:', error);
      showError('Failed to delete some crews. Please try again.');
    }
  };

  const toggleCrewMembersExpansion = (crewId: string) => {
    const newExpanded = new Set(expandedCrewMembers);
    if (newExpanded.has(crewId)) {
      newExpanded.delete(crewId);
    } else {
      newExpanded.add(crewId);
    }
    setExpandedCrewMembers(newExpanded);
  };

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="my-crews-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h2>My Crews</h2>
            <p>Sign in to view and manage your saved crew lineups</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In to View Crews
            </button>
          </div>
        </div>
        
        <AuthModal 
          open={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-crews-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading your crews...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="my-crews-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="alert error">
            ⚠️ {error}
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={loadCrews}>
              Retry Loading Crews
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (savedCrews.length === 0 && !loading) {
    return (
      <div className="my-crews-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🚣</div>
            <h2>No Crews Yet</h2>
            <p>Create your first crew lineup to get started with generating beautiful rowing images</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/crews/create')}
            >
              👥 Create Your First Crew
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-crews-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
      <div className="container">
        {successMessage && (
          <div className="alert success">
            ✅ {successMessage}
            <button className="alert-close" onClick={() => setSuccessMessage(null)}>×</button>
          </div>
        )}

        {error && (
          <div className="alert error">
            ⚠️ {error}
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="crews-section">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-title">Your Crews</span>
              <span className="section-badge">{getSortedCrews().length}</span>
              <div className="crew-count">
                {selectedCrews.size > 0 ? (
                  <span className="section-badge selection">
                    {selectedCrews.size} of {savedCrews.length} crews selected
                  </span>
                ) : (
                  ``
                )}
              </div>
            </div>
            <div className="section-header-right">
              {selectedCrews.size > 0 && (
                <div className="selection-actions-inline">
                  <button
                    className="btn btn-text-small"
                    onClick={() => setSelectedCrews(new Set())}
                  >
                    Clear ({selectedCrews.size})
                  </button>
                  <button
                    className="btn btn-outline-danger-small"
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-primary-small"
                    onClick={() => {
                      navigate('/generate', {
                        state: {
                          selectedCrewIds: Array.from(selectedCrews),
                        },
                      });
                    }}
                  >
                    Generate
                  </button>
                </div>
              )}
              
              <div className='crew-dropdown'>
              {savedCrews.length > 0 && (
                <div className="sort-dropdown">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort crews by"
                  >
                    <option value="recent">Recently Created</option>
                    <option value="club">Club Name</option>
                    <option value="race">Race Name</option>
                    <option value="boat_class">Boat Class</option>
                  </select>
                </div>
              )}
              </div>
            </div>
          </div>
          
          <div className="crews-grid">
            {distributeCrewsIntoColumns(getSortedCrews()).map((column, columnIndex) => (
              <div key={columnIndex} className="crew-column">
                {column.map((crew) => (
                  <div 
                    key={crew.id} 
                    className={`crew-card ${selectedCrews.has(crew.id) ? 'selected' : ''}`}
                    onClick={() => handleCrewSelection(crew.id, !selectedCrews.has(crew.id))}
                  >
                <div className="crew-card-header">
                  <div className="crew-card-title">
                    <h3>{crew.boatName}</h3>
                    <div className="crew-card-subtitle">
                      <span>{crew.boatClub}</span>
                      <span>•</span>
                      <span>{crew.boatClass}</span>
                    </div>
                  </div>
                  <div 
                    className={`crew-card-checkbox ${selectedCrews.has(crew.id) ? 'checked' : ''}`}
                    onClick={() => handleCrewSelection(crew.id, !selectedCrews.has(crew.id))}
                  ></div>
                </div>

                <div className="crew-compact-info">
                  <div className="crew-compact-row">
                    <span className="crew-compact-label">Race:</span>
                    <span className="crew-compact-value">{crew.raceName}</span>
                  </div>
                </div>

                <div className="crew-members">
                  <div 
                    className="crew-members-header" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCrewMembersExpansion(crew.id);
                    }}
                  >
                    <span className="crew-members-title">
                      {crew.crewMembers.length} Crew Members
                    </span>
                    <span className={`crew-members-toggle ${expandedCrewMembers.has(crew.id) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  
                  
                  {expandedCrewMembers.has(crew.id) && (
                    <div 
                      className="crew-boat-layout"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCrewMembersExpansion(crew.id);
                      }}
                    >
                      {/* Coach floated left */}
                      {crew.coachName && (
                        <div className="coach-position">
                          <div className="crew-member-seat coach">Coach</div>
                          <div className="crew-member-name">{crew.coachName}</div>
                        </div>
                      )}
                      
                      {/* Cox at top center if exists */}
                      {crew.crewMembers.some(member => member.seat === 'C') && (
                        <div className="cox-position">
                          {crew.crewMembers
                            .filter(member => member.seat === 'C')
                            .map((member, idx) => (
                              <div key={idx} className="crew-member-boat">
                                <div className="crew-member-seat">{member.seat}</div>
                                <div className="crew-member-name">{member.name}</div>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {/* Rowers in single column */}
                      <div className="rowers-layout">
                        {crew.crewMembers
                          .filter(member => member.seat !== 'C')
                          .map((member, idx) => (
                            <div key={idx} className="rower-position">
                              <div className="crew-member-boat">
                                <div className="crew-member-seat">{member.seat}</div>
                                <div className="crew-member-name">{member.name}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="crew-actions">
                  <div className="crew-actions-left">
                    <button 
                      className="crew-action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        const originalIndex = savedCrews.findIndex((c) => c.id === crew.id);
                        handleEditCrew(originalIndex);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div className="crew-actions-right">
                    <button 
                      className="crew-action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/generate', {
                          state: { selectedCrewIds: [crew.id] }
                        });
                      }}
                    >
                      Generate
                    </button>
                    <button 
                      className="crew-action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        const originalIndex = savedCrews.findIndex((c) => c.id === crew.id);
                        handleDeleteCrew(originalIndex);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default MyCrewsPage;