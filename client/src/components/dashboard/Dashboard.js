import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FaceMetricsDetail from './FaceMetricsDetail';
import FaceAnalytics from './FaceAnalytics';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const DashboardSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #eee;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.active ? '#3498db' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.active ? '#3498db' : 'transparent'};
  }

  &:hover {
    color: #3498db;
  }
`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentMetrics();
  }, []);

  const fetchCurrentMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitoring/current-metrics');
      const data = await response.json();
      setCurrentMetrics(data);
    } catch (error) {
      console.error('Error fetching current metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Face Preservation Dashboard</DashboardTitle>
        <DashboardSubtitle>
          Monitor and analyze face preservation quality metrics
        </DashboardSubtitle>
      </DashboardHeader>

      <TabContainer>
        <TabList>
          <Tab
            active={activeTab === 'metrics'}
            onClick={() => setActiveTab('metrics')}
          >
            Current Metrics
          </Tab>
          <Tab
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </Tab>
        </TabList>
      </TabContainer>

      {activeTab === 'metrics' ? (
        <FaceMetricsDetail metrics={currentMetrics} />
      ) : (
        <FaceAnalytics />
      )}
    </DashboardContainer>
  );
};

export default Dashboard; 