# Git Repository Setup Anleitung

## 🎯 Ziel
Du möchtest deine Änderungen aus dem `FreelancerTool` Ordner zu GitHub pushen.

## 📋 Voraussetzungen
- GitHub Account erstellt
- Git installiert

---

## 1️⃣ GitHub Repository erstellen

### Option A: Via GitHub Website (Einfachste Methode)

1. **Gehe zu GitHub.com** und logge dich ein
2. **Klicke auf das "+" Icon** oben rechts → "New repository"
3. **Fülle die Details aus:**
   - Repository name: `freelancer-tool` (oder wie du möchtest)
   - Description: `SaaS platform for freelancers to manage invoices and cashflow`
   - Visibility: **Private** (empfohlen) oder Public
   - ❌ **NICHT** "Initialize repository with README" anklicken
   - ❌ **NICHT** .gitignore oder License hinzufügen (haben wir schon)
4. **Klicke "Create repository"**

### Option B: Via GitHub CLI (Terminal)

```bash
# GitHub CLI installieren (falls noch nicht)
# Windows: winget install --id GitHub.cli
# Mac: brew install gh

# In GitHub einloggen
gh auth login

# Repository erstellen
cd /e/FreelancerTool
gh repo create freelancer-tool --private --source=. --remote=origin
```

---

## 2️⃣ Lokales Repo mit GitHub verbinden

Nach dem Erstellen des GitHub Repos zeigt GitHub dir eine URL wie:
`https://github.com/DeinUsername/freelancer-tool.git`

**Wichtig:** Kopiere diese URL!

### Im Terminal (Git Bash / PowerShell):

```bash
# Gehe in dein Projektverzeichnis
cd /e/FreelancerTool

# Füge das Remote Repository hinzu
git remote add origin https://github.com/DeinUsername/freelancer-tool.git

# Verifiziere, dass das Remote Repository hinzugefügt wurde
git remote -v

# Erwartete Ausgabe:
# origin  https://github.com/DeinUsername/freelancer-tool.git (fetch)
# origin  https://github.com/DeinUsername/freelancer-tool.git (push)
```

---

## 3️⃣ Ersten Push durchführen

```bash
# Push zu GitHub (erstmaliger Push)
git push -u origin master

# Falls du nach Credentials gefragt wirst:
# - Username: Dein GitHub Username
# - Password: Verwende einen Personal Access Token (nicht dein GitHub Passwort!)
```

### 🔐 Personal Access Token erstellen (falls benötigt):

1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Scope auswählen: `repo` (alle Optionen)
4. Token kopieren (wird nur einmal angezeigt!)
5. Beim Git Push diesen Token als Password verwenden

---

## 4️⃣ Täglicher Workflow (Das machst du jeden Tag)

### Änderungen commiten und pushen:

```bash
# Gehe in dein Projekt
cd /e/FreelancerTool

# Siehe welche Dateien geändert wurden
git status

# Füge alle Änderungen hinzu
git add .

# Oder nur bestimmte Dateien:
git add frontend/app/...
git add backend/src/...

# Commit mit Nachricht
git commit -m "Add feature X"

# Push zu GitHub
git push

# Das war's! ✅
```

### Schneller Workflow (3 Commands):

```bash
git add .
git commit -m "Update: beschreibung deiner änderungen"
git push
```

---

## 5️⃣ Wichtige Git Commands

### Status prüfen:
```bash
git status                    # Zeigt geänderte Dateien
git log --oneline -10         # Zeigt letzte 10 Commits
git diff                      # Zeigt Änderungen seit letztem Commit
```

### Änderungen verwerfen:
```bash
git checkout -- datei.ts      # Einzelne Datei zurücksetzen
git reset --hard HEAD         # ALLE Änderungen verwerfen (VORSICHT!)
```

### Branch Management:
```bash
git branch                    # Zeigt aktuelle Branches
git checkout -b feature-x     # Neuen Branch erstellen
git checkout master           # Zurück zu master
git merge feature-x           # Branch mergen
```

---

## 6️⃣ Was wird NICHT gepusht (via .gitignore)

Diese Dateien werden automatisch ignoriert:
- ✅ `node_modules/` (Dependencies)
- ✅ `.env` und `.env.local` (Secrets!)
- ✅ `dist/` und `build/` (Build-Artefakte)
- ✅ `.next/` (Next.js Build Cache)
- ✅ IDE-Ordner (`.vscode/`, `.idea/`)

**Wichtig:** Deine `.env` Dateien mit Secrets werden NICHT zu GitHub hochgeladen! Das ist sicher so.

---

## 7️⃣ Troubleshooting

### Problem: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/DeinUsername/freelancer-tool.git
```

### Problem: "failed to push some refs"
```bash
# Hole die neuesten Änderungen
git pull origin master --rebase
git push
```

### Problem: Merge Conflicts
```bash
# Öffne die konflikt-Dateien, behebe die Konflikte
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Problem: Falscher Commit Message
```bash
# Letzten Commit Message ändern (nur wenn noch nicht gepusht!)
git commit --amend -m "Neue bessere Message"
```

---

## 8️⃣ Best Practices

### ✅ DO:
- Commite oft (mehrmals am Tag)
- Schreibe klare Commit Messages
- Pushe regelmäßig zu GitHub (mindestens täglich)
- Verwende `.gitignore` für Secrets
- Erstelle Branches für größere Features

### ❌ DON'T:
- Commite nie `.env` Dateien mit Secrets
- Commite keine `node_modules/`
- Verwende keine vagen Commit Messages ("update", "fix")
- Pushe nicht ohne lokale Tests

---

## 9️⃣ Git GUI Tools (Optional)

Falls du die Kommandozeile nicht magst:

- **GitHub Desktop** (Empfohlen für Anfänger) - https://desktop.github.com/
- **GitKraken** (Visuell) - https://www.gitkraken.com/
- **VS Code Git Integration** (Eingebaut)

---

## 🎉 Fertig!

Du kannst jetzt deine Änderungen mit diesen 3 Commands pushen:

```bash
git add .
git commit -m "Deine Änderung beschreiben"
git push
```

**Repository ansehen:** `https://github.com/DeinUsername/freelancer-tool`

---

## 📞 Hilfe

Bei Problemen:
1. `git status` - Zeigt was los ist
2. `git log --oneline -5` - Zeigt letzte Commits
3. GitHub Issues im Repo erstellen
