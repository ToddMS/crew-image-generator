import { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';
import CrewInfoComponent from './components/CrewInfoComponent/CrewInfoComponent';
import CrewNamesComponent from './components/CrewNamesComponent/CrewNamesComponent';
import SavedCrewsComponent from './components/SavedCrewsComponent/SavedCrewComponent';
import ImageGenerator from './components/ImageGenerator/ImageGenerator';
import GalleryPage from './components/GalleryPage/GalleryPage';
import FooterComponent from './components/FooterComponent/FooterComponent';
import LoginPrompt from './components/Auth/LoginPrompt';
import { ApiService } from './services/api.service';
import { useAuth } from './context/AuthContext';

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

function App() {
  const { user } = useAuth();
  const theme = useTheme();
  const crewNameRef = useRef<HTMLInputElement | null>(null);
  const savedCrewsRef = useRef<HTMLInputElement | null>(null);
  const imageGeneratorRef = useRef<HTMLInputElement | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [savedCrews, setSavedCrews] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [selectedCrewForImage, setSelectedCrewForImage] = useState<number | null>(null);
  const [recentCrews, setRecentCrews] = useState<number[]>([]); // Track recent crew indices
  const [galleryRefreshTrigger, setGalleryRefreshTrigger] = useState(0); // To trigger gallery refresh
  const [isBulkMode, setIsBulkMode] = useState(false); // Track if we're in bulk mode
  const [showGalleryPage, setShowGalleryPage] = useState(true); // Track if gallery page is shown

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

  // Load draft on user login
  useEffect(() => {
    if (user && !editIndex) {
      const draftKey = `rowgram_draft_${user.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Only load draft if it's recent (within 24 hours) and not already filled
          const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000;
          const isEmpty = !boatClass && !clubName && !raceName && !boatName && 
                         !crewNames.some(n => n) && !coxName;
          
          if (isRecent && isEmpty) {
            setBoatClass(draft.boatClass || '');
            setClubName(draft.clubName || '');
            setRaceName(draft.raceName || '');
            setBoatName(draft.boatName || '');
            setCrewNames(draft.crewNames || []);
            setCoxName(draft.coxName || '');
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          localStorage.removeItem(draftKey);
        }
      }
    }
  }, [user, editIndex]);

  // Clear draft when crew is saved or form is reset
  const clearDraft = () => {
    if (user) {
      localStorage.removeItem(`rowgram_draft_${user.id}`);
    }
  };

  // Clear all form data when user logs out and load crews when authenticated
  useEffect(() => {
    const loadCrews = async () => {
      if (!user) {
        // Clear all form state when user logs out
        setSavedCrews([]);
        setBoatClass('');
        setClubName('');
        setRaceName('');
        setBoatName('');
        setCrewNames([]);
        setCoxName('');
        setEditIndex(null);
        setShowImageGenerator(false);
        setSelectedCrewForImage(null);
        setRecentCrews([]);
        clearDraft();
        return;
      }

      try {
        const result = await ApiService.getCrews();
        if (result.data) {
          // Transform backend crew data to frontend format
          const transformedCrews = result.data.map(crew => {
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
            
            const totalRowers = crew.boatType.seats;
            const hasCox = boatClassHasCox(crew.boatType.value);
            
            return {
              ...crew,
              boatClub: crew.clubName,
              boatName: crew.name,
              boatClass: crew.boatType.value,
              crewMembers: crew.crewNames.map((name, idx) => ({
                seat: getSeatLabel(idx, totalRowers, hasCox),
                name
              }))
            };
          });
          setSavedCrews(transformedCrews);
        } else if (result.error) {
          // Handle authentication errors
          console.error('Error loading crews:', result.error);
          setSavedCrews([]);
        }
      } catch (error) {
        console.error('Error loading crews:', error);
        setSavedCrews([]);
      }
    };

    loadCrews();
  }, [user]);

  // Function to update recent crews (max 5)
  const updateRecentCrews = (crewIndex: number) => {
    setRecentCrews(prev => {
      const filtered = prev.filter(idx => idx !== crewIndex);
      return [crewIndex, ...filtered].slice(0, 5);
    });
  };

  const handleCrewInfoSubmit = (newBoatClass: string, newClubName: string, newRaceName: string, newBoatName: string) => {
    setBoatClass(newBoatClass);
    setClubName(newClubName);
    setRaceName(newRaceName);
    setBoatName(newBoatName);
    setCrewNames(Array(boatClassToSeats[newBoatClass] || 0).fill(''));
    setCoxName('');
    setEditIndex(null);
    setTimeout(() => {
      crewNameRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames(names => names.map((n, i) => (i === idx ? value : n)));
  };

  const handleCoxNameChange = (value: string) => setCoxName(value);

  const handleSaveCrew = async () => {
    if (!user) {
      // This should be prevented by UI, but handle edge case
      console.error('User not authenticated');
      return;
    }

    // Proper rowing seat naming: Cox, Stroke, 7, 6, 5, 4, 3, 2, Bow for 8+
    // For 4+: Cox, Stroke, 3, 2, Bow
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
    
    const crewMembers = allNames.map((name, idx) => ({
      seat: getSeatLabel(idx, totalRowers, hasCox),
      name
    }));

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

    try {
      if (editIndex !== null) {
        // Update existing crew
        const existingCrew = savedCrews[editIndex];
        const result = await ApiService.updateCrew(existingCrew.id, { ...crewData, id: existingCrew.id });
        
        if (result.data) {
          setSavedCrews(prev => prev.map((crew, idx) => idx === editIndex ? {
            ...result.data!,
            boatClub: result.data!.clubName,
            raceName: result.data!.raceName,
            boatName: result.data!.name,
            crewMembers,
          } : crew));
          setEditIndex(null);
          clearDraft();
        }
      } else {
        // Create new crew
        const result = await ApiService.createCrew(crewData);
        
        if (result.data) {
          setSavedCrews(prev => [
            ...prev,
            {
              ...result.data!,
              boatClub: result.data!.clubName,
              raceName: result.data!.raceName,
              boatName: result.data!.name,
              crewMembers,
            },
          ]);
          clearDraft();
        }
      }
      
      setTimeout(() => {
        savedCrewsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (error) {
      console.error('Error saving crew:', error);
    }
  };

  const handleDeleteCrew = async (index: number) => {
    const crew = savedCrews[index];
    try {
      await ApiService.deleteCrew(crew.id);
      setSavedCrews(prev => prev.filter((_, idx) => idx !== index));
    } catch (error) {
      console.error('Error deleting crew:', error);
    }
  };

  const handleEditCrew = (index: number) => {
    const crew = savedCrews[index];
    if (!crew) return;
    updateRecentCrews(index); // Track as recent
    // Use the saved boat class instead of guessing
    const actualBoatClass = crew.boatClass || '';
    setBoatClass(actualBoatClass);
    setClubName(crew.boatClub);
    setRaceName(crew.raceName);
    setBoatName(crew.boatName);
    if (actualBoatClass === '8+' || actualBoatClass === '4+') {
      setCoxName(crew.crewMembers[0]?.name || '');
      setCrewNames(crew.crewMembers.slice(1).map((m: any) => m.name));
    } else {
      setCoxName('');
      setCrewNames(crew.crewMembers.map((m: any) => m.name));
    }
    setEditIndex(index);
    setTimeout(() => {
      crewNameRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };


  const handleShowImageGenerator = (crewIndex: number) => {
    updateRecentCrews(crewIndex); // Track as recent
    setSelectedCrewForImage(crewIndex);
    setShowImageGenerator(true);
    setIsBulkMode(false); // Exit bulk mode when showing individual generator
    setTimeout(() => {
      imageGeneratorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleBulkModeChange = (bulkMode: boolean) => {
    setIsBulkMode(bulkMode);
    if (bulkMode) {
      setShowImageGenerator(false); // Exit individual generator when entering bulk mode
    }
  };

  const handleGalleryClick = () => {
    // Always scroll to gallery
    setTimeout(() => {
      const element = document.getElementById('gallery');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleGenerateImage = async (imageName: string, template: string, colors?: { primary: string; secondary: string }, saveImage?: boolean) => {
    if (selectedCrewForImage === null) return;
    
    const selectedCrew = savedCrews[selectedCrewForImage];
    if (!selectedCrew) return;

    try {
      console.log('Generating image:', imageName, 'with template:', template, 'colors:', colors, 'for crew:', selectedCrew);
      
      // Call the backend API to generate the image
      const imageBlob = await ApiService.generateImage(selectedCrew.id, imageName, template, colors);
      
      if (imageBlob) {
        // Always save the image (no download from generator)
        try {
          await ApiService.saveImage(selectedCrew.id, imageName, template, colors, imageBlob);
          console.log('Image saved to crew gallery!');
          
          // Trigger gallery refresh
          setGalleryRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('Error saving image:', error);
        }
      } else {
        console.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleBulkGenerateImages = async (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void
  ) => {
    console.log('Bulk generating images for crews:', crewIds, 'with template:', template);
    
    for (let i = 0; i < crewIds.length; i++) {
      const crewId = crewIds[i];
      const crew = savedCrews.find(c => c.id === crewId);
      
      if (!crew) continue;
      
      try {
        const imageName = `${crew.boatName}_${crew.raceName}`;
        console.log(`Generating image ${i + 1}/${crewIds.length}: ${imageName}`);
        
        // Update progress
        onProgress?.(i + 1, crewIds.length, crew.boatName);
        
        // Generate image
        const imageBlob = await ApiService.generateImage(crew.id, imageName, template, colors);
        
        if (imageBlob) {
          // Always save to gallery (no individual downloads for bulk)
          await ApiService.saveImage(crew.id, imageName, template, colors, imageBlob);
          console.log(`Image ${i + 1}/${crewIds.length} saved to gallery`);
        }
      } catch (error) {
        console.error(`Error generating image for crew ${crew.boatName}:`, error);
      }
      
      // Small delay to prevent overwhelming the server
      if (i < crewIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Trigger gallery refresh
    setGalleryRefreshTrigger(prev => prev + 1);
    console.log('Bulk generation completed!');
  };

  return (
    <>
      <div id="home">
        <HeaderComponent onGalleryClick={handleGalleryClick} />
      </div>
      
      <div id="crew-form">
        <CrewInfoComponent
          onSubmit={handleCrewInfoSubmit}
          initialValues={{
            boatClass,
            clubName,
            raceName,
            boatName
          }}
        />
      </div>
      {boatClass && (
        <div ref={crewNameRef}>
          <CrewNamesComponent
            boatClass={boatClass}
            crewNames={crewNames}
            coxName={coxName}
            onNameChange={handleNameChange}
            onCoxNameChange={handleCoxNameChange}
            onSaveCrew={user ? handleSaveCrew : undefined}
            clubName={clubName}
            raceName={raceName}
            boatName={boatName}
          />
          {!user && (
            <LoginPrompt 
              message="Sign in to save crews to your account"
              actionText="Save Crew"
            />
          )}
        </div>
      )}
      <div id="saved-crews" ref={savedCrewsRef}>
        {user ? (
          <SavedCrewsComponent
            savedCrews={savedCrews}
            recentCrews={recentCrews}
            onDeleteCrew={handleDeleteCrew}
            onEditCrew={handleEditCrew}
            onGenerateImage={handleShowImageGenerator}
            onBulkGenerateImages={handleBulkGenerateImages}
            onBulkModeChange={handleBulkModeChange}
          />
        ) : (
          <Box sx={{ textAlign: 'center', padding: '40px 20px' }}>
            <Box 
              component="h2" 
              sx={{ 
                color: theme.palette.text.primary, 
                marginBottom: '20px',
                fontSize: '1.5rem',
                fontWeight: 400
              }}
            >
              My Crews
            </Box>
            <LoginPrompt 
              message="Sign in to view and manage your saved crews"
              actionText="View My Crews"
            />
          </Box>
        )}
      </div>
      
      {showImageGenerator && selectedCrewForImage !== null && !isBulkMode && (
        <div ref={imageGeneratorRef}>
          <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <ImageGenerator 
              onGenerate={handleGenerateImage} 
              selectedCrew={savedCrews[selectedCrewForImage]}
            />
          </Box>
        </div>
      )}
      
      {/* Gallery Section - Always show below ImageGenerator */}
      <div id="gallery">
        <GalleryPage refreshTrigger={galleryRefreshTrigger} />
      </div>
      
      <Box 
        id="help" 
        sx={{ 
          padding: '40px 20px', 
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f9f9f9', 
          marginTop: '40px' 
        }}
      >
        <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
          <Box 
            component="h2" 
            sx={{ 
              color: theme.palette.text.primary, 
              marginBottom: '20px',
              fontSize: '1.5rem',
              fontWeight: 500
            }}
          >
            Help & Guide
          </Box>
          <Box sx={{ lineHeight: '1.6', color: theme.palette.text.secondary }}>
            <Box 
              component="h3" 
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: '1.25rem',
                fontWeight: 500,
                mb: 2
              }}
            >
              How to Use RowGram:
            </Box>
            <Box component="ol" sx={{ mb: 3, pl: 3 }}>
              <li><strong>Create a Crew:</strong> Fill in club name, race name, boat name, and select boat class</li>
              <li><strong>Add Crew Members:</strong> Enter names for each seat position</li>
              <li><strong>Save Your Crew:</strong> Click "Save Crew" to store your lineup</li>
              <li><strong>Generate Images:</strong> Click "Generate Image" on any saved crew to create a downloadable PNG</li>
              <li><strong>Choose Templates:</strong> Select from 3 different image styles when generating</li>
            </Box>
            <Box 
              component="h3" 
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: '1.25rem',
                fontWeight: 500,
                mb: 2
              }}
            >
              Boat Types Supported:
            </Box>
            <Box component="ul" sx={{ pl: 3 }}>
              <li><strong>8+:</strong> Eight with Coxswain (8 rowers + 1 cox = 9 people)</li>
              <li><strong>4+:</strong> Four with Coxswain (4 rowers + 1 cox = 5 people)</li>
              <li><strong>4-:</strong> Four without Coxswain (4 rowers, no cox)</li>
              <li><strong>4x:</strong> Quad Sculls (4 scullers, each with 2 oars)</li>
              <li><strong>2-:</strong> Coxless Pair (2 rowers, each with 1 oar)</li>
              <li><strong>2x:</strong> Double Sculls (2 scullers, each with 2 oars)</li>
              <li><strong>1x:</strong> Single Sculls (1 sculler with 2 oars)</li>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <FooterComponent scrollToSection={scrollToSection} />
    </>
  );
}

export default App;