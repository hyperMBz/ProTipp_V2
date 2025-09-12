# Integration Points and External Dependencies

## External Services

| Service    | Purpose             | Integration Type | Key Files                  | Status |
| ---------- | ------------------- | ---------------- | -------------------------- | ------ |
| Supabase   | Backend (Auth, DB)  | SDK              | `src/lib/supabase/`        | ✅ Active |
| The Odds API| Sports data        | REST API         | `src/lib/api/odds-api.ts`  | ✅ Active |
| Stripe     | Payments            | SDK (planned)    | N/A                        | ⏳ Planned |
| Email Service| Notifications     | SMTP (planned)   | `scripts/test-email-config.js` | ⏳ Planned |

## Internal Integration Points

- **Frontend-Backend**: REST API on `/api/v1/` endpoints
- **Auth Flow**: Supabase auth with custom middleware
- **Real-time Updates**: WebSocket connections for live odds
- **Caching Layer**: Redis for API response caching
- **Analytics**: Custom performance tracking system
