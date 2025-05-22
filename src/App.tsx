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
  const [submittedBoatClass, setSubmittedBoatClass] = useState('');
  const [crewNames, setCrewNames] = useState<string[]>([]);
  const [coxName, setCoxName] = useState('');
  const [savedCrews, setSavedCrews] = useState<any[]>([]);

  const handleCrewInfoSubmit = (boatClass: string) => {
    setSubmittedBoatClass(boatClass);
    setCrewNames(Array(boatClassToSeats[boatClass] || 0).fill(''));
    setCoxName('');
  };

  const handleNameChange = (idx: number, value: string) => {
    setCrewNames(names => names.map((n, i) => (i === idx ? value : n)));
  };

  const handleCoxNameChange = (value: string) => setCoxName(value);

  const handleSaveCrew = (boatClub: string, raceName: string, boatName: string) => {
    const seatLabels = ['Cox', 'Stroke Seat', '7 Seat', '6 Seat', '5 Seat', '4 Seat', '3 Seat', '2 Seat', 'Bow'];
    const crewMembers = [
      ...(boatClassHasCox(submittedBoatClass) ? [{ seat: 'Cox', name: coxName }] : []),
      ...crewNames.map((name, idx) => ({ seat: seatLabels[idx + (boatClassHasCox(submittedBoatClass) ? 1 : 0)], name })),
    ];

    setSavedCrews(prev => [
      ...prev,
      {
        boatClub,
        raceName,
        boatName,
        crewMembers,
      },
    ]);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <HeaderComponent />
      <CrewInfoComponent
        boatClass={submittedBoatClass}
        onSubmit={handleCrewInfoSubmit}
      />
      {submittedBoatClass && (
        <CrewNamesComponent
          boatClass={submittedBoatClass}
          crewNames={crewNames}
          coxName={coxName}
          onNameChange={handleNameChange}
          onCoxNameChange={handleCoxNameChange}
          onSaveCrew={handleSaveCrew}
        />
      )}
      <SavedCrewsComponent savedCrews={savedCrews} />
    </ThemeProvider>
  );
}

export default App;