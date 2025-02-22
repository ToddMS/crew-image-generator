import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import BoatManager from './components/BoatManager';
import { CrewProvider } from './context/CrewContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CrewProvider>
        <BoatManager />
      </CrewProvider>
    </ThemeProvider>
  );
}

export default App;
