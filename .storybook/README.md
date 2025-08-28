# Storybook Integration - ProTipp V2

## 🎯 Mi a Storybook?

A Storybook egy **UI komponens fejlesztési környezet**, amely lehetővé teszi a komponensek izolált fejlesztését, tesztelését és dokumentálását.

## 🚀 Használat

### Storybook indítása:
```bash
bun run storybook
```
Elérhető: **http://localhost:6006**

### Production build:
```bash
bun run build-storybook
```

## 📚 Létrehozott Stories

### UI Komponensek
- **Button** (`UI/Button`) - shadcn/ui button variációk betting kontextusban

### Analytics Komponensek  
- **ProfitTimelineChart** (`Analytics/ProfitTimelineChart`) - Profit idősor grafikonok

### Betting Komponensek
- **ArbitrageTable** (`Betting/ArbitrageTable`) - Arbitrage lehetőségek táblázata

## 🎨 SuperDesign + Storybook Workflow

### 1. Design Phase (SuperDesign)
```
SuperDesign Canvas → Generate mockup → Export component prompt
```

### 2. Development Phase (Storybook)
```
Storybook → Create story → Develop component in isolation → Test variants
```

### 3. Integration Phase (Next.js)
```
Tested component → Import to app → Integration testing
```

## 🔧 Konfigurált Addon-ok

- **📖 Docs**: Automatikus dokumentáció generálás
- ♿ **A11y**: Accessibility testing
- 🧪 **Vitest**: Component testing integration
- 🎨 **Chromatic**: Visual regression testing

## 📝 Story Írási Minták

### Új Story Létrehozása:
```typescript
// src/stories/YourComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { YourComponent } from '../components/YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // vagy 'fullscreen'
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props itt
  },
};
```

## 🎯 Következő Lépések

1. **Nyisd meg**: http://localhost:6006
2. **Nézd meg** a létrehozott story-kat
3. **Hozz létre** új story-kat a többi komponenshez
4. **Integráld** a SuperDesign workflow-val

## 💡 Pro Tippek

- **Dark theme**: A Storybook automatikusan támogatja a projekt dark theme-jét
- **Real data**: Használj mock adatokat a story-kban
- **Variants**: Hozz létre különböző állapotokat (loading, error, success)
- **Responsive**: Teszteld a komponenseket különböző képernyőméreteken
