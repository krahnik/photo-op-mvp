import { render } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  LazyMotion: ({ children }) => <>{children}</>,
  domAnimation: {},
}));

// Create Material-UI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 4,
  },
});

// Create styled-components theme
const styledTheme = {
  photoBoothStyles: {
    container: {
      maxWidth: '800px',
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
    },
    preview: {
      borderRadius: '8px',
      background: '#f5f5f5',
    },
  },
  shadows: {
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    photo: '0 8px 16px rgba(0, 0, 0, 0.15)',
    card: '0 2px 4px rgba(0, 0, 0, 0.08)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    hover: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
  palette: {
    primary: '#1976d2',
    secondary: '#dc004e',
    error: '#f44336',
    background: '#ffffff',
  },
  shape: {
    borderRadius: 4,
    cardBorderRadius: 8,
  },
};

const AllTheProviders = ({ children }) => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        {children}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';
export { customRender as render }; 