
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AppPermission {
  id: string;
  app: string;
  packageName: string;
  permissions: string[];
  harmfulPermissions: string[];
}

interface PermissionsListProps {
  permissions: AppPermission[];
}

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions }) => {
  return (
    <Card className="cyber-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Android App Permissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[320px]">
          <Table>
            <TableHeader className="sticky top-0 bg-cyber-gray">
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.app}</TableCell>
                  <TableCell className="font-mono text-xs">{app.packageName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[400px]">
                      {app.harmfulPermissions.map((permission, i) => (
                        <Badge key={`harmful-${i}`} variant="outline" className="bg-cyber-red/20 text-xs border-cyber-red">
                          {permission}
                        </Badge>
                      ))}
                      {app.harmfulPermissions.length === 0 && 
                        <span className="text-muted-foreground">No harmful permissions</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`${app.harmfulPermissions.length > 0 ? 'bg-cyber-red' : 'bg-cyber-green'}`}>
                      {app.harmfulPermissions.length > 0 ? 'High Risk' : 'Safe'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {permissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No permission data available. Connect an Android device to scan permissions.
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

export default PermissionsList;
