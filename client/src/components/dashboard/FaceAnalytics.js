import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { Typography } from '@mui/material';

const AnalyticsContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 2rem;
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ChartSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: ${props => props.theme.spacing(2)};
  color: ${props => props.theme.palette.text.primary};
`;

const ChartWrapper = styled.div`
  height: 300px;
  margin-top: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const FaceAnalytics = () => {
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monitoring/face-analytics?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <AnalyticsContainer>
      <DateRangeSelector>
        <div>
          <label>Start Date:</label>
          <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <DateInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </DateRangeSelector>

      <StatsGrid>
        <StatCard>
          <StatValue>{analyticsData?.averagePreservationScore.toFixed(2)}</StatValue>
          <StatLabel>Average Preservation Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analyticsData?.totalProcessedImages}</StatValue>
          <StatLabel>Total Processed Images</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analyticsData?.successRate.toFixed(1)}%</StatValue>
          <StatLabel>Success Rate</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{analyticsData?.averageProcessingTime.toFixed(1)}s</StatValue>
          <StatLabel>Avg Processing Time</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <SectionTitle variant="h6" component="span">Preservation Score Trend</SectionTitle>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData?.dailyScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="preservationScore"
                stroke="#3498db"
                name="Preservation Score"
              />
              <Line
                type="monotone"
                dataKey="qualityScore"
                stroke="#2ecc71"
                name="Quality Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartSection>

      <ChartSection>
        <SectionTitle variant="h6" component="span">Face Detection Distribution</SectionTitle>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.faceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faceCount" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#3498db"
                name="Number of Images"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartSection>

      <ChartSection>
        <SectionTitle variant="h6" component="span">Demographic Preservation Rates</SectionTitle>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.demographicRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="preservationRate"
                fill="#3498db"
                name="Preservation Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartSection>
    </AnalyticsContainer>
  );
};

export default FaceAnalytics; 