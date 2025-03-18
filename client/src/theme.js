import { createTheme } from '@mui/material/styles';

// Base theme object for styled-components
const baseTheme = {
  photoBoothStyles: {
    container: {
      maxWidth: '800px',
      background: '#ffffff',
      borderRadius: 12,
      padding: '24px',
    },
    preview: {
      borderRadius: 8,
      background: '#f5f5f5',
    },
    captureButton: {
      size: '64px',
      background: '#4CAF50',
      hoverBackground: '#45a049',
      shadow: '0 2px 4px rgba(0,0,0,0.2)',
    }
  },
  shadows: {
    photo: '0 8px 16px rgba(0,0,0,0.15)',
    card: '0 2px 4px rgba(0,0,0,0.08)',
    button: '0 2px 4px rgba(0,0,0,0.1)',
    hover: '0 6px 12px rgba(0,0,0,0.15)',
  },
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    error: '#f44336',
    background: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#cccccc',
    }
  },
  transitions: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: '300ms',
  },
  shape: {
    borderRadius: 4,
    cardBorderRadius: 8,
  }
};

// Create a deep clone of the base theme to prevent mutations
export const theme = JSON.parse(JSON.stringify(baseTheme));

// Material-UI theme
export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      dark: '#9a0036',
      light: '#e33371',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#cccccc',
    }
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'span',
          subtitle2: 'span',
          body1: 'p',
          body2: 'p',
          caption: 'span',
          overline: 'span',
        },
      },
    },
  },
}); 