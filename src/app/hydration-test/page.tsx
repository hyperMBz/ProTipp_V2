"use client";

import { useState, useEffect } from "react";
import { ConnectionStatus } from "@/components/ui/connection-status";

export default function HydrationTest() {
  const [isClient, setIsClient] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRealTime(true);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Hydration Test</h1>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span>Connection Status:</span>
          <ConnectionStatus isRealTime={isClient && isRealTime} />
          <span>{isClient && isRealTime ? 'ÉLŐ' : 'OFFLINE'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Client Side:</span>
          <span className="font-mono">{isClient ? 'true' : 'false'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Real Time:</span>
          <span className="font-mono">{isRealTime ? 'true' : 'false'}</span>
        </div>
      </div>
    </div>
  );
}
