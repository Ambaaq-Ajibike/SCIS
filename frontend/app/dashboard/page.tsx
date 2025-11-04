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
import { feedbackService, mlService, dashboardService, systemManagerService } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface DashboardStats {
  totalHospitals?: number;
  totalPatients: number;
  totalDoctors?: number;
  averageTES: number;
  interoperabilityRate: number;
  performanceIndex: number;
  alertsCount: number;
  hospitalName?: string;
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
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    averageTES: 0,
    interoperabilityRate: 0,
    performanceIndex: 0,
    alertsCount: 0
  });
  
  const [hospitalPerformance, setHospitalPerformance] = useState<HospitalPerformance[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [doctorsData, setDoctorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    if (user?.role === 'SystemManager') {
      fetchHospitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.role === 'SystemManager' && selectedHospitalId) {
      fetchDoctorsByHospital(selectedHospitalId);
    } else if (user?.role === 'SystemManager' && !selectedHospitalId) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHospitalId]);

  const fetchHospitals = async () => {
    try {
      setHospitalsLoading(true);
      const hospitalList = await systemManagerService.getAllHospitals();
      // Ensure hospitalId is a string (in case it comes as GUID object)
      const formattedHospitals = hospitalList.map((h: any) => ({
        ...h,
        hospitalId: String(h.hospitalId || h.HospitalId || ''),
        hospitalName: h.hospitalName || h.HospitalName || ''
      }));
      setHospitals(formattedHospitals);
      console.log('Hospitals loaded:', formattedHospitals.length);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  };

  const fetchDoctorsByHospital = async (hospitalId: string) => {
    try {
      setLoading(true);
      const doctors = await systemManagerService.getDoctorsByHospital(hospitalId);
      setDoctorsData(doctors);
      
      // Update stats to show hospital-specific data
      // Try to find hospital by different possible ID formats
      const hospital = hospitals.find(h => 
        String(h.hospitalId) === String(hospitalId) || 
        String(h.HospitalId) === String(hospitalId)
      );
      
      if (hospital) {
        setStats({
          totalPatients: hospital.totalPatients || 0,
          totalDoctors: hospital.totalDoctors || doctors.length || 0,
          averageTES: hospital.averageTreatmentEvaluationScore || 0,
          interoperabilityRate: hospital.totalDataRequests > 0 
            ? (hospital.approvedDataRequests / hospital.totalDataRequests) * 100 
            : 0,
          performanceIndex: hospital.averageTreatmentEvaluationScore || 0,
          alertsCount: 0,
          hospitalName: hospital.hospitalName || hospital.HospitalName
        });
      } else {
        // If hospital not found in list, fetch it or use doctors data
        console.warn('Hospital not found in list, using doctors data for stats');
        const avgTES = doctors.length > 0 
          ? doctors.reduce((sum: number, d: any) => sum + (d.averageTreatmentEvaluationScore || 0), 0) / doctors.length 
          : 0;
        setStats({
          totalPatients: 0,
          totalDoctors: doctors.length,
          averageTES: avgTES,
          interoperabilityRate: 0,
          performanceIndex: avgTES,
          alertsCount: 0
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors by hospital:', error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API based on user role
      const [dashboardStats, hospitalPerf, sentimentAnalysis, doctors] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getHospitalPerformance(),
        dashboardService.getSentimentAnalysis(),
        dashboardService.getDoctors()
      ]);

      // Set dashboard stats
      setStats(dashboardStats);

      // Set hospital performance data
      setHospitalPerformance(hospitalPerf.map((h: any, index: number) => ({
        hospitalId: h.hospitalId,
        hospitalName: h.hospitalName,
        averageTES: h.averageTES,
        patientVolume: h.patientVolume,
        performanceIndex: h.performanceIndex,
        ranking: h.ranking
      })));

      // Set sentiment data
      setSentimentData(sentimentAnalysis.map((s: any) => ({
        sentiment: s.sentiment,
        count: s.count,
        percentage: s.percentage
      })));

      // Set doctors data
      setDoctorsData(doctors);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Prepare TES data based on user role and hospital filter
  const tesData = (user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
    ? doctorsData.map(d => ({
        name: d.doctorName?.split(' ')[0] || d.doctorName || 'Doctor', // Use first name or first part of username
        tes: d.averageTreatmentEvaluationScore || 0,
        performance: d.averageTreatmentEvaluationScore || 0 // For doctors, use TES as performance
      }))
    : hospitalPerformance.map(h => ({
        name: h.hospitalName.split(' ')[0],
        tes: h.averageTES,
        performance: h.performanceIndex
      }));

  // Prepare volume data based on user role
  const volumeData = user?.role === 'HospitalManager' 
    ? hospitalPerformance.map(h => ({
        name: h.hospitalName.split(' ')[0],
        volume: h.patientVolume
      }))
    : hospitalPerformance.map(h => ({
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'HospitalManager' 
                ? `${stats.hospitalName || 'Hospital'} Dashboard`
                : user?.role === 'SystemManager' && selectedHospitalId
                ? `${hospitals.find(h => h.hospitalId === selectedHospitalId)?.hospitalName || 'Hospital'} Dashboard`
                : 'System Dashboard'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'HospitalManager' 
                ? 'Overview of your hospital\'s performance and key metrics'
                : user?.role === 'SystemManager' && selectedHospitalId
                ? 'Overview of doctor performance and key metrics for this hospital'
                : 'System-wide overview of all hospitals and performance metrics'
              }
            </p>
          </div>

          {/* Hospital Filter for SystemManager */}
          {user?.role === 'SystemManager' && (
            <div className="mb-6 bg-white shadow rounded-lg p-4">
              <label htmlFor="hospital-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Hospital
              </label>
              {hospitalsLoading ? (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Loading hospitals...
                </div>
              ) : (
                <select
                  id="hospital-filter"
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  disabled={hospitals.length === 0}
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.hospitalId} value={hospital.hospitalId}>
                      {hospital.hospitalName}
                    </option>
                  ))}
                </select>
              )}
              {!hospitalsLoading && hospitals.length === 0 && (
                <p className="mt-2 text-sm text-red-600">No hospitals available</p>
              )}
            </div>
          )}

          {/* Dashboard Content */}
          <>
              {/* Stats Overview */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${user?.role === 'SystemManager' && !selectedHospitalId ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-6 mb-8`}>
            {user?.role === 'SystemManager' && !selectedHospitalId && (
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
            )}

            {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId)) && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserCheck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Doctors</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalDoctors || doctorsData.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId)) 
                    ? 'Doctor TES Performance' 
                    : 'Hospital TES Performance Comparison'}
                </h3>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                    ? 'Hospital Patient Volume' 
                    : 'Patient Volume Trends'}
                </h3>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                    ? 'Doctor Performance Overview' 
                    : 'Hospital Performance Rankings'}
                </h3>
                <div className="space-y-4">
                  {(user?.role === 'SystemManager' && selectedHospitalId ? doctorsData : hospitalPerformance).map((item: any, index: number) => {
                    const isDoctorView = user?.role === 'SystemManager' && selectedHospitalId;
                    return (
                    <div key={isDoctorView ? item.doctorId : item.hospitalId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {user?.role === 'SystemManager' && !selectedHospitalId && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        <div className={user?.role === 'SystemManager' && !selectedHospitalId ? 'ml-3' : ''}>
                          <p className="font-medium text-gray-900">
                            {isDoctorView ? item.doctorName : item.hospitalName}
                          </p>
                          <p className="text-sm text-gray-500">
                            TES: {isDoctorView ? (item.averageTreatmentEvaluationScore || 0).toFixed(1) : item.averageTES}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {isDoctorView ? (item.averageTreatmentEvaluationScore || 0).toFixed(1) : item.performanceIndex}%
                        </p>
                        <p className="text-sm text-gray-500">Performance</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                  ? 'Hospital Performance Insights' 
                  : 'System Performance Insights & Recommendations'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Critical Alert</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? `${stats.alertsCount} doctors below TES threshold (70%)`
                      : `${stats.alertsCount} doctors across system below TES threshold (70%)`
                    }
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-800">Improvement Needed</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? 'Consider additional training for doctors with low TES scores'
                      : 'Some hospitals need interoperability training'
                    }
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Good Performance</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? `Hospital performance index: ${stats.performanceIndex}%`
                      : 'Overall system health is excellent'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          </>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
