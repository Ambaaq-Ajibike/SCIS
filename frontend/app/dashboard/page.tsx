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
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Network,
  Shield,
  Activity,
  Database,
  Link2,
  CheckCircle2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { LoadingSpinner } from '@/components/ui';
import { DashboardStats, HospitalFilter } from '@/components/features';
import { dashboardService, systemManagerService } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { USER_ROLES } from '@/constants';

interface DashboardStatsData {
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
  const [stats, setStats] = useState<DashboardStatsData>({
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
      // Normalize doctor data field names
      const normalizedDoctors = doctors.map((d: any) => ({
        ...d,
        doctorId: d.doctorId || d.id,
        doctorName: d.doctorName || d.username || d.firstName || 'Unknown',
        averageTreatmentEvaluationScore: d.averageTreatmentEvaluationScore || d.averageTES || 0,
        averageTES: d.averageTES || d.averageTreatmentEvaluationScore || 0
      }));
      setDoctorsData(normalizedDoctors);
      
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
      setHospitalPerformance(hospitalPerf.map((h: any) => ({
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

      // Set doctors data - normalize field names to handle both averageTES and averageTreatmentEvaluationScore
      const normalizedDoctors = doctors.map((d: any) => {
        const tes = d.averageTreatmentEvaluationScore ?? d.averageTES ?? 0;
        return {
          ...d,
          doctorId: d.doctorId || d.id,
          doctorName: d.doctorName || d.username || d.firstName || 'Unknown',
          averageTreatmentEvaluationScore: tes,
          averageTES: tes
        };
      });
      setDoctorsData(normalizedDoctors);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Prepare TES data based on user role and hospital filter
  const tesData = (user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
    ? doctorsData
        .map(d => {
          // Get TES value from either field name
          const tes = d.averageTreatmentEvaluationScore ?? d.averageTES ?? 0;
          const doctorName = d.doctorName || d.username || d.firstName || 'Doctor';
          return {
            name: doctorName.split(' ')[0], // Use first name or first part of username
            tes: Number(tes) || 0,
            performance: Number(tes) || 0 // For doctors, use TES as performance
          };
        })
        .filter(d => {
          // Show doctors with TES > 0, or if all doctors have 0 TES, show them all
          const hasAnyTES = doctorsData.some(doc => {
            const docTES = doc.averageTreatmentEvaluationScore ?? doc.averageTES ?? 0;
            return Number(docTES) > 0;
          });
          // If any doctor has TES > 0, only show those with TES > 0
          // Otherwise, show all doctors (they all have 0 TES)
          return hasAnyTES ? d.tes > 0 : true;
        })
    : hospitalPerformance.map(h => ({
        name: h.hospitalName.split(' ')[0],
        tes: h.averageTES,
        performance: h.performanceIndex
      }));

  // Prepare volume data
  const volumeData = hospitalPerformance.map(h => ({
    name: h.hospitalName.split(' ')[0],
    volume: h.patientVolume
  }));

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <LoadingSpinner fullScreen text="Loading dashboard..." />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="mt-1 text-sm font-semibold text-primary-600">
                  Smart Connected System for Integrated Health Administration
                </p>
                <p className="mt-2 text-gray-600">
                  {user?.role === 'HospitalManager' 
                    ? `Monitoring ${stats.hospitalName || 'your hospital'}'s integration within the decentralized healthcare network`
                    : user?.role === 'SystemManager' && selectedHospitalId
                    ? `Analyzing ${hospitals.find(h => h.hospitalId === selectedHospitalId)?.hospitalName || 'hospital'}'s performance in the interoperable network`
                    : 'National healthcare network overview - Real-time coordination and service delivery across integrated health institutions'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Hospital Filter for SystemManager */}
          {user?.role === USER_ROLES.SYSTEM_MANAGER && (
            <HospitalFilter
              hospitals={hospitals.map(h => ({
                hospitalId: h.hospitalId,
                hospitalName: h.hospitalName,
              }))}
              selectedHospitalId={selectedHospitalId}
              onHospitalChange={setSelectedHospitalId}
              isLoading={hospitalsLoading}
            />
          )}

          {/* Dashboard Content */}
          <DashboardStats
            stats={{
              ...stats,
              totalDoctors: stats.totalDoctors || doctorsData.length,
            }}
            userRole={user?.role}
            selectedHospitalId={selectedHospitalId}
          />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* TES Performance Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId)) 
                    ? 'Healthcare Provider Performance Metrics' 
                    : 'Institution Performance Comparison - Treatment Evaluation Scores'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  {tesData.length > 0 ? (
                    <BarChart data={tesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => `${value}%`} />
                      <Bar dataKey="tes" fill="#3b82f6" />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <p className="text-sm">No TES data available</p>
                        <p className="text-xs mt-1">Doctors will appear here after receiving feedback</p>
                      </div>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patient Volume Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                    ? 'Service Delivery Volume' 
                    : 'Healthcare Service Delivery Trends Across Network'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Feedback Sentiment Analysis</h3>
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
                      {sentimentData.map((_, index) => (
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
                    ? 'Healthcare Provider Performance Overview' 
                    : 'Institution Performance Rankings - Network Integration'}
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

          {/* Network Integration Status */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Network className="h-5 w-5 mr-2 text-primary-600" />
                Decentralized Network Integration Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-blue-800 mb-1">Data Exchange</h4>
                  <p className="text-sm text-blue-700">
                    {stats.interoperabilityRate.toFixed(1)}% success rate
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Error-controlled protocols active</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-green-800 mb-1">Real-Time Communication</h4>
                  <p className="text-sm text-green-700">Active</p>
                  <p className="text-xs text-green-600 mt-1">Service-level architecture operational</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-purple-800 mb-1">Secure Authentication</h4>
                  <p className="text-sm text-purple-700">Enabled</p>
                  <p className="text-xs text-purple-600 mt-1">Discretionary access control active</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Link2 className="h-5 w-5 text-orange-600" />
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-orange-800 mb-1">FHIR Compliance</h4>
                  <p className="text-sm text-orange-700">Compliant</p>
                  <p className="text-xs text-orange-600 mt-1">Standards-based interoperability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                  ? 'Healthcare Institution Performance Insights' 
                  : 'National Healthcare Network Insights & Recommendations'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Attention Required</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? `${stats.alertsCount} healthcare providers below performance threshold (70%)`
                      : `${stats.alertsCount} providers across network below performance threshold (70%)`
                    }
                  </p>
                  <p className="text-xs text-red-600 mt-2">Review data exchange protocols and communication mechanisms</p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-800">Optimization Opportunity</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? 'Enhance interoperability protocols and real-time communication mechanisms'
                      : 'Some institutions need enhanced integration training and protocol optimization'
                    }
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">Focus on service-level architecture improvements</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Network Health</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    {(user?.role === 'HospitalManager' || (user?.role === 'SystemManager' && selectedHospitalId))
                      ? `Institution performance index: ${stats.performanceIndex}% - Well integrated`
                      : 'Overall network health is excellent - Decentralized system operating optimally'
                    }
                  </p>
                  <p className="text-xs text-green-600 mt-2">Seamless collaboration across healthcare entities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
