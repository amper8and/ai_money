# UBA AI-Money Demo — Full Specification

**Version**: 2.0  
**Date**: 2026-02-26  
**Status**: Active  

---

## 1. Overview

**Product**: UBA AI-Money Demo  
**Tagline**: "Turn money into momentum"  
**Purpose**: A mobile-first SPA demo showcasing how UBA's AI-Money assistant guides customers through goal-based savings and credit planning for home renovation/upgrade projects.

**Demo Persona**: Amina Diallo  
- Phone: +234 *** **7  
- Email: a.diallo@email.com  
- Wallet: ₦2,500 cash + 150 Goal Points  
- Badges: Goal Setter, AutoSave Enabled, Early Adopter  

---

## 2. URLs & Environments

| Environment | URL |
|---|---|
| Original demo | https://qkaguvgn.gensparkspace.com/ |
| Dev sandbox | https://3000-id4cik1v1merwzoobrqnf-6532622b.e2b.dev |
| GitHub | https://github.com/amper8and/ai_money |

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Backend framework | Hono v4.x |
| Runtime | Cloudflare Pages Workers |
| Build tool | Vite v6 + @hono/vite-build/cloudflare-pages |
| Frontend | Vanilla JS (ES5-compatible) |
| CSS | Tailwind CSS CDN |
| Icons | FontAwesome 6.4.0 CDN |
| Typography | Google Fonts — Montserrat |
| Deployment | wrangler pages deploy |
| Dev server | wrangler pages dev (via PM2) |
| Package manager | npm |

---

## 4. Project Structure

```
webapp/
├── src/
│   └── index.tsx              # Hono router — imports app.html?raw, serves images
├── public/
│   ├── static/
│   │   ├── app.html           # Full SPA (HTML + CSS + JS in one file)
│   │   └── style.css          # (legacy, unused)
│   ├── welcome-background-with-logo.jpg
│   └── amina-profile.png
├── dist/                      # Build output
│   ├── _worker.js
│   ├── _routes.json
│   ├── static/
│   ├── welcome-background-with-logo.jpg
│   └── amina-profile.png
├── ecosystem.config.cjs       # PM2 config
├── wrangler.jsonc             # Cloudflare config
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Architecture

### Server (src/index.tsx)
```typescript
import appHtml from '../public/static/app.html?raw'  // Vite raw import at build time

app.get('/')     → c.html(appHtml)                   // Serve full SPA
app.get('/welcome-background-with-logo.jpg')         // Serve image (wrangler static)
app.get('/amina-profile.png')                        // Serve image (wrangler static)
```

### SPA Pattern (public/static/app.html)
- Single `#app` div, populated entirely by `render()`
- Global `state` object holds all application state
- `render()` dispatches to per-page render functions based on `state.page`
- No external JS libraries (except Tailwind CDN)
- ES5-compatible vanilla JS throughout

---

## 6. State Object (Annotated)

```js
var state = {
  isAuth: false,            // true after login()
  page: 'welcome',          // current page key
  goal: null,               // { upgradeType, budget, timeline, preference, monthlyMax }
                            // Set by confirmGoal() after wizard completion
  selectedPlan: null,       // 'save_only' | 'hybrid' | 'credit_first'
                            // Set by selectPlan() — triggers nav to 'mission'
  goalWizard: {
    step: 1,                // Current wizard step (1-8)
    upgradeType: null,      // 'Paint' | 'Appliances' | 'Furniture' | 'Repairs'
    budget: null,           // Number (₦)
    timeline: null,         // Number (weeks)
    preference: null,       // 'Save-only' | 'Hybrid' | 'Credit-first'
    monthlyMax: null        // Number (₦/month cap)
  },
  user: {
    name: 'Amina Diallo',
    phone: '+234 *** **7',
    email: 'a.diallo@email.com',
    badges: ['Goal Setter', 'AutoSave Enabled', 'Early Adopter'],
    wallet: { cash: 2500, points: 150 }   // points replaces dataMB
  },
  missions: [{
    id: 'mission-home-upgrade',
    name: 'Home Upgrade Sprint',
    desc: 'Fund your renovation without financial stress',
    reward: '250 Goal Points',
    progress: 1,    // step 1 is pre-completed (goal creation)
    total: 3,
    steps: [
      { id: 's1', text: 'Create Renovation Goal', done: true },
      { id: 's2', text: 'Open Renovation Pocket + Activate AutoSave', done: false },
      { id: 's3', text: 'Accept Pre-Approval + Choose payout option', done: false }
    ]
  }],
  rewards: [
    { id: 1, amount: '₦500 Cashback',         source: 'Partner Merchant',    status: 'redeem',   statusColor: '#E41000' },
    { id: 2, amount: '250 Goal Points',        source: 'Home Upgrade Sprint', status: 'pending',  statusColor: '#666' },
    { id: 3, amount: 'Fee Waiver (1 transfer)',source: 'AutoSave Bonus',      status: 'redeemed', statusColor: '#10b981' }
  ],
  totalRewards: { cash: 500, points: 150 }
}
```

