# Penetrációs Tesztelési Terv - ProTipp V2

**Dátum**: 2024-12-19  
**Tesztelő**: Quinn (Test Architect)  
**Scope**: Teljes alkalmazás biztonsági tesztelése  

## 🎯 **Tesztelési Célok**

### **Fő Célok**
1. **Autentikáció bypass** lehetőségek azonosítása
2. **Session hijacking** és **token forgery** ellenőrzése
3. **Input validation** és **injection attacks** tesztelése
4. **Rate limiting** és **DoS protection** validálása
5. **API security** és **endpoint protection** ellenőrzése

### **Biztonsági Területek**
- **Authentication & Authorization**
- **Input Validation & Sanitization**
- **Session Management**
- **API Security**
- **Rate Limiting**
- **Data Protection**

## 🧪 **Tesztelési Metódusok**

### **1. Autentikáció Tesztelés**

#### **A) JWT Token Manipulation**
```bash
# 1. Token format manipulation
curl -H "Authorization: Bearer invalid-token" https://api.protipp.com/protected

# 2. Expired token test
curl -H "Authorization: Bearer expired-jwt-token" https://api.protipp.com/protected

# 3. Token signature bypass
curl -H "Authorization: Bearer manipulated-jwt-token" https://api.protipp.com/protected

# 4. Empty token test
curl -H "Authorization: Bearer " https://api.protipp.com/protected
```

#### **B) Session Hijacking**
```bash
# 1. Session token theft simulation
curl -H "Cookie: supabase-auth-token=stolen-token" https://api.protipp.com/dashboard

# 2. Session fixation
curl -H "Cookie: supabase-auth-token=fixed-session-id" https://api.protipp.com/login

# 3. Concurrent session test
curl -H "Authorization: Bearer valid-token" https://api.protipp.com/dashboard
curl -H "Authorization: Bearer same-token" https://api.protipp.com/dashboard
```

#### **C) Authentication Bypass**
```bash
# 1. Direct URL access
curl https://api.protipp.com/admin/dashboard

# 2. Role escalation
curl -H "Authorization: Bearer user-token" https://api.protipp.com/admin/users

# 3. Permission bypass
curl -H "Authorization: Bearer free-user-token" https://api.protipp.com/premium/analytics
```

### **2. Input Validation Tesztelés**

#### **A) XSS (Cross-Site Scripting)**
```bash
# 1. Reflected XSS
curl -X POST https://api.protipp.com/search \
  -H "Content-Type: application/json" \
  -d '{"query": "<script>alert(\"XSS\")</script>"}'

# 2. Stored XSS
curl -X POST https://api.protipp.com/bets \
  -H "Content-Type: application/json" \
  -d '{"notes": "<img src=x onerror=alert(\"XSS\")>"}'

# 3. DOM-based XSS
curl "https://api.protipp.com/profile?name=<script>alert('XSS')</script>"
```

#### **B) SQL Injection**
```bash
# 1. Basic SQL injection
curl -X POST https://api.protipp.com/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "1'\'' OR 1=1 --"}'

# 2. Union-based injection
curl -X GET "https://api.protipp.com/bets?id=1 UNION SELECT * FROM users"

# 3. Time-based blind injection
curl -X GET "https://api.protipp.com/bets?id=1; WAITFOR DELAY '\''00:00:05'\''"
```

#### **C) NoSQL Injection**
```bash
# 1. MongoDB injection
curl -X POST https://api.protipp.com/search \
  -H "Content-Type: application/json" \
  -d '{"filter": {"$where": "this.password == this.username"}}'

# 2. Operator injection
curl -X POST https://api.protipp.com/bets \
  -H "Content-Type: application/json" \
  -d '{"odds": {"$gt": 0}}'
```

### **3. API Security Tesztelés**

#### **A) HTTP Method Override**
```bash
# 1. Method override
curl -X POST https://api.protipp.com/users/123 \
  -H "X-HTTP-Method-Override: DELETE"

# 2. Method confusion
curl -X GET https://api.protipp.com/users/123 \
  -H "Content-Type: application/json" \
  -d '{"action": "delete"}'
```

