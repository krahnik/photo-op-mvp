import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Grid, Typography } from '@mui/material';
import { 
  TrendingUp, 
  People, 
  PhotoCamera, 
  Error,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Card from '../common/Card';
import MetricDisplay from '../common/MetricDisplay';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing(3)};
`;

const ChartContainer = styled(Card)`
  height: 400px;
  margin-bottom: ${props => props.theme.spacing(3)};
`;

const ChartTitle = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  margin-bottom: ${props => props.theme.spacing(3)};
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = ({ timeRange, sharedData, onUpdateSharedData }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, sharedData.refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, sharedData.refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
      
      onUpdateSharedData({
        analyticsMetrics: {
          activeUsers: data.activeUsers,
          totalTransforms: data.totalTransforms,
          errorRate: data.errorRate
        }
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMonitoring = (metricType) => {
    navigate('/dashboard/monitoring', { 
      state: { highlightedMetric: metricType } 
    });
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboardData) return <div>No data available</div>;

  return (
    <DashboardContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <MetricDisplay
            title="Active Users"
            value={dashboardData.activeUsers}
            icon={People}
            iconBackground="#0984E3"
            trend={dashboardData.usersTrend}
            onClick={() => navigateToMonitoring('users')}
            tooltipTitle="View user activity monitoring"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricDisplay
            title="Total Transforms"
            value={dashboardData.totalTransforms}
            icon={PhotoCamera}
            iconBackground="#00B894"
            trend={dashboardData.transformsTrend}
            onClick={() => navigateToMonitoring('transforms')}
            tooltipTitle="View transformation performance"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricDisplay
            title="Conversion Rate"
            value={`${((dashboardData.recentLeads.length / dashboardData.totalTransforms) * 100).toFixed(1)}%`}
            icon={TrendingUp}
            iconBackground="#FDCB6E"
            trend={dashboardData.conversionTrend}
            onClick={() => navigateToMonitoring('conversions')}
            tooltipTitle="View detailed conversion metrics"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricDisplay
            title="Error Rate"
            value={`${dashboardData.errorRate.toFixed(1)}%`}
            icon={Error}
            iconBackground="#D63031"
            trend={dashboardData.errorTrend}
            onClick={() => navigateToMonitoring('errors')}
            tooltipTitle="View error monitoring"
          />
        </Grid>

        <Grid item xs={12}>
          <ChartContainer>
            <ChartTitle variant="h6">
              Transform Quality by Style
            </ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.transformQuality}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE6E9" />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fill: '#636E72' }}
                  axisLine={{ stroke: '#DFE6E9' }}
                />
                <YAxis 
                  tick={{ fill: '#636E72' }}
                  axisLine={{ stroke: '#DFE6E9' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FFFFFF',
                    border: '1px solid #DFE6E9',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="avgQuality" 
                  fill="#0984E3"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer>
            <ChartTitle variant="h6">
              Recent Leads Distribution
            </ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.recentLeads}
                  dataKey="value"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dashboardData.recentLeads.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#FFFFFF',
                    border: '1px solid #DFE6E9',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer>
            <ChartTitle variant="h6">
              Processing Time Trend
            </ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.processingTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE6E9" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: '#636E72' }}
                  axisLine={{ stroke: '#DFE6E9' }}
                />
                <YAxis 
                  tick={{ fill: '#636E72' }}
                  axisLine={{ stroke: '#DFE6E9' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FFFFFF',
                    border: '1px solid #DFE6E9',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="processingTime" 
                  stroke="#0984E3"
                  strokeWidth={2}
                  dot={{ fill: '#0984E3', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard; 