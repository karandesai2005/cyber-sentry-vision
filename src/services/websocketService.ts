
import { toast } from '@/components/ui/use-toast';

interface AlertListener {
  (alert: NetworkAlert): void;
}

export interface NetworkAlert {
  srcIp: string;
  dstIp: string;
  timestamp: string;
  riskLevel: number;
  reason: string;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: AlertListener[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 3000; // 3 seconds
  
  connect(url: string = 'ws://localhost:8000/ws'): void {
    if (this.socket) {
      this.disconnect();
    }
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        toast({
          title: "Network Monitor Connected",
          description: "Successfully connected to packet scanning service",
        });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data) as NetworkAlert;
          this.notifyListeners(alert);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to network monitoring service",
          variant: "destructive"
        });
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      toast({
        title: "Connection Failed",
        description: "Could not reconnect to network monitoring service after multiple attempts",
        variant: "destructive"
      });
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectTimeout);
  }
  
  addListener(listener: AlertListener): void {
    this.listeners.push(listener);
  }
  
  removeListener(listener: AlertListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  private notifyListeners(alert: NetworkAlert): void {
    this.listeners.forEach(listener => {
      listener(alert);
    });
  }
  
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();

