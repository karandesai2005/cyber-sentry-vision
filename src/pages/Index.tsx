
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MonitoringControls from '@/components/MonitoringControls';
import IPTable, { IPData } from '@/components/IPTable';
import PermissionsList, { AppPermission } from '@/components/PermissionsList';
import AlertBanner, { AlertType } from '@/components/AlertBanner';
import StatsSummary from '@/components/StatsSummary';
import { toast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockIpData: IPData[] = [
  {
    id: '1',
    ip: '192.168.1.101',
    device: 'Desktop PC',
    timestamp: '2023-04-24 10:15:22',
    riskLevel: 1,
    status: 'safe'
  },
  {
    id: '2',
    ip: '192.168.1.105',
    device: 'Android Phone',
    timestamp: '2023-04-24 10:14:55',
    riskLevel: 2,
    status: 'safe'
  },
  {
    id: '3',
    ip: '45.33.49.201',
    device: 'Unknown',
    timestamp: '2023-04-24 10:14:30',
    riskLevel: 7,
    status: 'danger'
  },
  {
    id: '4',
    ip: '192.168.1.110',
    device: 'Smart TV',
    timestamp: '2023-04-24 10:13:15',
    riskLevel: 1,
    status: 'safe'
  },
  {
    id: '5',
    ip: '192.168.1.115',
    device: 'Tablet',
    timestamp: '2023-04-24 10:12:08',
    riskLevel: 4,
    status: 'warning'
  }
];

const mockPermissionData: AppPermission[] = [
  {
    id: '1',
    app: 'Messaging App',
    packageName: 'com.messages',
    permissions: ['READ_CONTACTS', 'INTERNET'],
    harmfulPermissions: ['SEND_SMS', 'READ_CALL_LOG']
  },
  {
    id: '2',
    app: 'Camera App',
    packageName: 'com.camera',
    permissions: ['CAMERA', 'STORAGE'],
    harmfulPermissions: []
  },
  {
    id: '3',
    app: 'Suspicious Game',
    packageName: 'com.game.suspicious',
    permissions: ['INTERNET', 'STORAGE'],
    harmfulPermissions: ['READ_SMS', 'CAMERA', 'LOCATION']
  },
  {
    id: '4',
    app: 'Weather App',
    packageName: 'com.weather.forecast',
    permissions: ['INTERNET', 'LOCATION'],
    harmfulPermissions: []
  }
];

const Index = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [ipData, setIpData] = useState<IPData[]>([]);
  const [permissionData, setPermissionData] = useState<AppPermission[]>([]);
  const [alert, setAlert] = useState<{
    type: AlertType;
    title: string;
    message: string;
  }>({
    type: null,
    title: '',
    message: ''
  });

  // Stats
  const [devicesConnected, setDevicesConnected] = useState(0);
  const [ipScanned, setIpScanned] = useState(0);
  const [alertsDetected, setAlertsDetected] = useState(0);

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
    
    if (!isMonitoring) {
      // Starting monitoring
      setIpData(mockIpData);
      setPermissionData(mockPermissionData);
      setDevicesConnected(4);
      setIpScanned(5);
      setAlertsDetected(2);
      
      toast({
        title: "Monitoring Started",
        description: "CyberSentry is now actively scanning network traffic and device permissions.",
      });
      
      // Simulate an alert after 3 seconds
      setTimeout(() => {
        setAlert({
          type: 'error',
          title: 'Suspicious Activity Detected!',
          message: 'High risk IP address 45.33.49.201 detected communicating with com.messages app.'
        });
        setAlertsDetected(prev => prev + 1);
      }, 3000);
    } else {
      // Stopping monitoring
      toast({
        title: "Monitoring Stopped",
        description: "CyberSentry monitoring has been paused.",
      });
    }
  };

  const clearAlert = () => {
    setAlert({
      type: null,
      title: '',
      message: ''
    });
  };

  useEffect(() => {
    // Simulate real-time updates when monitoring is active
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        // Add a new IP every 10 seconds to simulate real-time monitoring
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        // Generate a random IP
        const newIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
        const riskLevel = Math.floor(Math.random() * 10) + 1;
        let status: 'safe' | 'warning' | 'danger' = 'safe';
        
        if (riskLevel > 6) {
          status = 'danger';
        } else if (riskLevel > 3) {
          status = 'warning';
        }
        
        const newIpData: IPData = {
          id: Date.now().toString(),
          ip: newIp,
          device: 'Unknown Device',
          timestamp,
          riskLevel,
          status
        };
        
        setIpData(prev => [newIpData, ...prev.slice(0, 9)]); // Keep only the latest 10 entries
        setIpScanned(prev => prev + 1);
        
        if (status === 'danger') {
          setAlert({
            type: 'error',
            title: 'Suspicious Activity Detected!',
            message: `High risk IP address ${newIp} detected with risk level ${riskLevel}.`
          });
          setAlertsDetected(prev => prev + 1);
        } else if (status === 'warning') {
          setAlert({
            type: 'warning',
            title: 'Potential Risk Detected',
            message: `Moderate risk IP address ${newIp} detected with risk level ${riskLevel}.`
          });
          setAlertsDetected(prev => prev + 1);
        } else if (riskLevel === 1 && Math.random() > 0.7) {
          // Occasionally show safe alerts
          setAlert({
            type: 'success',
            title: 'Safe IP Detected',
            message: `IP address ${newIp} verified as safe.`
          });
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  return (
    <div className="min-h-screen cyber-grid">
      <Header alerts={alertsDetected} />
      
      <main className="container py-6">
        {alert.type && (
          <AlertBanner 
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={clearAlert}
          />
        )}
        
        <div className="space-y-6">
          <MonitoringControls 
            isMonitoring={isMonitoring} 
            onToggleMonitoring={toggleMonitoring} 
          />
          
          <StatsSummary 
            devicesConnected={devicesConnected} 
            ipScanned={ipScanned} 
            alertsDetected={alertsDetected} 
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <IPTable ipData={ipData} />
            <PermissionsList permissions={permissionData} />
          </div>
          
          <div className="mt-8 p-4 bg-cyber-gray rounded border border-cyber-blue/30">
            <h3 className="font-medium text-lg mb-2">Setup Instructions:</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This is a frontend prototype of CyberSentry. To connect to the backend:</p>
              <ol className="list-decimal list-inside space-y-1 pl-4">
                <li>Install Python dependencies: <code className="bg-cyber-dark px-2 py-1 rounded text-xs">pip install flask flask-socketio scapy requests</code></li>
                <li>Setup ADB for Android monitoring: <code className="bg-cyber-dark px-2 py-1 rounded text-xs">adb devices</code></li>
                <li>Run Flask server: <code className="bg-cyber-dark px-2 py-1 rounded text-xs">python server.py</code></li>
              </ol>
              <p className="mt-2">Note: For Scapy to work, administrator/root privileges may be required.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
