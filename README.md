# 🛡️ ShieldApp v3 — Sécurité privée à la demande

> **La marketplace Uber-like pour agents de sécurité certifiés à Conakry, Guinée.**
> Trouvez un agent ONPSEC en quelques minutes. Paiement Mobile Money sécurisé.

---

## 🌐 Démo Live

**URL GitHub Pages :** `https://pilel1990.github.io/shield-app/`

> Mode démo complet — aucune inscription requise.
> Utilisez **"Accès démo rapide"** sur l'écran de connexion.

---

## ✨ Fonctionnalités

### Côté Client
- 🔍 **Recherche d'agents** disponibles par commune et type de mission
- 🤖 **Matching IA** via Claude (claude-sonnet-4-20250514) — score de compatibilité
- 📅 **Réservation** avec calcul automatique du prix (règles métier côté serveur)
- 💳 **Paiement sécurisé** Orange Money & MTN MoMo en escrow
- 📍 **Suivi mission** en temps réel (Supabase Realtime)
- 💬 **Chat** avec l'agent pendant la mission
- ⭐ **Notation** après chaque mission

### Côté Agent
- 📲 **Tableau de bord** avec statistiques et revenus
- 🟢 **Toggle disponibilité** en ligne/hors ligne
- ✅ **Gestion missions** : accepter, démarrer, terminer
- 👤 **Profil certifié** avec badge ONPSEC
- 💰 **Suivi revenus** (75% du prix de base)

### Sécurité & Métier
- 🔐 **Auth SMS OTP** via Africa's Talking (+224)
- 🔒 **PIN à 4 chiffres** chiffré bcrypt
- ⚡ **Tarifs fixes** non modifiables côté client
- 🏦 **Escrow** : fonds bloqués jusqu'à validation mission
- 📊 **Commission** : 25% plateforme / 75% agent

---

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Base de données | Supabase (PostgreSQL) |
| Auth | SMS OTP via Africa's Talking |
| Paiements | Orange Money + MTN MoMo Guinée |
| IA Matching | Claude claude-sonnet-4-20250514 (Anthropic) |
| Temps réel | Supabase Realtime |
| Déploiement | GitHub Pages (frontend) |

---

## 📁 Structure du Projet

```
shieldapp/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Onboarding, Login, RegClient, RegAgent
│   │   │   ├── client/         # HomeView, AgentView, BookingView, LiveView
│   │   │   ├── agent/          # AgentDash, MissionsView, ProfilView
│   │   │   └── shared/         # Toast, Header, BottomNav, AgentPhoto
│   │   ├── context/            # AuthContext, AppContext
│   │   ├── hooks/              # useAgents, useMissions, useChat, useMatching
│   │   ├── services/           # api.js, supabase.js, mockData.js
│   │   └── constants/          # tarifs.js, config.js
│   └── vite.config.js
│
├── backend/                    # Node.js + Express
│   ├── routes/
│   │   ├── auth.js             # OTP, PIN, Login
│   │   ├── agents.js           # Liste, profil, disponibilité
│   │   ├── missions.js         # CRUD missions + messages
│   │   ├── matching.js         # Scoring IA Claude
│   │   ├── payments.js         # Orange/MTN + escrow
│   │   ├── uploads.js          # Photos + documents
│   │   └── notifications.js    # SMS + push
│   ├── middleware/auth.js      # JWT
│   └── server.js
│
├── shared/
│   └── supabase-schema.sql     # Script création tables
│
└── .github/workflows/
    └── deploy.yml              # CI/CD GitHub Pages
```

---

## 🚀 Installation & Développement

### Prérequis
- Node.js 18+
- npm 9+

### 1. Cloner et installer

```bash
git clone https://github.com/pilel1990/shield-app.git
cd shield-app

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Variables d'environnement

```bash
# Copier les exemples
cp .env.example .env.local
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Remplir avec vos clés
```

### 3. Démarrer en mode démo (sans APIs)

```bash
# Frontend seulement (mode démo complet)
cd frontend && npm run dev
# → http://localhost:3000/shield-app/
```

### 4. Démarrer en mode full-stack

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 🗄️ Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `shared/supabase-schema.sql` dans **SQL Editor**
3. Activer Realtime sur les tables : `missions`, `messages`, `agents`
4. Copier l'URL et les clés dans `.env`

---

## 💳 Tarifs des Missions (GNF)

| Type de mission | Tarif / heure |
|----------------|--------------|
| Garde du corps VIP | 150 000 GNF |
| Protection d'événement | 100 000 GNF |
| Surveillance de site | 50 000 GNF |
| Sécurité résidentielle | 60 000 GNF |
| Escorte sécurisée | 120 000 GNF |
| Mission sur mesure | 80 000 GNF |

> **Règles métier :** Minimum 3h • Urgence +25% • Immédiat +50%
> Commission plateforme : 25% (invisible client) • Part agent : 75%

---

## 🧪 Tester la démo

### Flow Client
1. Ouvrir l'app → **"Accès démo rapide"** → Client
2. Parcourir les agents disponibles (HomeView)
3. Cliquer **"Réserver"** sur un agent
4. Choisir type mission, durée, adresse
5. Simuler paiement Orange/MTN
6. Voir la mission dans "Mes missions"
7. Accéder au suivi live + chat

### Flow Agent
1. Accès démo rapide → **Agent**
2. Toggle disponibilité ON/OFF
3. Voir les nouvelles missions en attente
4. Accepter → Démarrer → Terminer
5. Consulter statistiques et revenus

---

## 🔌 Connecter les vraies APIs

### Supabase
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
VITE_DEMO_MODE=false
```

### SMS OTP (Africa's Talking)
```env
AFRICASTALKING_API_KEY=your-key
AFRICASTALKING_USERNAME=shieldapp
```

### Claude IA Matching
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Mobile Money
```env
ORANGE_MONEY_API_KEY=your-key
MTN_MOMO_API_KEY=your-key
```

---

## 🚢 Déploiement GitHub Pages

```bash
# 1. Push sur main → GitHub Actions se déclenche automatiquement
git push origin main

# 2. Activer GitHub Pages dans Settings > Pages
# Source: GitHub Actions

# 3. URL live:
# https://pilel1990.github.io/shield-app/
```

---

## 📞 Formats téléphone Guinée

- Orange Guinée : `+224 62X XXX XXX`
- MTN Guinée : `+224 65X XXX XXX`

---

## 📄 Licence

Propriétaire — © 2025 ShieldApp Guinée. Tous droits réservés.

---

*Construit avec ❤️ pour la sécurité à Conakry, Guinée 🇬🇳*
