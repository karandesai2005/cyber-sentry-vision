
import React from 'react';
import { Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  alerts: number;
}

const Header: React.FC<HeaderProps> = ({ alerts }) => {
  return (
    <header className="bg-cyber-gray p-4 flex items-center justify-between border-b border-cyber-blue/30">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-cyber-blue animate-pulse-glow" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue via-white to-cyber-purple bg-clip-text text-transparent">
          CyberSentry
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {alerts > 0 && (
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-cyber-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {alerts}
            </span>
          </Button>
        )}
        <div className="text-sm bg-cyber-gray rounded px-3 py-1 border border-cyber-blue/30">
          <span className="text-muted-foreground">System Status: </span> 
          <span className="text-cyber-blue font-medium">Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
