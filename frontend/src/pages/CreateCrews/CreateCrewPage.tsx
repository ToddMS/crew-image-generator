import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
import { ClubPreset } from '../../types/club.types';
import './CreateCrew.css';

const boatClassToSeats: Record<string, number> = {
  '8+': 8,
  '4+': 4,
  '4-': 4,
  '4x': 4,
  '2-': 2,
  '2x': 2,
  '1x': 1,
};

const boatClassHasCox = (boatClass: string) => boatClass === '8+' || boatClass === '4+';

const boatClassToBoatType = (boatClass: string) => {
  const mapping: Record<string, { id: number; value: string; seats: number; name: string }> = {
    '8+': { id: 1, value: '8+', seats: 8, name: 'Eight with Coxswain' },
    '4+': { id: 2, value: '4+', seats: 4, name: 'Four with Coxswain' },
    '4-': { id: 3, value: '4-', seats: 4, name: 'Four without Coxswain' },
    '4x': { id: 6, value: '4x', seats: 4, name: 'Quad Sculls' },
    '2-': { id: 7, value: '2-', seats: 2, name: 'Coxless Pair' },
    '2x': { id: 4, value: '2x', seats: 2, name: 'Double Sculls' },
    '1x': { id: 5, value: '1x', seats: 1, name: 'Single Sculls' },
  };
  return mapping[boatClass];
};

const CreateCrewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('create_crew_step', activeStep.toString());
    window.dispatchEvent(new CustomEvent('step-changed'));
  }, [activeStep]);

  useEffect(() => {
    loadClubPresets();
  }, [user]); // Load when user changes (login/logout)

  const loadClubPresets = async () => {
    if (!user) {
      console.log('No user logged in, skipping club presets load');
      setClubPresets([]);
      return;
    }

    try {
      console.log('Loading club presets for user:', user);
      const response = await ApiService.getClubPresets();
      console.log('Club presets API response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Successfully loaded', response.data.length, 'club presets');
        setClubPresets(response.data);
      } else {
        console.log('API response was successful but no valid data:', response);
        setClubPresets([]);
      }
    } catch (error) {
      console.error('Error loading club presets:', error);
      setClubPresets([]);
    }
  };

  const handleClubPresetSelect = (presetId: number) => {
    setSelectedPresetId(presetId);
    const preset = clubPresets.find(p => p.id === presetId);
    if (preset) {
      setClubName(preset.club_name);
      setShowClubPresets(false);
    }
  };

  const handleToggleClubPresets = () => {
    setShowClubPresets(!showClubPresets);
  };

  useEffect(() => {
    const handleHeaderBack = () => {
      if (activeStep === 0) {
        navigate('/');
      } else {
        setActiveStep((prev) => prev - 1);
      }
    };

    window.addEventListener('navigate-back-step', handleHeaderBack);
    return () => window.removeEventListener('navigate-back-step', handleHeaderBack);
  }, [activeStep, navigate]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      label: 'Crew Information',
      description: 'Basic details about your crew',
    },
    {
      label: 'Add Members',
      description: 'Enter crew member names',
    },
    {
      label: 'Review & Save',
      description: 'Review and save your crew',
    },
  ];

  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showStep1Validation, setShowStep1Validation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [preserveStateAfterLogin, setPreserveStateAfterLogin] = useState(false);
  
  // Club presets
  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [showClubPresets, setShowClubPresets] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.form-group') || !target.closest('[data-club-presets]')) {
        setShowClubPresets(false);
      }
    };

    if (showClubPresets) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClubPresets]);

  const clearAllFields = () => {
    setBoatClass('');
    setClubName('');
    setRaceName('');
    setBoatName('');
    setCoachName('');
    setCrewNames([]);
    setCoxName('');
    setActiveStep(0);
    setCompletedSteps(new Set());
    setEditingCrewId(null);
    setSaving(false);
    setShowValidation(false);
    setShowStep1Validation(false);
    sessionStorage.removeItem('create_crew_step');
  };

  useEffect(() => {
    const pendingState = localStorage.getItem('rowgram_pending_save_state');
    if (pendingState && user) {
      try {
        const state = JSON.parse(pendingState);

        setBoatClass(state.boatClass);
        setClubName(state.clubName);
        setRaceName(state.raceName);
        setBoatName(state.boatName);
        setCoachName(state.coachName || '');
        setCrewNames(state.crewNames);
        setCoxName(state.coxName);
        setActiveStep(state.activeStep);
        setCompletedSteps(new Set(state.completedSteps));
        setEditingCrewId(state.editingCrewId);

        localStorage.removeItem('rowgram_pending_save_state');

        localStorage.setItem('rowgram_was_restored', 'true');

        setShowAuthModal(false);

        return;
      } catch (error) {
        console.error('Error restoring saved state:', error);
        localStorage.removeItem('rowgram_pending_save_state');
      }
    }

    if (preserveStateAfterLogin) {
      setPreserveStateAfterLogin(false);
      return;
    }

    const state = location.state as {
      editingCrew?: { id: string; boatClass: string; clubName: string; [key: string]: unknown };
    } | null;
    if (state?.editingCrew) {
      const crew = state.editingCrew;
      setEditingCrewId(crew.id);
      setBoatClass(crew.boatClass);
      setClubName(crew.clubName);
      setRaceName(String(crew.raceName || ''));
      setBoatName(String(crew.boatName || ''));
      setCoachName(String(crew.coachName || ''));
      setCrewNames(Array.isArray(crew.crewNames) ? crew.crewNames.map(String) : []);
      setCoxName(String(crew.coxName || ''));

      navigate(location.pathname, { replace: true });
    } else {
      clearAllFields();
      if (user) {
        localStorage.removeItem(`rowgram_draft_${user.id}`);
      }
    }
  }, [location.pathname, user, preserveStateAfterLogin]);

  useEffect(() => {
    if (
      user &&
      (boatClass ||
        clubName ||
        raceName ||
        boatName ||
        coachName ||
        crewNames.some((n) => n) ||
        coxName)
    ) {
      const draft = {
        boatClass,
        clubName,
        raceName,
        boatName,
        coachName,
        crewNames,
        coxName,
        timestamp: Date.now(),
      };
      localStorage.setItem(`rowgram_draft_${user.id}`, JSON.stringify(draft));
    }
  }, [boatClass, clubName, raceName, boatName, coachName, crewNames, coxName, user]);

  useEffect(() => {
    if (
      user &&
      activeStep === 2 &&
      boatClass &&
      clubName &&
      raceName &&
      boatName &&
      crewNames.every((name) => name.trim()) &&
      (!boatClassHasCox(boatClass) || coxName.trim()) &&
      !saving &&
      !showAuthModal
    ) {
      const wasRestored = localStorage.getItem('rowgram_was_restored');
      if (wasRestored) {
        localStorage.removeItem('rowgram_was_restored');
        setTimeout(() => {
          handleSaveCrew();
        }, 100);
      }
    }
  }, [
    user,
    activeStep,
    boatClass,
    clubName,
    raceName,
    boatName,
    crewNames,
    coxName,
    saving,
    showAuthModal,
  ]);

  const clearDraft = () => {
    if (user) {
      localStorage.removeItem(`rowgram_draft_${user.id}`);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleNext = () => {
    if (canProceedFromStep(activeStep)) {
      proceedToNextStep();
    }
  };

  const proceedToNextStep = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(activeStep);
    setCompletedSteps(newCompleted);
    setActiveStep((prev) => prev + 1);
    setShowValidation(false);
    setShowStep1Validation(false);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(boatClass && clubName && raceName && boatName);
      case 1:
        return (
          crewNames.every((name) => name.trim().length > 0) &&
          (!boatClassHasCox(boatClass) || coxName.trim().length > 0)
        );
      default:
        return true;
    }
  };

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames((names) => names.map((n, i) => (i === idx ? value : n)));
  };

  const focusNextInput = (currentElement: HTMLElement) => {
    const form = currentElement.closest('form') || currentElement.closest('.form-container');
    if (!form) return;
    
    const inputs = Array.from(form.querySelectorAll('input, select')) as HTMLElement[];
    const currentIndex = inputs.indexOf(currentElement);
    
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    } else if (activeStep === 0 && canProceedFromStep(0)) {
      // On step 0, if we're on the last input (coach name), go to next step
      proceedToNextStep();
    } else if (activeStep === 1 && canProceedFromStep(1)) {
      // On step 1, if we're on the last input, go to next step
      proceedToNextStep();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentElement?: HTMLElement) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = currentElement || (e.target as HTMLElement);
      focusNextInput(target);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

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

  const handleSaveCrew = async () => {
    if (!user) {
      const currentState = {
        boatClass,
        clubName,
        raceName,
        boatName,
        coachName,
        crewNames,
        coxName,
        activeStep,
        completedSteps: Array.from(completedSteps),
        editingCrewId,
        timestamp: Date.now(),
      };
      localStorage.setItem('rowgram_pending_save_state', JSON.stringify(currentState));
      setShowAuthModal(true);
      return;
    }

    setSaving(true);
    try {
      const boatType = boatClassToBoatType(boatClass);
      const allCrewNames = [...(boatClassHasCox(boatClass) ? [coxName] : []), ...crewNames];

      const crewData = {
        name: boatName,
        clubName: clubName,
        raceName: raceName,
        boatType: boatType,
        crewNames: allCrewNames,
        coachName: coachName.trim() || undefined,
      };

      let result;
      if (editingCrewId) {
        result = await ApiService.updateCrew(editingCrewId, { ...crewData, id: editingCrewId });
      } else {
        result = await ApiService.createCrew(crewData);
      }

      if (result.data) {
        clearDraft();


        const crewId = String(editingCrewId || result.data?.id);
        if (user && crewId && crewId !== 'undefined') {
          const recentKey = `recently_saved_crews_${user.id}`;
          const existing = localStorage.getItem(recentKey);
          let recentCrews = [];

          if (existing) {
            try {
              recentCrews = JSON.parse(existing);
            } catch (error) {
              console.error('Error parsing recent crews:', error);
            }
          }

          const filtered = recentCrews
            .map((id: string) => String(id))
            .filter((id: string) => id !== crewId);
          const newRecent = [crewId, ...filtered].slice(0, 5);
          localStorage.setItem(recentKey, JSON.stringify(newRecent));
        }

        showSuccess(`Crew "${boatName}" ${editingCrewId ? 'updated' : 'created'} successfully!`);

        navigate('/crews');
      }
    } catch (error) {
      console.error('Error saving crew:', error);
      showError('Failed to save crew. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="form-container">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (canProceedFromStep(0)) {
                proceedToNextStep();
              }
            }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="boatClass">
                    Boat Class <span className="required">*</span>
                  </label>
                  <select
                    id="boatClass"
                    value={boatClass}
                    onChange={(e) => {
                      const newBoatClass = e.target.value;
                      setBoatClass(newBoatClass);
                      setCrewNames(Array(boatClassToSeats[newBoatClass] || 0).fill(''));
                      setCoxName('');
                    }}
                    onKeyDown={handleKeyDown}
                    className={showValidation && !boatClass ? 'error' : ''}
                    required
                  >
                    <option value="">Select boat class</option>
                    <option value="8+">8+ (Eight with Coxswain)</option>
                    <option value="4+">4+ (Four with Coxswain)</option>
                    <option value="4-">4- (Four without Coxswain)</option>
                    <option value="4x">4x (Quad Sculls)</option>
                    <option value="2-">2- (Coxless Pair)</option>
                    <option value="2x">2x (Double Sculls)</option>
                    <option value="1x">1x (Single Sculls)</option>
                  </select>
                  {showValidation && !boatClass && (
                    <div className="error-message">Please select a boat class</div>
                  )}
                </div>

                <div className="form-group" data-club-presets>
                  <label htmlFor="clubName">
                    Club Name <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="clubName"
                      value={clubName}
                      onChange={(e) => {
                        setClubName(e.target.value);
                        setSelectedPresetId(null);
                        setShowClubPresets(true); // Always show dropdown when typing
                      }}
                      onFocus={() => {
                        setShowClubPresets(true);
                      }}
                      onBlur={() => {
                        // Delay hiding to allow for clicks
                        setTimeout(() => setShowClubPresets(false), 200);
                      }}
                      onKeyDown={(e) => {
                        handleKeyDown(e);
                        if (e.key === 'ArrowDown' && clubPresets.length > 0) {
                          e.preventDefault();
                          setShowClubPresets(true);
                        }
                      }}
                      className={showValidation && !clubName ? 'error' : ''}
                      placeholder="Type club name..."
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  {/* Club presets autocomplete dropdown */}
                  {showClubPresets && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      background: 'var(--white)',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius)',
                      marginTop: '0.25rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: 'var(--shadow-lg)',
                      width: '100%'
                    }}>
                      <div>
                        {clubPresets.length > 0 ? (
                          clubPresets.filter(preset => 
                            clubName.length === 0 || preset.club_name.toLowerCase().includes(clubName.toLowerCase())
                          ).map((preset, index) => (
                          <div
                            key={preset.id}
                            onClick={() => handleClubPresetSelect(preset.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              backgroundColor: selectedPresetId === preset.id 
                                ? 'var(--primary-light)' 
                                : index % 2 === 0 
                                  ? 'var(--white)' 
                                  : '#f8f9fa',
                              borderLeft: selectedPresetId === preset.id ? '3px solid var(--primary)' : '3px solid transparent',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedPresetId !== preset.id) {
                                e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                                e.currentTarget.style.borderLeft = '3px solid var(--primary-light)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedPresetId !== preset.id) {
                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--white)' : '#f8f9fa';
                                e.currentTarget.style.borderLeft = '3px solid transparent';
                              }
                            }}
                          >
                            <span style={{ 
                              fontSize: '0.9rem',
                              fontWeight: '400', 
                              color: 'var(--gray-900)' 
                            }}>
                              {preset.club_name}
                            </span>
                          </div>
                          ))
                        ) : (
                          <div
                            onClick={() => {
                              setShowClubPresets(false);
                              navigate('/club-presets');
                            }}
                            style={{
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              backgroundColor: 'var(--gray-50)',
                              borderLeft: '3px solid transparent',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                              e.currentTarget.style.borderLeft = '3px solid var(--primary-light)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                              e.currentTarget.style.borderLeft = '3px solid transparent';
                            }}
                          >
                            <span style={{ 
                              fontSize: '0.9rem',
                              fontWeight: '400', 
                              color: 'var(--gray-900)' 
                            }}>
                              Add Club Preset
                            </span>
                            <span style={{ 
                              fontSize: '1rem',
                              fontWeight: '500', 
                              color: 'var(--primary)' 
                            }}>
                              +
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  
                  {showValidation && !clubName && (
                    <div className="error-message">Please enter club name</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="raceName">
                    Race/Event Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="raceName"
                    value={raceName}
                    onChange={(e) => setRaceName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={showValidation && !raceName ? 'error' : ''}
                    placeholder="Enter race or event name"
                    required
                  />
                  {showValidation && !raceName && (
                    <div className="error-message">Please enter race name</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="boatName">
                    Boat Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="boatName"
                    value={boatName}
                    onChange={(e) => setBoatName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={showValidation && !boatName ? 'error' : ''}
                    placeholder="Enter boat name"
                    required
                  />
                  {showValidation && !boatName && (
                    <div className="error-message">Please enter boat name</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="coachName">Coach Name (Optional)</label>
                  <input
                    type="text"
                    id="coachName"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter coach name (optional)"
                  />
                </div>
              </div>
            </form>
          </div>
        );

      case 1:
        if (!canProceedFromStep(0)) {
          return (
            <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                ⬅️ Please complete crew information first
              </p>
              <p style={{ color: 'var(--gray-500)' }}>
                Go back to fill in boat class, club name, race name, and boat name
              </p>
            </div>
          );
        }

        return (
          <div className="form-container">
            <div className="crew-names-section">

              {boatClassHasCox(boatClass) && (
                <div className="cox-input">
                  <div className="crew-name-input">
                    <div className="seat-label">Coxswain <span className="required">*</span></div>
                    <input
                      type="text"
                      value={coxName}
                      onChange={(e) => setCoxName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={showStep1Validation && !coxName.trim() ? 'error' : ''}
                      placeholder="Enter coxswain name"
                      required
                    />
                    {showStep1Validation && !coxName.trim() && (
                      <div className="error-message">Please enter coxswain name</div>
                    )}
                  </div>
                </div>
              )}

              <div className="crew-names-grid">
                {crewNames.map((name, index) => {
                  const seatNumber = boatClassToSeats[boatClass] - index;
                  const seatName =
                    seatNumber === 1
                      ? 'Bow Seat'
                      : seatNumber === boatClassToSeats[boatClass]
                        ? 'Stroke Seat'
                        : `${seatNumber} Seat`;
                  
                  return (
                    <div key={index} className="crew-name-input">
                      <div className="seat-label">{seatName} <span className="required">*</span></div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={showStep1Validation && !name.trim() ? 'error' : ''}
                        placeholder="Enter rower name"
                        required
                      />
                      {showStep1Validation && !name.trim() && (
                        <div className="error-message">Please enter rower name</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-container">
            <div className="review-section">
              <div className="review-card">
                <h3>Crew Details</h3>
                <div className="review-item">
                  <span className="review-label">Boat Class:</span>
                  <span className="review-value">
                    {boatClass} - {boatClassToBoatType(boatClass)?.name}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Club:</span>
                  <span className="review-value">{clubName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Race:</span>
                  <span className="review-value">{raceName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Boat Name:</span>
                  <span className="review-value">{boatName}</span>
                </div>
                {coachName && (
                  <div className="review-item">
                    <span className="review-label">Coach:</span>
                    <span className="review-value">{coachName}</span>
                  </div>
                )}
              </div>

              <div className="review-card">
                <h3>Crew Members</h3>
                {boatClassHasCox(boatClass) && (
                  <div className="review-item">
                    <span className="review-label">Coxswain:</span>
                    <span className="review-value">{coxName}</span>
                  </div>
                )}
                {crewNames.map((name, index) => {
                  const seatNumber = boatClassToSeats[boatClass] - index;
                  const seatName =
                    seatNumber === 1
                      ? 'Bow Seat'
                      : seatNumber === boatClassToSeats[boatClass]
                        ? 'Stroke Seat'
                        : `${seatNumber} Seat`;
                  
                  return (
                    <div key={index} className="review-item">
                      <span className="review-label">{seatName}:</span>
                      <span className="review-value">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentPage = getCurrentPage();

  return (
    <div className="create-crew-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />

      <div className="container">
        {/* Stepper */}
        <div className="stepper">
          {steps.map((step, index) => (
            <div 
              key={step.label} 
              className={`step ${
                completedSteps.has(index) ? 'completed' : 
                activeStep === index ? 'active' : 'inactive'
              }`}
            >
              <div className="step-icon">
                {completedSteps.has(index) ? '✓' : (index + 1)}
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent(activeStep)}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-secondary" 
            onClick={handleBack}
          >
            ← {activeStep === 0 ? 'Dashboard' : 'Back'}
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeStep === steps.length - 1 ? (
              <button
                className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                onClick={handleSaveCrew}
                disabled={saving || !canProceedFromStep(activeStep) || !user}
                title={!user ? 'Please sign in to save your crew' : ''}
              >
                {saving ? 'Saving...' : editingCrewId ? 'Update Crew' : 'Save Crew'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (activeStep === 0) {
                    setShowValidation(true);
                  } else if (activeStep === 1) {
                    setShowStep1Validation(true);
                  }
                  handleNext();
                }}
                disabled={!canProceedFromStep(activeStep)}
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default CreateCrewPage;
