import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Fab,
  Snackbar,
  useMediaQuery,
  Drawer,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel,
  ButtonGroup,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdSave,
  MdArrowBack,
  MdCheckCircle,
  MdInfo,
  MdHelp,
  MdExpandMore,
  MdNavigateNext,
  MdNavigateBefore,
  MdCheck,
  MdWarning,
  MdError,
  MdGroup,
  MdBoat,
  MdPreview,
  MdAutoAwesome,
  MdTemplate,
  MdCopy,
  MdPhoto,
  MdDragIndicator,
  MdRefresh,
  MdFileUpload,
  MdCloudUpload,
  MdAccessTime,
  MdShuffle,
  MdStars,
  MdTune,
  MdLightbulb,
  MdQuestionMark,
  MdVisibility,
  MdEdit,
  MdClose,
  MdAdd,
  MdRemove,
  MdSwapVert,
  MdFileDownload,
  MdAutorenew,
  MdNotifications,
  MdBookmark,
  MdHistory
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';

// SECTION 1: Constants and Types
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
    '8+': { id: 1, value: '8+', seats: 8, name: 'Eight with Coxswain', icon: '🚣‍♂️🚣‍♀️🚣‍♂️🚣‍♀️🚣‍♂️🚣‍♀️🚣‍♂️🚣‍♀️👨‍✈️' },
    '4+': { id: 2, value: '4+', seats: 4, name: 'Four with Coxswain', icon: '🚣‍♂️🚣‍♀️🚣‍♂️🚣‍♀️👨‍✈️' },
    '4-': { id: 3, value: '4-', seats: 4, name: 'Four without Coxswain', icon: '🚣‍♂️🚣‍♀️🚣‍♂️🚣‍♀️' },
    '4x': { id: 6, value: '4x', seats: 4, name: 'Quad Sculls', icon: '🏁🚣‍♀️🚣‍♂️🚣‍♀️🚣‍♂️' },
    '2-': { id: 7, value: '2-', seats: 2, name: 'Coxless Pair', icon: '🚣‍♂️🚣‍♀️' },
    '2x': { id: 4, value: '2x', seats: 2, name: 'Double Sculls', icon: '🏁🚣‍♀️🚣‍♂️' },
    '1x': { id: 5, value: '1x', seats: 1, name: 'Single Sculls', icon: '🏁🚣‍♂️' },
  };
  return mapping[boatClass];
};

// SECTION 4: Smart Defaults and Templates
const commonClubNames = [
  'Oxford University Boat Club',
  'Cambridge University Boat Club',
  'Harvard University',
  'Yale University',
  'Princeton University',
  'University of Washington',
  'California Rowing Club',
  'Henley Rowing Club',
  'London Rowing Club',
  'Thames Rowing Club'
];

const boatNameTemplates: Record<string, string[]> = {
  '8+': ['1st VIII', '2nd VIII', '3rd VIII', 'Senior VIII', 'Junior VIII', 'Novice VIII'],
  '4+': ['1st IV+', '2nd IV+', 'Senior IV+', 'Junior IV+', 'Novice IV+'],
  '4-': ['1st IV-', '2nd IV-', 'Senior IV-', 'Junior IV-', 'Novice IV-'],
  '4x': ['1st 4x', '2nd 4x', 'Senior 4x', 'Junior 4x', 'Novice 4x'],
  '2-': ['1st Pair', '2nd Pair', 'Senior Pair', 'Junior Pair'],
  '2x': ['1st 2x', '2nd 2x', 'Senior 2x', 'Junior 2x'],
  '1x': ['Single', 'Senior Single', 'Junior Single']
};

const raceTemplates = [
  'Head of the River',
  'Henley Royal Regatta',
  'Head of the Charles',
  'University Boat Race',
  'Bumps',
  'Metropolitan Regatta',
  'National Championships',
  'Winter Training',
  'Spring Season',
  'Summer Racing'
];

