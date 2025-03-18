import React from 'react';
import styled from 'styled-components';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

const DetailContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-top: 2rem;
`;

const MetricsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
`;

const MetricLabel = styled.span`
  color: #666;
`;

const MetricValue = styled.span`
  font-weight: bold;
  color: #3498db;
`;

const ChartWrapper = styled.div`
  height: 400px;
  margin-top: 2rem;
`;

const FaceMetricsDetail = ({ metrics }) => {
  const radarData = [
    { metric: 'Landmark Accuracy', value: metrics?.face_metrics.landmark_accuracy },
    { metric: 'Expression Similarity', value: metrics?.face_metrics.expression_similarity },
    { metric: 'Face Orientation', value: metrics?.face_metrics.face_orientation },
    { metric: 'Feature Preservation', value: metrics?.face_metrics.feature_preservation },
    { metric: 'Symmetry Score', value: metrics?.face_metrics.symmetry_score },
    { metric: 'Age Preservation', value: metrics?.demographic_metrics.age_preservation_score },
    { metric: 'Gender Preservation', value: metrics?.demographic_metrics.gender_preservation_score }
  ];

  return (
    <DetailContainer>
      <MetricsSection>
        <SectionTitle>Face Preservation Metrics</SectionTitle>
        <MetricRow>
          <MetricLabel>Overall Score</MetricLabel>
          <MetricValue>{metrics?.overall_metrics.total_score.toFixed(2)}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Quality Grade</MetricLabel>
          <MetricValue>{metrics?.overall_metrics.quality_grade}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Preservation Confidence</MetricLabel>
          <MetricValue>{metrics?.overall_metrics.preservation_confidence.toFixed(2)}</MetricValue>
        </MetricRow>
      </MetricsSection>

      <MetricsSection>
        <SectionTitle>Demographic Preservation</SectionTitle>
        <MetricRow>
          <MetricLabel>Age Range Consistency</MetricLabel>
          <MetricValue>{metrics?.demographic_metrics.age_range_consistency.toFixed(2)}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Gender Confidence</MetricLabel>
          <MetricValue>{metrics?.demographic_metrics.gender_confidence.toFixed(2)}</MetricValue>
        </MetricRow>
      </MetricsSection>

      {metrics?.face_metrics.multi_face_metrics && (
        <MetricsSection>
          <SectionTitle>Multi-Face Metrics</SectionTitle>
          <MetricRow>
            <MetricLabel>Face Spacing</MetricLabel>
            <MetricValue>{metrics.face_metrics.multi_face_metrics.face_spacing.toFixed(2)}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Face Size Ratio</MetricLabel>
            <MetricValue>{metrics.face_metrics.multi_face_metrics.face_size_ratio.toFixed(2)}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Face Angle Consistency</MetricLabel>
            <MetricValue>{metrics.face_metrics.multi_face_metrics.face_angle_consistency.toFixed(2)}</MetricValue>
          </MetricRow>
        </MetricsSection>
      )}

      <ChartWrapper>
        <SectionTitle>Preservation Quality Radar Chart</SectionTitle>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis domain={[0, 1]} />
            <Radar
              name="Preservation Score"
              dataKey="value"
              stroke="#3498db"
              fill="#3498db"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </DetailContainer>
  );
};

export default FaceMetricsDetail; 