#### **B) Parameter Pollution**
```bash
# 1. Duplicate parameters
curl -X GET "https://api.protipp.com/bets?id=1&id=2"

# 2. Array parameter injection
curl -X GET "https://api.protipp.com/bets?id[]=1&id[]=2"
```

#### **C) Content-Type Manipulation**
```bash
# 1. Content-Type bypass
curl -X POST https://api.protipp.com/upload \
  -H "Content-Type: text/plain" \
  -d '{"malicious": "data"}'

# 2. Charset manipulation
curl -X POST https://api.protipp.com/search \
  -H "Content-Type: application/json; charset=utf-7" \
  -d '{"query": "test"}'
```

### **4. Rate Limiting Tesztelés**

#### **A) Rate Limit Bypass**
```bash
# 1. IP rotation
for i in {1..100}; do
  curl -H "X-Forwarded-For: 192.168.1.$i" https://api.protipp.com/login
done

# 2. User-Agent rotation
for i in {1..100}; do
  curl -H "User-Agent: Bot$i" https://api.protipp.com/api/arbitrage
done

# 3. Header manipulation
curl -H "X-Real-IP: 192.168.1.1" https://api.protipp.com/api/arbitrage
curl -H "X-Forwarded-For: 192.168.1.2" https://api.protipp.com/api/arbitrage
```

#### **B) Burst Attack**
```bash
# 1. Rapid requests
for i in {1..50}; do
  curl -X POST https://api.protipp.com/api/bets &
done
wait

# 2. Distributed requests
for i in {1..10}; do
  for j in {1..10}; do
    curl -H "X-Forwarded-For: 192.168.$i.$j" https://api.protipp.com/api/arbitrage &
  done
done
wait
```

### **5. Session Management Tesztelés**

#### **A) Session Fixation**
```bash
# 1. Session ID manipulation
curl -H "Cookie: sessionid=fixed-session-id" https://api.protipp.com/login

# 2. Session timeout test
curl -H "Authorization: Bearer old-token" https://api.protipp.com/dashboard
```

#### **B) Concurrent Session**
```bash
# 1. Multiple sessions
curl -H "Authorization: Bearer token1" https://api.protipp.com/dashboard
curl -H "Authorization: Bearer token2" https://api.protipp.com/dashboard
```

### **6. Data Protection Tesztelés**

#### **A) Information Disclosure**
```bash
# 1. Error message analysis
curl -X POST https://api.protipp.com/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@test.com", "password": "wrong"}'

# 2. Directory traversal
curl https://api.protipp.com/../../etc/passwd
curl https://api.protipp.com/../config/database.yml
```

#### **B) Data Leakage**
```bash
# 1. Response analysis
curl -X GET https://api.protipp.com/api/users/123

# 2. Error handling
curl -X GET https://api.protipp.com/api/users/999999
```

## 🔧 **Tesztelési Eszközök**

### **1. Automatizált Eszközök**
- **OWASP ZAP** - Web application security scanner
- **Burp Suite** - Web vulnerability scanner
- **Nmap** - Network security scanner
- **SQLMap** - SQL injection testing

### **2. Manuális Tesztelés**
- **cURL** - Command line HTTP client
- **Postman** - API testing tool
- **Browser DevTools** - Client-side analysis
- **Custom scripts** - Specific test cases

### **3. Monitoring Eszközök**
- **Application logs** - Error tracking
- **Rate limiting metrics** - Performance monitoring
- **Security events** - Audit logging
- **Database queries** - SQL monitoring

## 📊 **Tesztelési Forgatókönyvek**

### **1. Kritikus Tesztelési Forgatókönyvek**

#### **A) Authentication Bypass**
```typescript
// Test scenario: Authentication bypass
describe('Authentication Bypass Tests', () => {
  test('should not allow access without valid token', async () => {
    const response = await fetch('/api/protected', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    expect(response.status).toBe(401);
  });
  
  test('should not allow role escalation', async () => {
    const userToken = await getValidUserToken();
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    expect(response.status).toBe(403);
  });
});
```

