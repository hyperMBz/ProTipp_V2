# BMAD + SuperDesign Integration

## Workflow Integration

### Phase 1: Planning (UX-Expert + SuperDesign)
1. **UX-Expert agent** creates front-end-spec.md
2. **SuperDesign** generates visual mockups from the spec
3. **Fork and iterate** designs in SuperDesign
4. **Export prompts** to continue with BMAD development cycle

### Phase 2: Development (Dev Agent + SuperDesign Output)
1. Use SuperDesign generated **component prompts**
2. **Dev agent** implements with shadcn/ui
3. **Iterate** between SuperDesign mockups and code implementation

## SuperDesign Commands for BMAD Agents

### For UX-Expert Agent
```
After creating front-end-spec.md, use SuperDesign to:
1. Generate initial mockups from the specification
2. Create wireframes for user flow validation
3. Design component variations for A/B testing
4. Export refined prompts for development phase
```

### For Dev Agent
```
When implementing UI components:
1. Reference SuperDesign mockups in .superdesign/generated/
2. Use component prompts from SuperDesign exports
3. Maintain design consistency with generated mockups
4. Test implementation against visual designs
```

## Project-Specific Templates

### Betting Platform Components
- Odds comparison tables
- Arbitrage opportunity cards
- Profit calculators
- Real-time alert components
- Analytics dashboards

### Design System Integration
- Use existing shadcn/ui components as base
- Follow established dark theme
- Maintain responsive design patterns
- Integrate with Tailwind CSS classes

## Workflow Enhancement

SuperDesign enhances BMAD by:
- **Visual validation** of UX specifications
- **Rapid prototyping** before coding
- **Design iteration** without code changes
- **Component library** expansion through AI generation
