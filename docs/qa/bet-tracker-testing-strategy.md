# ProTipp V2 - Bet Tracker Tesztelési Stratégia

**Verzió:** 1.0  
**Dátum:** 2024. január 26.  
**QA Lead:** BMad Master  
**Státusz:** Ready for Development  
**Kapcsolódó Story:** 1.15 - Sprint 5  

## 📋 **1. TESZTELÉSI ÁTTEKINTÉS**

### **1.1 Tesztelési Célok**
- **Funkcionális tesztelés:** Minden Bet Tracker funkció működik
- **Integrációs tesztelés:** Komponensek együttműködése
- **Performance tesztelés:** Gyors válaszidők és optimalizáció
- **Accessibility tesztelés:** WCAG 2.1 AA megfelelés
- **Cross-browser tesztelés:** Kompatibilitás minden böngészőben

### **1.2 Tesztelési Szintek**
- **Unit Tests:** Komponens szintű tesztelés
- **Integration Tests:** API és adatbázis integráció
- **E2E Tests:** Teljes felhasználói workflow
- **Performance Tests:** Betöltési idők és memória használat
- **Security Tests:** Adatvédelem és biztonság

## 🧪 **2. UNIT TESZTEK**

### **2.1 BetTrackerButton Tests**

#### **2.1.1 Render Tests**
```tsx
describe('BetTrackerButton', () => {
  it('renders with plus icon when not added', () => {
    render(<BetTrackerButton opportunity={mockOpportunity} />);
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });
  
  it('renders with check icon when added', () => {
    render(<BetTrackerButton opportunity={mockOpportunity} isAdded />);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
  
  it('applies correct styling based on state', () => {
    const { rerender } = render(<BetTrackerButton opportunity={mockOpportunity} />);
    expect(screen.getByRole('button')).toHaveClass('border-primary');
    
    rerender(<BetTrackerButton opportunity={mockOpportunity} isAdded />);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');
  });
});
```