// SECTION 5: Help Content
const helpContent = {
  boatClass: {
    title: "What are Boat Classes?",
    content: [
      "8+ = Eight with Coxswain (8 rowers + 1 cox)",
      "4+ = Four with Coxswain (4 rowers + 1 cox)", 
      "4- = Four without Coxswain (4 rowers only)",
      "4x = Quad Sculls (4 scullers with 2 oars each)",
      "2- = Coxless Pair (2 rowers with 1 oar each)",
      "2x = Double Sculls (2 scullers with 2 oars each)",
      "1x = Single Sculls (1 sculler with 2 oars)"
    ]
  },
  positions: {
    title: "Crew Positions Explained",
    content: [
      "Stroke Seat: Sets the rhythm for the crew",
      "Middle Seats: Provide power and maintain rhythm",
      "Bow: Helps with balance and steering",
      "Cox: Steers the boat and motivates the crew (in coxed boats)"
    ]
  }
};

interface ValidationErrors {
  boatClass?: string;
  clubName?: string;
  raceName?: string;
  boatName?: string;
  crewNames?: string[];
  coxName?: string;
}

interface DraftData {
  boatClass: string;
  clubName: string;
  raceName: string;
  boatName: string;
  crewNames: string[];
  coxName: string;
  timestamp: number;
  step: number;
}

