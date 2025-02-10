import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import BoatManager from './components/BoatManager';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BoatManager />
    </ThemeProvider>
  );
}

export default App;
