# Appendix - Useful Commands and Scripts

## Development Commands

```bash
# Start development server (Turbopack)
bun run dev

# Build production bundle
bun run build

# Run all tests
bun run test:all

# Generate coverage report
bun run test:coverage

# Performance analysis
bun run lighthouse:audit

# Bundle analysis
bun run performance:analyze
```

## Deployment Commands

```bash
# Production deployment
bun run deploy:production

# Netlify optimized build
bun run netlify:build

# Performance monitoring
bun run performance:monitor
```

## Quality Assurance

```bash
# Lint and type check
bun run lint

# Format code (Biome)
bun run format

# Security audit
bun run test:security

# Full CI pipeline
bun run test:ci
```
