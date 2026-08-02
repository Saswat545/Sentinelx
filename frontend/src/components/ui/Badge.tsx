import React from 'react';
import { RiskLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'risk';
  riskLevel?: RiskLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  riskLevel,
  className = '',
  size = 'md',
}) => {
  let colorStyle = 'bg-gray-800 text-gray-300 border-gray-700';

  if (riskLevel) {
    switch (riskLevel) {
      case 'CRITICAL':
      case 'HIGH':
        colorStyle = 'bg-red-950/60 text-red-400 border-red-800/80';
        break;
      case 'MEDIUM':
        colorStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/80';
        break;
      case 'LOW':
        colorStyle = 'bg-blue-950/60 text-blue-400 border-blue-800/80';
        break;
      case 'SAFE':
        colorStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        colorStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
        break;
      case 'warning':
        colorStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/80';
        break;
      case 'danger':
        colorStyle = 'bg-red-950/60 text-red-400 border-red-800/80';
        break;
      case 'info':
        colorStyle = 'bg-blue-950/60 text-blue-400 border-blue-800/80';
        break;
      case 'outline':
        colorStyle = 'bg-transparent text-gray-300 border-gray-700';
        break;
      case 'default':
      default:
        colorStyle = 'bg-gray-800/80 text-gray-300 border-gray-700';
        break;
    }
  }

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border ${colorStyle} ${sizeStyle} transition-colors ${className}`}
    >
      {children}
    </span>
  );
};
