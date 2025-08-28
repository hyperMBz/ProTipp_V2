# 🧩 ProTipp V2 Component Templates

Phase D fejlesztésekhez használható komponens sablonok.

## 📄 **Basic Card Component Template**

```tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface YourComponentProps {
  className?: string;
  title: string;
  description?: string;
  isLoading?: boolean;
}

export function YourComponent({ 
  className, 
  title, 
  description,
  isLoading = false 
}: YourComponentProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div>
            {/* Your content here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 💳 **Subscription Card Template**

```tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  onSelect: (tierId: string) => void;
  className?: string;
}

export function SubscriptionCard({ tier, onSelect, className }: SubscriptionCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:scale-105",
      tier.popular && "border-primary ring-2 ring-primary/20",
      tier.current && "border-green-400 ring-2 ring-green-400/20",
      className
    )}>
      {tier.popular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
          POPULAR
        </div>
      )}
      
      {tier.current && (
        <div className="absolute top-0 left-0 bg-green-400 text-black px-3 py-1 text-xs font-medium">
          CURRENT PLAN
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">
            €{tier.price}
          </span>
          <span className="text-muted-foreground">/{tier.period}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          onClick={() => onSelect(tier.id)}
          className="w-full"
          variant={tier.popular ? "default" : "outline"}
          disabled={tier.current}
        >
          {tier.current ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

## ⚡ **Live Status Component Template**

```tsx
"use client";

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusProps {
  isConnected: boolean;
  lastUpdate?: Date;
  dataPoints?: number;
  className?: string;
}

export function LiveStatus({ 
  isConnected, 
  lastUpdate, 
  dataPoints = 0,
  className 
}: LiveStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);
      
      if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            
            <Badge 
              variant={isConnected ? "default" : "secondary"} 
              className={cn(
                "gap-1",
                isConnected && "bg-green-400/10 text-green-400 border-green-400/20"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"
              )} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">{dataPoints} points</div>
            {timeAgo && (
              <div className="text-xs text-muted-foreground">{timeAgo}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 📊 **Metrics Card Template**

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'percentage' | 'number';
  suffix?: string;
  className?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  previousValue,
  format,
  suffix = '',
  className 
}: MetricsCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `€${formatNumber(val)}`;
      case 'percentage':
        return `${val.toFixed(2)}%`;
      case 'number':
        return formatNumber(val);
      default:
        return val.toString();
    }
  };

  const getTrend = () => {
    if (!previousValue) return null;
    
    const change = ((value - previousValue) / previousValue) * 100;
    const isPositive = change > 0;
    const isNeutral = Math.abs(change) < 0.01;

    return {
      change: Math.abs(change),
      isPositive,
      isNeutral,
      icon: isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
    };
  };

  const trend = getTrend();

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{title}</div>
          
          <div className="flex items-center justify-between">
            <div className={cn(
              "text-2xl font-bold",
              format === 'currency' && value > 0 && "text-green-400",
              format === 'currency' && value < 0 && "text-red-400"
            )}>
              {formatValue(value)}{suffix}
            </div>

            {trend && (
              <Badge 
                variant="secondary"
                className={cn(
                  "gap-1",
                  trend.isPositive && "bg-green-400/10 text-green-400 border-green-400/20",
                  !trend.isPositive && !trend.isNeutral && "bg-red-400/10 text-red-400 border-red-400/20"
                )}
              >
                <trend.icon className="h-3 w-3" />
                {trend.change.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🔌 **API Documentation Component Template**

```tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example: string;
}

interface APIDocumentationProps {
  endpoint: APIEndpoint;
  className?: string;
}

export function APIDocumentation({ endpoint, className }: APIDocumentationProps) {
  const [copiedExample, setCopiedExample] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const copyToClipboard = async (text: string, type: 'example' | 'response') => {
    await navigator.clipboard.writeText(text);
    
    if (type === 'example') {
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'POST': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'PUT': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'DELETE': return 'bg-red-400/10 text-red-400 border-red-400/20';
      default: return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  return (
    <Card className={cn("gradient-bg border-primary/20", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge className={getMethodColor(endpoint.method)}>
            {endpoint.method}
          </Badge>
          <code className="text-primary font-mono text-sm bg-secondary/50 px-2 py-1 rounded">
            {endpoint.path}
          </code>
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="parameters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-2">
            {endpoint.parameters?.length ? (
              <div className="space-y-2">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <div>
                      <code className="text-primary">{param.name}</code>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {param.type}
                      </Badge>
                      {param.required && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {param.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No parameters required</p>
            )}
          </TabsContent>

          <TabsContent value="example">
            <div className="relative">
              <pre className="bg-secondary/50 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{endpoint.example}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(endpoint.example, 'example')}
              >
                {copiedExample ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="response">
            <div className="relative">
              <pre className="bg-secondary/50 rounded-lg p-4 text-sm overflow-x-auto">
                <code>{endpoint.response}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(endpoint.response, 'response')}
              >
                {copiedResponse ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

## 🎯 **Usage Guidelines**

### **1. File Naming Convention**
```
src/components/[category]/[ComponentName].tsx
```

### **2. Import Structure**
```tsx
// React & Next.js
import { useState, useEffect } from 'react';

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import { Icon } from "lucide-react";

// Utils & Hooks
import { cn } from "@/lib/utils";
import { useCustomHook } from "@/lib/hooks/use-custom-hook";

// Types
import type { CustomType } from "@/lib/types";
```

### **3. Props Interface**
```tsx
interface ComponentProps {
  // Required props first
  title: string;
  data: DataType[];
  
  // Optional props with defaults
  className?: string;
  isLoading?: boolean;
  
  // Event handlers
  onSelect?: (id: string) => void;
  onChange?: (value: string) => void;
}
```

### **4. State Management**
```tsx
// Local state
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// Loading states
const [isLoading, setIsLoading] = useState(false);

// Form data
const [formData, setFormData] = useState<FormType>({});
```

---

**🧩 Ezekkel a template-ekkel gyorsan és konzisztensen tudsz új komponenseket létrehozni a Phase D fejlesztésekhez!**
