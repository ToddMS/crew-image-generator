import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';
import CrewInfoComponent from './components/CrewInfoComponent/CrewInfoComponent';
import TitleComponent from './components/TitleComponent/TitleComponent';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <HeaderComponent></HeaderComponent>
      <TitleComponent></TitleComponent>
      <CrewInfoComponent></CrewInfoComponent>

    </ThemeProvider>
  );
}

export default App;