---

## 7. Page Behaviour

### Navigation Flow
```
welcome ──login()──► home
home ──nav('goal')──► goal (wizard step 1)
goal wizard ──selectPlan()──► mission
home/campaigns ──nav('mission')──► mission
home/mission ──nav('profile')──► profile
home/mission ──nav('campaigns')──► campaigns
all pages ──nav('home')──► home
```

### welcome
- Full-screen background image with UBA branding
- Two login buttons (WhatsApp / Phone Number) both call `login()`
- `login()` sets `state.isAuth = true`, calls `nav('home')`

### home
- Header with user name, phone, profile image (clickable → profile)
- 4 quick-action icons: Payments, Goals (→ goal), Earn (→ mission), Transfer
- Goal Points balance card (gold, live from `state.user.wallet.points`)
- Mystery Box card
- Your Rewards section (from `state.rewards`)
- Active Mission card (Home Upgrade Sprint, progress bar, Continue button)
- **Floating CTA**: "Chat to AI-Money" (red button, bottom) → `nav('goal')`

### goal (wizard)
Steps 1-6 collect user inputs, step 7 = AI thinking animation, step 8 = plan selection.

| Step | Content |
|---|---|
| 1 | Upgrade type chips (Paint/Appliances/Furniture/Repairs) |
| 2 | Budget input (₦) |
| 3 | Timeline input (weeks) with quick-select chips |
| 4 | Preference cards (Save-only / Hybrid / Credit-first) |
| 5 | Monthly cap input (₦) with quick-select chips |
| 6 | Confirmation summary card |
| 7 | AI thinking animation (auto-advances after 2.2s) |
| 8 | 3 plan recommendation cards; "Activate This Plan" → `selectPlan()` |

**Validation**: Each `wizardNext()` call validates required inputs before advancing.

### mission
- Optional "Selected Plan" summary card (if `state.selectedPlan` set)
- Mission header: name, description, "8 weeks remaining" badge
- Progress bar (live from `state.missions[0].progress`)
- Reward display
- Step cards: completed steps show green check; pending steps show "Complete Step" button
- Quick "Complete Next Step" button at bottom (demo shortcut)
- Mission complete card shown when all steps done (250 Goal Points awarded)

### profile
- User avatar (amina-profile.png), name, phone
- Basic Info: username, email, cash balance, Goal Points (live)
- Badges & Achievements: Goal Setter, AutoSave Enabled, Early Adopter
- Active Goal card (shown if `state.goal` is set)

### campaigns
- Active Goal card (if `state.goal` set) OR empty-state with CTA to goal wizard
- Active Mission card (summary, progress bar, click → mission)
- Recent Rewards list

---

## 8. Key Functions

| Function | Purpose |
|---|---|
| `nav(page)` | Set `state.page` and call `render()` |
| `login()` | Set `state.isAuth = true`, nav to home |
| `toast(msg, color)` | Show dismissing toast (2.5s) |
| `fmt(n)` | Format number as Nigerian locale string |
| `completeStep(stepId)` | Mark step done, update progress, award points on completion |
| `wizardNext(nextStep)` | Validate + advance wizard step |
| `confirmGoal()` | Save goal to state, trigger AI thinking → plan selection |
| `selectPlan(planKey)` | Save selected plan, nav to mission |
| `getPlan(pk)` | Calculate plan details from goal inputs |
| `render()` | Master dispatcher — calls correct renderXxx() function |

