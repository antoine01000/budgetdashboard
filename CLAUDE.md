# Budget Dashboard — Contexte projet

## Vue d'ensemble

Application React de gestion de budget personnel/familial déployée sur Netlify, avec Supabase comme backend (auth + Postgres).

- **Prod (app)** : https://budgetdashboard.netlify.app/
- **Prod (Supabase)** : projet `iunfihikvlarustuhamo` (https://iunfihikvlarustuhamo.supabase.co)
- **Repo** : `antoine01000/budgetdashboard`
- **Branche de refonte** : `claude/github-paw-integration-r4OIE`

## Stack actuelle

- **Front** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS 3
- **State** : Zustand 4
- **Charts** : Chart.js + react-chartjs-2
- **Icons** : lucide-react
- **Backend** : Supabase (@supabase/supabase-js 2.39.7)
- **Deploy** : Netlify

## Structure

```
src/
├── App.tsx                    (108 lignes — nav tabs + routing manuel)
├── components/
│   ├── Auth/AuthPage.tsx
│   ├── Charts/ExpenseCharts.tsx       (594 lignes — trop gros)
│   ├── Analysis/ExpenseAnalysis.tsx   (517 lignes — trop gros)
│   ├── Cagnottes/CagnottesSection.tsx (438 lignes — trop gros)
│   ├── Expenses/AddExpenseModal.tsx   (302 lignes)
│   ├── Management/
│   ├── Layout/
│   └── Notepad.tsx
├── store/
│   ├── index.ts               (714 lignes — store monolithique à découper)
│   └── useNotepadStore.ts
├── types/
│   ├── index.ts
│   ├── notepad.ts
│   └── supabase.ts            (types manuels, à régénérer via `supabase gen types`)
├── lib/supabase.ts            (init client)
└── utils/colors.ts

supabase/migrations/           (18 fichiers SQL, à squash un jour)
```

## Schéma DB (8 tables)

Toutes protégées par RLS basée sur `auth.uid() = user_id`.

- `profiles` (id, email)
- `persons` (id, name, user_id, created_at)
- `categories` (id, name, color, user_id, order, created_at)
- `expenses` (id, month, amount, person_id, category_id, comment, user_id, created_at)
- `cagnottes` (id, name, type, description, amount, target_amount, user_id, created_at)
- `subcagnottes` (id, cagnotte_id, name, description, amount, target_amount, created_at)
- `operations` (id, subcagnotte_id, operation, previous_amount, new_amount, created_at)
- `notes` (id, user_id, cagnotte_id, content, created_at, updated_at)

## Commandes

```bash
npm install        # deps
npm run dev        # Vite dev server
npm run build      # build prod
npm run lint       # ESLint
npm run preview    # preview build
npm test           # lance la suite Vitest
npm run test:watch # Vitest en mode watch
```

## Audit — dette technique identifiée

1. **Store monolithique** (`src/store/index.ts` — 714 lignes) : pattern try/catch/isLoading/error répété ~15 fois. À remplacer par **TanStack Query** + stores découpés par domaine.
2. **Pas de routing** : navigation par `useState` dans `App.tsx`. Pas d'URLs partageables. → ajouter React Router.
3. **Pas de tests** : 0 fichier de test, 0 framework. → Vitest + React Testing Library.
4. **Composants trop gros** : `ExpenseCharts` (594), `ExpenseAnalysis` (517), `CagnottesSection` (438), `AddExpenseModal` (302). → découper.
5. **Navigation dupliquée 5×** dans `App.tsx` (un map sur une liste règlerait ça).
6. **`isLoading` global** dans le store → un fetch bloque toute l'UI.
7. **Pas d'ErrorBoundary**, gestion d'erreur UI incohérente (`set({ error })` jamais affiché à l'utilisateur).
8. **18 migrations bruyantes** — plusieurs qui se corrigent mutuellement. À squash.
9. **`<title>Vite + React + TS</title>** jamais customisé dans `index.html`.
10. **Types `Database` Supabase** présents mais manuels — à générer via `supabase gen types`.
11. **`.env` committé** — clés anon publiques (non-critique grâce au RLS, mais best practice = `.env.example`).

## Plan de refonte

### Quick wins (1-2h)
- [x] Title correct dans `index.html` (commit `d1b3a43`)
- [x] ErrorBoundary global (`src/components/ErrorBoundary.tsx`)
- [x] Extraire `<NavTabs>` (`src/components/Layout/NavTabs.tsx`)
- [x] `.env.example`
- [x] Fix config ESLint (dépendances installées, `npm run lint` OK, 0 erreurs)
- [ ] Régénérer types Supabase (`supabase gen types typescript`) — nécessite Supabase CLI

### Refonte moyenne (1-2j)
- [ ] Migrer state → **TanStack Query** (supprime ~500 lignes du store) — à faire contre le Pi, risque DB
- [ ] Découper store par domaine (`useExpenses`, `useCagnottes`, `useNotes`) — idem
- [x] Ajouter **React Router** (URLs propres, `/dashboard`, `/management`, `/cagnottes`, `/analysis`, `/notepad`)
- [x] Découper `ExpenseCharts` (594→164) : `MonthlyTable`, `ExpensesByPerson`, `lib/chartjs`
- [x] Découper `ExpenseAnalysis` (517→212) : `AnalysisFilters`, `useAnalysisData`
- [x] Découper `CagnottesSection` (438→83) : `CagnotteItem`, `NoteModal`
- [ ] `isLoading` par opération, pas global — à faire avec TanStack Query

### Plus gros (optionnel)
- [x] Tests (Vitest + RTL setup) — 12 tests : `useAnalysisData` + `useToastStore`
- [x] Code splitting par route (bundle initial 550 → 320 KB, -42%)
- [x] Système de toasts (remplace les `set({ error })` jamais affichés)
- [x] Accessibilité : hook `useEscapeKey` sur les 4 modals
- [x] PWA (installable mobile + offline shell + SW auto-update) — `vite-plugin-pwa`
- [ ] Design system (shadcn/ui)
- [ ] Squash des 18 migrations en une propre

## Environnement de dev — Supabase self-hosted sur Raspberry Pi

**Contexte** : free tier Supabase limité à 2 projets. Impossible de créer un staging cloud. Solution : self-host Supabase sur Raspberry Pi (8GB RAM).

### Plan de migration DB

1. **Installer Docker + Supabase CLI sur le Pi**
2. `supabase init` + `supabase start` (lance la stack Postgres + Auth GoTrue + PostgREST + Storage + Realtime + Studio en Docker)
3. **`pg_dump` de la prod cloud** (schémas `public` + `auth`) → fichier SQL
4. **Restore sur le Pi** (psql ou pg_restore)
5. **Modifier `.env` local** pour pointer vers le Pi (`VITE_SUPABASE_URL=http://[pi-ip]:54321`)
6. **Dev la refonte contre le Pi** (données réelles, zéro risque sur prod)
7. **Cut-over final** : supprimer ancien projet Supabase cloud → créer le nouveau → dump du Pi → restore nouveau cloud → update env vars Netlify

### À checker avant
- [ ] OS Pi : Raspberry Pi OS 64-bit requis
- [ ] Docker installé
- [ ] Supabase CLI installé
- [ ] IP fixe du Pi connue
- [ ] Accès SSH OK depuis le poste de dev

### Workflow de dev
- **IDE** : VS Code + extension **Remote-SSH** → connexion directe au Pi
- **Claude Code** : installé sur le Pi (`npm i -g @anthropic-ai/claude-code`), lancé dans `~/budgetdashboard`
- **Reprendre session** : `claude -c` (auto-reprend la dernière) ou `claude --resume` (picker)

## Conventions

- Développer sur `claude/github-paw-integration-r4OIE` (jamais directement sur `main`)
- Commits en français, descriptifs
- Merger vers `main` via PR quand un lot cohérent est prêt
- Pas de push destructif sans accord explicite

## État d'avancement

- [x] Audit initial du repo
- [x] Vérification connexion Supabase prod (actif)
- [x] Vérification déploiement Netlify (actif, bundle OK)
- [x] `CLAUDE.md` créé
- [x] Quick wins (commit `d1b3a43`) : title, ErrorBoundary, NavTabs, `.env.example`
- [x] React Router + découpe des gros composants (commit `9154c8a`)
- [x] Code splitting + toasts + tests Vitest + accessibilité Esc (commit `afa5947`)
- [x] PWA : manifest, service worker, icônes, installable mobile (commit `c160901`)
- [ ] Setup Pi (Docker + Supabase CLI + stack)
- [ ] Migration DB prod → Pi
- [ ] Switch `.env` local vers Pi
- [ ] Refonte du store (TanStack Query, découpe par domaine) — nécessite le Pi
- [ ] Design system (shadcn/ui) — optionnel
- [ ] Squash des 18 migrations en une propre — à faire avant cut-over cloud
