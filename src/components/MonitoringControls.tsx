
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, StopCircle } from 'lucide-react';

interface MonitoringControlsProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

const MonitoringControls: React.FC<MonitoringControlsProps> = ({
  isMonitoring,
  onToggleMonitoring,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-cyber-gray rounded-md border border-cyber-blue/30">
      <div>
        <h3 className="font-medium">Network & Device Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          {isMonitoring ? 'Actively monitoring for threats' : 'Monitoring paused'}
        </p>
      </div>
      
      <Button 
        onClick={onToggleMonitoring}
        variant={isMonitoring ? "destructive" : "default"}
        className={isMonitoring ? "bg-cyber-red hover:bg-cyber-red/80" : "bg-cyber-blue hover:bg-cyber-blue/80"}
      >
        {isMonitoring ? (
          <>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Monitoring
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Monitoring
          </>
        )}
      </Button>
    </div>
  );
};

export default MonitoringControls;
