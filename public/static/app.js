
// ─── STATE ───────────────────────────────────────────────────────────────────
var state = {
    isAuth: false,
    page: 'welcome',
    goal: null,
    selectedPlan: null,
    goalWizard: { step: 1, upgradeType: null, budget: null, timeline: null, preference: null, monthlyMax: null },
    user: {
        name: 'Amina Diallo',
        phone: '+234 *** **7',
        email: 'a.diallo@email.com',
        badges: ['Goal Setter', 'AutoSave Enabled', 'Early Adopter'],
        wallet: { cash: 2500, points: 150 }
    },
    missions: [{
        id: 'mission-home-upgrade',
        name: 'Home Upgrade Sprint',
        desc: 'Fund your renovation without financial stress',
        reward: '250 Goal Points',
        progress: 1,
        total: 3,
        steps: [
            { id: 's1', text: 'Create Renovation Goal', done: true },
            { id: 's2', text: 'Open Renovation Pocket + Activate AutoSave', done: false },
            { id: 's3', text: 'Accept Pre-Approval + Choose payout option', done: false }
        ]
    }],
    rewards: [
        { id: 1, amount: '&#8358;500 Cashback', source: 'Partner Merchant', status: 'redeem', statusColor: '#E41000' },
        { id: 2, amount: '250 Goal Points', source: 'Home Upgrade Sprint', status: 'pending', statusColor: '#666' },
        { id: 3, amount: 'Fee Waiver (1 transfer)', source: 'AutoSave Bonus', status: 'redeemed', statusColor: '#10b981' }
    ],
    totalRewards: { cash: 500, points: 150 }
};

// ─── CORE HELPERS ────────────────────────────────────────────────────────────
function nav(page) { state.page = page; render(); }
function login() { state.isAuth = true; nav('home'); }

function toast(msg, color) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color || '#10b981';
    el.innerHTML = '<p style="font-weight:500">' + msg + '</p>';
    document.body.appendChild(el);
    setTimeout(function() { el.parentNode && el.parentNode.removeChild(el); }, 2500);
}

function fmt(n) { return Number(n).toLocaleString('en-NG'); }

function completeStep(stepId) {
    var m = state.missions[0];
    var step = null;
    for (var i = 0; i < m.steps.length; i++) { if (m.steps[i].id === stepId) { step = m.steps[i]; break; } }
    if (step && !step.done) {
        step.done = true;
        m.progress++;
        toast('<i class="fas fa-check"></i> ' + step.text + ' completed!');
        if (m.progress === m.total) {
            setTimeout(function() {
                state.user.wallet.points += 250;
                state.totalRewards.points += 250;
                var r = null;
                for (var i = 0; i < state.rewards.length; i++) { if (state.rewards[i].source === 'Home Upgrade Sprint') { r = state.rewards[i]; break; } }
                if (r) { r.status = 'redeem'; r.statusColor = '#E41000'; }
                toast('<i class="fas fa-trophy"></i> Mission Complete! 250 Goal Points earned!', '#f59e0b');
                render();
            }, 1500);
        }
        render();
    }
}

// ─── WIZARD HELPERS ──────────────────────────────────────────────────────────
function wizardSelectUpgrade(val) {
    state.goalWizard.upgradeType = val;
    document.querySelectorAll('.chip-upgrade').forEach(function(c) { c.classList.remove('selected'); });
    var el = document.querySelector('.chip-upgrade[data-val="' + val + '"]');
    if (el) el.classList.add('selected');
}
function wizardSelectTimeline(val) {
    state.goalWizard.timeline = val;
    document.getElementById('input-timeline').value = val;
    document.querySelectorAll('.chip-timeline').forEach(function(c) { c.classList.remove('selected'); });
    var el = document.querySelector('.chip-timeline[data-val="' + val + '"]');
    if (el) el.classList.add('selected');
}
function wizardSelectMonthly(val) {
    state.goalWizard.monthlyMax = val;
    document.getElementById('input-monthly').value = val;
    document.querySelectorAll('.chip-monthly').forEach(function(c) { c.classList.remove('selected'); });
    var el = document.querySelector('.chip-monthly[data-val="' + val + '"]');
    if (el) el.classList.add('selected');
}
function wizardSelectPref(val) {
    state.goalWizard.preference = val;
    document.querySelectorAll('.plan-card-pref').forEach(function(c) { c.classList.remove('selected'); });
    var el = document.querySelector('.plan-card-pref[data-val="' + val + '"]');
    if (el) el.classList.add('selected');
}

function wizardNext(nextStep) {
    var w = state.goalWizard;
    if (nextStep === 3) {
        var bv = document.getElementById('input-budget'); w.budget = bv ? Number(bv.value) : w.budget;
        if (!w.budget || w.budget <= 0) { toast('<i class="fas fa-exclamation-circle"></i> Please enter a valid budget', '#E41000'); return; }
    }
    if (nextStep === 4) {
        var tv = document.getElementById('input-timeline'); w.timeline = tv ? Number(tv.value) : w.timeline;
        if (!w.timeline || w.timeline <= 0) { toast('<i class="fas fa-exclamation-circle"></i> Please enter a valid timeline', '#E41000'); return; }
    }
    if (nextStep === 6) {
        var mv = document.getElementById('input-monthly'); w.monthlyMax = mv ? Number(mv.value) : w.monthlyMax;
        if (!w.monthlyMax || w.monthlyMax <= 0) { toast('<i class="fas fa-exclamation-circle"></i> Please enter a monthly cap', '#E41000'); return; }
    }
    if (nextStep === 2 && !w.upgradeType) { toast('<i class="fas fa-exclamation-circle"></i> Please select what you are upgrading', '#E41000'); return; }
    if (nextStep === 5 && !w.preference) { toast('<i class="fas fa-exclamation-circle"></i> Please select a preference', '#E41000'); return; }
    w.step = nextStep;
    render();
    if (nextStep === 7) { setTimeout(function() { w.step = 8; render(); }, 2200); }
}

