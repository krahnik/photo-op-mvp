import { createTheme } from '@mui/material/styles';

// Base colors that are safe for styled-components
const baseColors = {
  primary: '#2196f3',
  secondary: '#f50057',
  background: '#f5f7fa',
  backgroundAlt: '#c3cfe2',
  text: '#333333',
  textLight: '#666666',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3'
};

// Base shadows that are safe for styled-components
const baseShadows = {
  small: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 8px rgba(0,0,0,0.12)',
  large: '0 8px 16px rgba(0,0,0,0.14)'
};

// Create the MUI theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: baseColors.primary,
    },
    secondary: {
      main: baseColors.secondary,
    },
    error: {
      main: baseColors.error,
    },
    background: {
      default: baseColors.background,
      paper: '#ffffff',
    },
    text: {
      primary: baseColors.text,
      secondary: baseColors.textLight,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Create the styled-components theme
export const styledTheme = {
  colors: baseColors,
  shadows: baseShadows,
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease',
  },
  photoBooth: {
    captureButtonSize: '64px',
    previewMaxWidth: '800px',
    previewMaxHeight: '600px',
    thumbnailSize: '120px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    round: '50%',
  },
}; 