#### **B) Input Validation**
```typescript
// Test scenario: Input validation
describe('Input Validation Tests', () => {
  test('should sanitize XSS attempts', async () => {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      },
      body: JSON.stringify({
        notes: '<script>alert("xss")</script>'
      })
    });
    
    const data = await response.json();
    expect(data.notes).not.toContain('<script>');
  });
  
  test('should prevent SQL injection', async () => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      },
      body: JSON.stringify({
        query: "'; DROP TABLE users; --"
      })
    });
    
    expect(response.status).toBe(400);
  });
});
```

#### **C) Rate Limiting**
```typescript
// Test scenario: Rate limiting
describe('Rate Limiting Tests', () => {
  test('should block excessive requests', async () => {
    const requests = [];
    
    // Make 100 requests quickly
    for (let i = 0; i < 100; i++) {
      requests.push(
        fetch('/api/arbitrage', {
          headers: {
            'Authorization': `Bearer ${validToken}`
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const blockedResponses = responses.filter(r => r.status === 429);
    
    expect(blockedResponses.length).toBeGreaterThan(0);
  });
});
```

### **2. Teljesítmény Tesztelési Forgatókönyvek**

#### **A) Load Testing**
```bash
# 1. Basic load test
ab -n 1000 -c 10 https://api.protipp.com/api/arbitrage

# 2. Stress test
ab -n 10000 -c 100 https://api.protipp.com/api/arbitrage

# 3. Endurance test
ab -n 100000 -c 50 -t 300 https://api.protipp.com/api/arbitrage
```

#### **B) Memory Leak Testing**
```bash
# 1. Memory monitoring
while true; do
  curl https://api.protipp.com/api/arbitrage
  sleep 1
done

# 2. Long-running session test
curl -H "Authorization: Bearer $TOKEN" https://api.protipp.com/dashboard
sleep 3600
curl -H "Authorization: Bearer $TOKEN" https://api.protipp.com/dashboard
```

## 📋 **Tesztelési Terv**

### **1. Fázis: Előkészítés (1 nap)**
- [ ] Tesztelési környezet beállítása
- [ ] Tesztelési eszközök telepítése
- [ ] Tesztelési adatok előkészítése
- [ ] Monitoring beállítása

### **2. Fázis: Automatizált Tesztelés (1 nap)**
- [ ] OWASP ZAP scan futtatása
- [ ] Burp Suite scan futtatása
- [ ] SQLMap injection tesztelés
- [ ] Nmap port scanning

### **3. Fázis: Manuális Tesztelés (2 nap)**
- [ ] Autentikáció bypass tesztelés
- [ ] Input validation tesztelés
- [ ] API security tesztelés
- [ ] Rate limiting tesztelés

### **4. Fázis: Eredmények Elemzése (1 nap)**
- [ ] Tesztelési eredmények összegyűjtése
- [ ] Biztonsági rések kategorizálása
- [ ] Javítási javaslatok készítése
- [ ] Jelentés elkészítése

## 🎯 **Sikerességi Kritériumok**

### **Biztonsági Kritériumok**
- ✅ Nincs kritikus biztonsági rés
- ✅ Nincs autentikáció bypass
- ✅ Nincs input validation bypass
- ✅ Rate limiting megfelelően működik
- ✅ Session management biztonságos

### **Teljesítmény Kritériumok**
- ✅ Alkalmazás ellenáll 1000+ egyidejű kérésnek
- ✅ Rate limiting megfelelően működik
- ✅ Nincs memory leak
- ✅ Response time < 100ms

### **Compliance Kritériumok**
- ✅ OWASP Top 10 compliance
- ✅ GDPR compliance
- ✅ Security headers beállítva
- ✅ Audit logging működik

## 🚨 **Következő Lépések**

1. **Azonnali cselekvés**: Tesztelési környezet beállítása
2. **1. nap**: Automatizált tesztelés futtatása
3. **2-3. nap**: Manuális tesztelés végrehajtása
4. **4. nap**: Eredmények elemzése és jelentés készítése
5. **5. nap**: Javítások implementálása

**Kritikus**: A penetrációs tesztelés eredményei alapján azonnali javítások szükségesek lehetnek!