function confirmGoal() {
    var w = state.goalWizard;
    state.goal = {
        upgradeType: w.upgradeType || 'Renovation',
        budget: w.budget || 200000,
        timeline: w.timeline || 8,
        preference: w.preference || 'Hybrid',
        monthlyMax: w.monthlyMax || 25000
    };
    var s1 = state.missions[0].steps[0];
    if (!s1.done) { s1.done = true; state.missions[0].progress = 1; }
    // Show analysis screen (step 7) first, then advance to plan recommendations (step 8)
    w.step = 7;
    render();
    setTimeout(function() { w.step = 8; render(); }, 2200);
}

function selectPlan(planKey) {
    state.selectedPlan = planKey;
    nav('mission');
    toast('<i class="fas fa-rocket"></i> Plan activated! Your mission is ready.', '#10b981');
}

function togglePlanCard(el, planKey) {
    state.selectedPlan = planKey;
    document.querySelectorAll('.plan-card-rec').forEach(function(c) { c.classList.remove('selected'); });
    el.closest('.plan-card-rec').classList.add('selected');
    render();
}

function getPlan(pk) {
    var g = state.goal || { budget: 200000, timeline: 8, monthlyMax: 25000 };
    var wkly = Math.round(g.budget / g.timeline / 1000) * 1000;
    var savTot = Math.round(g.budget * 0.4 / 1000) * 1000;
    var loanTot = g.budget - savTot;
    var wklySav = Math.round(savTot / g.timeline / 1000) * 1000;
    var loanMo = Math.round(loanTot / (Math.ceil(g.timeline / 4) * 2) / 100) * 100;
    var plans = {
        save_only:    { label: 'Save-Only Plan',    icon: 'fa-piggy-bank',    color: '#3b82f6', tag: null,          lines: ['Save &#8358;' + fmt(wkly) + '/week for ' + g.timeline + ' weeks', 'Total: &#8358;' + fmt(g.budget), 'No credit required'] },
        hybrid:       { label: 'Hybrid Plan',       icon: 'fa-balance-scale', color: '#f59e0b', tag: 'Recommended', lines: ['Save &#8358;' + fmt(wklySav) + '/week (&#8358;' + fmt(savTot) + ' total)', 'Pre-approved loan: &#8358;' + fmt(loanTot), 'Monthly repayment &le; &#8358;' + fmt(loanMo)] },
        credit_first: { label: 'Credit-First Plan', icon: 'fa-bolt',          color: '#10b981', tag: null,          lines: ['Take &#8358;' + fmt(g.budget) + ' now', 'Higher monthly repayment applies', 'Funds available immediately'] }
    };
    return plans[pk];
}

// ─── RENDERERS ───────────────────────────────────────────────────────────────

