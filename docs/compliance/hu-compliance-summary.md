# HU Compliance Összefoglaló (nem minősül jogi tanácsnak)

## Alapelv
- Csak információs/összehasonlító szolgáltatás, fogadás indítása/közvetítése nélkül.
- Egyértelmű diszklémer és felhasználási feltételek.

## Kulcspontok (röviden)
- Szerencsejáték tevékenység HU-ban engedélyköteles; aggregált információ nyújtása jellemzően nem.
- Kiskorúak védelme, felelős játékszemlélet, reklámkorlátok betartása.
- Pénzügyi szolgáltatásnak nem minősül; számlázás EU-s szabályok szerint.
- Személyes adatok kezelése: GDPR, adatminimalizálás, DPA.

## Kerülendő irányok
- Nem licencelt szolgáltatók népszerűsítése HU-ban.
- “Place bet” gomb vagy automatizált fogadásindítás.
- Affiliate/redirect programok jogi átvilágítás nélkül.

## Integrációs prioritások
- Rövid táv: The Odds API (stabil), publikus feedek (ha vannak), deep-link nélkül.
- Közép táv: EU-licencelt irodák (William Hill/Pinnacle) read-only.
- Hosszú táv: HU jogi egyeztetés után bővítés, partneri szerződések.

## Fallback stratégia
- Aggregált feed → The Odds API; ideiglenes piaczárás: cache-elt/stale adatok jelölése.
