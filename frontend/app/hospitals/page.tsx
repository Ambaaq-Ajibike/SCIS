'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Settings, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalPatients: number;
  averageTES: number;
  performanceIndex: number;
  interoperabilityRate: number;
  alertsCount: number;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockHospitals: Hospital[] = [
        {
          id: '1',
          name: 'City General Hospital',
          address: '123 Main St, City, State 12345',
          phoneNumber: '+1-555-0100',
          email: 'info@citygeneral.com',
          isActive: true,
          createdAt: '2024-01-01',
          totalPatients: 1250,
          averageTES: 85.2,
          performanceIndex: 92.1,
          interoperabilityRate: 95.5,
          alertsCount: 0,
        },
        {
          id: '2',
          name: 'Metro Medical Center',
          address: '456 Oak Ave, Metro, State 12346',
          phoneNumber: '+1-555-0200',
          email: 'contact@metromedical.com',
          isActive: true,
          createdAt: '2024-01-05',
          totalPatients: 980,
          averageTES: 82.7,
          performanceIndex: 88.9,
          interoperabilityRate: 92.3,
          alertsCount: 1,
        },
        {
          id: '3',
          name: 'Regional Health Center',
          address: '789 Pine St, Regional, State 12347',
          phoneNumber: '+1-555-0300',
          email: 'admin@regionalhealth.com',
          isActive: true,
          createdAt: '2024-01-10',
          totalPatients: 750,
          averageTES: 79.1,
          performanceIndex: 84.3,
          interoperabilityRate: 89.7,
          alertsCount: 2,
        },
        {
          id: '4',
          name: 'Community Hospital',
          address: '321 Elm St, Community, State 12348',
          phoneNumber: '+1-555-0400',
          email: 'info@communityhospital.com',
          isActive: false,
          createdAt: '2024-01-15',
          totalPatients: 450,
          averageTES: 76.8,
          performanceIndex: 81.2,
          interoperabilityRate: 87.1,
          alertsCount: 3,
        },
        {
          id: '5',
          name: 'University Medical Center',
          address: '654 Campus Dr, University, State 12349',
          phoneNumber: '+1-555-0500',
          email: 'contact@universitymedical.com',
          isActive: true,
          createdAt: '2024-01-20',
          totalPatients: 1100,
          averageTES: 74.5,
          performanceIndex: 78.9,
          interoperabilityRate: 85.2,
          alertsCount: 1,
        },
      ];

      setHospitals(mockHospitals);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = searchTerm === '' || 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && hospital.isActive) ||
      (statusFilter === 'Inactive' && !hospital.isActive);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'performance':
        return b.performanceIndex - a.performanceIndex;
      case 'patients':
        return b.totalPatients - a.totalPatients;
      case 'tes':
        return b.averageTES - a.averageTES;
      default:
        return 0;
    }
  });

  const getPerformanceColor = (index: number) => {
    if (index >= 90) return 'text-green-600';
    if (index >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTESColor = (tes: number) => {
    if (tes >= 80) return 'text-green-600';
    if (tes >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
    <ProtectedRoute allowedRoles={['SystemManager']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
                <p className="text-gray-600">Manage healthcare institutions and performance</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Hospital
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search hospitals..."
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="name">Name</option>
                  <option value="performance">Performance Index</option>
                  <option value="patients">Patient Count</option>
                  <option value="tes">TES Score</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Hospitals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div key={hospital.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{hospital.name}</h3>
                        <div className="flex items-center">
                          {hospital.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            hospital.isActive ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {hospital.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{hospital.address}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{hospital.phoneNumber}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{hospital.email}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{hospital.totalPatients}</span>
                        </div>
                        <p className="text-xs text-gray-500">Patients</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="h-4 w-4 text-green-500 mr-1" />
                          <span className={`text-sm font-medium ${getTESColor(hospital.averageTES)}`}>
                            {hospital.averageTES}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">TES Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                          <span className={`text-sm font-medium ${getPerformanceColor(hospital.performanceIndex)}`}>
                            {hospital.performanceIndex}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Performance</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          {hospital.alertsCount > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            hospital.alertsCount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {hospital.alertsCount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