function renderWelcome() {
    return '<div class="min-h-screen relative flex items-center justify-center p-6" style="background-image:url(\'welcome-background-with-logo.jpg\');background-size:cover;background-position:center;">' +
        '<div class="relative z-10 max-w-md w-full text-center">' +
            '<p class="text-xl font-semibold text-white mb-3">Turn money into momentum</p>' +
            '<p class="text-base text-gray-300 mb-12">Achieve goals. Unlock rewards. Live freer.</p>' +
            '<div class="space-y-4">' +
                '<button onclick="login()" class="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95" style="background:#000;color:white;">' +
                    '<i class="fab fa-whatsapp" style="font-size:1.25rem"></i> Continue with WhatsApp' +
                '</button>' +
                '<button onclick="login()" class="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all active:scale-95" style="background:#E41000;color:white;">' +
                    '<i class="fas fa-mobile-alt" style="font-size:1.25rem"></i> Continue with Phone Number' +
                '</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function renderHome() {
    var m = state.missions[0];
    var pct = (m.progress / m.total) * 100;
    var rewardsHtml = state.rewards.map(function(r) {
        return '<div class="rounded-xl p-3" style="background:#1a1a1a">' +
            '<div class="flex items-center justify-between mb-1">' +
                '<h3 class="font-semibold text-sm">' + r.amount + '</h3>' +
                '<span class="text-xs px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.1);color:' + r.statusColor + ';text-transform:capitalize">' + r.status + '</span>' +
            '</div>' +
            '<p class="text-gray-400 text-xs">From: ' + r.source + '</p>' +
        '</div>';
    }).join('');

    return '<div class="min-h-screen pb-28" style="background:#0a0a0a">' +
        '<div class="px-6 py-4" style="background:#1a1a1a">' +
            '<div class="flex items-center justify-between">' +
                '<div>' +
                    '<h1 class="text-2xl font-bold mb-1">Hi, Amina <i class="fas fa-hand-paper" style="color:#f59e0b"></i></h1>' +
                    '<p class="text-gray-400 text-sm">' + state.user.phone + '</p>' +
                '</div>' +
                '<img src="amina-profile.png" alt="Amina" class="w-12 h-12 rounded-full object-cover" style="cursor:pointer" onclick="nav(\'profile\')">' +
            '</div>' +
        '</div>' +
        '<div class="px-6 space-y-5 mt-5">' +
            /* Quick actions */
            '<div class="flex justify-between gap-3">' +
                '<div class="flex flex-col items-center gap-2 cursor-pointer">' +
                    '<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000"><i class="fas fa-credit-card" style="color:white;font-size:1.5rem"></i></div>' +
                    '<span class="text-xs font-medium">Payments</span>' +
                '</div>' +
                '<div class="flex flex-col items-center gap-2 cursor-pointer" onclick="nav(\'goal\')">' +
                    '<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000"><i class="fas fa-bullseye" style="color:white;font-size:1.5rem"></i></div>' +
                    '<span class="text-xs font-medium">Goals</span>' +
                '</div>' +
                '<div class="flex flex-col items-center gap-2 cursor-pointer" onclick="nav(\'mission\')">' +
                    '<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000"><i class="fas fa-coins" style="color:white;font-size:1.5rem"></i></div>' +
                    '<span class="text-xs font-medium">Earn</span>' +
                '</div>' +
                '<div class="flex flex-col items-center gap-2 cursor-pointer">' +
                    '<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#E41000"><i class="fas fa-exchange-alt" style="color:white;font-size:1.5rem"></i></div>' +
                    '<span class="text-xs font-medium">Transfer</span>' +
                '</div>' +
            '</div>' +
            /* Points balance */
            '<div class="card-static" style="border:1px solid rgba(245,158,11,0.25)">' +
                '<div class="flex items-center justify-between">' +
                    '<div>' +
                        '<p class="text-gray-400 text-xs mb-1">Goal Points Balance</p>' +
                        '<p class="text-2xl font-bold" style="color:#f59e0b">' + state.user.wallet.points.toLocaleString() + ' <span class="text-sm font-medium">pts</span></p>' +
                    '</div>' +
                    '<div class="w-12 h-12 rounded-2xl flex items-center justify-center" style="background:rgba(245,158,11,0.15)"><i class="fas fa-star" style="color:#f59e0b;font-size:1.25rem"></i></div>' +
                '</div>' +
            '</div>' +
            /* Mystery box */
            '<div class="card" style="background:linear-gradient(90deg,rgba(245,158,11,0.2),rgba(249,115,22,0.2));border:1px solid rgba(245,158,11,0.3)">' +
                '<div class="flex items-center gap-4">' +
                    '<div class="text-4xl"><i class="fas fa-gift" style="color:#f59e0b"></i></div>' +
                    '<div><h3 class="font-semibold mb-1">Mystery Box</h3><p class="text-gray-400 text-sm">Complete 3 goals to unlock</p></div>' +
                '</div>' +
            '</div>' +
            /* Rewards */
            '<div class="card-static">' +
                '<div class="flex items-center justify-between mb-4">' +
                    '<h2 class="text-lg font-semibold">Your Rewards</h2>' +
                    '<span class="text-xs" style="color:#10b981">&#8358;' + fmt(state.totalRewards.cash) + ' + ' + state.totalRewards.points + ' pts</span>' +
                '</div>' +
                '<div class="space-y-3">' + rewardsHtml + '</div>' +
            '</div>' +
            /* Active mission */
            '<div class="card-static" style="background:linear-gradient(135deg,#212121,#1a1a1a);border:1px solid rgba(16,185,129,0.2)">' +
                '<div class="mb-3">' +
                    '<div class="badge badge-warning mb-2">Active Mission</div>' +
                    '<h3 class="font-semibold mb-1">' + m.name + '</h3>' +
                    '<p class="text-gray-400 text-sm">' + m.desc + ' <span style="color:#f59e0b">&#8594; ' + m.reward + '</span></p>' +
                '</div>' +
                '<div class="mb-4">' +
                    '<div class="flex items-center justify-between text-sm mb-2"><span class="text-gray-400">Progress</span><span class="font-medium">' + m.progress + '/' + m.total + ' steps</span></div>' +
                    '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                '</div>' +
                '<button onclick="nav(\'mission\')" class="btn btn-primary w-full justify-center">Continue &#8594;</button>' +
            '</div>' +
        '</div>' +
        /* Floating CTA */
        '<div class="fixed bottom-6 left-6 right-6 z-30">' +
            '<button onclick="nav(\'goal\')" class="w-full py-4 px-6 rounded-full font-semibold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg" style="background:#E41000;color:white;">' +
                '<i class="fas fa-robot" style="font-size:1.25rem"></i> Chat to AI-Money' +
            '</button>' +
        '</div>' +
    '</div>';
}

