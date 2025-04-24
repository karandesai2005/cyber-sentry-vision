
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type AlertType = 'success' | 'warning' | 'error' | null;

interface AlertBannerProps {
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoClose && type) {
      timer = setTimeout(() => {
        onClose();
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [type, autoClose, onClose]);

  if (!type) return null;

  const alertIcons = {
    success: <CheckCircle className="h-5 w-5 text-cyber-green" />,
    warning: <AlertCircle className="h-5 w-5 text-cyber-yellow" />,
    error: <AlertCircle className="h-5 w-5 text-cyber-red" />,
  };

  const alertClasses = {
    success: 'border-cyber-green/40 bg-cyber-green/10',
    warning: 'border-cyber-yellow/40 bg-cyber-yellow/10',
    error: 'border-cyber-red/40 bg-cyber-red/10',
  };

  return (
    <Alert className={`${alertClasses[type]} mb-4`} variant="default">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {alertIcons[type]}
          <AlertTitle>{title}</AlertTitle>
        </div>
        <button onClick={onClose}>
          <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      <AlertDescription className="pl-7">{message}</AlertDescription>
    </Alert>
  );
};

export default AlertBanner;
