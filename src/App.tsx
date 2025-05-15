import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import BoatManager from './components/BoatManager';
import { CrewProvider } from './context/CrewContext';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <HeaderComponent></HeaderComponent>

      <CrewProvider>
        <BoatManager />
      </CrewProvider>
    </ThemeProvider>
  );
}

export default App;
