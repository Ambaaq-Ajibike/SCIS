/**
 * Status Badge component
 */

import React from 'react';
import { UserCheck, UserX, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export type StatusType = 'active' | 'inactive' | 'success' | 'error' | 'warning' | 'pending';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusStyles = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: UserCheck,
    defaultLabel: 'Active',
  },
  inactive: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: UserX,
    defaultLabel: 'Inactive',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: CheckCircle,
    defaultLabel: 'Success',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: XCircle,
    defaultLabel: 'Error',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: AlertCircle,
    defaultLabel: 'Warning',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: AlertCircle,
    defaultLabel: 'Pending',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = false,
}) => {
  const style = statusStyles[status];
  const Icon = style.icon;
  const displayLabel = label || style.defaultLabel;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${style.bg} ${style.text} ${sizeStyles[size]}`}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {displayLabel}
    </span>
  );
};

