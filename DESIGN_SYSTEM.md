# 🎨 ProTipp V2 Design System Guide

Ez a dokumentum a **Phase D fejlesztésekhez** biztosítja a konzisztens design mintákat.

## 🎯 **Alapelvek**

### **1. Dark-First Design** 🌙
- **Alapháttér**: `hsl(0, 0%, 5%)` - Mély fekete
- **Card háttér**: `hsl(0, 0%, 8%)` - Enyhén világosabb
- **Szöveg**: `hsl(0, 0%, 98%)` - Majdnem fehér

### **2. Purple Accent System** 💜
- **Primary**: `hsl(262, 83%, 58%)` - Vibráló lila
- **Gradient**: `linear-gradient(135deg, hsl(262, 83%, 8%) 0%, hsl(0, 0%, 5%) 100%)`
- **Charts**: 5-szintű lila paletta

### **3. Professional Typography** ✍️
- **Font**: Inter (Google Fonts)
- **Hierarchy**: 
  - H1: `text-2xl font-bold` + gradient text
  - H2: `text-xl font-semibold`
  - Body: `text-sm` / `text-base`
  - Muted: `text-muted-foreground`

## 🧩 **Komponens Minták**

### **Card Layout** 📄
```tsx
<Card className="gradient-bg border-primary/20">
  <CardHeader>
    <CardTitle className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
      Cím
    </CardTitle>
    <CardDescription>
      Leírás
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Tartalom */}
  </CardContent>
</Card>
```

### **Button Hierarchy** 🔘
- **Primary**: `variant="default"` - Lila háttér
- **Secondary**: `variant="outline"` - Átlátszó border
- **Ghost**: `variant="ghost"` - Hover effect
- **Destructive**: `variant="destructive"` - Piros (törlés)

### **Status Colors** 🎨
- **Profit**: `text-green-400` (`.profit-positive`)
- **Loss**: `text-red-400` (`.profit-negative`)
- **Neutral**: `text-muted-foreground`
- **Warning**: `text-yellow-400`
- **Info**: `text-blue-400`

## 📊 **Chart & Analytics**

### **Chart Colors** 📈
```css
--chart-1: hsl(262, 83%, 58%)  /* Primary purple */
--chart-2: hsl(280, 65%, 45%)  /* Deep purple */
--chart-3: hsl(295, 70%, 35%)  /* Violet */
--chart-4: hsl(310, 60%, 40%)  /* Magenta */
--chart-5: hsl(325, 55%, 50%)  /* Pink */
```

### **Animations** ⚡
- **Real-time pulse**: `animate-pulse-purple`
- **Hover transitions**: `transition-colors`
- **Loading states**: Skeleton pattern

## 🏗️ **Layout Patterns**

### **Dashboard Grid** 📱
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4-card layout */}
</div>
```

### **Tab Navigation** 📑
```tsx
<Tabs defaultValue="overview" className="space-y-4">
  <TabsList className="grid w-full grid-cols-7">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    {/* ... */}
  </TabsList>
</Tabs>
```

### **Filter Bar** 🔍
```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Sport" />
    </SelectTrigger>
  </Select>
  {/* További filterek */}
</div>
```

## 🚀 **Phase D Specific Patterns**

### **1. Subscription Cards** 💳
```tsx
<Card className={`relative overflow-hidden ${
  tier === 'premium' ? 'border-primary ring-2 ring-primary/20' : ''
}`}>
  {tier === 'premium' && (
    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs">
      POPULAR
    </div>
  )}
</Card>
```

### **2. Live Status Indicators** 🔴
```tsx
<Badge variant={isLive ? "default" : "secondary"} className="gap-1">
  <div className={`w-2 h-2 rounded-full ${
    isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
  }`} />
  {isLive ? 'LIVE' : 'OFFLINE'}
</Badge>
```

### **3. API Documentation** 📚
```tsx
<div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
  <pre className="text-primary">GET /api/arbitrage</pre>
</div>
```

### **4. Portfolio Metrics** 📊
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardContent className="p-4">
      <div className="text-2xl font-bold text-green-400">
        +{formatNumber(profit)}€
      </div>
      <div className="text-xs text-muted-foreground">Total Profit</div>
    </CardContent>
  </Card>
</div>
```

## 🎨 **CSS Variables & Custom Classes**

### **CSS Variables (globals.css)** 🎯
```css
:root {
  /* Background Colors */
  --background: 0 0% 5%;           /* Main background - Deep black */
  --card: 0 0% 8%;                 /* Card background - Slightly lighter */
  --popover: 0 0% 8%;              /* Popover background */
  
  /* Text Colors */
  --foreground: 0 0% 98%;          /* Main text - Almost white */
  --muted-foreground: 0 0% 63%;    /* Muted text - Gray */
  
  /* Brand Colors */
  --primary: 262 83% 58%;          /* Purple primary */
  --secondary: 0 0% 14%;           /* Dark secondary */
  --accent: 262 83% 58%;           /* Purple accent */
  
  /* System Colors */
  --destructive: 0 62% 30%;        /* Red for errors/delete */
  --border: 0 0% 14%;              /* Border color */
  --input: 0 0% 14%;               /* Input background */
  --ring: 262 83% 58%;             /* Focus ring color */
  
  /* Chart Colors - Purple Palette */
  --chart-1: 262 83% 58%;          /* Primary purple */
  --chart-2: 280 65% 45%;          /* Deep purple */
  --chart-3: 295 70% 35%;          /* Violet */
  --chart-4: 310 60% 40%;          /* Magenta */
  --chart-5: 325 55% 50%;          /* Pink */
  
  /* Border Radius */
  --radius: 0.5rem;                /* Standard border radius */
}
```

