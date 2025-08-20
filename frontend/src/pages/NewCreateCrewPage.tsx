import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  MdGroups, 
  MdSportsKabaddi,
  MdPersonAdd,
  MdCheck,
  MdArrowForward,
  MdArrowBack
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { ApiService } from '../services/api.service';

interface BoatType {
  id: number;
  value: string;
  name: string;
  seats: number;
  hasCox: boolean;
}

const boatTypes: BoatType[] = [
  { id: 1, value: '8+', name: 'Eight', seats: 8, hasCox: true },
  { id: 2, value: '4+', name: 'Coxed Four', seats: 4, hasCox: true },
  { id: 3, value: '4-', name: 'Coxless Four', seats: 4, hasCox: false },
  { id: 4, value: '2-', name: 'Coxless Pair', seats: 2, hasCox: false },
  { id: 5, value: '2x', name: 'Double Sculls', seats: 2, hasCox: false },
  { id: 6, value: '1x', name: 'Single Sculls', seats: 1, hasCox: false },
];

const NewCreateCrewPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [crewName, setCrewName] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [selectedBoatType, setSelectedBoatType] = useState<BoatType | null>(null);
  const [crewMembers, setCrewMembers] = useState<string[]>([]);
  const [coachName, setCoachName] = useState('');

  const steps = ['Crew Details', 'Boat Type', 'Add Members', 'Review'];

  // Initialize crew members array when boat type changes
  useEffect(() => {
    if (selectedBoatType) {
      const totalSeats = selectedBoatType.seats + (selectedBoatType.hasCox ? 1 : 0);
      const newMembers = Array(totalSeats).fill('');
      if (selectedBoatType.hasCox) {
        newMembers[0] = 'Cox'; // Pre-fill cox position
      }
      setCrewMembers(newMembers);
    }
  }, [selectedBoatType]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...crewMembers];
    newMembers[index] = value;
    setCrewMembers(newMembers);
  };

  const handleSubmit = async () => {
    if (!selectedBoatType) return;
    
    setLoading(true);
    setError(null);

    try {
      const crewData = {
        name: crewName,
        clubName,
        raceName,
        boatTypeId: selectedBoatType.id,
        crewNames: crewMembers,
        coachName: coachName || undefined,
      };

      const response = await ApiService.createCrew(crewData);
      
      if (response.error) {
        setError(response.error);
      } else {
        navigate('/crews', { 
          state: { 
            message: `Successfully created crew: ${crewName}`,
            newCrewId: response.data?.id 
          }
        });
      }
    } catch (err) {
      setError('Failed to create crew. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: return crewName && clubName && raceName;
      case 1: return selectedBoatType;
      case 2: return crewMembers.every((member, index) => 
        member.trim() || (selectedBoatType?.hasCox && index === 0) // Cox can be empty
      );
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#4a90e2', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <MdGroups size={32} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Crew Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding basic information about your crew
              </Typography>
            </Box>

            <TextField
              label="Crew Name"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              fullWidth
              placeholder="e.g., Men's Senior 8+"
              required
            />
            <TextField
              label="Club Name"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              fullWidth
              placeholder="e.g., Thames Rowing Club"
              required
            />
            <TextField
              label="Race/Event Name"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              fullWidth
              placeholder="e.g., Head of the River Race"
              required
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#2ecc71', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <MdSportsKabaddi size={32} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Choose Boat Type
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select the type of boat for this crew
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {boatTypes.map((boat) => (
                <Grid item xs={12} sm={6} md={4} key={boat.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedBoatType?.id === boat.id 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onClick={() => setSelectedBoatType(boat)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {boat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {boat.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Chip 
                          label={`${boat.seats} rowers`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        {boat.hasCox && (
                          <Chip 
                            label="+ Cox" 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {selectedBoatType?.id === boat.id && (
                        <MdCheck 
                          size={24} 
                          color={theme.palette.primary.main}
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#e74c3c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <MdPersonAdd size={32} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Add Crew Members
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter the names for your {selectedBoatType?.name}
              </Typography>
              <Chip 
                label={`${selectedBoatType?.seats} rowers${selectedBoatType?.hasCox ? ' + Cox' : ''}`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Grid container spacing={2}>
              {crewMembers.map((member, index) => {
                const isCox = selectedBoatType?.hasCox && index === 0;
                const seatNumber = isCox ? 'Cox' : `Seat ${selectedBoatType?.hasCox ? index : index + 1}`;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <TextField
                      label={seatNumber}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      fullWidth
                      placeholder={isCox ? "Cox name" : "Rower name"}
                      variant="outlined"
                      disabled={isCox && member === 'Cox'} // Keep Cox pre-filled
                    />
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <TextField
              label="Coach Name (Optional)"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              fullWidth
              placeholder="Enter coach name"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: '#f39c12', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <MdCheck size={32} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Review & Create
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your crew details before creating
              </Typography>
            </Box>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Crew Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Crew Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {crewName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Club</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {clubName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Race/Event</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {raceName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Boat Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedBoatType?.value} - {selectedBoatType?.name}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Crew Members
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {crewMembers.map((member, index) => (
                    <Chip 
                      key={index}
                      label={member || `Seat ${index + 1}`}
                      variant={member ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>

                {coachName && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">Coach</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {coachName}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      title="Create New Crew" 
      subtitle="Set up a crew lineup for image generation"
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Progress Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={Boolean(index < activeStep || (index === activeStep && isStepValid(index)))}>
                  <StepLabel>
                    <Typography variant="body2" sx={{ fontWeight: index === activeStep ? 600 : 400 }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<MdArrowBack />}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid(activeStep) || loading}
            endIcon={activeStep === steps.length - 1 ? <MdCheck /> : <MdArrowForward />}
            variant="contained"
            size="large"
          >
            {loading ? 'Creating...' : activeStep === steps.length - 1 ? 'Create Crew' : 'Next'}
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default NewCreateCrewPage;