import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import apiClient from '@/lib/apiClient';

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await apiClient.get('/health', { timeout: 5000 });
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking && isConnected === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
        <span>Checking...</span>
      </div>
    );
  }

  return (
    <button
      onClick={checkConnection}
      className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
      title="Click to refresh connection status"
    >
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Disconnected</span>
        </>
      )}
    </button>
  );
};
