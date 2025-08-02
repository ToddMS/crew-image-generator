import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdSave, MdArrowBack, MdCheckCircle, MdNavigateNext, MdNavigateBefore, MdCheck, MdDirectionsBoat, MdGroup, MdPreview } from 'react-icons/md';
import CrewInfoComponent from '../components/CrewInfoComponent/CrewInfoComponent';
import CrewNamesComponent from '../components/CrewNamesComponent/CrewNamesComponent';
import LoginPrompt from '../components/Auth/LoginPrompt';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      label: 'Crew Information',
      icon: <MdDirectionsBoat />,
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
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  // Clear fields and reset state when entering page
  const clearAllFields = () => {
    setBoatClass('');
    setClubName('');
    setRaceName('');
    setBoatName('');
    setCrewNames([]);
    setCoxName('');
    setActiveStep(0);
    setCompletedSteps(new Set());
    setEditingCrewId(null);
    setSaving(false);
    setSaveSuccess(false);
  };

  // Load editing data if present, otherwise clear fields
  useEffect(() => {
    const state = location.state as any;
    if (state?.editingCrew) {
      // Editing mode - load crew data
      const crew = state.editingCrew;
      setEditingCrewId(crew.id);
      setBoatClass(crew.boatClass);
      setClubName(crew.clubName);
      setRaceName(crew.raceName);
      setBoatName(crew.boatName);
      setCrewNames(crew.crewNames);
      setCoxName(crew.coxName);
      
      // Clear the navigation state to prevent re-loading on refresh
      navigate(location.pathname, { replace: true });
    } else {
      // New crew mode - clear all fields and start fresh
      clearAllFields();
      // Also clear any existing draft
      if (user) {
        localStorage.removeItem(`rowgram_draft_${user.id}`);
      }
    }
  }, [location.pathname, user]); // Remove location.state from dependencies to clear on every navigation

  // Auto-save draft to localStorage
  useEffect(() => {
    if (user && (boatClass || clubName || raceName || boatName || crewNames.some(n => n) || coxName)) {
      const draft = {
        boatClass,
        clubName,
        raceName,
        boatName,
        crewNames,
        coxName,
        timestamp: Date.now()
      };
      localStorage.setItem(`rowgram_draft_${user.id}`, JSON.stringify(draft));
    }
  }, [boatClass, clubName, raceName, boatName, crewNames, coxName, user]);

  // Note: Draft loading is now handled in the main useEffect above to ensure proper clearing

  const clearDraft = () => {
    if (user) {
      localStorage.removeItem(`rowgram_draft_${user.id}`);
    }
  };

  // Wizard navigation
  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(activeStep);
    setCompletedSteps(newCompleted);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(boatClass && clubName && raceName && boatName);
      case 1:
        return crewNames.every(name => name.trim()) && 
               (!boatClassHasCox(boatClass) || coxName.trim());
      default:
        return true;
    }
  };

  const handleCrewInfoSubmit = (newBoatClass: string, newClubName: string, newRaceName: string, newBoatName: string) => {
    setBoatClass(newBoatClass);
    setClubName(newClubName);
    setRaceName(newRaceName);
    setBoatName(newBoatName);
    setCrewNames(Array(boatClassToSeats[newBoatClass] || 0).fill(''));
    setCoxName('');
  };

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames(names => names.map((n, i) => (i === idx ? value : n)));
  };

  const handleCoxNameChange = (value: string) => setCoxName(value);

  const handleSaveCrew = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const getSeatLabel = (idx: number, totalRowers: number, hasCox: boolean) => {
        if (hasCox && idx === 0) return 'Cox';
        const rowerIdx = hasCox ? idx - 1 : idx;
        
        if (totalRowers === 8) {
          const seats = ['Stroke Seat', '7 Seat', '6 Seat', '5 Seat', '4 Seat', '3 Seat', '2 Seat', 'Bow'];
          return seats[rowerIdx];
        } else if (totalRowers === 4) {
          const seats = ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
          return seats[rowerIdx];
        } else if (totalRowers === 2) {
          const seats = ['Stroke Seat', 'Bow'];
          return seats[rowerIdx];
        } else if (totalRowers === 1) {
          return 'Single';
        }
        return `${rowerIdx + 1} Seat`;
      };
      
      const totalRowers = boatClassToSeats[boatClass] || 0;
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
        crewNames: allCrewNames
      };

      let result;
      if (editingCrewId) {
        // Update existing crew
        result = await ApiService.updateCrew(editingCrewId, { ...crewData, id: editingCrewId });
      } else {
        // Create new crew
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

        // Add to recently saved crews
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
          
          // Ensure all IDs are strings and add to front, remove if already exists, keep only 5
          const filtered = recentCrews.map(id => String(id)).filter(id => id !== crewId);
          const newRecent = [crewId, ...filtered].slice(0, 5);
          localStorage.setItem(recentKey, JSON.stringify(newRecent));
        }

        // Show success notification
        showSuccess(`Crew "${boatName}" ${editingCrewId ? 'updated' : 'created'} successfully!`);

        // Navigate immediately
        navigate('/crews');
      }
    } catch (error) {
      console.error('Error saving crew:', error);
      showError('Failed to save crew. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Step content renderer
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdDirectionsBoat color={theme.palette.primary.main} />
                Crew Information
              </Typography>
              <CrewInfoComponent
                onSubmit={handleCrewInfoSubmit}
                initialValues={{
                  boatClass,
                  clubName,
                  raceName,
                  boatName
                }}
              />
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdGroup color={theme.palette.primary.main} />
                Crew Members
              </Typography>
              
              {!canProceedFromStep(0) ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: theme.palette.text.secondary 
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ⬅️ Please complete crew information first
                  </Typography>
                  <Typography variant="body2">
                    Go back to fill in boat class, club name, race name, and boat name
                  </Typography>
                </Box>
              ) : (
                <CrewNamesComponent
                  boatClass={boatClass}
                  crewNames={crewNames}
                  coxName={coxName}
                  onNameChange={handleNameChange}
                  onCoxNameChange={handleCoxNameChange}
                  onSaveCrew={() => {}} // Empty function, save happens in step 3
                  clubName={clubName}
                  raceName={raceName}
                  boatName={boatName}
                  saving={false}
                  canSave={false}
                  user={user}
                  isEditing={!!editingCrewId}
                  hideButton={true} // Hide the save button from this component
                />
              )}
              
              {!user && canProceedFromStep(0) && (
                <Box sx={{ mt: 3 }}>
                  <LoginPrompt 
                    message="Sign in to save crews to your account"
                    actionText="Continue"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdPreview color={theme.palette.primary.main} />
                Review & Save
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Crew Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Crew Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Boat Class:</Typography>
                      <Typography variant="body2">{boatClass} - {boatClassToBoatType(boatClass)?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Club:</Typography>
                      <Typography variant="body2">{clubName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Race:</Typography>
                      <Typography variant="body2">{raceName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Boat Name:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{boatName}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Crew Members */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Crew Members
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {boatClassHasCox(boatClass) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Coxswain:</Typography>
                        <Typography variant="body2">{coxName}</Typography>
                      </Box>
                    )}
                    {crewNames.map((name, index) => {
                      const seatNumber = boatClassToSeats[boatClass] - index;
                      const seatName = seatNumber === 1 ? 'Bow' : 
                                     seatNumber === boatClassToSeats[boatClass] ? 'Stroke' : 
                                     `${seatNumber} Seat`;
                      return (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{seatName}:</Typography>
                          <Typography variant="body2">{name}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {editingCrewId ? 'Edit Crew' : 'Create New Crew'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {editingCrewId ? 'Update your crew information and members' : 'Follow the steps below to create your crew lineup'}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<MdArrowBack />}
          onClick={() => navigate('/')}
        >
          Back
        </Button>
      </Box>

      {/* Progress Indicator */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(((activeStep + 1) / steps.length) * 100)}% complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 4
            }
          }}
        />
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={completedSteps.has(index)}>
            <StepLabel 
              onClick={() => handleStepClick(index)}
              sx={{ cursor: 'pointer' }}
              icon={
                <Box
                  sx={{
                    width: 40,
                    height: 40,
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
                  {completedSteps.has(index) ? <MdCheck size={20} /> : step.icon}
                </Box>
              }
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      {renderStepContent(activeStep)}

      {/* Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<MdNavigateBefore />}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSaveCrew}
              disabled={saving || !canProceedFromStep(activeStep)}
              endIcon={saving ? <MdCheckCircle /> : <MdSave />}
              size="large"
            >
              {saving ? 'Saving...' : editingCrewId ? 'Update Crew' : 'Save Crew'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceedFromStep(activeStep)}
              endIcon={<MdNavigateNext />}
              size="large"
            >
              Next Step
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateCrewPage;