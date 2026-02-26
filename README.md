# UBA AI-Money Demo: Missions & Rewards App

## Overview
A mobile-first SPA demo showcasing **AI-Money** — UBA's intelligent goal-planning assistant that helps customers fund home upgrades and renovation projects without financial stress.

- **Live Demo**: https://qkaguvgn.gensparkspace.com/ (original)  
- **Dev Sandbox**: https://3000-id4cik1v1merwzoobrqnf-6532622b.e2b.dev  
- **GitHub**: https://github.com/amper8and/ai_money  
- **Platform**: Cloudflare Pages + Hono  

---

## Demo Journey (Amina Diallo)

1. **Welcome Screen** → Login via WhatsApp or Phone Number
2. **Home Dashboard** → See wallet balance, rewards, active mission; tap **"Chat to AI-Money"**
3. **Goal Creation Wizard** (5 steps):
   - Select upgrade type: Paint / Appliances / Furniture / Repairs
   - Enter target budget (e.g. ₦200,000)
   - Set timeline (e.g. 8 weeks)
   - Choose preference: Save-only / Hybrid / Credit-first
   - Set monthly payment cap (e.g. ₦25,000)
4. **AI Analysis** → Animated thinking screen (~2 s)
5. **Plan Recommendations** → 3 selectable cards (Save-Only, **Hybrid [Recommended]**, Credit-First)
6. **Mission Screen** → Home Upgrade Sprint with step-by-step completion
7. **Rewards** → 250 Goal Points earned on mission completion

---

## Features Implemented

| Feature | Status |
|---|---|
| Welcome screen with UBA branding | ✅ |
| Login (demo — no real auth) | ✅ |
| Home dashboard (wallet, rewards, mission card) | ✅ |
| **Goal Creation Wizard (5 steps)** | ✅ |
| **AI-Money analysis + plan recommendations** | ✅ |
| **Home Upgrade Sprint mission** | ✅ |
| Step completion with toast feedback | ✅ |
| **Points wallet (replaces data/MB)** | ✅ |
| **Banking-themed rewards** (cashback, fee waiver, goal points) | ✅ |
| Profile / Identity page with badges | ✅ |
| Campaigns page with active goal card | ✅ |
| Responsive mobile-first dark UI | ✅ |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Hono (Cloudflare Pages) |
| Frontend | Vanilla JS + Tailwind CSS CDN |
| Fonts | Google Fonts (Montserrat) |
| Icons | FontAwesome 6.4.0 |
| Storage | None (in-memory state, resets on refresh) |
| Deploy | Cloudflare Pages via Wrangler |

---

## Architecture

Single-file SPA (`public/static/app.html`) served by a thin Hono router (`src/index.tsx`).  
The HTML is imported at build time using Vite's `?raw` import and returned via `c.html()`.

```
src/index.tsx          — Hono router (import app.html?raw, serve images)
public/static/app.html — Full SPA: state, renderers, wizard, mission logic
public/welcome-background-with-logo.jpg
public/amina-profile.png
```

### Navigation (state.page)
```
welcome → home → goal (wizard 1-8) → mission
                ↓
           profile, campaigns
```

---

## Data Model

```js
state = {
  isAuth: false,
  page: 'welcome',
  goal: null,           // Set after wizard completion
  selectedPlan: null,   // 'save_only' | 'hybrid' | 'credit_first'
  goalWizard: { step, upgradeType, budget, timeline, preference, monthlyMax },
  user: {
    name, phone, email,
    badges: ['Goal Setter', 'AutoSave Enabled', 'Early Adopter'],
    wallet: { cash: 2500, points: 150 }
  },
  missions: [{
    id: 'mission-home-upgrade',
    name: 'Home Upgrade Sprint',
    steps: [s1 (done), s2, s3],
    reward: '250 Goal Points',
    progress: 1, total: 3
  }],
  rewards: [₦500 Cashback, 250 Goal Points, Fee Waiver],
  totalRewards: { cash: 500, points: 150 }
}
```

---

## Local Development

```bash
npm install
npm run build
pm2 start ecosystem.config.cjs   # starts on port 3000
curl http://localhost:3000        # verify
```

## Deployment

```bash
npm run build
npx wrangler pages deploy dist --project-name <your-project-name>
```

---

## Suggested Next Steps

1. Add more mission types (bill payment, school fees, travel)
2. Persist state to Cloudflare D1 (real user accounts)
3. Add real AI recommendation engine via OpenAI/Gemini API
4. Integrate UBA Open Banking API for real balance/transaction data
5. Add push notifications for goal milestones
6. Enable real WhatsApp login via Twilio / WhatsApp Business API

---

*Last updated: 2026-02-26 — AI-Money positioning with Goal Creation wizard and Home Upgrade Sprint mission*
