# UBA AI-Mobile Demo: Missions & Rewards App

## Project Overview
- **Name**: UBA — Univerxe (AI-Mobile Demo)
- **Goal**: A mobile-first demo app showcasing UBA's AI-Mobile Missions & Rewards experience
- **Tagline**: "Turn money into momentum. Achieve goals. Unlock rewards. Live freer."

## URLs
- **Original (Production)**: https://qkaguvgn.gensparkspace.com/
- **Sandbox Dev**: https://3000-id4cik1v1merwzoobrqnf-6532622b.e2b.dev
- **GitHub**: https://github.com/amper8and/ai_money

## Features
- ✅ Welcome screen with UBA branding and login flow
- ✅ Home dashboard with wallet, rewards, and active mission
- ✅ Mission detail view with step-by-step progress tracking
- ✅ Profile / Identity page with badges and verification
- ✅ Campaigns overview with active goals and rewards
- ✅ Interactive step completion with toast notifications
- ✅ Simulated wallet balance update on mission completion

## Pages / Routes
| Page | Description |
|------|-------------|
| `welcome` | Landing / login screen (WhatsApp or Phone Number) |
| `home` | Main dashboard with shortcuts, mystery box, rewards |
| `mission` | Bills Booster mission with step completion |
| `profile` | User identity, wallet, badges |
| `campaigns` | Goals & rewards tracking |

## Technology Stack
- **Backend**: Hono framework (Cloudflare Workers)
- **Frontend**: Vanilla JavaScript with Tailwind CSS (CDN)
- **Font**: Google Fonts - Montserrat
- **Icons**: Font Awesome 6
- **Deployment**: Cloudflare Pages

## User Guide
1. Open the app — you'll see the **Welcome screen**
2. Click either "Continue with WhatsApp" or "Continue with Phone Number" to log in
3. You land on the **Home** screen — tap the profile image to see the Identity page
4. Tap **"Earn"** or **"Continue →"** to open the Mission Details page
5. Click **"Complete Step"** buttons to progress through the Bills Booster mission
6. On completing all 3 steps, **250MB data** is added to the wallet

## Development

### Local Start
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### Rebuild after changes
```bash
npm run build
pm2 restart uba-missions-rewards
```

## Deployment Status
- **Platform**: Cloudflare Pages
- **Status**: 🟡 Dev sandbox running — ready for Cloudflare deployment
- **Tech Stack**: Hono + TypeScript + Tailwind CSS (CDN) + Montserrat
- **Last Updated**: February 25, 2026
