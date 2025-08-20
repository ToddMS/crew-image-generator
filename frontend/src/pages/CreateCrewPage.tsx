import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/RowgramThemeContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';
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
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError } = useNotification();

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('create_crew_step', activeStep.toString());
    window.dispatchEvent(new CustomEvent('step-changed'));
  }, [activeStep]);

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
      icon: '⚓',
      description: 'Basic details about your crew',
    },
    {
      label: 'Add Members',
      icon: '👥',
      description: 'Enter crew member names',
    },
    {
      label: 'Review & Save',
      icon: '✅',
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
    if (path.includes('/analytics')) return 'analytics';
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
      const hasCox = boatClassHasCox(boatClass);
      const allNames = hasCox ? [coxName, ...crewNames] : crewNames;

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

        trackEvent(editingCrewId ? 'crew_updated' : 'crew_created', {
          boatClass,
          crewSize: allNames.length,
          clubName,
          raceName,
        });

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

                <div className="form-group">
                  <label htmlFor="clubName">
                    Club Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="clubName"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className={showValidation && !clubName ? 'error' : ''}
                    placeholder="Enter club name"
                    required
                  />
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
              <div className="crew-names-header">
                <h3>Enter Crew Member Names</h3>
                <p style={{ color: 'var(--gray-600)', margin: 0 }}>
                  {boatClass} - {boatClassToSeats[boatClass]} rowers
                  {boatClassHasCox(boatClass) && ' + coxswain'}
                </p>
              </div>

              {boatClassHasCox(boatClass) && (
                <div className="cox-input">
                  <div className="form-group">
                    <label htmlFor="coxName">
                      Coxswain <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="coxName"
                      value={coxName}
                      onChange={(e) => setCoxName(e.target.value)}
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
                      ? 'Bow'
                      : seatNumber === boatClassToSeats[boatClass]
                        ? 'Stroke'
                        : `${seatNumber}`;
                  
                  return (
                    <div key={index} className="crew-name-input">
                      <div className="seat-label">{seatName}</div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
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
                      ? 'Bow'
                      : seatNumber === boatClassToSeats[boatClass]
                        ? 'Stroke'
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
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <button className="logo" onClick={() => handleNavClick('/')}>
            <div className="logo-icon">⚓</div>
            <span>RowGram</span>
          </button>
          
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('/')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${currentPage === 'crews' ? 'active' : ''}`}
              onClick={() => handleNavClick('/crews')}
            >
              My Crews
            </button>
            <button 
              className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
              onClick={() => handleNavClick('/crews/create')}
            >
              Create Crew
            </button>
            <button 
              className={`nav-link ${currentPage === 'templates' ? 'active' : ''}`}
              onClick={() => handleNavClick('/templates/create')}
            >
              Templates
            </button>
            <button 
              className={`nav-link ${currentPage === 'generate' ? 'active' : ''}`}
              onClick={() => handleNavClick('/generate')}
            >
              Generate
            </button>
            <button 
              className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
              onClick={() => handleNavClick('/gallery')}
            >
              Gallery
            </button>
            <button 
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('/settings')}
            >
              Settings
            </button>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">{user.club_name || user.name}</span>
                <div className="user-avatar">
                  {user.name?.[0] || 'U'}
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                  ↗️
                </button>
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Header */}
        <div className="create-crew-header">
          <h1>{editingCrewId ? 'Edit Your Crew' : 'Create New Crew'}</h1>
          <p>Set up your rowing crew with all the details and member information</p>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-text">
              Step {activeStep + 1} of {steps.length}
            </span>
            <span className="progress-text">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

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
                {completedSteps.has(index) ? '✓' : step.icon}
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
