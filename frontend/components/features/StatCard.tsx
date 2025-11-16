/**
 * Reusable Stat Card component for dashboard
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  trend,
  className = '',
}) => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {formattedValue}
              </dd>
              {trend && (
                <dd className="text-xs text-gray-500 mt-1">
                  <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