#### **2.1.2 Interaction Tests**
```tsx
describe('BetTrackerButton Interactions', () => {
  it('calls onAdd when clicked and not added', async () => {
    const onAdd = jest.fn();
    render(<BetTrackerButton opportunity={mockOpportunity} onAdd={onAdd} />);
    
    await user.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledWith(mockOpportunity);
  });
  
  it('calls onRemove when clicked and added', async () => {
    const onRemove = jest.fn();
    render(<BetTrackerButton opportunity={mockOpportunity} isAdded onRemove={onRemove} />);
    
    await user.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledWith(mockOpportunity.id);
  });
  
  it('shows loading state during API call', async () => {
    render(<BetTrackerButton opportunity={mockOpportunity} />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### **2.2 BetTrackerPanel Tests**

#### **2.2.1 Display Tests**
```tsx
describe('BetTrackerPanel', () => {
  it('renders empty state when no bets', () => {
    render(<BetTrackerPanel />);
    expect(screen.getByText('Nincsenek hozzáadott fogadások')).toBeInTheDocument();
  });
  
  it('renders bet count in header', () => {
    const mockBets = [mockBet1, mockBet2];
    render(<BetTrackerPanel />, {
      wrapper: ({ children }) => (
        <BetTrackerProvider value={{ trackedBets: mockBets }}>
          {children}
        </BetTrackerProvider>
      )
    });
    expect(screen.getByText('2')).toBeInTheDocument();
  });
  
  it('renders loading state', () => {
    render(<BetTrackerPanel />, {
      wrapper: ({ children }) => (
        <BetTrackerProvider value={{ isLoading: true }}>
          {children}
        </BetTrackerProvider>
      )
    });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

#### **2.2.2 Responsive Tests**
```tsx
describe('BetTrackerPanel Responsive', () => {
  it('applies mobile styles on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    render(<BetTrackerPanel />);
    expect(screen.getByTestId('bet-tracker-panel')).toHaveClass('w-full');
  });
  
  it('applies desktop styles on large screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    render(<BetTrackerPanel />);
    expect(screen.getByTestId('bet-tracker-panel')).toHaveClass('w-80');
  });
});
```

### **2.3 BetTrackerItem Tests**

#### **2.3.1 Display Tests**
```tsx
describe('BetTrackerItem', () => {
  it('displays bet information correctly', () => {
    render(<BetTrackerItem bet={mockBet} onUpdate={jest.fn()} onRemove={jest.fn()} />);
    
    expect(screen.getByText(mockBet.event_name)).toBeInTheDocument();
    expect(screen.getByText(mockBet.sport)).toBeInTheDocument();
    expect(screen.getByText(mockBet.bookmaker)).toBeInTheDocument();
    expect(screen.getByText(mockBet.odds.toFixed(2))).toBeInTheDocument();
  });
  
  it('shows stake when provided', () => {
    render(<BetTrackerItem bet={mockBet} onUpdate={jest.fn()} onRemove={jest.fn()} />);
    expect(screen.getByText(`${mockBet.stake.toLocaleString()} Ft`)).toBeInTheDocument();
  });
  
  it('shows notes when provided', () => {
    render(<BetTrackerItem bet={mockBet} onUpdate={jest.fn()} onRemove={jest.fn()} />);
    expect(screen.getByText(mockBet.notes)).toBeInTheDocument();
  });
});
```

#### **2.3.2 Edit Mode Tests**
```tsx
describe('BetTrackerItem Edit Mode', () => {
  it('enters edit mode when edit button clicked', async () => {
    render(<BetTrackerItem bet={mockBet} onUpdate={jest.fn()} onRemove={jest.fn()} />);
    
    await user.click(screen.getByTestId('edit-button'));
    expect(screen.getByTestId('stake-input')).toBeInTheDocument();
    expect(screen.getByTestId('notes-textarea')).toBeInTheDocument();
  });
  
  it('saves changes when save button clicked', async () => {
    const onUpdate = jest.fn();
    render(<BetTrackerItem bet={mockBet} onUpdate={onUpdate} onRemove={jest.fn()} />);
    
    await user.click(screen.getByTestId('edit-button'));
    await user.clear(screen.getByTestId('stake-input'));
    await user.type(screen.getByTestId('stake-input'), '2000');
    await user.click(screen.getByTestId('save-button'));
    
    expect(onUpdate).toHaveBeenCalledWith({ stake: 2000 });
  });
  
  it('cancels changes when cancel button clicked', async () => {
    render(<BetTrackerItem bet={mockBet} onUpdate={jest.fn()} onRemove={jest.fn()} />);
    
    await user.click(screen.getByTestId('edit-button'));
    await user.clear(screen.getByTestId('stake-input'));
    await user.type(screen.getByTestId('stake-input'), '9999');
    await user.click(screen.getByTestId('cancel-button'));
    
    expect(screen.getByText(`${mockBet.stake.toLocaleString()} Ft`)).toBeInTheDocument();
  });
});
```

## 🔌 **3. INTEGRATION TESZTEK**

### **3.1 API Integration Tests**

#### **3.1.1 Bet Tracker API Tests**
```tsx
describe('Bet Tracker API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('fetches tracked bets successfully', async () => {
    const mockBets = [mockBet1, mockBet2];
    mockFetchTrackedBets.mockResolvedValue(mockBets);
    
    const { result } = renderHook(() => useBetTracker(), {
      wrapper: BetTrackerProvider
    });
    
    await waitFor(() => {
      expect(result.current.trackedBets).toEqual(mockBets);
    });
  });
  
  it('adds bet to tracker successfully', async () => {
    const mockNewBet = { ...mockBet, id: 'new-id' };
    mockAddBetToTracker.mockResolvedValue(mockNewBet);
    
    const { result } = renderHook(() => useBetTracker(), {
      wrapper: BetTrackerProvider
    });
    
    await act(async () => {
      await result.current.addToTracker(mockOpportunity);
    });
    
    expect(mockAddBetToTracker).toHaveBeenCalledWith({
      opportunity_id: mockOpportunity.id,
      event_name: mockOpportunity.event_name,
      sport: mockOpportunity.sport,
      bookmaker: mockOpportunity.bookmaker,
      odds: mockOpportunity.odds
    });
  });
  
  it('handles API errors gracefully', async () => {
    mockAddBetToTracker.mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useBetTracker(), {
      wrapper: BetTrackerProvider
    });
    
    await act(async () => {
      try {
        await result.current.addToTracker(mockOpportunity);
      } catch (error) {
        expect(result.current.error).toBeTruthy();
      }
    });
  });
});
```

#### **3.1.2 Real-time Integration Tests**
```tsx
describe('Bet Tracker Real-time Integration', () => {
  it('updates when real-time event received', async () => {
    const { result } = renderHook(() => useBetTracker(), {
      wrapper: BetTrackerProvider
    });
    
    // Simulate real-time update
    act(() => {
      mockRealtimeUpdate({
        eventType: 'INSERT',
        new: mockNewBet
      });
    });
    
    await waitFor(() => {
      expect(result.current.trackedBets).toContainEqual(mockNewBet);
    });
  });
  
  it('removes bet when real-time delete event received', async () => {
    const { result } = renderHook(() => useBetTracker(), {
      wrapper: BetTrackerProvider
    });
    
    // Simulate real-time delete
    act(() => {
      mockRealtimeUpdate({
        eventType: 'DELETE',
        old: { id: mockBet.id }
      });
    });
    
    await waitFor(() => {
      expect(result.current.trackedBets).not.toContainEqual(
        expect.objectContaining({ id: mockBet.id })
      );
    });
  });
});
```

### **3.2 Component Integration Tests**

#### **3.2.1 ArbitrageTable Integration**
```tsx
describe('ArbitrageTable + Bet Tracker Integration', () => {
  it('shows correct button state for each opportunity', () => {
    render(
      <BetTrackerProvider>
        <ArbitrageTable opportunities={mockOpportunities} />
      </BetTrackerProvider>
    );
    
    const buttons = screen.getAllByTestId('bet-tracker-button');
    expect(buttons).toHaveLength(mockOpportunities.length);
    
    // Check that added opportunities show check icon
    const addedButtons = buttons.filter(button => 
      button.querySelector('[data-testid="check-icon"]')
    );
    expect(addedButtons).toHaveLength(1); // Only first opportunity is added
  });
  
  it('updates button state when bet is added', async () => {
    render(
      <BetTrackerProvider>
        <ArbitrageTable opportunities={mockOpportunities} />
      </BetTrackerProvider>
    );
    
    const buttons = screen.getAllByTestId('bet-tracker-button');
    const secondButton = buttons[1];
    
    await user.click(secondButton);
    
    await waitFor(() => {
      expect(secondButton.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
    });
  });
});
```

## 🎭 **4. E2E TESZTEK**

### **4.1 User Workflow Tests**

#### **4.1.1 Complete Bet Tracker Workflow**
```tsx
describe('Bet Tracker Complete Workflow', () => {
  it('allows user to add, edit, and remove bets', async () => {
    await page.goto('/dashboard');
    
    // Wait for arbitrage table to load
    await page.waitForSelector('[data-testid="arbitrage-table"]');
    
    // Add first bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
    
    // Add second bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:nth-of-type(2)');
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(2);
    
    // Edit first bet
    await page.click('[data-testid="edit-button"]:first-of-type');
    await page.fill('[data-testid="stake-input"]', '1500');
    await page.fill('[data-testid="notes-textarea"]', 'Test jegyzet');
    await page.click('[data-testid="save-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="bet-tracker-item"]:first-of-type')).toContainText('1,500 Ft');
    await expect(page.locator('[data-testid="bet-tracker-item"]:first-of-type')).toContainText('Test jegyzet');
    
    // Remove first bet
    await page.click('[data-testid="remove-button"]:first-of-type');
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
    
    // Clear all bets
    await page.click('[data-testid="clear-all-button"]');
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toContainText('Nincsenek hozzáadott fogadások');
  });
});
```

#### **4.1.2 Cross-page Persistence**
```tsx
describe('Bet Tracker Cross-page Persistence', () => {
  it('maintains bet tracker state across page navigation', async () => {
    await page.goto('/dashboard');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
    
    // Navigate to arbitrage page
    await page.click('[data-testid="arbitrage-nav-link"]');
    await page.waitForURL('/arbitrage');
    
    // Verify bet tracker still shows the bet
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
    
    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-nav-link"]');
    await page.waitForURL('/dashboard');
    
    // Verify bet tracker still shows the bet
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
  });
});
```

### **4.2 Mobile E2E Tests**

#### **4.2.1 Mobile Bet Tracker Workflow**
```tsx
describe('Mobile Bet Tracker Workflow', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 375, height: 667 });
  });
  
  it('works correctly on mobile devices', async () => {
    await page.goto('/dashboard');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toHaveClass('w-full');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    
    // Verify mobile panel is visible
    await expect(page.locator('[data-testid="bet-tracker-panel"]')).toBeVisible();
    
    // Test touch interactions
    await page.tap('[data-testid="edit-button"]:first-of-type');
    await expect(page.locator('[data-testid="stake-input"]')).toBeVisible();
    
    // Test mobile keyboard
    await page.fill('[data-testid="stake-input"]', '2000');
    await page.tap('[data-testid="save-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="bet-tracker-item"]:first-of-type')).toContainText('2,000 Ft');
  });
});
```

## 📊 **5. PERFORMANCE TESZTEK**

### **5.1 Load Time Tests**

#### **5.1.1 Component Load Performance**
```tsx
describe('Bet Tracker Performance', () => {
  it('loads bet tracker panel within 200ms', async () => {
    const startTime = performance.now();
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="bet-tracker-panel"]');
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(200);
  });
  
  it('adds bet to tracker within 300ms', async () => {
    await page.goto('/dashboard');
    
    const startTime = performance.now();
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    await page.waitForSelector('[data-testid="bet-tracker-item"]');
    const addTime = performance.now() - startTime;
    
    expect(addTime).toBeLessThan(300);
  });
});
```

#### **5.1.2 Memory Usage Tests**
```tsx
describe('Bet Tracker Memory Usage', () => {
  it('does not exceed memory limits with many bets', async () => {
    await page.goto('/dashboard');
    
    // Add 50 bets to tracker
    for (let i = 0; i < 50; i++) {
      await page.click(`[data-testid="bet-tracker-button"]:nth-of-type(${i + 1})`);
      await page.waitForTimeout(100); // Small delay between adds
    }
    
    // Check memory usage
    const metrics = await page.metrics();
    expect(metrics.JSHeapUsedSize).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
```

### **5.2 Real-time Performance Tests**

#### **5.2.1 Real-time Update Performance**
```tsx
describe('Bet Tracker Real-time Performance', () => {
  it('updates within 100ms of real-time event', async () => {
    await page.goto('/dashboard');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    
    // Simulate real-time update
    const startTime = performance.now();
    await page.evaluate(() => {
      // Simulate real-time event
      window.dispatchEvent(new CustomEvent('bet-tracker-update', {
        detail: { type: 'UPDATE', data: mockUpdatedBet }
      }));
    });
    
    // Wait for update to be reflected
    await page.waitForSelector('[data-testid="updated-bet"]');
    const updateTime = performance.now() - startTime;
    
    expect(updateTime).toBeLessThan(100);
  });
});
```

## ♿ **6. ACCESSIBILITY TESZTEK**

### **6.1 Keyboard Navigation Tests**

#### **6.1.1 Keyboard Accessibility**
```tsx
describe('Bet Tracker Keyboard Accessibility', () => {
  it('navigates bet tracker with keyboard only', async () => {
    await page.goto('/dashboard');
    
    // Tab to first bet tracker button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter to add bet
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(1);
    
    // Tab to edit button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Tab to stake input
    await page.keyboard.press('Tab');
    await page.keyboard.type('1000');
    
    // Tab to save button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify changes
    await expect(page.locator('[data-testid="bet-tracker-item"]:first-of-type')).toContainText('1,000 Ft');
  });
});
```

### **6.2 Screen Reader Tests**

#### **6.2.1 Screen Reader Compatibility**
```tsx
describe('Bet Tracker Screen Reader Compatibility', () => {
  it('provides proper ARIA labels', async () => {
    await page.goto('/dashboard');
    
    // Check button ARIA labels
    const button = page.locator('[data-testid="bet-tracker-button"]:first-of-type');
    await expect(button).toHaveAttribute('aria-label', 'Hozzáadás a Bet Tracker-hez');
    
    // Add bet and check updated label
    await button.click();
    await expect(button).toHaveAttribute('aria-label', 'Eltávolítás a Bet Tracker-ből');
    
    // Check panel ARIA labels
    const panel = page.locator('[data-testid="bet-tracker-panel"]');
    await expect(panel).toHaveAttribute('role', 'complementary');
    await expect(panel).toHaveAttribute('aria-label', 'Bet Tracker panel');
  });
});
```

## 🔒 **7. SECURITY TESZTEK**

### **7.1 Data Validation Tests**

#### **7.1.1 Input Validation**
```tsx
describe('Bet Tracker Security', () => {
  it('validates stake input correctly', async () => {
    await page.goto('/dashboard');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    
    // Try to enter invalid stake
    await page.click('[data-testid="edit-button"]:first-of-type');
    await page.fill('[data-testid="stake-input"]', '-1000');
    await page.click('[data-testid="save-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });
  
  it('sanitizes notes input', async () => {
    await page.goto('/dashboard');
    
    // Add bet to tracker
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    
    // Try to enter malicious script
    await page.click('[data-testid="edit-button"]:first-of-type');
    await page.fill('[data-testid="notes-textarea"]', '<script>alert("xss")</script>');
    await page.click('[data-testid="save-button"]');
    
    // Should sanitize the input
    await expect(page.locator('[data-testid="bet-tracker-item"]:first-of-type')).not.toContainText('<script>');
  });
});
```

### **7.2 Authorization Tests**

#### **7.2.1 User Isolation**
```tsx
describe('Bet Tracker Authorization', () => {
  it('only shows user\'s own bets', async () => {
    // Login as user 1
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user1@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/dashboard');
    await page.click('[data-testid="bet-tracker-button"]:first-of-type');
    
    // Logout and login as user 2
    await page.click('[data-testid="logout-button"]');
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user2@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/dashboard');
    
    // Should not see user 1's bets
    await expect(page.locator('[data-testid="bet-tracker-item"]')).toHaveCount(0);
  });
});
```

## 📈 **8. MONITORING ÉS METRIKÁK**

### **8.1 Test Metrics**

#### **8.1.1 Coverage Metrics**
- **Unit Test Coverage:** > 90%
- **Integration Test Coverage:** > 80%
- **E2E Test Coverage:** > 70%
- **Critical Path Coverage:** 100%

#### **8.1.2 Performance Metrics**
- **Component Load Time:** < 200ms
- **API Response Time:** < 300ms
- **Real-time Update Latency:** < 100ms
- **Memory Usage:** < 50MB

### **8.2 Quality Gates**

#### **8.2.1 Pre-deployment Checks**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Performance tests meet criteria
- [ ] Accessibility tests pass
- [ ] Security tests pass
- [ ] Code coverage meets requirements

#### **8.2.2 Post-deployment Monitoring**
- [ ] Error rate < 1%
- [ ] Response time < 500ms
- [ ] User satisfaction > 4.5/5
- [ ] Accessibility score > 95%

---

**Dokumentum verzió:** 1.0  
**Utolsó frissítés:** 2024. január 26.  
**QA Lead:** BMad Master  
**Státusz:** Ready for Development - Sprint 5
