import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Usb, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { NetworkAlert, websocketService } from '@/services/websocketService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extend the Navigator interface to include USB
declare global {
  interface Navigator {
    usb: {
      requestDevice(options: { filters: any[] }): Promise<any>;
      addEventListener(type: string, callback: (event: any) => void): void;
      getDevices(): Promise<any[]>;
    };
  }
}

interface USBDevice {
  productId: string;
  vendorId: string;
  productName?: string;
}

const USBMonitor = () => {
  const [devices, setDevices] = useState<USBDevice[]>([]);
  const [networkAlerts, setNetworkAlerts] = useState<NetworkAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState('devices');

  const requestUSBPermission = async () => {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [] // Empty array to show all devices
      });
      
      const newDevice = {
        productId: device.productId.toString(16),
        vendorId: device.vendorId.toString(16),
        productName: device.productName
      };

      setDevices(prev => [...prev, newDevice]);
      toast({
        title: "USB Device Detected",
        description: `New device connected: ${device.productName || 'Unknown Device'}`,
      });

    } catch (error) {
      console.error('Error accessing USB device:', error);
      toast({
        title: "USB Access Error",
        description: "Could not access USB device. Make sure you have the necessary permissions.",
        variant: "destructive"
      });
    }
  };

  const startNetworkMonitoring = () => {
    if (!isMonitoring) {
      websocketService.connect();
      setIsMonitoring(true);
      toast({
        title: "Network Monitoring Started",
        description: "CyberSentry is now monitoring network traffic",
      });
    } else {
      websocketService.disconnect();
      setIsMonitoring(false);
      toast({
        title: "Network Monitoring Stopped",
        description: "CyberSentry has stopped monitoring network traffic",
      });
    }
  };

  useEffect(() => {
    navigator.usb.addEventListener('connect', (event: any) => {
      const device = event.device;
      setDevices(prev => [...prev, {
        productId: device.productId.toString(16),
        vendorId: device.vendorId.toString(16),
        productName: device.productName
      }]);
    });

    navigator.usb.addEventListener('disconnect', (event: any) => {
      const device = event.device;
      setDevices(prev => prev.filter(d => 
        d.productId !== device.productId.toString(16) ||
        d.vendorId !== device.vendorId.toString(16)
      ));
    });

    navigator.usb.getDevices()
      .then(devices => {
        setDevices(devices.map(device => ({
          productId: device.productId.toString(16),
          vendorId: device.vendorId.toString(16),
          productName: device.productName
        })));
      });

    const handleNetworkAlert = (alert: NetworkAlert) => {
      setNetworkAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep latest 50 alerts
      
      if (alert.riskLevel > 6) {
        toast({
          title: "High Risk IP Detected!",
          description: `${alert.srcIp} → ${alert.dstIp}: ${alert.reason}`,
          variant: "destructive"
        });
      } else if (alert.riskLevel > 3) {
        toast({
          title: "Suspicious IP Detected",
          description: `${alert.srcIp} → ${alert.dstIp}: ${alert.reason}`,
          variant: "warning"
        });
      }
    };
    
    websocketService.addListener(handleNetworkAlert);

    return () => {
      websocketService.removeListener(handleNetworkAlert);
      if (isMonitoring) {
        websocketService.disconnect();
      }
    };
  }, []);

  const renderRiskLevel = (level: number) => {
    if (level > 6) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-md font-medium">{level}</span>;
    } else if (level > 3) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-md font-medium">{level}</span>;
    } else {
      return <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-md font-medium">{level}</span>;
    }
  };

  return (
    <Card className="cyber-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Usb className="h-5 w-5 text-cyber-blue" />
          <CardTitle className="text-lg">USB & Network Monitor</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="devices">USB Devices</TabsTrigger>
            <TabsTrigger value="network">Network Traffic</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <button
              onClick={requestUSBPermission}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-white px-4 py-2 rounded-md transition-colors"
            >
              Scan for USB Devices
            </button>
            
            <div className="space-y-2">
              {devices.length > 0 ? (
                devices.map((device, index) => (
                  <div 
                    key={`${device.vendorId}-${device.productId}-${index}`}
                    className="p-3 bg-cyber-gray rounded-md border border-cyber-blue/30"
                  >
                    <p className="font-medium">{device.productName || 'Unknown Device'}</p>
                    <p className="text-sm text-muted-foreground">
                      Vendor ID: {device.vendorId} | Product ID: {device.productId}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No USB devices detected. Click "Scan for USB Devices" to start monitoring.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <button
              onClick={startNetworkMonitoring}
              className={`w-full ${isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-cyber-blue hover:bg-cyber-blue/80'} text-white px-4 py-2 rounded-md transition-colors`}
            >
              {isMonitoring ? 'Stop Network Monitoring' : 'Start Network Monitoring'}
            </button>
            
            <div className="space-y-2">
              {networkAlerts.length > 0 ? (
                networkAlerts.map((alert, index) => (
                  <div 
                    key={`${alert.srcIp}-${alert.timestamp}-${index}`}
                    className={`p-3 rounded-md border ${alert.riskLevel > 6 ? 'bg-red-950/20 border-red-500/30' : alert.riskLevel > 3 ? 'bg-yellow-950/20 border-yellow-500/30' : 'bg-cyber-gray border-cyber-blue/30'}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        {alert.riskLevel > 3 && (
                          <AlertTriangle className="inline-block mr-1 h-4 w-4 text-yellow-500" />
                        )}
                        {alert.srcIp} → {alert.dstIp}
                      </p>
                      <p className="text-sm">Risk: {renderRiskLevel(alert.riskLevel)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {isMonitoring 
                    ? 'Monitoring network traffic. Alerts will appear here...'
                    : 'Click "Start Network Monitoring" to begin scanning network traffic.'}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-3 bg-cyber-gray rounded-md border border-cyber-blue/30">
          <p className="text-sm text-muted-foreground">
            <strong>Setup Instructions:</strong> To monitor your phone's network traffic, connect your phone via USB tethering and run the backend Python server on your laptop. The server requires root/admin privileges for packet sniffing. For more details, check the documentation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default USBMonitor;
