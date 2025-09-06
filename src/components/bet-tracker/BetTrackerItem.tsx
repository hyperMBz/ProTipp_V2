"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  Target,
  DollarSign
} from 'lucide-react';
import { BetTrackerItem as BetTrackerItemType } from '@/lib/types/bet-tracker';
import { useBetTrackerActions } from './BetTrackerProvider';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BetTrackerItemProps {
  bet: BetTrackerItemType;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BetTrackerItemType>) => void;
  isEditing?: boolean;
}

export function BetTrackerItem({ 
  bet, 
  onRemove, 
  onUpdate, 
  isEditing = false 
}: BetTrackerItemProps) {
  const { updateBet } = useBetTrackerActions();
  const [isEditMode, setIsEditMode] = useState(isEditing);
  const [editData, setEditData] = useState({
    stake: bet.stake || 0,
    notes: bet.notes || '',
    status: bet.status
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    
    try {
      await updateBet(bet.id, editData);
      onUpdate(bet.id, editData);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating bet:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      stake: bet.stake || 0,
      notes: bet.notes || '',
      status: bet.status
    });
    setIsEditMode(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <TrendingUp className="h-3 w-3" />;
      case 'lost':
        return <X className="h-3 w-3" />;
      case 'cancelled':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getProfitColor = (profit?: number) => {
    if (!profit) return 'text-muted-foreground';
    return profit > 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Card className="gradient-bg border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {bet.sport}
              </Badge>
              <Badge
                className={cn('text-xs flex items-center gap-1', getStatusColor(bet.status))}
              >
                {getStatusIcon(bet.status)}
                {bet.status === 'pending' ? 'Függőben' : 
                 bet.status === 'won' ? 'Nyert' :
                 bet.status === 'lost' ? 'Vesztett' : 'Törölve'}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {bet.event_name}
            </h3>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {bet.bookmaker}
              </span>
              <span className="font-mono">
                {bet.odds ? bet.odds.toFixed(2) : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {bet.outcome}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isEditMode ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditMode(true)}
                  className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(bet.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Tét (Ft)
                </label>
                <Input
                  type="number"
                  value={editData.stake}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    stake: parseFloat(e.target.value) || 0 
                  }))}
                  className="h-8 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Státusz
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    status: e.target.value as any 
                  }))}
                  className="w-full h-8 px-3 text-sm bg-background border border-border rounded-md"
                >
                  <option value="pending">Függőben</option>
                  <option value="won">Nyert</option>
                  <option value="lost">Vesztett</option>
                  <option value="cancelled">Törölve</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Jegyzetek
              </label>
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                className="min-h-[60px] text-sm"
                placeholder="Jegyzetek hozzáadása..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {bet.stake && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tét:</span>
                <span className="font-semibold">
                  {formatNumber(bet.stake)} Ft
                </span>
              </div>
            )}
            
            {bet.profit !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit:</span>
                <span className={cn('font-semibold', getProfitColor(bet.profit))}>
                  {bet.profit > 0 ? '+' : ''}{formatNumber(bet.profit)} Ft
                </span>
              </div>
            )}
            
            {bet.notes && (
              <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                {bet.notes}
              </div>
            )}
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Hozzáadva: {formatDate(bet.added_at)}</span>
              {bet.settled_at && (
                <span>Lezárva: {formatDate(bet.settled_at)}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
