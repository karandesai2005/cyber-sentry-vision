
import React from 'react';
import { Shield, Monitor, AlertTriangle } from 'lucide-react';
import StatusCard from './StatusCard';

interface StatsSummaryProps {
  devicesConnected: number;
  ipScanned: number;
  alertsDetected: number;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  devicesConnected, 
  ipScanned, 
  alertsDetected 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatusCard 
        title="Devices Connected" 
        value={devicesConnected} 
        status="safe"
        icon={<Monitor className="h-5 w-5 text-cyber-green" />}
      />
      
      <StatusCard 
        title="IP Addresses Scanned" 
        value={ipScanned} 
        status="neutral"
        icon={<Shield className="h-5 w-5 text-cyber-blue" />}
      />
      
      <StatusCard 
        title="Alerts Detected" 
        value={alertsDetected}
        status={alertsDetected > 0 ? 'danger' : 'safe'}
        icon={<AlertTriangle className="h-5 w-5 text-cyber-red" />}
      />
    </div>
  );
};

export default StatsSummary;
