/**
 * Dashboard Stats Overview component
 */

import React from 'react';
import { StatCard } from './StatCard';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  UserCheck,
  BarChart3
} from 'lucide-react';

export interface DashboardStatsProps {
  stats: {
    totalHospitals?: number;
    totalPatients: number;
    totalDoctors?: number;
    averageTES: number;
    interoperabilityRate: number;
    performanceIndex: number;
    alertsCount: number;
  };
  userRole?: string;
  selectedHospitalId?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  userRole,
  selectedHospitalId,
}) => {
  const isSystemManager = userRole === 'SystemManager';
  const showHospitals = isSystemManager && !selectedHospitalId && stats.totalHospitals !== undefined;
  const showDoctors = userRole === 'HospitalManager' || (isSystemManager && selectedHospitalId);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isSystemManager ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-6 mb-8`}>
      {showHospitals && (
        <StatCard
          title="Hospitals"
          value={stats.totalHospitals || 0}
          icon={Building2}
          iconColor="text-primary-600"
        />
      )}

      {showDoctors && (
        <StatCard
          title="Doctors"
          value={stats.totalDoctors || 0}
          icon={UserCheck}
          iconColor="text-blue-600"
        />
      )}

      <StatCard
        title="Patients"
        value={stats.totalPatients}
        icon={Users}
        iconColor="text-green-600"
      />

      {/* <StatCard
        title="Avg TES"
        value={`${stats.averageTES}%`}
        icon={Activity}
        iconColor="text-blue-600"
      /> */}

      <StatCard
        title="Network Interop"
        value={`${stats.interoperabilityRate}%`}
        icon={TrendingUp}
        iconColor="text-purple-600"
      />

      <StatCard
        title="Performance"
        value={`${stats.performanceIndex}%`}
        icon={BarChart3}
        iconColor="text-orange-600"
      />

      <StatCard
        title="Alerts"
        value={stats.alertsCount}
        icon={AlertTriangle}
        iconColor="text-red-600"
      />
    </div>
  );
};

