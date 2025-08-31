"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Wifi, 
  WifiOff, 
  Image, 
  Video, 
  Download,
  Settings,
  Zap,
  Battery,
  Smartphone,
  Monitor
} from "lucide-react";
import { useMobilePreferences, useDeviceInfo } from "@/lib/hooks/use-mobile";

interface DataSaverProps {
  className?: string;
  onSettingsChange?: (settings: DataSaverSettings) => void;
}

interface DataSaverSettings {
  enabled: boolean;
  imageQuality: number;
  videoQuality: number;
  autoSync: boolean;
  backgroundSync: boolean;
  compressionLevel: number;
  cacheSize: number;
}

interface DataUsage {
  images: number;
  videos: number;
  api: number;
  total: number;
  saved: number;
}

export function DataSaver({
  className,
  onSettingsChange,
}: DataSaverProps) {
  const { isMobile, isTablet } = useDeviceInfo();
  const preferences = useMobilePreferences();
  
  const [settings, setSettings] = useState<DataSaverSettings>({
    enabled: preferences.dataSaver,
    imageQuality: 0.7,
    videoQuality: 0.5,
    autoSync: true,
    backgroundSync: false,
    compressionLevel: 0.8,
    cacheSize: 50,
  });

  const [dataUsage, setDataUsage] = useState<DataUsage>({
    images: 0,
    videos: 0,
    api: 0,
    total: 0,
    saved: 0,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Beállítások változásának kezelése
  useEffect(() => {
    onSettingsChange?.(settings);
    applyDataSaverSettings(settings);
  }, [settings, onSettingsChange]);

  // Adatmentési beállítások alkalmazása
  const applyDataSaverSettings = (newSettings: DataSaverSettings) => {
    if (newSettings.enabled) {
      // Képminőség csökkentése
      document.documentElement.style.setProperty(
        '--image-quality', 
        newSettings.imageQuality.toString()
      );

      // Videóminőség csökkentése
      document.documentElement.style.setProperty(
        '--video-quality', 
        newSettings.videoQuality.toString()
      );

      // Kompresszió beállítása
      document.documentElement.style.setProperty(
        '--compression-level', 
        newSettings.compressionLevel.toString()
      );

      // Cache méret beállítása
      document.documentElement.style.setProperty(
        '--cache-size', 
        `${newSettings.cacheSize}MB`
      );
    } else {
      // Alapértelmezett értékek visszaállítása
      document.documentElement.style.removeProperty('--image-quality');
      document.documentElement.style.removeProperty('--video-quality');
      document.documentElement.style.removeProperty('--compression-level');
      document.documentElement.style.removeProperty('--cache-size');
    }
  };

  // Adatmentési optimalizálás
  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      // Képek optimalizálása
      await optimizeImages();
      
      // Videók optimalizálása
      await optimizeVideos();
      
      // Cache tisztítása
      await clearUnusedCache();
      
      // Adatmennyiség újraszámítása
      await calculateDataUsage();
      
      // Sikeres optimalizálás
      setDataUsage(prev => ({
        ...prev,
        saved: prev.saved + Math.floor(prev.total * 0.3), // 30% megtakarítás
      }));

    } catch (error) {
      console.error('Optimalizálási hiba:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Képek optimalizálása
  const optimizeImages = async () => {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      if (settings.enabled) {
        // Képminőség csökkentése
        const originalSrc = img.getAttribute('data-original-src') || img.src;
        img.setAttribute('data-original-src', originalSrc);
        
        // Optimalizált URL generálása
        const optimizedUrl = generateOptimizedImageUrl(originalSrc, {
          quality: settings.imageQuality,
          width: isMobile ? 800 : 1200,
        });
        
        img.src = optimizedUrl;
      } else {
        // Eredeti kép visszaállítása
        const originalSrc = img.getAttribute('data-original-src');
        if (originalSrc) {
          img.src = originalSrc;
          img.removeAttribute('data-original-src');
        }
      }
    });
  };

  // Videók optimalizálása
  const optimizeVideos = async () => {
    const videos = document.querySelectorAll('video');
    
    videos.forEach((video) => {
      if (settings.enabled) {
        // Videóminőség csökkentése
        video.setAttribute('data-original-quality', video.getAttribute('data-quality') || 'high');
        video.setAttribute('data-quality', 'low');
        
        // Autoplay letiltása
        video.removeAttribute('autoplay');
        video.setAttribute('preload', 'none');
      } else {
        // Eredeti minőség visszaállítása
        const originalQuality = video.getAttribute('data-original-quality');
        if (originalQuality) {
          video.setAttribute('data-quality', originalQuality);
          video.removeAttribute('data-original-quality');
        }
      }
    });
  };

  // Használaton kívüli cache törlése
  const clearUnusedCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const unusedCaches = cacheNames.filter(name => 
          !name.includes('protip-v2') || name.includes('old')
        );
        
        await Promise.all(
          unusedCaches.map(name => caches.delete(name))
        );
        
        console.log('Használaton kívüli cache törölve');
      } catch (error) {
        console.error('Cache törlési hiba:', error);
      }
    }
  };

  // Adatmennyiség számítása
  const calculateDataUsage = async () => {
    // Szimulált adatmennyiség számítás
    const newDataUsage: DataUsage = {
      images: Math.floor(Math.random() * 50) + 10, // 10-60 MB
      videos: Math.floor(Math.random() * 100) + 20, // 20-120 MB
      api: Math.floor(Math.random() * 20) + 5, // 5-25 MB
      total: 0,
      saved: dataUsage.saved,
    };
    
    newDataUsage.total = newDataUsage.images + newDataUsage.videos + newDataUsage.api;
    
    setDataUsage(newDataUsage);
  };

  // Optimalizált kép URL generálása
  const generateOptimizedImageUrl = (originalUrl: string, options: {
    quality: number;
    width: number;
  }) => {
    // Itt implementálhatod a kép optimalizáló szolgáltatás integrációját
    const params = new URLSearchParams();
    params.append('q', options.quality.toString());
    params.append('w', options.width.toString());
    params.append('f', 'webp');
    
    return `${originalUrl}?${params.toString()}`;
  };

  // Beállítások frissítése
  const updateSetting = <K extends keyof DataSaverSettings>(
    key: K,
    value: DataSaverSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Adatmentési javaslatok
  const getDataSavingSuggestions = () => {
    const suggestions = [];
    
    if (dataUsage.images > 30) {
      suggestions.push('Képek minőségének csökkentése');
    }
    
    if (dataUsage.videos > 80) {
      suggestions.push('Videók automatikus lejátszásának letiltása');
    }
    
    if (dataUsage.api > 15) {
      suggestions.push('API hívások gyakoriságának csökkentése');
    }
    
    if (settings.cacheSize > 100) {
      suggestions.push('Cache méret csökkentése');
    }
    
    return suggestions;
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Save className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Adatmentés</h3>
            <p className="text-sm text-muted-foreground">
              Optimalizálja az adatfelhasználást
            </p>
          </div>
        </div>
        
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
      </div>

      {/* Adatmennyiség */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Képek</span>
            <span className="font-medium">{dataUsage.images} MB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Videók</span>
            <span className="font-medium">{dataUsage.videos} MB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API hívások</span>
            <span className="font-medium">{dataUsage.api} MB</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Összesen</span>
            <span className="font-medium">{dataUsage.total} MB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Megtakarítás</span>
            <span className="font-medium text-green-600">{dataUsage.saved} MB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hatékonyság</span>
            <Badge variant="secondary" className="text-xs">
              {dataUsage.total > 0 ? Math.round((dataUsage.saved / dataUsage.total) * 100) : 0}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Optimalizálási beállítások */}
      {settings.enabled && (
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Képminőség</label>
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.imageQuality * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.imageQuality]}
              onValueChange={([value]) => updateSetting('imageQuality', value)}
              max={1}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Videóminőség</label>
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.videoQuality * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.videoQuality]}
              onValueChange={([value]) => updateSetting('videoQuality', value)}
              max={1}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Cache méret</label>
              <span className="text-xs text-muted-foreground">
                {settings.cacheSize} MB
              </span>
            </div>
            <Slider
              value={[settings.cacheSize]}
              onValueChange={([value]) => updateSetting('cacheSize', value)}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Automatikus beállítások */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Automatikus szinkronizálás</span>
          </div>
          <Switch
            checked={settings.autoSync}
            onCheckedChange={(checked) => updateSetting('autoSync', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Háttérben szinkronizálás</span>
          </div>
          <Switch
            checked={settings.backgroundSync}
            onCheckedChange={(checked) => updateSetting('backgroundSync', checked)}
          />
        </div>
      </div>

      {/* Optimalizálási javaslatok */}
      {getDataSavingSuggestions().length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Optimalizálási javaslatok</h4>
          <div className="space-y-2">
            {getDataSavingSuggestions().map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Műveletek */}
      <div className="flex space-x-3">
        <Button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex-1"
        >
          {isOptimizing ? (
            <>
              <Settings className="h-4 w-4 animate-spin mr-2" />
              Optimalizálás...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Optimalizálás
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={calculateDataUsage}
          className="flex-1"
        >
          <Monitor className="h-4 w-4 mr-2" />
          Frissítés
        </Button>
      </div>

      {/* Eszköz információk */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            {isMobile ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            <span>{isMobile ? 'Mobil' : isTablet ? 'Tablet' : 'Asztali'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Battery className="h-3 w-3" />
            <span>Adatmentés aktív</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
