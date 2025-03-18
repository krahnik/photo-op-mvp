import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import DashboardNavigation from './DashboardNavigation';
import AnalyticsDashboard from './AnalyticsDashboard';
import MonitoringDashboard from './MonitoringDashboard';
import DashboardSettings from './DashboardSettings';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const Content = styled.div`
  padding: 2rem;
`;

const TimeRangeSelector = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

const DashboardContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeRange, setTimeRange] = useState('24h');

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Shared data and state management
  const [sharedDashboardData, setSharedDashboardData] = useState({
    timeRange,
    refreshInterval: 60000, // 1 minute
    filters: {},
    selectedMetrics: []
  });

  const updateSharedData = (updates) => {
    setSharedDashboardData(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <Container>
      <DashboardNavigation 
        currentPath={location.pathname} 
        onNavigate={handleNavigate}
      />
      <Content>
        <TimeRangeSelector>
          <select 
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </TimeRangeSelector>
        
        <Routes>
          <Route 
            path="analytics" 
            element={
              <AnalyticsDashboard 
                timeRange={timeRange}
                sharedData={sharedDashboardData}
                onUpdateSharedData={updateSharedData}
              />
            } 
          />
          <Route 
            path="monitoring" 
            element={
              <MonitoringDashboard 
                timeRange={timeRange}
                sharedData={sharedDashboardData}
                onUpdateSharedData={updateSharedData}
              />
            } 
          />
          <Route 
            path="settings" 
            element={
              <DashboardSettings 
                sharedData={sharedDashboardData}
                onUpdateSharedData={updateSharedData}
              />
            } 
          />
        </Routes>
      </Content>
    </Container>
  );
};

export default DashboardContainer; 