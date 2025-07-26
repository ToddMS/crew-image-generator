import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdSave, MdArrowBack, MdCheckCircle } from 'react-icons/md';
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
  const location = useLocation();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  // Load editing data if present
  useEffect(() => {
    const state = location.state as any;
    if (state?.editingCrew) {
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
    }
  }, [location.state, navigate, location.pathname]);

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
            
            // Auto-populate form with saved data
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

        // Navigate immediately with success message
        navigate('/crews', { 
          state: { 
            successMessage: `Crew "${boatName}" ${editingCrewId ? 'updated' : 'saved'} successfully!` 
          } 
        });
      }
    } catch (error) {
      console.error('Error saving crew:', error);
    } finally {
      setSaving(false);
    }
  };


  const canProceedToStep2 = Boolean(boatClass && clubName && raceName && boatName);
  const canSave = canProceedToStep2 && crewNames.every(name => name.trim() !== '') && (!boatClassHasCox(boatClass) || coxName.trim() !== '');


  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
            {editingCrewId ? 'Edit Crew' : 'Create New Crew'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
            {editingCrewId ? 'Update your crew information and members' : 'Enter your crew information and add members to create your lineup'}
          </Typography>
        </CardContent>
      </Card>

      {/* Side by Side Layout */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Side - Crew Info */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
        </Box>

        {/* Right Side - Crew Names */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Crew Members
              </Typography>
              
              {!canProceedToStep2 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: theme.palette.text.secondary 
                }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    👈 Please fill in the crew information first
                  </Typography>
                  <Typography variant="body2">
                    Select a boat class, enter club name, race name, and boat name to start adding crew members
                  </Typography>
                </Box>
              ) : (
                <CrewNamesComponent
                  boatClass={boatClass}
                  crewNames={crewNames}
                  coxName={coxName}
                  onNameChange={handleNameChange}
                  onCoxNameChange={handleCoxNameChange}
                  onSaveCrew={handleSaveCrew}
                  clubName={clubName}
                  raceName={raceName}
                  boatName={boatName}
                  saving={saving}
                  canSave={canSave}
                  user={user}
                  isEditing={!!editingCrewId}
                />
              )}
              
              {!user && canProceedToStep2 && (
                <Box sx={{ mt: 3 }}>
                  <LoginPrompt 
                    message="Sign in to save crews to your account"
                    actionText="Save Crew"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

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
          onClick={() => navigate('/')}
          startIcon={<MdArrowBack />}
          sx={{ color: theme.palette.text.secondary }}
        >
          Back to Dashboard
        </Button>

        {/* Save button moved to CrewNamesComponent */}
        <Box />
      </Box>
    </Box>
  );
};

export default CreateCrewPage;