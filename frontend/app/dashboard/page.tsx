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
  Cell
} from 'recharts';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  UserCheck,
  BarChart3
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { feedbackService, mlService } from '@/lib/api';

interface DashboardStats {
  totalHospitals: number;
  totalPatients: number;
  averageTES: number;
  interoperabilityRate: number;
  performanceIndex: number;
  alertsCount: number;
}

interface HospitalPerformance {
  hospitalId: number;
  hospitalName: string;
  averageTES: number;
  patientVolume: number;
  performanceIndex: number;
  ranking: number;
}

interface SentimentData {
  sentiment: string;
  count: number;
  percentage: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHospitals: 0,
    totalPatients: 0,
    averageTES: 0,
    interoperabilityRate: 0,
    performanceIndex: 0,
    alertsCount: 0
  });
  
  const [hospitalPerformance, setHospitalPerformance] = useState<HospitalPerformance[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const [insights, performanceGaps] = await Promise.all([
        feedbackService.getPerformanceInsights(),
        mlService.getPerformanceGaps()
      ]);

      // Mock data for demonstration (replace with real API calls)
      setStats({
        totalHospitals: 12,
        totalPatients: 2847,
        averageTES: 78.5,
        interoperabilityRate: 92.3,
        performanceIndex: 85.2,
        alertsCount: performanceGaps.length || 3
      });

      setHospitalPerformance([
        { hospitalId: 1, hospitalName: 'City General Hospital', averageTES: 85.2, patientVolume: 450, performanceIndex: 92.1, ranking: 1 },
        { hospitalId: 2, hospitalName: 'Metro Medical Center', averageTES: 82.7, patientVolume: 380, performanceIndex: 88.9, ranking: 2 },
        { hospitalId: 3, hospitalName: 'Regional Health Center', averageTES: 79.1, patientVolume: 320, performanceIndex: 84.3, ranking: 3 },
        { hospitalId: 4, hospitalName: 'Community Hospital', averageTES: 76.8, patientVolume: 280, performanceIndex: 81.2, ranking: 4 },
        { hospitalId: 5, hospitalName: 'University Medical Center', averageTES: 74.5, patientVolume: 420, performanceIndex: 78.9, ranking: 5 }
      ]);

      setSentimentData([
        { sentiment: 'Positive', count: 1250, percentage: 65.2 },
        { sentiment: 'Neutral', count: 450, percentage: 23.5 },
        { sentiment: 'Negative', count: 220, percentage: 11.3 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const tesData = hospitalPerformance.map(h => ({
    name: h.hospitalName.split(' ')[0],
    tes: h.averageTES,
    performance: h.performanceIndex
  }));

  const volumeData = hospitalPerformance.map(h => ({
    name: h.hospitalName.split(' ')[0],
    volume: h.patientVolume
  }));

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Hospitals</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalHospitals}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Patients</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalPatients.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg TES</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.averageTES}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Interop Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.interoperabilityRate}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Performance</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.performanceIndex}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Alerts</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.alertsCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* TES Performance Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital TES Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patient Volume Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Volume Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Sentiment Distribution</h3>
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

            {/* Hospital Rankings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Performance Rankings</h3>
                <div className="space-y-4">
                  {hospitalPerformance.map((hospital, index) => (
                    <div key={hospital.hospitalId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{hospital.hospitalName}</p>
                          <p className="text-sm text-gray-500">TES: {hospital.averageTES}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{hospital.performanceIndex}%</p>
                        <p className="text-sm text-gray-500">Performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Critical Alert</h4>
                  </div>
                  <p className="text-sm text-red-700">3 doctors below TES threshold (70%)</p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-800">Improvement Needed</h4>
                  </div>
                  <p className="text-sm text-yellow-700">2 hospitals need interoperability training</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Good Performance</h4>
                  </div>
                  <p className="text-sm text-green-700">Overall system health is excellent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
