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
  Alert,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { MdSave, MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import CrewInfoComponent from '../components/CrewInfoComponent/CrewInfoComponent';
import CrewNamesComponent from '../components/CrewNamesComponent/CrewNamesComponent';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
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
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const [activeStep, setActiveStep] = useState(0);
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const steps = ['Crew Information', 'Crew Members'];

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

  // Load draft on component mount
  useEffect(() => {
    if (user) {
      const draftKey = `rowgram_draft_${user.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent) {
            setBoatClass(draft.boatClass || '');
            setClubName(draft.clubName || '');
            setRaceName(draft.raceName || '');
            setBoatName(draft.boatName || '');
            setCrewNames(draft.crewNames || []);
            setCoxName(draft.coxName || '');
            
            // Set active step based on what's filled
            if (draft.boatClass && draft.clubName && draft.raceName && draft.boatName) {
              setActiveStep(1);
            }
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          localStorage.removeItem(draftKey);
        }
      }
    }
  }, [user]);

  const clearDraft = () => {
    if (user) {
      localStorage.removeItem(`rowgram_draft_${user.id}`);
    }
  };

  const handleCrewInfoSubmit = (newBoatClass: string, newClubName: string, newRaceName: string, newBoatName: string) => {
    setBoatClass(newBoatClass);
    setClubName(newClubName);
    setRaceName(newRaceName);
    setBoatName(newBoatName);
    setCrewNames(Array(boatClassToSeats[newBoatClass] || 0).fill(''));
    setCoxName('');
    setActiveStep(1);
  };

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames(names => names.map((n, i) => (i === idx ? value : n)));
  };

  const handleCoxNameChange = (value: string) => setCoxName(value);

  const handleCrewReorder = (oldIndex: number, newIndex: number) => {
    setCrewNames(names => {
      const newNames = [...names];
      const [reorderedItem] = newNames.splice(oldIndex, 1);
      newNames.splice(newIndex, 0, reorderedItem);
      return newNames;
    });
  };

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

      const result = await ApiService.createCrew(crewData);
      
      if (result.data) {
        clearDraft();
        setSaveSuccess(true);
        
        trackEvent('crew_created', {
          boatClass,
          crewSize: allNames.length,
          clubName,
          raceName
        });

        // Show success for 2 seconds, then navigate
        setTimeout(() => {
          navigate('/crews');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving crew:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep(0);
    }
  };

  const canProceedToStep2 = boatClass && clubName && raceName && boatName;
  const canSave = canProceedToStep2 && crewNames.some(name => name.trim()) && (!boatClassHasCox(boatClass) || coxName.trim());

  if (saveSuccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <MdCheckCircle size={64} color={theme.palette.success.main} />
        <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
          Crew Saved Successfully!
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Your crew "{boatName}" has been saved to your account.
        </Typography>
        <Chip
          label="Redirecting to My Crews..."
          color="success"
          sx={{ fontSize: '0.9rem' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
              Start by entering your crew's basic information
            </Typography>
          )}
          
          {activeStep === 1 && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
              Add crew members to complete your lineup
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Step Content */}
      {activeStep === 0 && (
        <CrewInfoComponent
          onSubmit={handleCrewInfoSubmit}
          initialValues={{
            boatClass,
            clubName,
            raceName,
            boatName
          }}
        />
      )}

      {activeStep === 1 && boatClass && (
        <Card>
          <CardContent>
            <CrewNamesComponent
              boatClass={boatClass}
              crewNames={crewNames}
              coxName={coxName}
              onNameChange={handleNameChange}
              onCoxNameChange={handleCoxNameChange}
              onCrewReorder={handleCrewReorder}
              clubName={clubName}
              raceName={raceName}
              boatName={boatName}
            />
            
            {!user && (
              <Box sx={{ mt: 3 }}>
                <LoginPrompt 
                  message="Sign in to save crews to your account"
                  actionText="Save Crew"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Button
          onClick={handleBack}
          startIcon={<MdArrowBack />}
          sx={{ color: theme.palette.text.secondary }}
        >
          {activeStep === 0 ? 'Back to Dashboard' : 'Previous'}
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === 1 && user && (
            <Button
              variant="contained"
              onClick={handleSaveCrew}
              disabled={!canSave || saving}
              startIcon={saving ? undefined : <MdSave />}
              sx={{
                backgroundColor: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.dark
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Crew'}
            </Button>
          )}
          
          {activeStep === 0 && canProceedToStep2 && (
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              endIcon={<MdArrowForward />}
            >
              Next: Add Members
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateCrewPage;