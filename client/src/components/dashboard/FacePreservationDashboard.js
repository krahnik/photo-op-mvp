import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const MetricTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  height: 400px;
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const FacePreservationDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard');
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <DashboardContainer>
      <h2>Face Preservation Quality Dashboard</h2>
      
      <DateRangeSelector>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </Select>
      </DateRangeSelector>

      <MetricsGrid>
        <MetricCard>
          <MetricTitle>Average Face Preservation Score</MetricTitle>
          <MetricValue>{metrics?.face_metrics.average_score.toFixed(2)}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Age Preservation Rate</MetricTitle>
          <MetricValue>{metrics?.face_metrics.age_preservation_rate}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Gender Preservation Rate</MetricTitle>
          <MetricValue>{metrics?.face_metrics.gender_preservation_rate}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricTitle>Multi-Face Success Rate</MetricTitle>
          <MetricValue>{metrics?.face_metrics.multi_face_success_rate}%</MetricValue>
        </MetricCard>
      </MetricsGrid>

      <ChartContainer>
        <h3>Face Preservation Quality Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics?.face_metrics.historical_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="preservation_score" stroke="#3498db" />
            <Line type="monotone" dataKey="age_preservation" stroke="#2ecc71" />
            <Line type="monotone" dataKey="gender_preservation" stroke="#e74c3c" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer>
        <h3>Face Detection Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics?.face_metrics.face_distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="face_count" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardContainer>
  );
};

export default FacePreservationDashboard; 