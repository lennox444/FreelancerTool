# Trial Expiration Test Guide

## Test User
- **Email:** expired@example.com
- **Password:** Demo123!
- **Status:** Trial expired (2 days ago)

## Expected Behavior

### 1. Login
✅ Login funktioniert normal
- Gehe zu http://localhost:3000/login
- Logge dich mit obigen Credentials ein
- Login sollte erfolgreich sein

### 2. Automatic Redirect
❌ Dashboard-Zugriff blockiert
- Nach Login wirst du AUTOMATISCH zu `/subscription-expired` weitergeleitet
- Du siehst eine schöne Paywall-Seite mit:
  - "Testphase abgelaufen" Header
  - Anzahl der abgelaufenen Tage
  - Liste der Pro-Features
  - "Jetzt upgraden" Button

### 3. Billing Page Access
✅ Upgrade-Seite erreichbar
- Klicke auf "Jetzt upgraden" Button
- Du wirst zu `/settings/billing` weitergeleitet
- Diese Seite ist die EINZIGE erlaubte Dashboard-Seite
- Du kannst upgraden!

### 4. Dashboard Blocked
❌ Alle anderen Seiten blockiert
- Versuche manuell zu navigieren:
  - http://localhost:3000/dashboard → Redirect zu /subscription-expired
  - http://localhost:3000/projects → Redirect zu /subscription-expired
  - http://localhost:3000/customers → Redirect zu /subscription-expired
  - etc.

### 5. After Upgrade
✅ Voller Zugriff nach Upgrade
- Nach erfolgreichem Upgrade auf PRO
- Trial-Check wird deaktiviert
- Alle Dashboard-Seiten sind wieder zugänglich

## Pro User Test
Um zu testen, dass PRO-User weiterhin Zugriff haben:
- Logge dich mit t@t.com ein (ist PRO)
- Dashboard sollte normal funktionieren
- Keine Redirect zu /subscription-expired

## Reset Trial für erneuten Test
Falls du den Test wiederholen willst:
```bash
cd backend
node create-expired-user.js
```
Setzt den User auf "1 Tag abgelaufen" zurück.
