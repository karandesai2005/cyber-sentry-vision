
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface IPData {
  id: string;
  ip: string;
  device: string;
  timestamp: string;
  riskLevel: number;
  status: 'safe' | 'warning' | 'danger';
}

interface IPTableProps {
  ipData: IPData[];
}

const IPTable: React.FC<IPTableProps> = ({ ipData }) => {
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'safe': return 'bg-cyber-green';
      case 'warning': return 'bg-cyber-yellow';
      case 'danger': return 'bg-cyber-red';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="cyber-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Network Activity Monitoring</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[320px]">
          <Table>
            <TableHeader className="sticky top-0 bg-cyber-gray">
              <TableRow>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ipData.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`cyber-status-dot ${getStatusClass(ip.status)}`}></span>
                      <span className="capitalize">{ip.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{ip.ip}</TableCell>
                  <TableCell>{ip.device}</TableCell>
                  <TableCell>{ip.riskLevel}/10</TableCell>
                  <TableCell className="text-right">{ip.timestamp}</TableCell>
                </TableRow>
              ))}
              {ipData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No IP data available. Start monitoring to capture network activity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default IPTable;
