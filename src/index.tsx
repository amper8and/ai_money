import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static assets
app.use('/static/*', serveStatic({ root: './' }))

// Serve image assets at root level
app.get('/welcome-background-with-logo.jpg', serveStatic({ path: './public/welcome-background-with-logo.jpg' }))
app.get('/amina-profile.png', serveStatic({ path: './public/amina-profile.png' }))

// Main app route
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>UBA — Univerxe (AI-Mobile Demo)</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        uba: { red: '#E4002B', 'red-dark': '#C00024' },
                        emerald: { DEFAULT: '#10b981', dark: '#059669' },
                        gold: { DEFAULT: '#f59e0b', dark: '#d97706' }
                    },
                    fontFamily: { sans: ['Montserrat', 'system-ui', 'sans-serif'] }
                }
            }
        }
    </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Montserrat', sans-serif; 
            background: #0a0a0a; 
            color: #fff;
            -webkit-font-smoothing: antialiased;
        }
        .card {
            background: #212121;
            border-radius: 1rem;
            padding: 1.25rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .card:hover { background: #2a2a2a; cursor: pointer; }
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 500;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn:active { transform: scale(0.95); }
        .btn-primary { background: #10b981; color: white; }
        .btn-primary:hover { background: #059669; }
        .progress-bar {
            width: 100%;
            height: 0.5rem;
            background: #1a1a1a;
            border-radius: 9999px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(to right, #10b981, #34d399);
            transition: width 0.5s;
        }
        .badge {
            display: inline-flex;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .badge-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .badge-success { background: rgba(16,185,129,0.2); color: #10b981; }
        .toast {
            position: fixed;
            bottom: 5rem;
            left: 1rem;
            right: 1rem;
            background: #212121;
            color: white;
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px rgba(0,0,0,0.4);
            z-index: 50;
            animation: slideUp 0.3s;
            border-left: 4px solid #10b981;
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .hidden { display: none; }
        
        /* CRITICAL: Ensure logo transparency */
        .logo-transparent {
            background: transparent !important;
            background-color: transparent !important;
        }
    </style>
</head>
<body>
    <div id="app"></div>

    <script>
        const state = {
            isAuth: false,
            page: 'welcome',
            user: {
                name: 'Amina Diallo',
                phone: '+234 *** **7',
                email: 'a.diallo@email.com',
                badges: ['SME Club Member', 'Early Adopter'],
                wallet: { cash: 2500, dataMB: 150 }
            },
            missions: [{
                id: 'mission-bills',
                name: 'Bills Booster',
                desc: 'Pay 3 bills this month',
                steps: [
                    { id: 's1', text: 'Pay first bill', done: false },
                    { id: 's2', text: 'Pay second bill', done: false },
                    { id: 's3', text: 'Pay third bill', done: false }
                ],
                reward: '250MB data',
                progress: 0,
                total: 3
            }],
            rewards: [
                { id: 1, amount: '&#8358;500 Airtime', source: 'Download &amp; Do', status: 'redeem', statusColor: '#E41000' },
                { id: 2, amount: '&#8358;300 Cashback', source: 'Bills Booster', status: 'pending', statusColor: '#666' },
                { id: 3, amount: '2GB Data Bundle', source: 'SME QR Challenge', status: 'redeemed', statusColor: '#10b981' }
            ],
            totalRewards: { cash: 1200, data: '2GB' }
        };

        function nav(page) { state.page = page; render(); }
        function login() { state.isAuth = true; nav('home'); }
        function toast(msg) {
            const el = document.createElement('div');
            el.className = 'toast';
            el.innerHTML = \`<p style="font-weight:500">\${msg}</p>\`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }
        function completeStep(stepId) {
            const m = state.missions[0];
            const step = m.steps.find(s => s.id === stepId);
            if (step && !step.done) {
                step.done = true;
                m.progress++;
                toast(\`<i class="fas fa-check"></i> \${step.text} completed!\`);
                if (m.progress === m.total) {
                    setTimeout(() => {
                        state.user.wallet.dataMB += 250;
                        toast('<i class="fas fa-trophy"></i> Mission Complete! 250MB earned!');
                        render();
                    }, 1500);
                }
                render();
            }
        }

        function renderWelcome() {
            return \`
                <div class="min-h-screen relative flex items-center justify-center p-6" 
                     style="background-image: url('welcome-background-with-logo.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                    <div class="relative z-10 max-w-md w-full text-center">
                        <p class="text-xl font-semibold text-white mb-3">Turn money into momentum</p>
                        <p class="text-base text-gray-300 mb-12">Achieve goals. Unlock rewards. Live freer.</p>
                        <div class="space-y-4">
                            <button onclick="login()" class="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95" 
                                    style="background:#000000; color:white;">
                                <i class="fab fa-whatsapp" style="font-size:1.25rem"></i> Continue with WhatsApp
                            </button>
                            <button onclick="login()" class="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95" 
                                    style="background:#E41000; color:white;">
                                <i class="fas fa-mobile-alt" style="font-size:1.25rem"></i> Continue with Phone Number
                            </button>
                        </div>
                    </div>
                </div>
            \`;
        }

        function renderHome() {
            const m = state.missions[0];
            const pct = (m.progress / m.total) * 100;
            return \`
                <div class="min-h-screen pb-6" style="background:#0a0a0a">
                    <div class="px-6 py-4" style="background:#1a1a1a">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-2xl font-bold mb-1">Hi, Amina <i class="fas fa-hand-paper" style="color:#f59e0b"></i></h1>
                                <p class="text-gray-400 text-sm">\${state.user.phone}</p>
                            </div>
                            <img src="amina-profile.png" alt="Amina's profile" class="w-12 h-12 rounded-full object-cover" style="cursor:pointer" onclick="nav('profile')">
                        </div>
                    </div>

                    <div class="px-6 space-y-6 mt-6">
                        <div class="flex justify-between gap-3">
                            <div class="flex flex-col items-center gap-2 cursor-pointer">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000">
                                    <i class="fas fa-credit-card" style="color:white; font-size:1.5rem"></i>
                                </div>
                                <span class="text-xs font-medium">Payments</span>
                            </div>
                            <div class="flex flex-col items-center gap-2 cursor-pointer" onclick="nav('mission')">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000">
                                    <i class="fas fa-coins" style="color:white; font-size:1.5rem"></i>
                                </div>
                                <span class="text-xs font-medium">Earn</span>
                            </div>
                            <div class="flex flex-col items-center gap-2 cursor-pointer">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000">
                                    <i class="fas fa-bullseye" style="color:white; font-size:1.5rem"></i>
                                </div>
                                <span class="text-xs font-medium">Goals</span>
                            </div>
                            <div class="flex flex-col items-center gap-2 cursor-pointer">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000">
                                    <i class="fas fa-exchange-alt" style="color:white; font-size:1.5rem"></i>
                                </div>
                                <span class="text-xs font-medium">Transfer</span>
                            </div>
                        </div>

                        <div class="card" style="background:linear-gradient(90deg,rgba(245,158,11,0.2),rgba(249,115,22,0.2)); border:1px solid rgba(245,158,11,0.3)">
                            <div class="flex items-center gap-4">
                                <div class="text-4xl"><i class="fas fa-gift" style="color:#f59e0b"></i></div>
                                <div>
                                    <h3 class="font-semibold mb-1">Mystery Box</h3>
                                    <p class="text-gray-400 text-sm">Complete 3 goals to unlock</p>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold">Your Rewards</h2>
                            </div>
                            <div class="space-y-3">
                                \${state.rewards.map(r => \`
                                    <div class="rounded-xl p-3" style="background:#1a1a1a">
                                        <div class="flex items-center justify-between mb-1">
                                            <h3 class="font-semibold text-sm">\${r.amount}</h3>
                                            <span class="text-xs px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.1); color:\${r.statusColor}; text-transform: capitalize">\${r.status}</span>
                                        </div>
                                        <p class="text-gray-400 text-xs">From: \${r.source}</p>
                                    </div>
                                \`).join('')}
                            </div>
                            <div class="mt-4 pt-3 border-t" style="border-color:#333">
                                <p class="text-sm text-gray-400">Total Rewards: <span class="font-semibold text-white">&#8358;\${state.totalRewards.cash}+ \${state.totalRewards.data}</span></p>
                            </div>
                        </div>

                        <div class="card" style="background:linear-gradient(135deg,#212121,#1a1a1a); border:1px solid rgba(16,185,129,0.2)">
                            <div class="mb-3">
                                <div class="badge badge-warning mb-2">Active Goal</div>
                                <h3 class="font-semibold mb-1">\${m.name}</h3>
                                <p class="text-gray-400 text-sm">\${m.desc} <span style="color:#f59e0b">&#8594; unlock 250MB</span></p>
                            </div>
                            <div class="mb-4">
                                <div class="flex items-center justify-between text-sm mb-2">
                                    <span class="text-gray-400">Progress</span>
                                    <span class="font-medium">\${m.progress}/\${m.total}</span>
                                </div>
                                <div class="progress-bar"><div class="progress-fill" style="width:\${pct}%"></div></div>
                            </div>
                            <button onclick="nav('mission')" class="btn btn-primary w-full justify-center">Continue &#8594;</button>
                        </div>
                    </div>

                    <div class="fixed bottom-6 left-6 right-6 z-30">
                        <button class="w-full py-4 px-6 rounded-full font-semibold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg" 
                                style="background:#E41000; color:white;">
                            <i class="fas fa-comments" style="font-size:1.25rem"></i>
                            Chat to AI-Mobile
                        </button>
                    </div>

                </div>
            \`;
        }

        function renderMission() {
            const m = state.missions[0];
            const pct = (m.progress / m.total) * 100;
            return \`
                <div class="min-h-screen pb-6" style="background:#0a0a0a">
                    <div class="px-6 py-4" style="background:#1a1a1a">
                        <div class="flex items-center gap-4 mb-6">
                            <button onclick="nav('home')" class="text-2xl">&#8592;</button>
                            <h1 class="text-xl font-bold">Mission Details</h1>
                        </div>
                    </div>

                    <div class="px-6 py-6">
                        <div class="card mb-6">
                            <div class="flex items-start gap-4 mb-4">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-4xl" style="background:rgba(245,158,11,0.2)"><i class="fas fa-bolt" style="color:#f59e0b"></i></div>
                                <div class="flex-1">
                                    <h2 class="text-2xl font-bold mb-2">\${m.name}</h2>
                                    <p class="text-gray-400 mb-3">\${m.desc}</p>
                                    <div class="badge badge-warning">7 days remaining</div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <div class="flex items-center justify-between text-sm mb-2">
                                    <span class="text-gray-400">Progress</span>
                                    <span class="font-medium">\${m.progress}/\${m.total} completed</span>
                                </div>
                                <div class="progress-bar h-3"><div class="progress-fill" style="width:\${pct}%"></div></div>
                            </div>
                            <div class="p-4 rounded-xl" style="background:linear-gradient(90deg,rgba(245,158,11,0.2),rgba(249,115,22,0.2)); border:1px solid rgba(245,158,11,0.3)">
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl"><i class="fas fa-gift" style="color:#f59e0b"></i></span>
                                    <div>
                                        <p class="text-gray-400 text-xs mb-1">Reward</p>
                                        <p class="text-lg font-bold" style="color:#f59e0b">\${m.reward}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h3 class="text-lg font-semibold mb-3">Steps to Complete</h3>
                            \${m.steps.map((s, i) => \`
                                <div class="card \${s.done ? 'border' : ''}" style="\${s.done ? 'background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3)' : 'border:1px solid #333'}">
                                    <div class="flex items-start gap-4">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center \${s.done ? 'font-bold' : ''}" 
                                             style="background:\${s.done ? '#10b981' : '#1a1a1a'}; color:\${s.done ? 'white' : '#666'}">
                                            \${s.done ? '<i class="fas fa-check"></i>' : i+1}
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-medium mb-2 \${s.done ? 'line-through' : ''}" style="color:\${s.done ? '#10b981' : 'white'}">\${s.text}</p>
                                            \${!s.done ? \`<button onclick="completeStep('\${s.id}')" class="btn btn-primary text-sm">Complete Step</button>\` : 
                                             \`<p class="text-sm" style="color:#10b981"><i class="fas fa-check"></i> Completed</p>\`}
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>

                        \${m.progress < m.total ? \`
                            <div class="mt-6">
                                <button onclick="completeStep('\${m.steps.find(s => !s.done)?.id}')" class="w-full btn btn-primary justify-center">Pay Bill Now</button>
                                <p class="text-center text-sm mt-2" style="color:#666">Demo: Simulated payment</p>
                            </div>
                        \` : ''}
                    </div>
                </div>
            \`;
        }

        function renderProfile() {
            return \`
                <div class="min-h-screen pb-6" style="background:#0a0a0a">
                    <div class="px-6 py-4" style="background:#1a1a1a">
                        <div class="flex items-center gap-4 mb-6">
                            <button onclick="nav('home')" class="text-2xl">&#8592;</button>
                            <h1 class="text-xl font-bold">Identity</h1>
                        </div>
                        <div class="flex items-center gap-4 mb-6">
                            <img src="amina-profile.png" alt="Amina's profile" class="w-16 h-16 rounded-full object-cover">
                            <div>
                                <h2 class="text-xl font-bold">\${state.user.name}</h2>
                                <p class="text-gray-400">\${state.user.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-6 space-y-6">
                        <div class="card">
                            <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-gray-400 text-sm mb-1 block">Username</label>
                                    <p class="font-medium">aminad</p>
                                </div>
                                <div>
                                    <label class="text-gray-400 text-sm mb-1 block">Email</label>
                                    <p class="font-medium">\${state.user.email}</p>
                                </div>
                                <div>
                                    <label class="text-gray-400 text-sm mb-1 block">Wallet</label>
                                    <div class="rounded-xl px-4 py-2 inline-block" style="background:#1a1a1a">
                                        <p class="font-bold">&#8358;\${state.user.wallet.cash.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                                <i class="fas fa-trophy" style="color:#f59e0b"></i> Badges &amp; Verification
                            </h3>
                            \${state.user.badges.map(b => \`
                                <div class="rounded-xl px-4 py-3 flex items-center justify-between mb-2" style="background:#1a1a1a">
                                    <span class="font-medium">\${b}</span>
                                    <div class="badge badge-success">Verified</div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>

                </div>
            \`;
        }

        function renderCampaigns() {
            const m = state.missions[0];
            const pct = (m.progress / m.total) * 100;
            return \`
                <div class="min-h-screen pb-6" style="background:#0a0a0a">
                    <div class="px-6 py-8" style="background:#1a1a1a">
                        <h1 class="text-2xl font-bold mb-2">Campaigns</h1>
                        <p class="text-gray-400">Track your goals and rewards</p>
                    </div>

                    <div class="px-6 py-6 space-y-6">
                        <div>
                            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><i class="fas fa-bullseye" style="color:#10b981"></i> Active Goals</h2>
                            <div class="card" onclick="nav('mission')" style="border:1px solid rgba(16,185,129,0.2)">
                                <h3 class="font-semibold mb-1">\${m.name}</h3>
                                <p class="text-gray-400 text-sm mb-3">\${m.desc}</p>
                                <div class="mb-3">
                                    <div class="flex items-center justify-between text-sm mb-2">
                                        <span class="text-gray-400">Progress</span>
                                        <span class="font-medium">\${m.progress}/\${m.total}</span>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" style="width:\${pct}%"></div></div>
                                </div>
                                <div class="rounded-xl px-3 py-2 flex items-center justify-between" style="background:rgba(245,158,11,0.1)">
                                    <span class="text-sm font-medium" style="color:#f59e0b">\${m.reward}</span>
                                    <span style="color:#f59e0b">&#8594;</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><i class="fas fa-gift" style="color:#f59e0b"></i> Recent Rewards</h2>
                            \${state.rewards.map(r => \`
                                <div class="card mb-2" style="background:#1a1a1a">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h3 class="font-medium mb-1">\${r.amount}</h3>
                                            <p class="text-gray-400 text-sm">From: \${r.source}</p>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.1); color:\${r.statusColor}; text-transform: capitalize">\${r.status}</span>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>

                </div>
            \`;
        }

        function render() {
            const app = document.getElementById('app');
            if (!state.isAuth) { app.innerHTML = renderWelcome(); return; }
            switch(state.page) {
                case 'home': app.innerHTML = renderHome(); break;
                case 'mission': app.innerHTML = renderMission(); break;
                case 'profile': app.innerHTML = renderProfile(); break;
                case 'campaigns': app.innerHTML = renderCampaigns(); break;
                default: app.innerHTML = renderHome();
            }
        }

        render();
    </script>
</body>
</html>`)
})

export default app
