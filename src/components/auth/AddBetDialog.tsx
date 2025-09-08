"use client";

import { useState } from 'react';
import { useAddBet } from '@/lib/hooks/use-bet-history';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface AddBetDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const sportsOptions = [
  "Labdarúgás", "Kosárlabda", "Tenisz", "Amerikai Futball",
  "Baseball", "Jégkorong", "Ökölvívás", "MMA", "Esports",
  "Golf", "Darts", "Snooker", "Motorsport", "Krikett"
];

const bookmakersOptions = [
  "Bet365", "Unibet", "Tipico", "1xBet", "Betfair", "Pinnacle",
  "William Hill", "Bwin", "888Sport", "LeoVegas", "Betsson",
  "ComeOn", "Sportingbet"
];

export function AddBetDialog({ children, open, onOpenChange }: AddBetDialogProps) {
  const addBetMutation = useAddBet();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    event_name: '',
    sport: '',
    bookmaker: '',
    odds: '',
    stake: '',
    outcome: '',
    notes: ''
  });

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);

    if (!newOpen) {
      // Reset form when dialog closes
      setError(null);
      setSuccess(null);
      setFormData({
        event_name: '',
        sport: '',
        bookmaker: '',
        odds: '',
        stake: '',
        outcome: '',
        notes: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.event_name || !formData.sport || !formData.bookmaker ||
        !formData.odds || !formData.stake || !formData.outcome) {
      setError('Kérjük töltse ki az összes kötelező mezőt');
      return;
    }

    const odds = parseFloat(formData.odds);
    const stake = parseFloat(formData.stake);

    if (isNaN(odds) || odds <= 1) {
      setError('Az odds értéknek 1-nél nagyobb számnak kell lennie');
      return;
    }

    if (isNaN(stake) || stake <= 0) {
      setError('A tét értéknek pozitív számnak kell lennie');
      return;
    }

    try {
      await addBetMutation.mutateAsync({
        event_name: formData.event_name,
        sport: formData.sport,
        bookmaker: formData.bookmaker,
        match_id: formData.event_name, // Using event_name as match_id for now
        bet_type: formData.outcome,
        odds,
        stake,
        potential_return: stake * odds,
        outcome: formData.outcome,
        status: 'pending',
        placed_at: new Date().toISOString(),
        notes: formData.notes || undefined,
      });

      setSuccess('Fogadás sikeresen hozzáadva!');
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hiba történt a fogadás hozzáadása során');
      }
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePotentialReturn = () => {
    const odds = parseFloat(formData.odds);
    const stake = parseFloat(formData.stake);

    if (!isNaN(odds) && !isNaN(stake) && odds > 1 && stake > 0) {
      return stake * odds;
    }
    return 0;
  };

  const calculatePotentialProfit = () => {
    const potentialReturn = calculatePotentialReturn();
    const stake = parseFloat(formData.stake);

    if (potentialReturn > 0 && !isNaN(stake)) {
      return potentialReturn - stake;
    }
    return 0;
  };

  const actualOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Új fogadás hozzáadása</span>
          </DialogTitle>
          <DialogDescription>
            Add hozzá a fogadásodat a personal bet tracker-hez
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event_name">Esemény neve *</Label>
            <Input
              id="event_name"
              placeholder="pl. Barcelona vs Real Madrid"
              value={formData.event_name}
              onChange={(e) => updateFormField('event_name', e.target.value)}
              disabled={addBetMutation.isPending}
            />
          </div>

          {/* Sport & Bookmaker */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
                              <Select value={formData.sport} onValueChange={(value: string) => updateFormField('sport', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz sportot" />
                </SelectTrigger>
                <SelectContent>
                  {sportsOptions.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookmaker">Fogadóiroda *</Label>
                              <Select value={formData.bookmaker} onValueChange={(value: string) => updateFormField('bookmaker', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz fogadóirodát" />
                </SelectTrigger>
                <SelectContent>
                  {bookmakersOptions.map((bookmaker) => (
                    <SelectItem key={bookmaker} value={bookmaker}>
                      {bookmaker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label htmlFor="outcome">Kimenetel *</Label>
            <Input
              id="outcome"
              placeholder="pl. Barcelona győzelem, Over 2.5 Goals"
              value={formData.outcome}
              onChange={(e) => updateFormField('outcome', e.target.value)}
              disabled={addBetMutation.isPending}
            />
          </div>

          {/* Odds & Stake */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odds">Odds *</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                min="1.01"
                placeholder="2.50"
                value={formData.odds}
                onChange={(e) => updateFormField('odds', e.target.value)}
                disabled={addBetMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake">Tét (Ft) *</Label>
              <Input
                id="stake"
                type="number"
                min="1"
                placeholder="10000"
                value={formData.stake}
                onChange={(e) => updateFormField('stake', e.target.value)}
                disabled={addBetMutation.isPending}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Megjegyzések</Label>
            <Input
              id="notes"
              placeholder="Opcionális megjegyzések..."
              value={formData.notes}
              onChange={(e) => updateFormField('notes', e.target.value)}
              disabled={addBetMutation.isPending}
            />
          </div>

          {/* Calculation Summary */}
          {formData.odds && formData.stake && (
            <Card className="bg-secondary/30 border-primary/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Potenciális nyeremény:</div>
                    <div className="font-semibold text-primary">
                      {formatNumber(calculatePotentialReturn())} Ft
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Potenciális profit:</div>
                    <div className="font-semibold text-green-400">
                      +{formatNumber(calculatePotentialProfit())} Ft
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={addBetMutation.isPending}
          >
            {addBetMutation.isPending ? (
              'Hozzáadás...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Fogadás hozzáadása
              </>
            )}
          </Button>
        </form>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 text-green-700 bg-green-50/10">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
