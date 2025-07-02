import { useState, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';
import CrewInfoComponent from './components/CrewInfoComponent/CrewInfoComponent';
import CrewNamesComponent from './components/CrewNamesComponent/CrewNamesComponent';
import SavedCrewsComponent from './components/SavedCrewsComponent/SavedCrewComponent';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const boatClassToSeats: Record<string, number> = {
  '8+': 8,
  '4+': 4,
  '4-': 4,
  '2x': 2,
  '1x': 1,
};

const boatClassHasCox = (boatClass: string) => boatClass === '8+' || boatClass === '4+';

function App() {
  const crewNameRef = useRef<HTMLInputElement | null>(null);
  const savedCrewsRef = useRef<HTMLInputElement | null>(null);

  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [savedCrews, setSavedCrews] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  const handleSaveCrew = () => {
    const seatLabels = ['Cox', 'Stroke Seat', '7 Seat', '6 Seat', '5 Seat', '4 Seat', '3 Seat', '2 Seat', 'Bow'];
    const crewMembers = [
      ...(boatClassHasCox(boatClass) ? [{ seat: 'Cox', name: coxName }] : []),
      ...crewNames.map((name, idx) => ({ seat: seatLabels[idx + (boatClassHasCox(boatClass) ? 1 : 0)], name })),
    ];

    if (editIndex !== null) {
      setSavedCrews(prev => prev.map((crew, idx) => idx === editIndex ? {
        boatClub: clubName,
        raceName: raceName,
        boatName: boatName,
        crewMembers,
      } : crew));
      setEditIndex(null);
    } else {
      setSavedCrews(prev => [
        ...prev,
        {
          boatClub: clubName,
          raceName: raceName,
          boatName: boatName,
          crewMembers,
        },
      ]);
    }
    setTimeout(() => {
      savedCrewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleDeleteCrew = (index: number) => {
    setSavedCrews(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleEditCrew = (index: number) => {
    const crew = savedCrews[index];
    if (!crew) return;
    let guessedBoatClass = '';
    if (crew.crewMembers.length === 9) guessedBoatClass = '8+';
    else if (crew.crewMembers.length === 5 && crew.crewMembers[0].seat === 'Cox') guessedBoatClass = '4+';
    else if (crew.crewMembers.length === 4) guessedBoatClass = '4-';
    else if (crew.crewMembers.length === 2) guessedBoatClass = '2x';
    else if (crew.crewMembers.length === 1) guessedBoatClass = '1x';
    setBoatClass(guessedBoatClass);
    setClubName(crew.boatClub);
    setRaceName(crew.raceName);
    setBoatName(crew.boatName);
    if (guessedBoatClass === '8+' || guessedBoatClass === '4+') {
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

  return (
    <ThemeProvider theme={lightTheme}>
      <HeaderComponent />
      <CrewInfoComponent
        onSubmit={handleCrewInfoSubmit}
      />
      {boatClass && (
        <div ref={crewNameRef}>
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
          />
        </div>
      )}
      <div ref={savedCrewsRef}>
        <SavedCrewsComponent
          savedCrews={savedCrews}
          onDeleteCrew={handleDeleteCrew}
          onEditCrew={handleEditCrew}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;