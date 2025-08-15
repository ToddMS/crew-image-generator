import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdSave, MdCheckCircle, MdNavigateNext, MdNavigateBefore, MdCheck, MdGroup } from 'react-icons/md';
import RowingIcon from '@mui/icons-material/Rowing';
import CrewInfoComponent from '../components/CrewInfoComponent/CrewInfoComponent';
import CrewNamesComponent from '../components/CrewNamesComponent/CrewNamesComponent';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';

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
  const mapping: Record<string, any> = {
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
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
      icon: <RowingIcon />,
      description: 'Basic details about your crew'
    },
    {
      label: 'Add Members',
      icon: <MdGroup />,
      description: 'Enter crew member names'
    },
    {
      label: 'Review & Save',
      icon: <MdCheckCircle />,
      description: 'Review and save your crew'
    }
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

    const state = location.state as any;
    if (state?.editingCrew) {
      const crew = state.editingCrew;
      setEditingCrewId(crew.id);
      setBoatClass(crew.boatClass);
      setClubName(crew.clubName);
      setRaceName(crew.raceName);
      setBoatName(crew.boatName);
      setCoachName(crew.coachName || '');
      setCrewNames(crew.crewNames);
      setCoxName(crew.coxName);
      
      navigate(location.pathname, { replace: true });
    } else {
      clearAllFields();
      if (user) {
        localStorage.removeItem(`rowgram_draft_${user.id}`);
      }
    }
  }, [location.pathname, user, preserveStateAfterLogin]);

  useEffect(() => {
    if (user && (boatClass || clubName || raceName || boatName || coachName || crewNames.some(n => n) || coxName)) {
      const draft = {
        boatClass,
        clubName,
        raceName,
        boatName,
        coachName,
        crewNames,
        coxName,
        timestamp: Date.now()
      };
      localStorage.setItem(`rowgram_draft_${user.id}`, JSON.stringify(draft));
    }
  }, [boatClass, clubName, raceName, boatName, coachName, crewNames, coxName, user]);

  useEffect(() => {
    if (user && activeStep === 2 && 
        boatClass && clubName && raceName && boatName &&
        crewNames.every(name => name.trim()) &&
        (!boatClassHasCox(boatClass) || coxName.trim()) &&
        !saving && !showAuthModal) {
      
      const wasRestored = localStorage.getItem('rowgram_was_restored');
      if (wasRestored) {
        localStorage.removeItem('rowgram_was_restored');
        setTimeout(() => {
          handleSaveCrew();
        }, 100);
      }
    }
  }, [user, activeStep, boatClass, clubName, raceName, boatName, crewNames, coxName, saving, showAuthModal]);

  const clearDraft = () => {
    if (user) {
      localStorage.removeItem(`rowgram_draft_${user.id}`);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleNext = () => {
    const currentForm = document.querySelector(`[data-step="${activeStep}"] form`);
    proceedToNextStep();
    // if (currentForm) {
    //   const submitButton = document.createElement('button');
    //   submitButton.type = 'submit';
    //   submitButton.style.display = 'none';
    //   currentForm.appendChild(submitButton);
    //   submitButton.click();
    //   currentForm.removeChild(submitButton);
      
    //   // if (currentForm.checkValidity()) {
    //   //   proceedToNextStep();
    //   // }
    // } else {
    //   if (canProceedFromStep(activeStep)) {
        
    //   }
    // }
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

  const handleCrewInfoSubmit = useCallback((newBoatClass: string, newClubName: string, newRaceName: string, newBoatName: string, newCoachName?: string) => {
    setBoatClass(newBoatClass);
    setClubName(newClubName);
    setRaceName(newRaceName);
    setBoatName(newBoatName);
    setCoachName(newCoachName || '');
    setCrewNames(Array(boatClassToSeats[newBoatClass] || 0).fill(''));
    setCoxName('');
  }, []);

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames(names => names.map((n, i) => (i === idx ? value : n)));
  };

  const handleCoxNameChange = (value: string) => setCoxName(value);

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
        timestamp: Date.now()
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
      const allCrewNames = [
        ...(boatClassHasCox(boatClass) ? [coxName] : []),
        ...crewNames
      ];

      const crewData = {
        name: boatName,
        clubName: clubName,
        raceName: raceName,
        boatType: boatType,
        crewNames: allCrewNames,
        coachName: coachName.trim() || undefined
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
          raceName
        });

        const crewId = String(editingCrewId || result.data?.id);
        console.log('Crew saved, ID:', crewId, 'Result:', result);
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
          
          const filtered = recentCrews.map(id => String(id)).filter(id => id !== crewId);
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
          <Box data-step="0">
            <CrewInfoComponent
              onSubmit={handleCrewInfoSubmit}
              initialValues={{
                boatClass,
                clubName,
                raceName,
                boatName,
                coachName
              }}
              showValidation={showValidation}
            />
          </Box>
        );

      case 1:
        return (
          <Box data-step="1">
            (
              <CrewNamesComponent
                boatClass={boatClass}
                crewNames={crewNames}
                coxName={coxName}
                onNameChange={handleNameChange}
                onCoxNameChange={handleCoxNameChange}
                onSaveCrew={() => {}}
                clubName={clubName}
                raceName={raceName}
                boatName={boatName}
                saving={false}
                canSave={false}
                user={user}
                isEditing={!!editingCrewId}
                hideButton={true}
                showValidation={showStep1Validation}
              />
            )
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                Crew Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Boat Class:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{boatClass} - {boatClassToBoatType(boatClass)?.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Club:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{clubName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Race:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{raceName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Boat Name:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>{boatName}</Typography>
                </Box>
                {coachName && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Coach:</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{coachName}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                Crew Members
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {boatClassHasCox(boatClass) && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>Coxswain:</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{coxName}</Typography>
                  </Box>
                )}
                {crewNames.map((name, index) => {
                  const seatNumber = boatClassToSeats[boatClass] - index;
                  const seatName = seatNumber === 1 ? 'Bow' : 
                                 seatNumber === boatClassToSeats[boatClass] ? 'Stroke' : 
                                 `${seatNumber} Seat`;
                  return (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>{seatName}:</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>{name}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 1000, 
      mx: 'auto',
      width: '100%',
      px: 3,
      pt: 0,
      pb: 0
    }}>
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(((activeStep + 1) / steps.length) * 100)}% complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ 
            height: 4, 
            borderRadius: 2,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={completedSteps.has(index)}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: completedSteps.has(index) ? theme.palette.success.main : 
                                   activeStep === index ? theme.palette.primary.main : theme.palette.grey[300],
                    color: completedSteps.has(index) || activeStep === index ? 'white' : theme.palette.text.secondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {completedSteps.has(index) ? <MdCheck size={14} /> : 
                   index === 0 ? <RowingIcon sx={{ fontSize: 14 }} /> :
                   React.cloneElement(step.icon as React.ReactElement, { size: 14 })}
                </Box>
              }
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {step.description}
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 1.5,
        mt: 1,
        pb: 0,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<MdNavigateBefore />}
        >
          {activeStep === 0 ? 'Dashboard' : 'Back'}
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Tooltip 
              title={!user ? "Please sign in to save your crew" : ""}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  onClick={handleSaveCrew}
                  disabled={saving || !canProceedFromStep(activeStep)}
                  endIcon={saving ? <MdCheckCircle /> : <MdSave />}
                  size="large"
                  sx={{
                    opacity: !user ? 0.6 : 1,
                    backgroundColor: !user ? theme.palette.grey[400] : undefined,
                    '&:hover': {
                      backgroundColor: !user ? theme.palette.grey[400] : undefined,
                    }
                  }}
                >
                  {saving ? 'Saving...' : editingCrewId ? 'Update Crew' : 'Save Crew'}
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<MdNavigateNext />}
              size="large"
            >
              Next Step
            </Button>
          )}
        </Box>
      </Box>

      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
};

export default CreateCrewPage;