### **Custom Gradients** 🌈
- `.gradient-bg` - Fő háttér gradient: `linear-gradient(135deg, hsl(262, 83%, 8%) 0%, hsl(0, 0%, 5%) 100%)`
- `.bg-gradient-to-r from-primary to-purple-400` - Szöveg gradient

### **Utility Classes** 🛠️
- `.profit-positive` - Zöld profit szín (`@apply text-green-400`)
- `.profit-negative` - Piros veszteség szín (`@apply text-red-400`)
- `.animate-pulse-purple` - Lila pulse animáció (2s infinite)

### **Spacing System** 📏
- Konzisztens `gap-4`, `space-y-6` használat
- Container padding: `p-4`, `p-6`
- Responsive spacing: `sm:p-6`, `lg:p-8`

## 🔧 **Fejlesztési Szabályok**

### **DO ✅**
- Használj meglévő UI komponenseket (`@/components/ui/`)
- Kövesd a színpalettát (CSS változók)
- Alkalmazz konzisztens spacing-et
- Használj gradient text-et címeknél
- Implementálj loading states-eket

### **DON'T ❌**
- Ne hozz létre új színeket
- Ne használj inline style-okat
- Ne törj el responsive layout-okat
- Ne felejts el dark mode támogatást
- Ne használj hardcoded értékeket

## 📱 **Responsive Breakpoints**
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`
- **Wide**: `> 1280px`

## 🎯 **Phase D Komponens Lista**

### **Subscription System** 💳
- `PricingCards` - 3-tier layout
- `PaymentForm` - Stripe integration
- `BillingHistory` - Transaction list
- `SubscriptionStatus` - Current plan display

### **Live Betting** ⚡
- `LiveOddsStream` - Real-time data
- `WebSocketStatus` - Connection indicator
- `LiveArbitrageAlert` - Instant notifications
- `QuickBetPlacement` - One-click betting

### **API Management** 🔌
- `APIKeyManager` - Key generation/revocation
- `APIDocumentation` - Interactive docs
- `UsageMetrics` - Rate limiting display
- `SDKDownload` - Code examples

### **Portfolio Advanced** 📈
- `MultiBookmakerTracker` - Account balances
- `RiskManagement` - Kelly calculator
- `AutomatedBetting` - Bot configuration
- `PortfolioOptimizer` - Allocation suggestions

## ♿ **Accessibility Guidelines**

### **Color Contrast** 🎨
- **Text on Background**: 16.5:1 ratio (WCAG AAA)
- **Text on Cards**: 14.2:1 ratio (WCAG AAA) 
- **Primary on Background**: 7.8:1 ratio (WCAG AA)
- **Muted Text**: 4.6:1 ratio (WCAG AA)

### **Focus Management** 🎯
```tsx
// Focus ring for interactive elements
<Button className="focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
  Click me
</Button>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>
```

### **Semantic HTML** 📝
```tsx
// Use proper heading hierarchy
<main id="main-content">
  <h1>Dashboard</h1>
  <section>
    <h2>Arbitrage Opportunities</h2>
    <h3>Soccer Matches</h3>
  </section>
</main>

// Use semantic landmarks
<nav aria-label="Main navigation">
<aside aria-label="Filters">
<section aria-labelledby="opportunities-heading">
```

### **ARIA Labels** 🏷️
```tsx
// Loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading opportunities...' : `${opportunities.length} opportunities found`}
</div>

// Interactive elements
<button 
  aria-label={`Add bet for ${event.name}`}
  aria-describedby={`${event.id}-details`}
>
  <Plus className="h-4 w-4" />
</button>

// Form inputs
<Label htmlFor="stake-input">Stake Amount</Label>
<Input 
  id="stake-input"
  aria-describedby="stake-help"
  aria-invalid={hasError}
/>
<p id="stake-help" className="text-sm text-muted-foreground">
  Enter your bet amount in EUR
</p>
```

### **Keyboard Navigation** ⌨️
```tsx
// Custom keyboard handlers
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect();
      break;
    case 'Escape':
      onClose();
      break;
  }
};

// Tab order management
<div role="tablist">
  <button role="tab" tabIndex={isSelected ? 0 : -1}>
    Overview
  </button>
</div>
```

### **Screen Reader Support** 📢
```tsx
// Live regions for dynamic content
<div aria-live="assertive" className="sr-only">
  {alertMessage}
</div>

// Descriptive text for complex elements
<div 
  role="img" 
  aria-label={`Profit chart showing ${profitMargin}% arbitrage opportunity`}
>
  <Chart data={chartData} />
</div>

// Status announcements
<span className="sr-only">
  {status === 'won' ? 'Bet won' : status === 'lost' ? 'Bet lost' : 'Bet pending'}
</span>
```

### **Motion & Animation** 🎬
```tsx
// Respect reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-purple {
    animation: none;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Alternative for reduced motion
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### **Error Handling** ⚠️
```tsx
// Clear error messages
<Alert variant="destructive" role="alert">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Unable to load betting data. Please check your connection and try again.
  </AlertDescription>
</Alert>

// Form validation
<Input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : undefined}
/>
{error && (
  <p id="error-message" role="alert" className="text-destructive text-sm">
    {error}
  </p>
)}
```

### **Testing Checklist** ✅
- [ ] Tab navigation works through all interactive elements
- [ ] Screen reader announces all important information
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Error messages are announced
- [ ] Loading states are communicated
- [ ] Reduced motion preferences respected
- [ ] Semantic HTML structure used
- [ ] ARIA labels provide context
- [ ] Keyboard shortcuts work as expected

---

**🎨 Ez a design system biztosítja, hogy minden új Phase D funkció konzisztens, professzionális és akadálymentes legyen!**