function renderGoal() {
    var w = state.goalWizard;
    var s = w.step;
    var g = state.goal || { budget: w.budget || 200000, timeline: w.timeline || 8, monthlyMax: w.monthlyMax || 25000 };

    /* Step dots */
    var dots = s <= 5 ? (function() {
        var d = '';
        for (var i = 1; i <= 5; i++) d += '<div class="w-6 h-1.5 rounded-full" style="background:' + (i <= s ? '#10b981' : '#333') + '"></div>';
        return '<div class="ml-auto flex gap-1">' + d + '</div>';
    })() : '';

    var header = '<div class="px-6 py-4 flex items-center gap-3" style="background:#1a1a1a">' +
        '<button onclick="nav(\'home\')" class="text-2xl flex-shrink-0">&#8592;</button>' +
        '<div class="flex items-center gap-2">' +
            '<div class="w-8 h-8 rounded-full flex items-center justify-center" style="background:rgba(228,0,43,0.15)"><i class="fas fa-robot" style="color:#E41000"></i></div>' +
            '<div><p class="text-sm font-bold leading-tight">AI-Money</p><p class="text-xs" style="color:#10b981">Goal Creation</p></div>' +
        '</div>' + dots +
    '</div>';

    var body = '';

    if (s === 1) {
        /* Step 1 — What upgrading? */
        body = '<div class="mb-6"><span class="badge badge-blue">Step 1 of 5</span><h2 class="text-xl font-bold mt-2 mb-1">What are you upgrading?</h2><p class="text-gray-400 text-sm">Select the area you want to improve</p></div>' +
            '<div class="flex flex-wrap gap-2 mb-8">' +
                ['Paint','Appliances','Furniture','Repairs'].map(function(v) {
                    return '<div class="chip chip-upgrade' + (w.upgradeType === v ? ' selected' : '') + '" data-val="' + v + '" onclick="wizardSelectUpgrade(\'' + v + '\')">' +
                        '<i class="fas ' + {Paint:'fa-paint-roller',Appliances:'fa-blender',Furniture:'fa-couch',Repairs:'fa-tools'}[v] + ' mr-2"></i>' + v +
                    '</div>';
                }).join('') +
            '</div>' +
            '<button onclick="wizardNext(2)" class="btn btn-primary w-full justify-center">Next &#8594;</button>';
    } else if (s === 2) {
        /* Step 2 — Budget */
        body = '<div class="mb-6"><span class="badge badge-blue">Step 2 of 5</span><h2 class="text-xl font-bold mt-2 mb-1">What\'s your target budget?</h2><p class="text-gray-400 text-sm">Enter the total amount you need (&#8358;)</p></div>' +
            '<div class="mb-8">' +
                '<div class="flex items-center gap-2 mb-2" style="background:#1a1a1a;border:1.5px solid #333;border-radius:0.75rem;padding:0.75rem 1rem;">' +
                    '<span class="text-gray-400 font-bold text-lg">&#8358;</span>' +
                    '<input id="input-budget" type="number" placeholder="e.g. 200000" min="1000" value="' + (w.budget || '') + '" oninput="state.goalWizard.budget=Number(this.value)">' +
                '</div>' +
                '<p class="text-xs text-gray-500 mt-2">Suggested: &#8358;50,000 – &#8358;500,000</p>' +
            '</div>' +
            '<div class="flex gap-3"><button onclick="wizardNext(1)" class="btn btn-outline">&#8592; Back</button><button onclick="wizardNext(3)" class="btn btn-primary flex-1 justify-center">Next &#8594;</button></div>';
    } else if (s === 3) {
        /* Step 3 — Timeline */
        body = '<div class="mb-6"><span class="badge badge-blue">Step 3 of 5</span><h2 class="text-xl font-bold mt-2 mb-1">What\'s your timeline?</h2><p class="text-gray-400 text-sm">How many weeks to reach your goal?</p></div>' +
            '<div class="mb-8">' +
                '<div class="flex items-center gap-2 mb-3" style="background:#1a1a1a;border:1.5px solid #333;border-radius:0.75rem;padding:0.75rem 1rem;">' +
                    '<input id="input-timeline" type="number" placeholder="e.g. 8" min="1" max="52" value="' + (w.timeline || '') + '" oninput="state.goalWizard.timeline=Number(this.value)">' +
                    '<span class="text-gray-400 font-medium">weeks</span>' +
                '</div>' +
                '<div class="flex flex-wrap gap-2">' +
                    [4,8,12,16].map(function(v) {
                        return '<div class="chip chip-timeline' + (w.timeline === v ? ' selected' : '') + '" data-val="' + v + '" onclick="wizardSelectTimeline(' + v + ')">' + v + ' weeks</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
            '<div class="flex gap-3"><button onclick="wizardNext(2)" class="btn btn-outline">&#8592; Back</button><button onclick="wizardNext(4)" class="btn btn-primary flex-1 justify-center">Next &#8594;</button></div>';
    } else if (s === 4) {
        /* Step 4 — Preference */
        var prefOpts = [
            { val: 'Save-only',    icon: 'fa-piggy-bank',    color: 'rgba(59,130,246,0.2)',    iconColor: '#3b82f6', label: 'Save-only',    sub: 'Build your goal from savings alone', tag: '' },
            { val: 'Hybrid',      icon: 'fa-balance-scale', color: 'rgba(245,158,11,0.2)',     iconColor: '#f59e0b', label: 'Hybrid',       sub: 'Save part + pre-approved credit',    tag: '<span class="badge badge-warning" style="font-size:0.6rem;padding:0.1rem 0.5rem">Popular</span>' },
            { val: 'Credit-first',icon: 'fa-bolt',           color: 'rgba(16,185,129,0.2)',    iconColor: '#10b981', label: 'Credit-first', sub: 'Access funds now, repay over time',   tag: '' }
        ];
        body = '<div class="mb-6"><span class="badge badge-blue">Step 4 of 5</span><h2 class="text-xl font-bold mt-2 mb-1">What\'s your preference?</h2><p class="text-gray-400 text-sm">How do you want to fund this goal?</p></div>' +
            '<div class="space-y-3 mb-8">' +
                prefOpts.map(function(p) {
                    return '<div class="plan-card plan-card-pref' + (w.preference === p.val ? ' selected' : '') + '" data-val="' + p.val + '" onclick="wizardSelectPref(\'' + p.val + '\')">' +
                        '<div class="flex items-center gap-3">' +
                            '<div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:' + p.color + '"><i class="fas ' + p.icon + '" style="color:' + p.iconColor + '"></i></div>' +
                            '<div class="flex-1"><div class="flex items-center gap-2"><p class="font-semibold">' + p.label + '</p>' + p.tag + '</div><p class="text-gray-400 text-xs">' + p.sub + '</p></div>' +
                        '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
            '<div class="flex gap-3"><button onclick="wizardNext(3)" class="btn btn-outline">&#8592; Back</button><button onclick="wizardNext(5)" class="btn btn-primary flex-1 justify-center">Next &#8594;</button></div>';
    } else if (s === 5) {
        /* Step 5 — Monthly cap */
        body = '<div class="mb-6"><span class="badge badge-blue">Step 5 of 5</span><h2 class="text-xl font-bold mt-2 mb-1">Keep monthly payments under?</h2><p class="text-gray-400 text-sm">Set your monthly comfort limit (&#8358;)</p></div>' +
            '<div class="mb-8">' +
                '<div class="flex items-center gap-2 mb-3" style="background:#1a1a1a;border:1.5px solid #333;border-radius:0.75rem;padding:0.75rem 1rem;">' +
                    '<span class="text-gray-400 font-bold text-lg">&#8358;</span>' +
                    '<input id="input-monthly" type="number" placeholder="e.g. 25000" min="1000" value="' + (w.monthlyMax || '') + '" oninput="state.goalWizard.monthlyMax=Number(this.value)">' +
                    '<span class="text-gray-400 font-medium">/month</span>' +
                '</div>' +
                '<div class="flex flex-wrap gap-2">' +
                    [15000,25000,40000,60000].map(function(v) {
                        return '<div class="chip chip-monthly' + (w.monthlyMax === v ? ' selected' : '') + '" data-val="' + v + '" onclick="wizardSelectMonthly(' + v + ')">&#8358;' + fmt(v) + '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
            '<div class="flex gap-3"><button onclick="wizardNext(4)" class="btn btn-outline">&#8592; Back</button><button onclick="wizardNext(6)" class="btn btn-primary flex-1 justify-center">Analyse with AI &#8594;</button></div>';
    } else if (s === 6) {
        /* Step 6 — Confirm */
        body = '<div class="mb-4"><h2 class="text-xl font-bold mb-1">Confirm your goal</h2><p class="text-gray-400 text-sm">Here\'s what we captured</p></div>' +
            '<div class="card-static mb-6" style="background:#1a1a1a;border:1px solid rgba(16,185,129,0.3)">' +
                '<div class="flex items-center gap-3 mb-4">' +
                    '<div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(16,185,129,0.15)"><i class="fas fa-home" style="color:#10b981"></i></div>' +
                    '<div><p class="font-semibold">Home Upgrade Goal</p><p class="text-xs text-gray-400">' + (w.upgradeType || 'Renovation') + '</p></div>' +
                '</div>' +
                '<div class="space-y-2 text-sm">' +
                    '<div class="flex justify-between"><span class="text-gray-400">Target budget</span><span class="font-semibold">&#8358;' + fmt(w.budget || 200000) + '</span></div>' +
                    '<div class="flex justify-between"><span class="text-gray-400">Timeline</span><span class="font-semibold">' + (w.timeline || 8) + ' weeks</span></div>' +
                    '<div class="flex justify-between"><span class="text-gray-400">Preference</span><span class="font-semibold">' + (w.preference || 'Hybrid') + '</span></div>' +
                    '<div class="flex justify-between"><span class="text-gray-400">Monthly cap</span><span class="font-semibold">&#8358;' + fmt(w.monthlyMax || 25000) + '</span></div>' +
                '</div>' +
            '</div>' +
            '<div class="flex gap-3"><button onclick="wizardNext(5)" class="btn btn-outline">&#8592; Edit</button><button onclick="confirmGoal()" class="btn btn-primary flex-1 justify-center"><i class="fas fa-robot"></i> Analyse with AI-Money</button></div>';
    } else if (s === 7) {
        /* AI thinking */
        body = '<div class="flex flex-col items-center justify-center py-16">' +
            '<div class="w-20 h-20 rounded-full flex items-center justify-center mb-6" style="background:rgba(228,0,43,0.15);border:2px solid rgba(228,0,43,0.4)">' +
                '<i class="fas fa-robot" style="color:#E41000;font-size:2rem"></i>' +
            '</div>' +
            '<h2 class="text-xl font-bold mb-2 text-center">AI-Money is analysing...</h2>' +
            '<p class="text-gray-400 text-sm text-center mb-6">Building your personalised plan</p>' +
            '<div class="ai-thinking flex items-center gap-1"><span></span><span></span><span></span></div>' +
            '<div class="mt-8 text-xs space-y-2 text-center" style="color:#555">' +
                '<p>&#10003; Checking savings capacity</p><p>&#10003; Evaluating credit options</p><p>&#10003; Matching to goal timeline</p>' +
            '</div>' +
        '</div>';
    } else {
        /* Step 8 — Plan recommendations */
        var planKeys = ['save_only', 'hybrid', 'credit_first'];
        var plansHtml = planKeys.map(function(pk) {
            var p = getPlan(pk);
            var isSelected = state.selectedPlan === pk;
            var linesHtml = p.lines.map(function(l) {
                return '<li class="text-sm text-gray-300 flex items-start gap-2"><span style="color:#10b981;margin-top:2px">&#8250;</span>' + l + '</li>';
            }).join('');
            return '<div class="plan-card plan-card-rec' + (pk === 'hybrid' ? ' recommended' : '') + (isSelected ? ' selected' : '') + '" onclick="togglePlanCard(this,\'' + pk + '\')">' +
                '<div class="flex items-start justify-between mb-3">' +
                    '<div class="flex items-center gap-3">' +
                        '<div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.05)"><i class="fas ' + p.icon + '" style="color:' + p.color + '"></i></div>' +
                        '<p class="font-semibold">' + p.label + '</p>' +
                    '</div>' +
                    (p.tag ? '<span class="badge badge-warning" style="font-size:0.65rem">' + p.tag + '</span>' : '') +
                    (isSelected ? '<div class="w-5 h-5 rounded-full flex items-center justify-center" style="background:#10b981"><i class="fas fa-check" style="font-size:0.6rem;color:white"></i></div>' : '') +
                '</div>' +
                '<ul class="space-y-1">' + linesHtml + '</ul>' +
            '</div>';
        }).join('');

        var activateBtnStyle = state.selectedPlan ? '' : 'background:#333;color:#888;cursor:not-allowed';
        var activateOnclick = state.selectedPlan ? 'selectPlan(state.selectedPlan)' : 'toast(\'<i class=\\\'fas fa-exclamation-circle\\\'></i> Please select a plan first\',\'#E41000\')';

        body = '<div class="mb-5">' +
                '<div class="flex items-center gap-2 mb-3">' +
                    '<div class="w-7 h-7 rounded-full flex items-center justify-center" style="background:rgba(228,0,43,0.15)"><i class="fas fa-robot" style="color:#E41000;font-size:0.8rem"></i></div>' +
                    '<span class="text-sm font-medium" style="color:#E41000">AI-Money</span>' +
                '</div>' +
                '<h2 class="text-xl font-bold mb-1">3 Recommended Paths</h2>' +
                '<p class="text-gray-400 text-sm">For your &#8358;' + fmt(g.budget) + ' goal in ' + g.timeline + ' weeks</p>' +
            '</div>' +
            plansHtml +
            '<button onclick="' + activateOnclick + '" class="btn w-full justify-center mt-2' + (state.selectedPlan ? ' btn-primary' : '') + '" style="' + activateBtnStyle + '">Activate This Plan &#8594;</button>';
    }

    return '<div class="min-h-screen pb-6" style="background:#0a0a0a">' +
        header +
        '<div class="px-6 py-6">' + body + '</div>' +
    '</div>';
}

function renderMission() {
    var m = state.missions[0];
    var pct = (m.progress / m.total) * 100;
    var plan = state.selectedPlan ? getPlan(state.selectedPlan) : null;
    var goal = state.goal;

    var planSummary = '';
    if (plan && goal) {
        planSummary = '<div class="card-static mb-4" style="background:#1a1a1a;border:1px solid rgba(16,185,129,0.3)">' +
            '<div class="flex items-center justify-between mb-3">' +
                '<div class="flex items-center gap-2"><i class="fas ' + plan.icon + '" style="color:' + plan.color + '"></i><span class="font-semibold text-sm">' + plan.label + '</span></div>' +
                (plan.tag ? '<span class="badge badge-warning" style="font-size:0.65rem">' + plan.tag + '</span>' : '') +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2 text-xs">' +
                '<div class="rounded-lg p-2" style="background:#212121"><p class="text-gray-400 mb-0.5">Target</p><p class="font-bold">&#8358;' + fmt(goal.budget) + '</p></div>' +
                '<div class="rounded-lg p-2" style="background:#212121"><p class="text-gray-400 mb-0.5">Timeline</p><p class="font-bold">' + goal.timeline + ' weeks</p></div>' +
                '<div class="rounded-lg p-2" style="background:#212121"><p class="text-gray-400 mb-0.5">Monthly cap</p><p class="font-bold">&#8358;' + fmt(goal.monthlyMax) + '</p></div>' +
                '<div class="rounded-lg p-2" style="background:#212121"><p class="text-gray-400 mb-0.5">Upgrading</p><p class="font-bold">' + goal.upgradeType + '</p></div>' +
            '</div>' +
        '</div>';
    }

    var stepsHtml = m.steps.map(function(s, i) {
        return '<div class="card-static" style="' + (s.done ? 'background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3)' : 'background:#212121;border:1px solid #2a2a2a') + '">' +
            '<div class="flex items-start gap-4">' +
                '<div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:' + (s.done ? '#10b981' : '#1a1a1a') + ';color:' + (s.done ? 'white' : '#666') + '">' +
                    (s.done ? '<i class="fas fa-check" style="font-size:0.85rem"></i>' : (i + 1)) +
                '</div>' +
                '<div class="flex-1">' +
                    '<p class="font-medium mb-2' + (s.done ? ' line-through' : '') + '" style="color:' + (s.done ? '#10b981' : 'white') + '">' + s.text + '</p>' +
                    (s.done
                        ? '<p class="text-sm" style="color:#10b981"><i class="fas fa-check-circle"></i> Completed</p>'
                        : '<button onclick="completeStep(\'' + s.id + '\')" class="btn btn-primary text-sm">Complete Step</button>') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    var nextIncomplete = null;
    for (var i = 0; i < m.steps.length; i++) { if (!m.steps[i].done) { nextIncomplete = m.steps[i]; break; } }

    var bottomAction = m.progress < m.total
        ? '<div><button onclick="completeStep(\'' + nextIncomplete.id + '\')" class="w-full btn btn-primary justify-center"><i class="fas fa-arrow-right"></i> Complete Next Step</button><p class="text-center text-xs mt-2" style="color:#555">Demo: tap to simulate step completion</p></div>'
        : '<div class="card-static text-center" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3)"><i class="fas fa-trophy text-4xl mb-3" style="color:#f59e0b"></i><h3 class="text-lg font-bold mb-1">Mission Complete!</h3><p class="text-gray-400 text-sm">You earned <span class="font-bold" style="color:#10b981">250 Goal Points</span></p></div>';

    return '<div class="min-h-screen pb-6" style="background:#0a0a0a">' +
        '<div class="px-6 py-4" style="background:#1a1a1a">' +
            '<div class="flex items-center gap-4"><button onclick="nav(\'home\')" class="text-2xl">&#8592;</button><h1 class="text-xl font-bold">Mission Details</h1></div>' +
        '</div>' +
        '<div class="px-6 py-5 space-y-4">' +
            planSummary +
            '<div class="card-static">' +
                '<div class="flex items-start gap-4 mb-4">' +
                    '<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:rgba(245,158,11,0.15)"><i class="fas fa-home" style="color:#f59e0b;font-size:1.5rem"></i></div>' +
                    '<div class="flex-1">' +
                        '<h2 class="text-xl font-bold mb-1">' + m.name + '</h2>' +
                        '<p class="text-gray-400 text-sm mb-3">' + m.desc + '</p>' +
                        '<div class="badge badge-warning">8 weeks remaining</div>' +
                    '</div>' +
                '</div>' +
                '<div class="mb-4">' +
                    '<div class="flex items-center justify-between text-sm mb-2"><span class="text-gray-400">Progress</span><span class="font-medium">' + m.progress + '/' + m.total + ' completed</span></div>' +
                    '<div class="progress-bar" style="height:0.625rem"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                '</div>' +
                '<div class="p-3 rounded-xl flex items-center gap-3" style="background:linear-gradient(90deg,rgba(245,158,11,0.2),rgba(249,115,22,0.2));border:1px solid rgba(245,158,11,0.3)">' +
                    '<i class="fas fa-star" style="color:#f59e0b;font-size:1.2rem"></i>' +
                    '<div><p class="text-gray-400 text-xs">Reward</p><p class="font-bold" style="color:#f59e0b">' + m.reward + '</p></div>' +
                '</div>' +
            '</div>' +
            '<div><h3 class="text-base font-semibold mb-3">Steps to Complete</h3><div class="space-y-3">' + stepsHtml + '</div></div>' +
            bottomAction +
        '</div>' +
    '</div>';
}

function renderProfile() {
    var goalSection = '';
    if (state.goal) {
        goalSection = '<div class="card-static" style="background:#212121;border:1px solid rgba(16,185,129,0.2)">' +
            '<h3 class="text-base font-semibold mb-3 flex items-center gap-2"><i class="fas fa-bullseye" style="color:#10b981"></i> Active Goal</h3>' +
            '<div class="space-y-2 text-sm">' +
                '<div class="flex justify-between"><span class="text-gray-400">Goal</span><span class="font-medium">Home Upgrade (' + state.goal.upgradeType + ')</span></div>' +
                '<div class="flex justify-between"><span class="text-gray-400">Target</span><span class="font-medium">&#8358;' + fmt(state.goal.budget) + '</span></div>' +
                '<div class="flex justify-between"><span class="text-gray-400">Plan</span><span class="font-medium">' + (state.selectedPlan ? getPlan(state.selectedPlan).label : 'Pending') + '</span></div>' +
            '</div>' +
        '</div>';
    }
    var badgesHtml = state.user.badges.map(function(b) {
        return '<div class="rounded-xl px-4 py-3 flex items-center justify-between mb-2" style="background:#1a1a1a"><span class="font-medium text-sm">' + b + '</span><div class="badge badge-success">Active</div></div>';
    }).join('');

    return '<div class="min-h-screen pb-6" style="background:#0a0a0a">' +
        '<div class="px-6 py-4" style="background:#1a1a1a">' +
            '<div class="flex items-center gap-4 mb-5"><button onclick="nav(\'home\')" class="text-2xl">&#8592;</button><h1 class="text-xl font-bold">Identity</h1></div>' +
            '<div class="flex items-center gap-4">' +
                '<img src="amina-profile.png" alt="Amina" class="w-16 h-16 rounded-full object-cover">' +
                '<div><h2 class="text-xl font-bold">' + state.user.name + '</h2><p class="text-gray-400 text-sm">' + state.user.phone + '</p></div>' +
            '</div>' +
        '</div>' +
        '<div class="px-6 py-6 space-y-5">' +
            '<div class="card-static" style="background:#212121">' +
                '<h3 class="text-base font-semibold mb-4">Basic Information</h3>' +
                '<div class="space-y-4">' +
                    '<div><label class="text-gray-400 text-xs mb-1 block">Username</label><p class="font-medium">aminad</p></div>' +
                    '<div><label class="text-gray-400 text-xs mb-1 block">Email</label><p class="font-medium">' + state.user.email + '</p></div>' +
                    '<div class="flex gap-4">' +
                        '<div><label class="text-gray-400 text-xs mb-1 block">Cash Balance</label><div class="rounded-xl px-4 py-2 inline-block" style="background:#1a1a1a"><p class="font-bold">&#8358;' + state.user.wallet.cash.toLocaleString() + '</p></div></div>' +
                        '<div><label class="text-gray-400 text-xs mb-1 block">Goal Points</label><div class="rounded-xl px-4 py-2 inline-block" style="background:#1a1a1a;border:1px solid rgba(245,158,11,0.3)"><p class="font-bold" style="color:#f59e0b">' + state.user.wallet.points.toLocaleString() + ' pts</p></div></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="card-static" style="background:#212121">' +
                '<h3 class="text-base font-semibold mb-4 flex items-center gap-2"><i class="fas fa-trophy" style="color:#f59e0b"></i> Badges &amp; Achievements</h3>' +
                badgesHtml +
            '</div>' +
            goalSection +
        '</div>' +
    '</div>';
}

function renderCampaigns() {
    var m = state.missions[0];
    var pct = (m.progress / m.total) * 100;
    var goal = state.goal;
    var plan = state.selectedPlan ? getPlan(state.selectedPlan) : null;

    var goalSection = goal
        ? '<div><h2 class="text-base font-semibold mb-3 flex items-center gap-2"><i class="fas fa-home" style="color:#10b981"></i> Active Goal</h2>' +
            '<div class="card-static" style="background:#1a1a1a;border:1px solid rgba(16,185,129,0.25)">' +
                '<div class="flex items-start justify-between mb-3">' +
                    '<div><p class="font-semibold">Home Upgrade Sprint</p><p class="text-gray-400 text-xs">' + goal.upgradeType + ' · &#8358;' + fmt(goal.budget) + ' · ' + goal.timeline + ' weeks</p></div>' +
                    '<span class="badge badge-warning" style="font-size:0.65rem">In Progress</span>' +
                '</div>' +
                (plan ? '<div class="flex items-center gap-2 mb-3 text-xs"><i class="fas ' + plan.icon + '" style="color:' + plan.color + '"></i><span class="text-gray-400">Plan:</span><span class="font-medium">' + plan.label + '</span></div>' : '') +
                '<div class="mb-1 flex justify-between text-xs text-gray-400"><span>Mission progress</span><span>' + m.progress + '/' + m.total + ' steps</span></div>' +
                '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
                '<button onclick="nav(\'mission\')" class="btn btn-primary w-full justify-center mt-4 text-sm">View Mission &#8594;</button>' +
            '</div></div>'
        : '<div><h2 class="text-base font-semibold mb-3 flex items-center gap-2"><i class="fas fa-home" style="color:#10b981"></i> Active Goal</h2>' +
            '<div class="card-static text-center" style="background:#1a1a1a;border:1px dashed #333">' +
                '<i class="fas fa-bullseye text-3xl mb-3" style="color:#555"></i><p class="font-medium mb-1">No active goal yet</p>' +
                '<p class="text-gray-400 text-sm mb-4">Start a goal with AI-Money to see your plan here</p>' +
                '<button onclick="nav(\'goal\')" class="btn btn-primary justify-center"><i class="fas fa-robot"></i> Chat to AI-Money</button>' +
            '</div></div>';

    var recentRewards = state.rewards.map(function(r) {
        return '<div class="card-static mb-2" style="background:#1a1a1a">' +
            '<div class="flex items-center justify-between">' +
                '<div><h3 class="font-medium text-sm mb-0.5">' + r.amount + '</h3><p class="text-gray-400 text-xs">From: ' + r.source + '</p></div>' +
                '<span class="text-xs px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.1);color:' + r.statusColor + ';text-transform:capitalize">' + r.status + '</span>' +
            '</div></div>';
    }).join('');

    return '<div class="min-h-screen pb-6" style="background:#0a0a0a">' +
        '<div class="px-6 py-6" style="background:#1a1a1a">' +
            '<h1 class="text-2xl font-bold mb-1">Campaigns</h1><p class="text-gray-400 text-sm">Your goals, missions &amp; rewards</p>' +
        '</div>' +
        '<div class="px-6 py-6 space-y-6">' +
            goalSection +
            '<div><h2 class="text-base font-semibold mb-3 flex items-center gap-2"><i class="fas fa-rocket" style="color:#f59e0b"></i> Active Mission</h2>' +
                '<div class="card" onclick="nav(\'mission\')" style="border:1px solid rgba(16,185,129,0.2)">' +
                    '<h3 class="font-semibold mb-1">' + m.name + '</h3><p class="text-gray-400 text-sm mb-3">' + m.desc + '</p>' +
                    '<div class="mb-3"><div class="flex justify-between text-xs text-gray-400 mb-2"><span>Progress</span><span>' + m.progress + '/' + m.total + '</span></div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div></div>' +
                    '<div class="rounded-xl px-3 py-2 flex items-center justify-between" style="background:rgba(245,158,11,0.1)"><span class="text-sm font-medium" style="color:#f59e0b">' + m.reward + '</span><span style="color:#f59e0b">&#8594;</span></div>' +
                '</div>' +
            '</div>' +
            '<div><h2 class="text-base font-semibold mb-3 flex items-center gap-2"><i class="fas fa-gift" style="color:#f59e0b"></i> Recent Rewards</h2>' + recentRewards + '</div>' +
        '</div>' +
    '</div>';
}

// ─── MASTER RENDER ────────────────────────────────────────────────────────────
function render() {
    var el = document.getElementById('app');
    if (!state.isAuth) { el.innerHTML = renderWelcome(); return; }
    if (state.page === 'home')      { el.innerHTML = renderHome();      return; }
    if (state.page === 'goal')      { el.innerHTML = renderGoal();      return; }
    if (state.page === 'mission')   { el.innerHTML = renderMission();   return; }
    if (state.page === 'profile')   { el.innerHTML = renderProfile();   return; }
    if (state.page === 'campaigns') { el.innerHTML = renderCampaigns(); return; }
    el.innerHTML = renderHome();
}

render();
