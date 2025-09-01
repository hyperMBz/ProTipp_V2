"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isRealTime: boolean;
  className?: string;
}

export function ConnectionStatus({ isRealTime, className = "h-4 w-4" }: ConnectionStatusProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, render a placeholder to prevent hydration mismatch
  if (!isClient) {
    return <div className={className} />;
  }

  return isRealTime ? (
    <Wifi className={`${className} text-green-400`} />
  ) : (
    <WifiOff className={`${className} text-red-400`} />
  );
}