const CreateCrewPageEnhanced: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError, showInfo } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // SECTION 1: Progressive Step-by-Step Wizard Flow
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Core form state
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  // SECTION 3: Real-Time Validation & Smart Feedback
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formCompletion, setFormCompletion] = useState(0);

  // SECTION 5: Interactive Help & Onboarding
  const [showHelp, setShowHelp] = useState(false);
  const [helpTopic, setHelpTopic] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // SECTION 7: Advanced Features & Shortcuts
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // SECTION 8: Enhanced Draft & Auto-Save
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | 'none'>('none');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  const steps = [
    {
      label: 'Crew Information',
      icon: <MdBoat />,
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

  // SECTION 3: Real-time validation
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'boatClass':
        return !value ? 'Please select a boat class' : null;
      case 'clubName':
        return !value ? 'Club name is required' : 
               value.length < 2 ? 'Club name must be at least 2 characters' : null;
      case 'raceName':
        return !value ? 'Race name is required' : 
               value.length < 2 ? 'Race name must be at least 2 characters' : null;
      case 'boatName':
        return !value ? 'Boat name is required' : 
               value.length < 2 ? 'Boat name must be at least 2 characters' : null;
      case 'crewNames':
        const names = value as string[];
        const emptyNames = names.filter(name => !name.trim());
        return emptyNames.length > 0 ? `${emptyNames.length} crew member name(s) missing` : null;
      case 'coxName':
        const needsCox = boatClassHasCox(boatClass);
        return needsCox && !value ? 'Coxswain name is required' : null;
      default:
        return null;
    }
  };

  const updateValidation = () => {
    const errors: ValidationErrors = {};
    
    if (touched.boatClass) errors.boatClass = validateField('boatClass', boatClass) || undefined;
    if (touched.clubName) errors.clubName = validateField('clubName', clubName) || undefined;
    if (touched.raceName) errors.raceName = validateField('raceName', raceName) || undefined;
    if (touched.boatName) errors.boatName = validateField('boatName', boatName) || undefined;
    if (touched.crewNames) errors.crewNames = validateField('crewNames', crewNames) ? [validateField('crewNames', crewNames)!] : undefined;
    if (touched.coxName) errors.coxName = validateField('coxName', coxName) || undefined;

    setValidationErrors(errors);

    // Calculate completion percentage
    const totalFields = 4 + crewNames.length + (boatClassHasCox(boatClass) ? 1 : 0);
    const completedFields = [
      boatClass,
      clubName,
      raceName,
      boatName,
      ...crewNames,
      ...(boatClassHasCox(boatClass) ? [coxName] : [])
    ].filter(field => field && field.trim()).length;
    
    setFormCompletion((completedFields / totalFields) * 100);
  };

  // SECTION 8: Enhanced Auto-Save
  const saveDraft = async () => {
    if (!user) return;

    setAutoSaveStatus('saving');
    
    try {
      const draft: DraftData = {
        boatClass,
        clubName,
        raceName,
        boatName,
        crewNames,
        coxName,
        timestamp: Date.now(),
        step: activeStep
      };

      const draftKey = `rowgram_draft_${user.id}`;
      localStorage.setItem(draftKey, JSON.stringify(draft));
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      // Clear timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  const loadDrafts = () => {
    if (!user) return;
    
    try {
      const draftKey = `rowgram_draft_${user.id}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        setDrafts([draft]);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const restoreDraft = (draft: DraftData) => {
    setBoatClass(draft.boatClass);
    setClubName(draft.clubName);
    setRaceName(draft.raceName);
    setBoatName(draft.boatName);
    setCrewNames(draft.crewNames);
    setCoxName(draft.coxName);
    setActiveStep(draft.step);
    setShowDrafts(false);
    showInfo('Draft restored successfully!');
  };

  // SECTION 4: Smart Defaults
  const generateBoatName = (club: string, boatClass: string): string => {
    const templates = boatNameTemplates[boatClass] || ['Crew'];
    const clubShort = club.split(' ')[0];
    return `${clubShort} ${templates[0]}`;
  };

  const applyTemplate = (templateType: string) => {
    switch (templateType) {
      case 'senior_eight':
        setBoatClass('8+');
        setRaceName('Head of the River');
        setBoatName(generateBoatName(clubName || 'Club', '8+'));
        break;
      case 'novice_four':
        setBoatClass('4+');
        setRaceName('Novice Regatta');
        setBoatName(generateBoatName(clubName || 'Club', '4+'));
        break;
      case 'training':
        setRaceName('Winter Training');
        break;
    }
    setShowTemplates(false);
    showSuccess('Template applied!');
  };

  // Auto-save trigger
  useEffect(() => {
    if (user && (boatClass || clubName || raceName || boatName || crewNames.some(n => n) || coxName)) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        saveDraft();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [boatClass, clubName, raceName, boatName, crewNames, coxName, user]);

  // Validation trigger
  useEffect(() => {
    updateValidation();
  }, [boatClass, clubName, raceName, boatName, crewNames, coxName, touched]);

  // Load initial data
  useEffect(() => {
    loadDrafts();
    
    // Check for editing data
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
      navigate(location.pathname, { replace: true });
    }

    // Show onboarding for first-time users
    const hasSeenOnboarding = localStorage.getItem('rowgram_onboarding_create');
    if (!hasSeenOnboarding && !state?.editingCrew) {
      setShowOnboarding(true);
    }
  }, [location.state, navigate, location.pathname]);

  // Update crew names array when boat class changes
  useEffect(() => {
    if (boatClass && crewNames.length !== boatClassToSeats[boatClass]) {
      setCrewNames(Array(boatClassToSeats[boatClass] || 0).fill(''));
      setCoxName('');
    }
  }, [boatClass]);

  // SECTION 1: Step Navigation
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
        return !!(boatClass && clubName && raceName && boatName) && 
               !validationErrors.boatClass && !validationErrors.clubName && 
               !validationErrors.raceName && !validationErrors.boatName;
      case 1:
        return crewNames.every(name => name.trim()) && 
               (!boatClassHasCox(boatClass) || coxName.trim()) &&
               !validationErrors.crewNames && !validationErrors.coxName;
      default:
        return true;
    }
  };

  // Handle form submission
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
        result = await ApiService.updateCrew(editingCrewId, { ...crewData, id: editingCrewId });
      } else {
        result = await ApiService.createCrew(crewData);
      }
      
      if (result.data) {
        // Clear draft
        if (user) {
          localStorage.removeItem(`rowgram_draft_${user.id}`);
        }
        
        trackEvent(editingCrewId ? 'crew_updated' : 'crew_created', {
          boatClass,
          crewSize: allNames.length,
          clubName,
          raceName
        });

        // Add to recently saved crews
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

  // SECTION 2: Enhanced Visual Components
  const StepIcon = ({ step, completed, active }: { step: number; completed: boolean; active: boolean }) => (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed ? theme.palette.success.main : 
                       active ? theme.palette.primary.main : theme.palette.grey[300],
        color: completed || active ? 'white' : theme.palette.text.secondary,
        transition: 'all 0.3s ease'
      }}
    >
      {completed ? <MdCheck size={20} /> : steps[step]?.icon}
    </Box>
  );

  const ProgressIndicator = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(formCompletion)}% complete
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={formCompletion}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: theme.palette.success.main
          }
        }}
      />
    </Box>
  );

  // SECTION 5: Help Dialog Component
  const HelpDialog = () => (
    <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MdHelp color={theme.palette.primary.main} />
        {helpContent[helpTopic as keyof typeof helpContent]?.title || 'Help'}
      </DialogTitle>
      <DialogContent>
        {helpContent[helpTopic as keyof typeof helpContent]?.content.map((item, index) => (
          <Typography key={index} variant="body1" sx={{ mb: 1 }}>
            • {item}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowHelp(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Auto-save status indicator
  const AutoSaveIndicator = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {autoSaveStatus === 'saving' && (
        <>
          <MdAutorenew className="animate-spin" size={16} color={theme.palette.info.main} />
          <Typography variant="caption" color="info.main">Saving...</Typography>
        </>
      )}
      {autoSaveStatus === 'saved' && lastSaved && (
        <>
          <MdCheck size={16} color={theme.palette.success.main} />
          <Typography variant="caption" color="success.main">
            Saved {lastSaved.toLocaleTimeString()}
          </Typography>
        </>
      )}
      {autoSaveStatus === 'error' && (
        <>
          <MdWarning size={16} color={theme.palette.error.main} />
          <Typography variant="caption" color="error.main">Save failed</Typography>
        </>
      )}
    </Box>
  );

  // SECTION 1: Wizard Steps Content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdBoat color={theme.palette.primary.main} />
                Crew Information
              </Typography>

              <Grid container spacing={3}>
                {/* Boat Class Selection */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Boat Class *
                    </Typography>
                    <Tooltip title="Click for help with boat classes">
                      <IconButton 
                        size="small" 
                        onClick={() => { setHelpTopic('boatClass'); setShowHelp(true); }}
                      >
                        <MdHelp size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <ButtonGroup sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(boatClassToBoatType).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={boatClass === key ? 'contained' : 'outlined'}
                        onClick={() => {
                          setBoatClass(key);
                          setTouched(prev => ({ ...prev, boatClass: true }));
                          // Auto-generate boat name if club is selected
                          if (clubName && !boatName) {
                            setBoatName(generateBoatName(clubName, key));
                          }
                        }}
                        sx={{ 
                          minWidth: isSmall ? 'auto' : 120,
                          mb: 1,
                          textTransform: 'none'
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{key}</Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {value.name}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </ButtonGroup>
                  
                  {validationErrors.boatClass && (
                    <FormHelperText error>{validationErrors.boatClass}</FormHelperText>
                  )}
                </Grid>

                {/* Club Name */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={commonClubNames}
                    freeSolo
                    value={clubName}
                    onChange={(_, newValue) => {
                      setClubName(newValue || '');
                      setTouched(prev => ({ ...prev, clubName: true }));
                      // Auto-generate boat name if boat class is selected
                      if (boatClass && !boatName) {
                        setBoatName(generateBoatName(newValue || '', boatClass));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Club Name *"
                        placeholder="e.g., Oxford University Boat Club"
                        error={!!validationErrors.clubName}
                        helperText={validationErrors.clubName || "Start typing for suggestions"}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdGroup color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Race Name */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={raceTemplates}
                    freeSolo
                    value={raceName}
                    onChange={(_, newValue) => {
                      setRaceName(newValue || '');
                      setTouched(prev => ({ ...prev, raceName: true }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Race Name *"
                        placeholder="e.g., Head of the River"
                        error={!!validationErrors.raceName}
                        helperText={validationErrors.raceName || "Competition or event name"}
                      />
                    )}
                  />
                </Grid>

                {/* Boat Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Boat Name *"
                    value={boatName}
                    onChange={(e) => {
                      setBoatName(e.target.value);
                      setTouched(prev => ({ ...prev, boatName: true }));
                    }}
                    placeholder="e.g., Cambridge 1st VIII"
                    error={!!validationErrors.boatName}
                    helperText={validationErrors.boatName || "This will appear on your image"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdBoat color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                      endAdornment: boatClass && clubName && (
                        <InputAdornment position="end">
                          <Tooltip title="Auto-generate boat name">
                            <IconButton
                              size="small"
                              onClick={() => setBoatName(generateBoatName(clubName, boatClass))}
                            >
                              <MdAutoAwesome size={16} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                {/* Quick Template Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MdTemplate />}
                      onClick={() => setShowTemplates(true)}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MdCopy />}
                      onClick={() => {/* TODO: Copy from existing crew */}}
                    >
                      Copy from Existing
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdGroup color={theme.palette.primary.main} />
                  Add Crew Members
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MdFileUpload />}
                    onClick={() => setShowImport(true)}
                  >
                    Import Names
                  </Button>
                  <Tooltip title="Crew positions help">
                    <IconButton 
                      size="small" 
                      onClick={() => { setHelpTopic('positions'); setShowHelp(true); }}
                    >
                      <MdHelp size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {boatClass && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {boatClassToBoatType(boatClass)?.name} - {boatClassToSeats[boatClass]} rower{boatClassToSeats[boatClass] !== 1 ? 's' : ''}
                    {boatClassHasCox(boatClass) && ' + 1 coxswain'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Coxswain (if needed) */}
                    {boatClassHasCox(boatClass) && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Coxswain *"
                          value={coxName}
                          onChange={(e) => {
                            setCoxName(e.target.value);
                            setTouched(prev => ({ ...prev, coxName: true }));
                          }}
                          placeholder="Cox name"
                          error={!!validationErrors.coxName}
                          helperText={validationErrors.coxName}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>C</Avatar>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    {/* Crew Members */}
                    {crewNames.map((name, index) => {
                      const seatNumber = boatClassToSeats[boatClass] - index;
                      const seatName = seatNumber === 1 ? 'Bow' : 
                                     seatNumber === boatClassToSeats[boatClass] ? 'Stroke' : 
                                     `${seatNumber} Seat`;
                      
                      return (
                        <Grid item xs={12} sm={6} key={index}>
                          <TextField
                            fullWidth
                            label={`${seatName} *`}
                            value={name}
                            onChange={(e) => {
                              const newNames = [...crewNames];
                              newNames[index] = e.target.value;
                              setCrewNames(newNames);
                              setTouched(prev => ({ ...prev, crewNames: true }));
                            }}
                            placeholder={`Enter ${seatName.toLowerCase()} name`}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {seatNumber}
                                  </Avatar>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>

                  {validationErrors.crewNames && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {validationErrors.crewNames[0]}
                    </FormHelperText>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdPreview color={theme.palette.primary.main} />
                Review & Save
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Crew Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Boat Class:</Typography>
                        <Chip label={`${boatClass} - ${boatClassToBoatType(boatClass)?.name}`} size="small" />
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
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
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
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Your crew will be saved and you can generate images for it later in the Gallery.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // SECTION 6: Mobile-First Design
  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        {/* Mobile App Bar */}
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
              <MdArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
              {editingCrewId ? 'Edit Crew' : 'Create Crew'}
            </Typography>
            <IconButton color="inherit" onClick={() => setShowDrafts(true)}>
              <MdHistory />
            </IconButton>
          </Toolbar>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ height: 3 }}
          />
        </AppBar>

        <Box sx={{ p: 2 }}>
          <AutoSaveIndicator />
          <ProgressIndicator />
          
          {/* Mobile Step Content */}
          {renderStepContent(activeStep)}

          {/* Mobile Navigation */}
          <Box sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 2
          }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<MdNavigateBefore />}
              fullWidth
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSaveCrew}
                disabled={saving || !canProceedFromStep(activeStep)}
                endIcon={saving ? <MdAutorenew className="animate-spin" /> : <MdSave />}
                fullWidth
              >
                {saving ? 'Saving...' : editingCrewId ? 'Update Crew' : 'Save Crew'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceedFromStep(activeStep)}
                endIcon={<MdNavigateNext />}
                fullWidth
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        {/* Mobile Dialogs */}
        <HelpDialog />
      </Box>
    );
  }

  // SECTION 1 & 2: Desktop Progressive Wizard
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {editingCrewId ? 'Edit Crew' : 'Create New Crew'}
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/" onClick={() => navigate('/')}>
              Dashboard
            </Link>
            <Typography color="text.primary">
              {editingCrewId ? 'Edit Crew' : 'Create Crew'}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<MdHistory />}
            onClick={() => setShowDrafts(true)}
          >
            Drafts
          </Button>
          <Button
            variant="outlined"
            startIcon={<MdArrowBack />}
            onClick={() => navigate('/')}
          >
            Back
          </Button>
        </Box>
      </Box>

      <AutoSaveIndicator />
      <ProgressIndicator />

      {/* Enhanced Stepper */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                opacity: index <= activeStep ? 1 : 0.5,
                transition: 'opacity 0.3s ease'
              }}
              onClick={() => handleStepClick(index)}
            >
              <StepIcon 
                step={index} 
                completed={completedSteps.has(index)} 
                active={activeStep === index} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1, 
                  fontWeight: activeStep === index ? 600 : 400,
                  color: activeStep === index ? theme.palette.primary.main : theme.palette.text.secondary
                }}
              >
                {step.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 120 }}>
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Step Connector Lines */}
        <Box sx={{ 
          position: 'relative', 
          height: 2, 
          backgroundColor: theme.palette.grey[300], 
          mt: -2, 
          mb: 2,
          mx: 5
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            backgroundColor: theme.palette.primary.main,
            width: `${(activeStep / (steps.length - 1)) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </Box>
      </Box>

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
          <Button
            variant="outlined"
            startIcon={<MdVisibility />}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSaveCrew}
              disabled={saving || !canProceedFromStep(activeStep)}
              endIcon={saving ? <MdAutorenew className="animate-spin" /> : <MdSave />}
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

      {/* Dialogs */}
      <HelpDialog />

      {/* SECTION 7: Templates Dialog */}
      <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Templates</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => applyTemplate('senior_eight')}>
                <CardContent>
                  <Typography variant="h6">Senior Eight</Typography>
                  <Typography variant="body2" color="text.secondary">
                    8+ for Head of the River
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => applyTemplate('novice_four')}>
                <CardContent>
                  <Typography variant="h6">Novice Four</Typography>
                  <Typography variant="body2" color="text.secondary">
                    4+ for Novice events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplates(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* SECTION 8: Drafts Dialog */}
      <Dialog open={showDrafts} onClose={() => setShowDrafts(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Saved Drafts</DialogTitle>
        <DialogContent>
          {drafts.length === 0 ? (
            <Typography>No drafts found</Typography>
          ) : (
            <List>
              {drafts.map((draft, index) => (
                <ListItem key={index}>
                  <ListItemButton onClick={() => restoreDraft(draft)}>
                    <ListItemIcon>
                      <MdBookmark />
                    </ListItemIcon>
                    <ListItemText
                      primary={draft.boatName || 'Untitled Crew'}
                      secondary={`${draft.clubName} • ${new Date(draft.timestamp).toLocaleString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDrafts(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateCrewPageEnhanced;