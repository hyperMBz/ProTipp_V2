# ProTipp V2 - Bet Tracker Komponens Architektúra

**Verzió:** 1.0  
**Dátum:** 2024. január 26.  
**Architect:** BMad Master  
**Státusz:** Ready for Development  
**Kapcsolódó Story:** 1.15 - Sprint 5  

## 📋 **1. ARCHITEKTÚRA ÁTTEKINTÉS**

### **1.1 Komponens Hierarchia**
```
BetTrackerProvider (Context)
├── BetTrackerPanel (Main Container)
│   ├── BetTrackerHeader
│   ├── BetTrackerList
│   │   └── BetTrackerItem[]
│   └── BetTrackerFooter
├── BetTrackerButton (Add Button)
└── BetTrackerHooks (Custom Hooks)
```

### **1.2 Adatfolyam**
```
User Action → BetTrackerButton → Context → API → Database
                ↓
            Real-time Update ← Supabase ← Database
                ↓
            UI Update ← Context ← Hook
```

### **1.3 State Management**
- **Global State:** React Context (BetTrackerProvider)
- **Server State:** TanStack Query (API calls)
- **Local State:** useState (component-specific)
- **Real-time:** Supabase Realtime subscriptions

## 🏗️ **2. KOMPONENS SPECIFIKÁCIÓK**

### **2.1 BetTrackerProvider**

#### **2.1.1 Felelősségek**
- Global state management
- API calls coordination
- Real-time subscription management
- Error handling
- Loading states

#### **2.1.2 Interface**
```tsx
interface BetTrackerContextType {
  // State
  trackedBets: BetTrackerItem[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  addToTracker: (opportunity: ArbitrageOpportunity) => Promise<void>;
  removeFromTracker: (id: string) => Promise<void>;
  updateBet: (id: string, updates: Partial<BetTrackerItem>) => Promise<void>;
  clearTracker: () => Promise<void>;
  
  // Utilities
  isAdded: (opportunityId: string) => boolean;
  getBetById: (id: string) => BetTrackerItem | undefined;
}
```

#### **2.1.3 Implementation**
```tsx
export function BetTrackerProvider({ children }: { children: React.ReactNode }) {
  const [trackedBets, setTrackedBets] = useState<BetTrackerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // TanStack Query hooks
  const { data: bets, refetch } = useQuery({
    queryKey: ['bet-tracker'],
    queryFn: fetchTrackedBets,
  });
  
  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('bet-tracker-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bet_tracker',
        filter: `user_id=eq.${userId}`
      }, handleRealtimeUpdate)
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  // Context value
  const value = {
    trackedBets,
    isLoading,
    error,
    addToTracker,
    removeFromTracker,
    updateBet,
    clearTracker,
    isAdded,
    getBetById,
  };
  
  return (
    <BetTrackerContext.Provider value={value}>
      {children}
    </BetTrackerContext.Provider>
  );
}
```

### **2.2 BetTrackerButton**

#### **2.2.1 Felelősségek**
- Visual feedback for add/remove actions
- Integration with ArbitrageTable
- Optimistic updates
- Accessibility support

#### **2.2.2 Interface**
```tsx
interface BetTrackerButtonProps {
  opportunity: ArbitrageOpportunity;
  onAdd?: (opportunity: ArbitrageOpportunity) => void;
  onRemove?: (id: string) => void;
  isAdded?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### **2.2.3 Implementation**
```tsx
export function BetTrackerButton({
  opportunity,
  onAdd,
  onRemove,
  isAdded = false,
  disabled = false,
  size = 'md',
  className
}: BetTrackerButtonProps) {
  const { addToTracker, removeFromTracker, isAdded: checkIsAdded } = useBetTracker();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const actuallyAdded = isAdded || checkIsAdded(opportunity.id);
  
  const handleClick = async () => {
    if (disabled) return;
    
    setIsAnimating(true);
    
    try {
      if (actuallyAdded) {
        await removeFromTracker(opportunity.id);
        onRemove?.(opportunity.id);
      } else {
        await addToTracker(opportunity);
        onAdd?.(opportunity);
      }
    } catch (error) {
      console.error('Bet tracker action failed:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  
  return (
    <Button
      size={size}
      variant={actuallyAdded ? "default" : "outline"}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "transition-all duration-200",
        isAnimating && "scale-95",
        actuallyAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
      aria-label={actuallyAdded ? "Eltávolítás a Bet Tracker-ből" : "Hozzáadás a Bet Tracker-hez"}
    >
      {actuallyAdded ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  );
}
```

### **2.3 BetTrackerPanel**

#### **2.3.1 Felelősségek**
- Main container for tracked bets
- Responsive layout management
- Panel visibility control
- Integration with dashboard

#### **2.3.2 Interface**
```tsx
interface BetTrackerPanelProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  position?: 'right' | 'left' | 'bottom';
  maxHeight?: string;
}
```

#### **2.3.3 Implementation**
```tsx
export function BetTrackerPanel({
  className,
  isOpen = true,
  onToggle,
  position = 'right',
  maxHeight = 'calc(100vh - 2rem)'
}: BetTrackerPanelProps) {
  const { trackedBets, isLoading, error } = useBetTracker();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const positionClasses = {
    right: 'fixed right-4 top-1/2 -translate-y-1/2',
    left: 'fixed left-4 top-1/2 -translate-y-1/2',
    bottom: 'fixed bottom-4 left-1/2 -translate-x-1/2'
  };
  
  return (
    <Card className={cn(
      "w-80 shadow-lg transition-all duration-300",
      positionClasses[position],
      isCollapsed && "w-12",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Bet Tracker</span>
              <Badge variant="outline" className="ml-2">
                {trackedBets.length}
              </Badge>
            </CardTitle>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Hiba történt a betöltés során</p>
              </div>
            ) : trackedBets.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Nincsenek hozzáadott fogadások</p>
              </div>
            ) : (
              <BetTrackerList bets={trackedBets} />
            )}
          </div>
          
          {trackedBets.length > 0 && (
            <BetTrackerFooter />
          )}
        </CardContent>
      )}
    </Card>
  );
}
```

### **2.4 BetTrackerItem**

#### **2.4.1 Felelősségek**
- Individual bet display
- Inline editing capabilities
- Real-time updates
- Action buttons

#### **2.4.2 Interface**
```tsx
interface BetTrackerItemProps {
  bet: BetTrackerItem;
  onUpdate: (updates: Partial<BetTrackerItem>) => void;
  onRemove: () => void;
  isEditing?: boolean;
  className?: string;
}
```

#### **2.4.3 Implementation**
```tsx
export function BetTrackerItem({
  bet,
  onUpdate,
  onRemove,
  isEditing = false,
  className
}: BetTrackerItemProps) {
  const [isEditingLocal, setIsEditingLocal] = useState(isEditing);
  const [stake, setStake] = useState(bet.stake?.toString() || '');
  const [notes, setNotes] = useState(bet.notes || '');
  
  const handleSave = () => {
    onUpdate({
      stake: parseFloat(stake) || 0,
      notes: notes.trim() || null
    });
    setIsEditingLocal(false);
  };
  
  const handleCancel = () => {
    setStake(bet.stake?.toString() || '');
    setNotes(bet.notes || '');
    setIsEditingLocal(false);
  };
  
  return (
    <div className={cn(
      "p-3 border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors",
      className
    )}>
      <div className="space-y-2">
        {/* Event Name */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{bet.event_name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {bet.sport}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {bet.bookmaker}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Odds */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Odds:</span>
          <span className="font-mono text-sm font-medium">{bet.odds.toFixed(2)}</span>
        </div>
        
        {/* Stake */}
        {isEditingLocal ? (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tét (Ft):</label>
            <Input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="h-8 text-sm"
              placeholder="0"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tét:</span>
            <span className="text-sm font-medium">
              {bet.stake ? `${bet.stake.toLocaleString()} Ft` : 'Nincs megadva'}
            </span>
          </div>
        )}
        
        {/* Notes */}
        {isEditingLocal ? (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Jegyzet:</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-16 text-sm resize-none"
              placeholder="Opcionális jegyzet..."
            />
          </div>
        ) : bet.notes ? (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Jegyzet:</span>
            <p className="text-xs text-muted-foreground line-clamp-2">{bet.notes}</p>
          </div>
        ) : null}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {isEditingLocal ? (
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave} className="h-6 text-xs">
                Mentés
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 text-xs">
                Mégse
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingLocal(true)}
              className="h-6 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Szerkesztés
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(bet.added_at), { addSuffix: true, locale: hu })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔌 **3. CUSTOM HOOKS**

### **3.1 useBetTracker**

#### **3.1.1 Felelősségek**
- Context access
- Action dispatching
- State synchronization
- Error handling

#### **3.1.2 Implementation**
```tsx
export function useBetTracker() {
  const context = useContext(BetTrackerContext);
  
  if (!context) {
    throw new Error('useBetTracker must be used within BetTrackerProvider');
  }
  
  return context;
}
```

### **3.2 useBetTrackerAPI**

#### **3.2.1 Felelősségek**
- API calls management
- TanStack Query integration
- Error handling
- Optimistic updates

#### **3.2.2 Implementation**
```tsx
export function useBetTrackerAPI() {
  const queryClient = useQueryClient();
  
  const addBetMutation = useMutation({
    mutationFn: addBetToTracker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet-tracker'] });
    },
    onError: (error) => {
      console.error('Failed to add bet to tracker:', error);
    }
  });
  
  const removeBetMutation = useMutation({
    mutationFn: removeBetFromTracker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet-tracker'] });
    },
    onError: (error) => {
      console.error('Failed to remove bet from tracker:', error);
    }
  });
  
  const updateBetMutation = useMutation({
    mutationFn: updateBetInTracker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bet-tracker'] });
    },
    onError: (error) => {
      console.error('Failed to update bet in tracker:', error);
    }
  });
  
  return {
    addBet: addBetMutation.mutateAsync,
    removeBet: removeBetMutation.mutateAsync,
    updateBet: updateBetMutation.mutateAsync,
    isAdding: addBetMutation.isPending,
    isRemoving: removeBetMutation.isPending,
    isUpdating: updateBetMutation.isPending,
  };
}
```

## 📊 **4. ADATBÁZIS INTEGRÁCIÓ**

### **4.1 API Functions**

#### **4.1.1 fetchTrackedBets**
```tsx
export async function fetchTrackedBets(): Promise<BetTrackerItem[]> {
  const { data, error } = await supabase
    .from('bet_tracker')
    .select('*')
    .order('added_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to fetch tracked bets: ${error.message}`);
  }
  
  return data || [];
}
```

#### **4.1.2 addBetToTracker**
```tsx
export async function addBetToTracker(bet: AddBetRequest): Promise<BetTrackerItem> {
  const { data, error } = await supabase
    .from('bet_tracker')
    .insert([bet])
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to add bet to tracker: ${error.message}`);
  }
  
  return data;
}
```

#### **4.1.3 removeBetFromTracker**
```tsx
export async function removeBetFromTracker(id: string): Promise<void> {
  const { error } = await supabase
    .from('bet_tracker')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Failed to remove bet from tracker: ${error.message}`);
  }
}
```

#### **4.1.4 updateBetInTracker**
```tsx
export async function updateBetInTracker(
  id: string, 
  updates: Partial<BetTrackerItem>
): Promise<BetTrackerItem> {
  const { data, error } = await supabase
    .from('bet_tracker')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update bet in tracker: ${error.message}`);
  }
  
  return data;
}
```

### **4.2 Real-time Subscriptions**

#### **4.2.1 Subscription Setup**
```tsx
export function useBetTrackerRealtime(userId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel('bet-tracker-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bet_tracker',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Bet tracker real-time update:', payload);
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['bet-tracker'] });
        
        // Show toast notification
        if (payload.eventType === 'INSERT') {
          toast.success('Új fogadás hozzáadva a Bet Tracker-hez');
        } else if (payload.eventType === 'UPDATE') {
          toast.info('Fogadás frissítve');
        } else if (payload.eventType === 'DELETE') {
          toast.info('Fogadás eltávolítva a Bet Tracker-ből');
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}
```

## 🎨 **5. STYLING ÉS ANIMÁCIÓK**

### **5.1 CSS Classes**

#### **5.1.1 Component Classes**
```css
.bet-tracker-panel {
  @apply w-80 shadow-lg transition-all duration-300;
}

.bet-tracker-button {
  @apply transition-all duration-200 hover:scale-105;
}

.bet-tracker-button.added {
  @apply bg-green-600 hover:bg-green-700 text-white;
}

.bet-tracker-item {
  @apply p-3 border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors;
}

.bet-tracker-item-editing {
  @apply bg-primary/5 border-primary/20;
}
```

#### **5.1.2 Animation Classes**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.bet-tracker-panel-enter {
  animation: slideInRight 0.3s ease-out;
}

.bet-tracker-panel-exit {
  animation: slideOutRight 0.3s ease-in;
}
```

### **5.2 Responsive Design**

#### **5.2.1 Mobile Styles**
```css
@media (max-width: 768px) {
  .bet-tracker-panel {
    @apply w-full h-64 bottom-0 left-0 right-0 top-auto;
  }
  
  .bet-tracker-button {
    @apply h-10 w-10;
  }
  
  .bet-tracker-item {
    @apply p-4;
  }
}
```

#### **5.2.2 Tablet Styles**
```css
@media (min-width: 768px) and (max-width: 1024px) {
  .bet-tracker-panel {
    @apply w-72;
  }
  
  .bet-tracker-button {
    @apply h-9 w-9;
  }
}
```

## 🧪 **6. TESZTELÉSI STRATÉGIA**

### **6.1 Unit Tests**

#### **6.1.1 BetTrackerButton Tests**
```tsx
describe('BetTrackerButton', () => {
  it('renders with plus icon when not added', () => {
    render(<BetTrackerButton opportunity={mockOpportunity} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });
  
  it('renders with check icon when added', () => {
    render(<BetTrackerButton opportunity={mockOpportunity} isAdded />);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
  
  it('calls onAdd when clicked and not added', async () => {
    const onAdd = jest.fn();
    render(<BetTrackerButton opportunity={mockOpportunity} onAdd={onAdd} />);
    
    await user.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledWith(mockOpportunity);
  });
});
```

#### **6.1.2 BetTrackerPanel Tests**
```tsx
describe('BetTrackerPanel', () => {
  it('renders empty state when no bets', () => {
    render(<BetTrackerPanel />);
    expect(screen.getByText('Nincsenek hozzáadott fogadások')).toBeInTheDocument();
  });
  
  it('renders bet list when bets exist', () => {
    render(<BetTrackerPanel />, {
      wrapper: ({ children }) => (
        <BetTrackerProvider>
          {children}
        </BetTrackerProvider>
      )
    });
    // Mock bets and test rendering
  });
});
```

### **6.2 Integration Tests**

#### **6.2.1 API Integration Tests**
```tsx
describe('Bet Tracker API Integration', () => {
  it('adds bet to tracker successfully', async () => {
    const mockAddBet = jest.fn().mockResolvedValue(mockBet);
    
    render(<BetTrackerButton opportunity={mockOpportunity} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockAddBet).toHaveBeenCalledWith(mockOpportunity);
  });
  
  it('handles API errors gracefully', async () => {
    const mockAddBet = jest.fn().mockRejectedValue(new Error('API Error'));
    
    render(<BetTrackerButton opportunity={mockOpportunity} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Hiba történt')).toBeInTheDocument();
  });
});
```

### **6.3 E2E Tests**

#### **6.3.1 User Workflow Tests**
```tsx
describe('Bet Tracker User Workflow', () => {
  it('allows user to add and manage bets', async () => {
    await page.goto('/dashboard');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]');
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toBeVisible();
    
    // Edit bet
    await page.click('[data-testid="edit-bet-button"]');
    await page.fill('[data-testid="stake-input"]', '1000');
    await page.click('[data-testid="save-bet-button"]');
    
    // Remove bet
    await page.click('[data-testid="remove-bet-button"]');
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toContainText('Nincsenek hozzáadott fogadások');
  });
});
```

## 📈 **7. PERFORMANCE OPTIMALIZÁCIÓ**

### **7.1 Memoization**

#### **7.1.1 Component Memoization**
```tsx
export const BetTrackerItem = memo(function BetTrackerItem({
  bet,
  onUpdate,
  onRemove,
  isEditing = false,
  className
}: BetTrackerItemProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.bet.id === nextProps.bet.id &&
    prevProps.bet.updated_at === nextProps.bet.updated_at &&
    prevProps.isEditing === nextProps.isEditing
  );
});
```

#### **7.1.2 Callback Memoization**
```tsx
export function BetTrackerPanel() {
  const { trackedBets, removeFromTracker, updateBet } = useBetTracker();
  
  const handleRemove = useCallback((id: string) => {
    removeFromTracker(id);
  }, [removeFromTracker]);
  
  const handleUpdate = useCallback((id: string, updates: Partial<BetTrackerItem>) => {
    updateBet(id, updates);
  }, [updateBet]);
  
  // Component implementation
}
```

### **7.2 Virtualization**

#### **7.2.1 Large List Handling**
```tsx
import { FixedSizeList as List } from 'react-window';

export function BetTrackerList({ bets }: { bets: BetTrackerItem[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <BetTrackerItem
        bet={bets[index]}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
      />
    </div>
  );
  
  return (
    <List
      height={400}
      itemCount={bets.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## 🔒 **8. BIZTONSÁG ÉS VALIDÁCIÓ**

### **8.1 Input Validation**

#### **8.1.1 Stake Validation**
```tsx
const validateStake = (stake: string): boolean => {
  const numStake = parseFloat(stake);
  return !isNaN(numStake) && numStake >= 0 && numStake <= 1000000;
};
```

#### **8.1.2 Notes Validation**
```tsx
const validateNotes = (notes: string): boolean => {
  return notes.length <= 500; // Max 500 characters
};
```

### **8.2 Error Boundaries**

#### **8.2.1 Bet Tracker Error Boundary**
```tsx
export class BetTrackerErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Bet Tracker Error:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-400">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm">Hiba történt a Bet Tracker betöltése során</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
            className="mt-2"
          >
            Újrapróbálás
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. január 26.  
**Architect:** BMad Master  
**Státusz:** Ready for Development - Sprint 5
