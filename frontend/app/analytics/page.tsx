'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { mlService, feedbackService } from '@/lib/api';

interface PerformanceData {
  hospitalId: number;
  hospitalName: string;
  tes: number;
  volume: number;
  performanceIndex: number;
  sentimentScore: number;
  cluster: number;
}

interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface SentimentData {
  sentiment: string;
  count: number;
  percentage: number;
  trend: number;
}

interface PerformanceGap {
  id: string;
  hospitalId: number;
  hospitalName: string;
  gapType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  recommendation: string;
}

interface ResourceRecommendation {
  hospitalId: number;
  hospitalName: string;
  resourceType: string;
  currentLevel: number;
  recommendedLevel: number;
  priority: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
const SEVERITY_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

export default function AnalyticsPage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [performanceGaps, setPerformanceGaps] = useState<PerformanceGap[]>([]);
  const [resourceRecommendations, setResourceRecommendations] = useState<ResourceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedHospital, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch ML analytics data
      const [gaps, insights] = await Promise.all([
        mlService.getPerformanceGaps(),
        feedbackService.getPerformanceInsights()
      ]);

      // Mock data for demonstration
      setPerformanceData([
        { hospitalId: 1, hospitalName: 'City General Hospital', tes: 85.2, volume: 450, performanceIndex: 92.1, sentimentScore: 0.75, cluster: 1 },
        { hospitalId: 2, hospitalName: 'Metro Medical Center', tes: 82.7, volume: 380, performanceIndex: 88.9, sentimentScore: 0.68, cluster: 1 },
        { hospitalId: 3, hospitalName: 'Regional Health Center', tes: 79.1, volume: 320, performanceIndex: 84.3, sentimentScore: 0.62, cluster: 2 },
        { hospitalId: 4, hospitalName: 'Community Hospital', tes: 76.8, volume: 280, performanceIndex: 81.2, sentimentScore: 0.58, cluster: 2 },
        { hospitalId: 5, hospitalName: 'University Medical Center', tes: 74.5, volume: 420, performanceIndex: 78.9, sentimentScore: 0.55, cluster: 3 },
      ]);

      setForecastData([
        { date: '2024-01-01', predicted: 420, actual: 415, confidence: 0.85 },
        { date: '2024-01-02', predicted: 435, actual: 440, confidence: 0.82 },
        { date: '2024-01-03', predicted: 450, actual: 445, confidence: 0.88 },
        { date: '2024-01-04', predicted: 465, actual: 460, confidence: 0.90 },
        { date: '2024-01-05', predicted: 480, actual: 475, confidence: 0.87 },
        { date: '2024-01-06', predicted: 495, actual: 490, confidence: 0.85 },
        { date: '2024-01-07', predicted: 510, actual: 505, confidence: 0.83 },
      ]);

      setSentimentData([
        { sentiment: 'Positive', count: 1250, percentage: 65.2, trend: 5.2 },
        { sentiment: 'Neutral', count: 450, percentage: 23.5, trend: -1.8 },
        { sentiment: 'Negative', count: 220, percentage: 11.3, trend: -3.4 },
      ]);

      setPerformanceGaps([
        {
          id: '1',
          hospitalId: 4,
          hospitalName: 'Community Hospital',
          gapType: 'TES Performance',
          severity: 'High',
          description: 'TES score below threshold (70%)',
          recommendation: 'Implement staff training program and patient feedback system'
        },
        {
          id: '2',
          hospitalId: 5,
          hospitalName: 'University Medical Center',
          gapType: 'Interoperability',
          severity: 'Medium',
          description: 'Data exchange success rate below 90%',
          recommendation: 'Upgrade FHIR compliance and staff training'
        }
      ]);

      setResourceRecommendations([
        {
          hospitalId: 1,
          hospitalName: 'City General Hospital',
          resourceType: 'Nursing Staff',
          currentLevel: 85,
          recommendedLevel: 95,
          priority: 'Medium',
          reasoning: 'Patient volume increase requires additional nursing staff'
        },
        {
          hospitalId: 2,
          hospitalName: 'Metro Medical Center',
          resourceType: 'Medical Equipment',
          currentLevel: 70,
          recommendedLevel: 90,
          priority: 'High',
          reasoning: 'Equipment utilization rate indicates need for additional resources'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['SystemManager', 'HospitalManager', 'Doctor']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ML Analytics & Insights</h1>
                <p className="text-gray-600">AI-powered performance analysis and recommendations</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Performance Clustering */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Performance Clustering</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tes" name="TES Score" />
                    <YAxis dataKey="performanceIndex" name="Performance Index" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="volume" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sentiment, percentage }) => `${sentiment}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Patient Volume Forecasting */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Volume Forecasting</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Gaps</h3>
                <div className="space-y-4">
                  {performanceGaps.map((gap) => (
                    <div key={gap.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{gap.hospitalName}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[gap.severity]}`}>
                          {gap.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gap.description}</p>
                      <p className="text-sm text-blue-600">{gap.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Recommendations</h3>
                <div className="space-y-4">
                  {resourceRecommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.hospitalName}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[rec.priority]}`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {rec.resourceType}: {rec.currentLevel}% → {rec.recommendedLevel}%
                      </p>
                      <p className="text-sm text-blue-600">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Index Comparison */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Index Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hospitalName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="performanceIndex" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
