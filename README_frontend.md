# Frontend — RAG Chat (Vite + React + Tailwind)

Projet frontend pour un **chat RAG** avec gestion de workspaces (FAISS), choix du fournisseur LLM (Ollama local / Groq Cloud), historique local, et zone admin.

---

## 🚀 Stack
- **Build**: Vite
- **UI**: React 18 + Tailwind CSS + shadcn/ui + lucide-react
- **Auth**: Contexte `AuthContext` (JWT côté backend supposé)
- **RAG**: Workspace + FAISS (via API backend)
- **State léger**: React state + localStorage (historique)
- **Routing**: react-router-dom

---

## 📁 Structure des dossiers (proposée)
```
.
├── public/
├── src/
│   ├── assets/                       # Images, logos, etc.
│   ├── components/
│   │   ├── ui/                       # Petits composants UI réutilisables
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── AgentCard.jsx
│   │   │   ├── AnswerBlock.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessages.jsx
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ProviderSwitch.jsx
│   │   │   ├── SourceSwitch.jsx
│   │   │   └── TopTabs.jsx
│   │   └── index.js                  # (optionnel) exports groupés
│   ├── lib/                          # Helpers pur JS (formatters, consts, etc.)
│   ├── pages/                        # Pages / routes
│   │   ├── AdminDashboard.jsx
│   │   ├── Chat.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── services/
│   │   └── api.js                    # Appels HTTP vers le backend
│   ├── state/
│   │   └── AuthContext.jsx           # Auth, user, logout(), Protected, etc.
│   ├── styles/
│   │   ├── tailwind.css              # Entrée Tailwind
│   │   ├── theme.css                 # Variables et thèmes
│   │   ├── App.css                   # Styles globaux d’app
│   │   └── index.css                 # Reset + styles globaux
│   ├── App.jsx                       
│   └── main.jsx                      # Entrée Vite
├── .env                               # Variables locales (non commité)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
> Astuce: si un composant grossit, crée un dossier `components/<Nom>/index.jsx` + `styles.css` + `hooks.js`.

---

## 🔑 Variables d’environnement (`.env`)
Créez un `.env` (ou `.env.local`) à la racine :
```
# URL de base du backend (FastAPI/Express)
VITE_API_BASE=http://localhost:8000

# LLM provider côté serveur (info indicatif côté front)
VITE_DEFAULT_PROVIDER=ollama

# (Optionnel) Paramètres réseau pour Ollama local (si exposé via backend)
VITE_OLLAMA_HOST=http://127.0.0.1:11434

# (Optionnel) Flags debug
VITE_DEBUG=false
```
> ⚠️ Les clés sensibles (ex: GROQ_API_KEY) **restent côté backend**. Le front ne doit pas exposer de secrets.

---

## 📦 Installation & scripts
```bash
# 1) Installer
npm install

# 2) Lancer en dev
npm run dev

# 3) Build production
npm run build

# 4) Prévisualiser le build
npm run preview
```
> Tailwind: n’oubliez pas la config `tailwind.config.js` + `postcss.config.js` si le projet les utilise.

---

## 🔌 API – contrats attendus (côté front)
Le front consomme `services/api.js`. Endpoints attendus (exemples) :

- `GET /api/llm/status` → `{ active_provider, ready }`
- `POST /api/llm/select` body `{ provider }` → `{ provider, ready }`
- `POST /api/workspaces/:ws_id/build` → stats `{ total_chunks, total_vectors }`
- `POST /api/workspaces/:ws_id/upload` → upload de fichier
- `POST /api/ask` → `{ answer, context, hits, session_id? }`
- `POST /api/ask/:ws_id` → idem mais scoping workspace
- `GET /api/admin/stats` → métriques dashboard
- `GET /api/admin/config` → configuration active
- `POST /api/admin/reindex` / `POST /api/admin/flush`

> Adaptez si vos routes diffèrent. Le front affiche des messages “ready / not ready”, “index reconstruit”, etc., en se basant sur ces réponses.

---

## 👤 Authentification
- `AuthContext.jsx` expose `{ user, login, logout }`.
- Les pages protégées utilisent un composant `Protected` (dans `App.jsx`).
- Le bouton **Déconnexion** est présent dans **Admin** et **Chat** (appelle `logout()` puis redirige `/login`).

---

## 💬 Chat — fonctions clés
- **SourceSwitch**: `workspace` vs `global`
- **ProviderSwitch**: `ollama` vs `groq` (stocké dans `localStorage`)
- **Historique**: conservé dans `localStorage` par utilisateur
- **Upload**: drag & drop ou pièce jointe → upload → rebuild possible
- **Rebuild index**: bouton “Rebuild index” pour FAISS

---

## 🧱 Conventions & qualité
- Components UI **petits** → `src/components/ui/*`
- Pages → `src/pages/*`
- Pas de logique réseau dans les pages: passer par `services/api.js`
- Nommage: `PascalCase.jsx` pour composants, `camelCase` pour fonctions
- CSS: Tailwind en priorité; `theme.css` pour variables; `App.css` pour global
- Icônes: `lucide-react`
- Imports absolus (optionnel) : configurez `jsconfig.json/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "baseUrl": "src",
      "paths": { "@/*": ["*"] }
    }
  }
  ```

---

## 🧪 Vérifications rapides
- [ ] `.env` présent et `VITE_API_BASE` correct
- [ ] Backend démarré (status LLM = **ready**)
- [ ] Upload fichier → message “✅ importé”
- [ ] Rebuild → message “Index reconstruit”
- [ ] Déconnexion → redirection `/login` OK

---

## 🛠 Déploiement (exemple)
- Build: `npm run build` → dossier `dist/`
- Nginx/Apache: servir `dist/` en statique, et **proxy** `/api/*` vers votre backend
- Variables d’URL backend ajustées via `VITE_API_BASE`

---

## ❓Dépannage
- **LLM “not ready”**: vérifier qu’Ollama tourne (modèle téléchargé) ou que la clé GROQ est configurée côté serveur.
- **CORS**: configurer le backend pour autoriser l’origine du front (localhost:5173 en dev).
- **Uploads**: vérifier taille max, types MIME, et logs du backend.
- **Routes 404 en refresh**: activer le fallback `index.html` côté serveur (SPA).

---

## Licence
Projet interne pédagogique / pro. Adapter ici votre licence (MIT, etc.).
