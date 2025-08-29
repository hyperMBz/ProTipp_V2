# BMAD Method Alapú Arbitrage Platform Újratervezési Prompt

## Projekt Áttekintés

A BMAD Method (Breakthrough Method for Agile AI-Driven Development) keretrendszer alapján szeretném újratervezni a jelenlegi arbitrage platformomat a Cursorban. A platform egy professzionális arbitrage betting oldal lesz, hasonlóan az oddsjam.com-hoz, de továbbfejlesztett funkcionalitással és modern UI/UX megoldásokkal.

## Jelenlegi Helyzet Analízise

**Alapos projekt audit szükséges:**
- A brownfield-fullstack.yaml fájl alapján teljes kódbázis elemzés
- Jelenlegi fejlesztési terv és eddig elkészült feladatok részletes áttekintése
- Kód működésének, felépítésének és architektúrájának mélyreható vizsgálata
- Arbitrage algoritmusok és kalkulátorok hatékonyságának értékelése
- UI/UX elemek összevetése az oddsjam.com referencia platformmal

## Projekt Célkitűzések

### 1. Platform Funkcionalitás
**Arbitrage Betting Core Features:**
- Valós idejű odds aggregáció 100+ fogadóirodától
- Automated arbitrage detection és alert rendszer
- +EV (Positive Expected Value) betting opportunities
- Automatizált stake kalkulátor beépített jutalék és díj adjustmentekkel
- Live betting tools és gyors execution windows
- AI-powered pattern detection a sharp odds movements számára
- Closing line value (CLV) tracking és performance analytics

**Advanced Features:**
- Multi-market arbitrage support (mainlines, player props, futures)
- Bookmaker API integration és account linking
- Risk assessment és profitability prediction
- Customizable alerts (push, browser, SMS)
- Advanced filtering és sorting options
- Historical data analysis és trend reporting

### 2. UI/UX Excellence
**Design Principles (oddsjam.com inspiráció alapján):**
- Clean, professional interface modern dark/light theme opciókkal
- Real-time updating odds display dinamikus színkódolással
- Intuitive navigation pattern: Sport > Country > League > Event
- Mobile-first responsive design
- Advanced data visualization (charts, graphs, heatmaps)
- Customizable dashboard widgets
- Progressive disclosure for complex data
- Accessibility compliance (WCAG 2.1)

**User Experience Optimizations:**
- One-click bet placement integration
- Smart notification system
- Personalization engine
- Quick filters és search functionality
- Drag-and-drop dashboard customization
- Export capabilities (CSV, Excel, PDF reports)

### 3. Technical Architecture

**Backend Infrastructure:**
- Microservices architecture Docker containerization
- Real-time data processing (1M+ odds/second capacity)
- High-performance caching layer (Redis/Memcached)
- Rate limiting és API quota management
- Comprehensive logging és monitoring
- Scalable database design (PostgreSQL/MongoDB)

**Frontend Technology Stack:**
- Modern React/Next.js architecture
- State management (Redux Toolkit/Zustand)
- Real-time updates (WebSocket/SSE)
- Progressive Web App (PWA) capabilities
- Advanced charting libraries (D3.js/Chart.js)
- Optimized performance (lazy loading, code splitting)

## BMAD Method Implementation

### Phase 1: Agentic Planning (Web UI - Gemini/ChatGPT)

**1. Analyst Agent Role:**
- Competitive analysis (oddsjam.com, AVO, egyéb arbitrage platformok)
- Market research és user persona development
- Technical feasibility study
- Risk assessment és compliance requirements
- Project Brief dokumentum készítése

**2. Product Manager Agent Role:**
- Részletes PRD (Product Requirement Document) létrehozása
- Functional Requirements (FRs) definíció:
  - Real-time odds aggregation specifications
  - Arbitrage detection algorithm requirements  
  - User management és authentication system
  - Payment integration és withdrawal handling
  - Notification system specifications
- Non-Functional Requirements (NFRs):
  - Performance benchmarks (<100ms response times)
  - Scalability targets (10K concurrent users)
  - Security standards és data protection
  - Uptime requirements (99.9% availability)
- Epic és Story structure felépítése

**3. UX Expert Agent Role (opcionális):**
- Frontend Specification dokumentum
- User journey mapping
- Wireframe és mockup tervezés
- Interaction design patterns
- Accessibility guidelines implementation
- UI component library specifikáció

**4. Architect Agent Role:**
- System architecture design
- Technology stack kiválasztása
- Database schema tervezés
- API design és service boundaries
- Security architecture
- DevOps és deployment strategy
- Performance optimization strategy
- Third-party integrations (bookmaker APIs, payment gateways)

**5. Product Owner Agent Checklist:**
- Dokumentum alignement ellenőrzés (PRD ↔ Architecture ↔ UX Spec)
- Epic és Story prioritization
- Acceptance criteria definition
- Master Checklist futtatása
- Cross-functional requirements validation

### Phase 2: Context-Engineered Development (Cursor IDE)

**6. Scrum Master Agent Role:**
- PRD és Architecture sharding kisebb, manageable task-okra
- Hyper-detailed story files generálása teljes kontextussal:
  - Implementation guidelines
  - Architectural context embedding
  - Testing criteria definition
  - Dependencies mapping
  - Acceptance criteria detailing