---

## 9. Design System

### Colours
| Token | Hex | Usage |
|---|---|---|
| UBA Red | `#E41000` | Primary CTA, active states |
| Emerald | `#10b981` | Success, progress, step completion |
| Gold | `#f59e0b` | Rewards, points, warnings |
| Dark bg | `#0a0a0a` | Page background |
| Card bg | `#212121` | Cards |
| Surface | `#1a1a1a` | Inner surfaces, headers |

### CSS Classes
| Class | Description |
|---|---|
| `.card` | Hoverable card (background: #212121) |
| `.card-static` | Non-hoverable card |
| `.btn-primary` | Green action button |
| `.btn-outline` | Green outlined button |
| `.badge-warning` | Gold badge |
| `.badge-success` | Green badge |
| `.badge-blue` | Blue badge |
| `.chip` | Selectable tag (upgrade, timeline, monthly) |
| `.chip.selected` | Selected chip state |
| `.plan-card` | Preference/recommendation card |
| `.plan-card.selected` | Selected plan state |
| `.plan-card.recommended` | Gold border for recommended plan |
| `.progress-bar / .progress-fill` | Progress bar component |
| `.toast` | Slide-up notification |
| `.ai-thinking` | Bouncing dot animation |

---

## 10. Build System

### package.json Scripts
```bash
npm run build          # vite build → dist/_worker.js
npm run dev            # vite dev server (local, not for sandbox)
npm run deploy         # build + wrangler pages deploy
```

### Build Process
1. Vite SSR build via `@hono/vite-build/cloudflare-pages`
2. `src/index.tsx` compiled → `dist/_worker.js`
3. `public/static/app.html?raw` inlined into `_worker.js` at build time
4. Images copied manually: `cp public/*.{jpg,png} dist/`
5. Static dir copied: `cp -r public/static dist/`

---

## 11. PM2 / Dev Workflow

```js
// ecosystem.config.cjs
{
  name: 'uba-missions-rewards',
  script: 'npx',
  args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
  exec_mode: 'fork'
}
```

```bash
npm run build
cp public/*.jpg public/*.png dist/
cp -r public/static dist/
pm2 start ecosystem.config.cjs
curl http://localhost:3000   # → 200 OK
```

---

## 12. Cloudflare Deployment

```bash
npm run build
cp public/*.jpg public/*.png dist/
cp -r public/static dist/
npx wrangler pages deploy dist --project-name <project-name>
```

No D1/KV/R2 bindings needed — this is a pure in-memory demo.

---

## 13. Known Limitations

1. **No persistence** — state resets on page refresh
2. **No real auth** — both login buttons are demo shortcuts
3. **Static persona** — Amina Diallo is hardcoded (no real user data)
4. **No real AI** — plan recommendations are calculated client-side
5. **No real banking API** — wallet balance is hardcoded
6. **No real payments** — bill payment / AutoSave are UI-only
7. **Tailwind CDN** — production should use PostCSS/CLI build
8. **Single mission** — only Home Upgrade Sprint available
9. **No deep links** — page state not reflected in URL
10. **ES5 JS** — no modern syntax (for broad CDN compatibility)

---

## 14. Suggested Next Steps

| Priority | Task |
|---|---|
| High | Add Cloudflare D1 for persistent user state |
| High | Replace static persona with real login (WhatsApp OTP) |
| High | Connect real AI recommendation (OpenAI/Gemini) |
| Medium | Add more mission types (bills, school fees, travel) |
| Medium | URL-based navigation (history API) |
| Medium | Real UBA Open Banking API integration |
| Low | PWA/offline support |
| Low | Push notification milestones |
| Low | Tailwind CLI build (remove CDN) |
| Low | Accessibility improvements (ARIA, keyboard nav) |

---

*Specification maintained alongside codebase in `/home/user/webapp/spec.md`*
