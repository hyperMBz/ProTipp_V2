# Biztonsági és Megfelelőségi Checklist

## Kötelező kontrollok
- TLS/HSTS, erős CSP (`netlify.toml`)
- Secret kezelés: környezeti változók, rotáció 60–90 nap
- Input validáció (Zod), output escaping
- CSRF/XSS/SQLi védelem; Supabase RLS
- MFA/2FA támogatás (Supabase)
- Jelszó-hashing (Supabase: bcrypt/scrypt)
- Auditlog: admin és kritikus műveletek (IP, UA, diff)
- GDPR: adatminimalizálás, törlés, DPA

## Incidenskezelés
- Sev1–3 triage, on-call, kommunikációs sablonok, RCA 72 órán belül

## Backup/Restore
- RTO: 30 perc, RPO: 15 perc; rendszeres restore tesztek stagingen

## Adatmegőrzés
- Audit: 12 hónap; Analytics: 6–12 hónap; PII: min. szükséges ideig
