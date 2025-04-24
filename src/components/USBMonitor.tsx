
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Usb } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const [isScanning, setIsScanning] = useState(false);

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

    // Initial USB devices scan
    navigator.usb.getDevices()
      .then(devices => {
        setDevices(devices.map(device => ({
          productId: device.productId.toString(16),
          vendorId: device.vendorId.toString(16),
          productName: device.productName
        })));
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Card className="cyber-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Usb className="h-5 w-5 text-cyber-blue" />
          <CardTitle className="text-lg">USB Device Monitor</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default USBMonitor;
