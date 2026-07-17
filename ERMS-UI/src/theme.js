import { createTheme } from '@mui/material/styles';

// ERMS ortak MUI teması. Faz ilerledikçe genişletilebilir.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#00897b' },
    background: { default: '#f4f6f8' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
  },
});

export default theme;
