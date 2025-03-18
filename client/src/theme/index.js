import { createTheme } from '@mui/material/styles';

const baseTheme = {
  colors: {
    background: '#FFFFFF',
    backgroundAlt: '#F8F9FA',
    primary: '#2D3436',
    secondary: '#636E72',
    accent: '#0984E3',
    border: '#DFE6E9',
    error: '#D63031',
    success: '#00B894',
    warning: '#FDCB6E',
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
      disabled: '#B2BEC3'
    },
    photo: {
      overlay: 'rgba(45, 52, 54, 0.8)',
      captureButton: '#00B894',
      captureButtonHover: '#00A388',
      previewBorder: '#DFE6E9',
      transformationProgress: '#0984E3'
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: 0,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none'
    }
  },
  spacing: (factor) => `${factor * 8}px`,
  shape: {
    borderRadius: 12,
    cardBorderRadius: 16,
    buttonBorderRadius: 8,
    photoBoothRadius: 20
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
      photoTransform: 500
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      photoTransform: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  shadows: {
    card: '0 2px 20px rgba(0, 0, 0, 0.08)',
    dropdown: '0 4px 20px rgba(0, 0, 0, 0.15)',
    button: '0 2px 4px rgba(0, 0, 0, 0.12)',
    hover: '0 8px 30px rgba(0, 0, 0, 0.12)',
    photo: '0 12px 40px rgba(0, 0, 0, 0.2)'
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        },
        containedPrimary: {
          background: '#0984E3',
          '&:hover': {
            background: '#0876CC'
          }
        },
        containedSecondary: {
          background: '#00B894',
          '&:hover': {
            background: '#00A388'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#0984E3',
          height: 8,
          '& .MuiSlider-track': {
            border: 'none'
          },
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'inherit'
            },
            '&:before': {
              display: 'none'
            }
          }
        }
      }
    }
  },
  photoBoothStyles: {
    container: {
      background: '#FFFFFF',
      borderRadius: 20,
      padding: '24px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
    },
    preview: {
      aspectRatio: '1',
      borderRadius: 16,
      overflow: 'hidden',
      background: '#F8F9FA'
    },
    captureButton: {
      size: 64,
      background: '#00B894',
      hoverBackground: '#00A388',
      shadow: '0 4px 12px rgba(0, 184, 148, 0.3)'
    },
    transformProgress: {
      height: 4,
      borderRadius: 2,
      background: '#0984E3'
    }
  }
};

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: baseTheme.colors.primary,
      light: baseTheme.colors.accent,
      dark: '#1E272E'
    },
    secondary: {
      main: baseTheme.colors.secondary,
      light: '#B2BEC3',
      dark: '#4A5568'
    },
    error: {
      main: baseTheme.colors.error,
      light: '#FF7675',
      dark: '#C0392B'
    },
    warning: {
      main: baseTheme.colors.warning,
      light: '#FFEAA7',
      dark: '#F39C12'
    },
    success: {
      main: baseTheme.colors.success,
      light: '#55EFC4',
      dark: '#00A388'
    },
    background: {
      default: baseTheme.colors.background,
      paper: baseTheme.colors.backgroundAlt
    },
    text: baseTheme.colors.text
  }
});

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#74B9FF',
      light: '#81ECEC',
      dark: '#0984E3'
    },
    secondary: {
      main: '#A0AEC0',
      light: '#CBD5E0',
      dark: '#718096'
    },
    error: {
      main: '#FF7675',
      light: '#FAB1A0',
      dark: '#D63031'
    },
    warning: {
      main: '#FFEAA7',
      light: '#FFE082',
      dark: '#F39C12'
    },
    success: {
      main: '#55EFC4',
      light: '#81ECEC',
      dark: '#00B894'
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748'
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#E2E8F0',
      disabled: '#A0AEC0'
    }
  }
});

export { lightTheme, darkTheme }; 