- Development task prioritization
- Sprint planning és timeline estimation

**7. Development Agent Role:**
- Self-contained story file alapú implementáció
- Multi-file editing capabilities kihasználása
- Terminal command execution automation
- Code generation és refactoring
- Integration testing automation
- Performance optimization implementation

**8. QA Agent Role:**
- Automated testing strategy implementation:
  - Unit tests (Jest/Vitest)
  - Integration tests (Cypress/Playwright)
  - Performance tests (k6/JMeter)
  - Security testing (OWASP compliance)
- Bug detection és reporting
- Quality assurance protocols
- User acceptance testing scenarios

## MCP Server Integrations

**Recommended MCP Servers:**
- **GitHub MCP Server**: Version control és repository management
- **Linear MCP Server**: Project management és issue tracking integration
- **Database MCP Server**: PostgreSQL/MongoDB direct access
- **API Testing MCP Server**: Automated endpoint testing
- **Documentation MCP Server**: Markdown-based docs generation
- **Analytics MCP Server**: Performance metrics és usage analytics

**Additional Tools Integration:**
- **Superdesign MCP**: UI component generation és design system
- **Bookmaker API MCPs**: Odds data aggregation
- **Payment Gateway MCPs**: Stripe, PayPal integration
- **Monitoring MCPs**: Prometheus, Grafana dashboards

## Expanded Feature Requirements

### Core Arbitrage Features
1. **Multi-Sportsbook Integration:**
   - 150+ global bookmakers support
   - Real-time odds feeds minden major sportra
   - Alternative lines és player props
   - Live betting opportunities

2. **Advanced Algorithms:**
   - Machine learning-based opportunity detection
   - False positive minimization
   - Market inefficiency prediction
   - Bankroll optimization algorithms

3. **Risk Management:**
   - Account limiting detection
   - Bet sizing optimization
   - Kelly Criterion implementation
   - Portfolio diversification tools

### Enhanced UI/UX Components
1. **Dashboard Widgets:**
   - Profit/Loss tracking graphs
   - Win rate analytics
   - ROI performance metrics
   - Market activity heatmaps

2. **Advanced Filtering:**
   - Sport-specific filters
   - ROI threshold settings
   - Time window selections
   - Bookmaker availability filters

3. **Notification System:**
   - Customizable alert thresholds
   - Multi-channel delivery (email, SMS, push)
   - Sound notifications
   - Vibration patterns (mobile)

## Implementation Roadmap

### Sprint 1-2: Foundation (Planning Phase)
- BMAD Agent workflow execution (web-based)
- Complete documentation package
- Technical architecture finalization
- Development environment setup

### Sprint 3-4: Core Backend
- Database schema implementation
- Authentication system
- Basic API structure
- Odds aggregation service

### Sprint 5-6: Frontend Foundation  
- UI component library
- Basic dashboard
- User authentication flows
- Responsive design implementation

### Sprint 7-8: Arbitrage Engine
- Opportunity detection algorithm
- Stake calculation system
- Alert generation
- Basic filtering capabilities

### Sprint 9-10: Advanced Features
- Live betting integration
- Advanced analytics
- Performance optimization
- Mobile app development

### Sprint 11-12: Polish & Launch
- Security audit
- Performance testing
- User acceptance testing
- Production deployment

## Success Metrics

**Technical KPIs:**
- Odds update latency < 100ms
- System uptime > 99.9%
- API response time < 50ms
- Database query performance < 10ms

**Business KPIs:**
- User engagement rate > 80%
- Platform accuracy > 95%
- User retention > 70% (30 days)
- Revenue per user growth 20%/quarter

## Next Steps

1. **Immediate Actions:**
   - BMAD Method installation és configuration Cursorban
   - Brownfield-fullstack.yaml audit és analysis
   - Jelenlegi kódbázis comprehensive review
   - Competitive analysis (oddsjam.com feature mapping)

2. **Planning Phase Execution:**
   - Web-based agent workflow (Gemini/ChatGPT)
   - Complete documentation package generation
   - Stakeholder review és approval process

3. **Development Phase:**
   - Cursor IDE BMAD agent integration
   - Story-driven development workflow
   - Continuous integration pipeline setup
   - Regular quality assurance checkpoints

## Tool Integration Strategy

**MCP Ecosystem:**
- Model Context Protocol standardization
- Multiple MCP server connections
- Context-aware development workflow
- Tool discovery automation

**Development Workflow:**
- BMAD Method discipline adherence  
- Agile/Scrum methodology integration
- Continuous feedback loops
- Human-in-the-loop refinement

**Quality Assurance:**
- Automated testing integration
- Performance monitoring
- Security compliance checking
- User experience validation

---

**Kezdő Parancs:** `@BMad_Analyst kezdd el a projekt átfogó analízisét és készítsd el a Project Brief dokumentumot a brownfield-fullstack.yaml alapján, különös tekintettel az oddsjam.com konkurencia elemzésre és a jelenlegi platform gyengeségeinek azonosítására.`