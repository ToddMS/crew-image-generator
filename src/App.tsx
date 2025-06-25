import { useState } from 'react';
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
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [savedCrews, setSavedCrews] = useState<any[]>([]);

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

  const handleSaveCrew = () => {
    const seatLabels = ['Cox', 'Stroke Seat', '7 Seat', '6 Seat', '5 Seat', '4 Seat', '3 Seat', '2 Seat', 'Bow'];
    const crewMembers = [
      ...(boatClassHasCox(boatClass) ? [{ seat: 'Cox', name: coxName }] : []),
      ...crewNames.map((name, idx) => ({ seat: seatLabels[idx + (boatClassHasCox(boatClass) ? 1 : 0)], name })),
    ];

    setSavedCrews(prev => [
      ...prev,
      {
        boatClub: clubName,
        raceName: raceName,
        boatName: boatName,
        crewMembers,
      },
    ]);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <HeaderComponent />
      <CrewInfoComponent
        onSubmit={handleCrewInfoSubmit}
      />
      {boatClass && (
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
      )}
      <SavedCrewsComponent savedCrews={savedCrews} />
    </ThemeProvider>
  );
}

export default App;