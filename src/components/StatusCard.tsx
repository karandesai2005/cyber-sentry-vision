
import React from 'react';
import { Card } from '@/components/ui/card';

interface StatusCardProps {
  title: string;
  value: string | number;
  status?: 'safe' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  status = 'neutral',
  icon
}) => {
  const getStatusClass = () => {
    switch(status) {
      case 'safe': return 'status-safe';
      case 'warning': return 'status-warning';
      case 'danger': return 'status-danger';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="cyber-card p-4 h-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold monospace mt-1">{value}</h3>
        </div>
        {icon && (
          <div className="bg-cyber-gray/50 p-2 rounded">{icon}</div>
        )}
      </div>
      {status !== 'neutral' && (
        <div className="mt-4 flex items-center">
          <span className={`cyber-status-dot ${getStatusClass()}`}></span>
          <span className="text-xs capitalize">{status}</span>
        </div>
      )}
    </Card>
  );
};

export default StatusCard;
