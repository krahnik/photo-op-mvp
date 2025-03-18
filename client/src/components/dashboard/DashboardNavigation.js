import React from 'react';
import styled from 'styled-components';
import { Tabs, Tab, Box, Typography, Divider } from '@mui/material';
import { 
  BarChart as AnalyticsIcon,
  Speed as MonitoringIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const NavigationContainer = styled(Box)`
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 2rem;
`;

const StyledTabs = styled(Tabs)`
  min-height: 64px;
`;

const StyledTab = styled(Tab)`
  min-height: 64px;
  text-transform: none;
  font-size: 1rem;
  font-weight: 500;
`;

const DashboardTitle = styled(Typography)`
  padding: 1rem 0;
  color: ${props => props.theme.colors.primary};
`;

const DashboardNavigation = ({ currentPath, onNavigate }) => {
  const handleChange = (event, newValue) => {
    onNavigate(newValue);
  };

  return (
    <NavigationContainer>
      <DashboardTitle variant="h5">Photo-Op Analytics</DashboardTitle>
      <StyledTabs 
        value={currentPath} 
        onChange={handleChange}
        aria-label="dashboard navigation"
      >
        <StyledTab
          icon={<AnalyticsIcon />}
          iconPosition="start"
          label="Business Analytics"
          value="/dashboard/analytics"
        />
        <StyledTab
          icon={<MonitoringIcon />}
          iconPosition="start"
          label="System Monitoring"
          value="/dashboard/monitoring"
        />
        <StyledTab
          icon={<SettingsIcon />}
          iconPosition="start"
          label="Settings"
          value="/dashboard/settings"
        />
      </StyledTabs>
      <Divider />
    </NavigationContainer>
  );
};

export default DashboardNavigation; 