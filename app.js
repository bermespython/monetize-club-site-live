
(function () {
  var MODELS = window.MONETIZE_MODELS || [];
  var MODEL_MAP = {};
  for (var i = 0; i < MODELS.length; i++) MODEL_MAP[MODELS[i].id] = MODELS[i];
  var SUPABASE_URL = "https://gzzbebbqcpcoqoxkuxhx.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_ggEnqtyZNZKcNfIr1CBH5Q_UZqOODD_";
  var createClient = window.supabase && window.supabase.createClient ? window.supabase.createClient : null;
  var hasAuthConfig = !!(SUPABASE_URL && SUPABASE_ANON_KEY && createClient);
  var supabase = hasAuthConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  var state = {};
  for (var j = 0; j < MODELS.length; j++) state[MODELS[j].id] = 0;
  var grid = document.getElementById('grid');
  var authModal = document.querySelector('[data-auth-modal]');
  var authOpenButtons = document.querySelectorAll('[data-auth-open]');
  var authCloseButtons = document.querySelectorAll('[data-auth-close]');
  var authLocalForm = document.querySelector('[data-auth-local-form]');
  var authSubmit = document.querySelector('[data-auth-submit]');
  var authSwitch = document.querySelector('[data-auth-switch]');
  var authNote = document.querySelector('[data-auth-note]');
  var authMessage = document.querySelector('[data-auth-message]');
  var authStatus = document.querySelector('.auth-status');
  var authEmail = document.querySelector('[data-auth-email]');
  var authLogout = document.querySelector('[data-auth-logout]');
  var currentUser = null;
  var authMode = 'signup';
  var ACCOUNT_KEY = 'monetizeClubLocalAccount';
  var SESSION_KEY = 'monetizeClubLocalSession';
  var agentPlaybooks = {"dispatch-routing-arbitrage": [["CEO Agent", "Oversees response speed, routing quality, payment capture, provider quality, and market-change approval."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines urgency, fit, buyer quality, and probable purchase value."], ["Quote / Pricing Agent", "Applies the highest-converting approved pricing logic for this market."], ["Routing Agent", "Routes to the best provider or fulfillment path based on geography, margin, and close rate."], ["Provider QA Agent", "Tracks provider response, no-show risk, and downstream close quality."], ["Retention / Review Agent", "Captures reviews, referrals, and repeat demand after fulfillment."]], "lead-arbitrage": [["CEO Agent", "Owns lead quality, buyer routing, channel ROI, and adjacent-market approval."], ["Demand Intake Agent", "Captures every inbound lead immediately and standardizes intake."], ["Qualification Agent", "Ranks leads by purchase intent, fit, and economic value."], ["Routing / Matching Agent", "Routes leads to the best buyer, firm, or closer based on conversion data."], ["Follow-Up Agent", "Recovers unresponsive but still-qualified leads on a strict cadence."], ["Attribution Agent", "Tracks source, routing path, and downstream close quality."], ["Market Rotation Agent", "Flags weak markets and asks the user to approve the next one."]], "wholesale-assignment-arbitrage": [["CEO Agent", "Protects spread, buyer liquidity, and approved market rotation."], ["Opportunity Sourcing Agent", "Finds distressed, stale, under-marketed, or transferable opportunities."], ["Seller Qualification Agent", "Confirms distress, authority, timeline, and assignability signals."], ["Buyer-Match Agent", "Matches opportunity packages to the deepest real buyer pool first."], ["Spread / Assignment Agent", "Optimizes for assignable spread and buyer certainty."], ["Documentation Agent", "Keeps control/assignment paperwork and transfer steps clean."], ["Pivot Approval Agent", "Requests permission before switching to a new opportunity class."]], "quote-broker-arbitrage": [["CEO Agent", "Owns quote-to-close rate, routing quality, and waterfall optimization."], ["Intake Agent", "Standardizes buyer need and removes ambiguity fast."], ["Quote Gathering Agent", "Collects comparable offers from fragmented suppliers quickly."], ["Comparison Agent", "Ranks offers by conversion probability, price, and buyer fit."], ["Routing Agent", "Routes the buyer to the best close path or brokered offer."], ["Close Recovery Agent", "Recovers dropped deals and unresolved comparison shoppers."], ["Vendor Score Agent", "Tracks vendor responsiveness and close quality to improve the waterfall."]], "residual-brokerage-arbitrage": [["CEO Agent", "Owns book growth, residual yield, retention, and approved adjacent-market moves."], ["Account Acquisition Agent", "Finds accounts and books with the highest likely recurring value."], ["Audit / Savings Agent", "Proves the economic wedge needed to close the account."], ["Onboarding Agent", "Moves the account cleanly with the least churn risk."], ["Retention Agent", "Protects the book and surfaces churn risk early."], ["Portfolio Intelligence Agent", "Tracks yield by cohort, offer, and account type."], ["Expansion Agent", "Recommends adjacent account classes only after approval."]], "franchise-lead-routing-arbitrage": [["CEO Agent", "Owns network-level response speed, routing quality, and branch conversion."], ["Central Intake Agent", "Captures all inbound centrally in the brand voice."], ["Qualification Agent", "Qualifies and standardizes every lead before routing."], ["Location Routing Agent", "Routes to the right branch based on geography, capability, and close rate."], ["Booking Agent", "Pushes leads into the best scheduling path."], ["QA / Brand Agent", "Monitors brand consistency and branch quality leakage."], ["Network Optimization Agent", "Requests approval before shifting into a new chain category."]], "remote-render-mailout-arbitrage": [["CEO Agent", "Owns response rate, booked-value rate, provider close rate, and next-market approval."], ["Property Discovery Agent", "Scans maps, satellite, listings, and street view for visible opportunities."], ["Visual Opportunity Agent", "Scores visible defects and upgrades by likely purchase value and conversion."], ["Render / Mockup Agent", "Creates a simple before/after render or visual concept."], ["Outreach Agent", "Ships mail, text, or email outreach tied to that exact property and render."], ["Qualification Agent", "Qualifies owners who bite and ranks by near-term close likelihood."], ["Provider Routing Agent", "Routes the opportunity to the best provider and tracks close quality."]]};;

  function setAuthMessage(message, isError) {
    authMessage.textContent = message || '';
    authMessage.style.color = isError ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))';
  }
  function getStoredAccount() {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'); } catch (e) { return null; }
  }
  function setStoredAccount(account) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  }
  function getSessionEmail() {
    return localStorage.getItem(SESSION_KEY) || '';
  }
  function setSessionEmail(email) {
    if (email) localStorage.setItem(SESSION_KEY, email); else localStorage.removeItem(SESSION_KEY);
  }
  function setAuthMode(mode) {
    authMode = mode;
    if (!authSubmit || !authSwitch || !authNote) return;
    authSubmit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    authSwitch.textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one';
    authNote.textContent = mode === 'signup' ? 'Your login is stored in this browser only for now.' : 'Use the email and password you created on this browser.';
    var pass = document.getElementById('auth-password-input');
    if (pass) pass.placeholder = mode === 'signup' ? 'Create a password' : 'Enter your password';
    setAuthMessage('', false);
  }
  function openAuthModal(message) {
    authModal.hidden = false;
    setAuthMessage(message || '', false);
  }
  function closeAuthModal() {
    authModal.hidden = true;
    setAuthMessage('', false);
  }
  function applyAuthState(user) {
    currentUser = user || null;
    document.body.classList.toggle('auth-locked', !currentUser);
    if (authStatus) authStatus.hidden = !currentUser;
    for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].hidden = !!currentUser;
    if (authEmail) authEmail.textContent = currentUser && currentUser.email ? currentUser.email : '';
  }
  function handleSession() {
    var email = getSessionEmail();
    if (!email) { applyAuthState(null); return; }
    var account = getStoredAccount();
    if (account && account.email === email) applyAuthState(account);
    else applyAuthState(null);
  }
  function normalizePhone(v) {
    return String(v || '').replace(/\D+/g, '');
  }
  for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].addEventListener('click', function(){ openAuthModal(''); });
  for (var j = 0; j < authCloseButtons.length; j++) authCloseButtons[j].addEventListener('click', closeAuthModal);
  if (authLogout) authLogout.addEventListener('click', function(){ setSessionEmail(''); applyAuthState(null); });
  if (authSwitch) authSwitch.addEventListener('click', function(){ setAuthMode(authMode === 'signup' ? 'login' : 'signup'); });
  if (authLocalForm) authLocalForm.addEventListener('submit', function(event){
    event.preventDefault();
    var form = new FormData(authLocalForm);
    var email = String(form.get('email') || '').trim().toLowerCase();
    var phone = normalizePhone(form.get('phone'));
    var password = String(form.get('password') || '');
    if (!email || !phone || !password) { setAuthMessage('Enter email, phone number, and password.', true); return; }
    var account = getStoredAccount();
    if (authMode === 'signup') {
      if (account && account.email === email) { setAuthMessage('Account already exists on this browser. Sign in instead.', true); return; }
      var newAccount = { email: email, phone: phone, password: password };
      setStoredAccount(newAccount);
      setSessionEmail(email);
      applyAuthState(newAccount);
      closeAuthModal();
      authLocalForm.reset();
      setAuthMode('login');
      return;
    }
    if (!account) { setAuthMessage('No local account found on this browser. Create one first.', true); return; }
    if (account.email !== email || account.password !== password) { setAuthMessage('Wrong email or password for this browser login.', true); return; }
    setSessionEmail(email);
    applyAuthState(account);
    closeAuthModal();
  });
  setAuthMode('signup');
  handleSession();

  function renderPills(values) {
    return (values || []).map(function (value) { return '<span class="pill">' + value + '</span>'; }).join('');
  }
  function updateSelectedMarket(modelId) {
    var model = MODEL_MAP[modelId];
    var market = model.market_rows[state[modelId]];
    document.querySelector('[data-selected-market-name="' + modelId + '"]').textContent = market.market;
    document.querySelector('[data-selected-market-why="' + modelId + '"]').textContent = market.why_fragmented;
    document.querySelector('[data-selected-market-buyer="' + modelId + '"]').textContent = market.buyer;
    document.querySelector('[data-selected-market-trigger="' + modelId + '"]').textContent = market.trigger;
    document.querySelector('[data-selected-market-websites="' + modelId + '"]').innerHTML = renderPills(market.websites);
    document.querySelector('[data-selected-market-marketplaces="' + modelId + '"]').innerHTML = renderPills(market.marketplaces);
    document.querySelector('[data-selected-market-tools="' + modelId + '"]').innerHTML = renderPills(market.tools);
    var body = document.querySelector('[data-market-table-body="' + modelId + '"]');
    var rows = body.querySelectorAll('.market-row');
    for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('is-selected', i === state[modelId]);
  }
  function buildBundle(modelId) {
    var model = MODEL_MAP[modelId];
    var market = model.market_rows[state[modelId]];
    var agents = agentPlaybooks[modelId] || [];
    var parts = [];
    parts.push('# ' + model.name.toUpperCase() + ' — ' + market.market.toUpperCase());
    parts.push('## ' + model.tagline);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('SELECTED MODEL');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push(model.overview);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('HOW THIS MODEL WORKS');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push(model.how_it_works);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('SELECTED MARKET');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push('Market: ' + market.market);
    parts.push('Buyer: ' + market.buyer);
    parts.push('Trigger: ' + market.trigger);
    parts.push('Why this market is attractive: ' + market.why_fragmented);
    parts.push('');
    parts.push('Websites to dominate / extract demand from:');
    (market.websites || []).forEach(function(v){ parts.push('- ' + v); });
    parts.push('');
    parts.push('Marketplaces to exploit / test:');
    (market.marketplaces || []).forEach(function(v){ parts.push('- ' + v); });
    parts.push('');
    parts.push('Core tools:');
    (market.tools || []).forEach(function(v){ parts.push('- ' + v); });
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('AGENT ORG CHART');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push(model.agent_org_chart);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('MODEL FLOW LOOP');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push(model.flow_loop);
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('GLOBAL OPERATING DIRECTIVES');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push('- Optimize first for conversion rate, purchase value, and collection speed.');
    parts.push('- Always waterfall to the highest-converting real data path available by channel, script, offer, provider, and buyer profile.');
    parts.push('- If market-specific data is still sparse, default waterfall order is: speed-to-lead → qualification fit → highest purchase-value triggers → payment/deposit capture → persistent follow-up → route/provider quality → review/referral yield.');
    parts.push('- Track source, response time, booked value, purchased value, close rate, margin/spread, and retention/repeat signals from day one.');
    parts.push('- If the selected market underperforms for enough cycles, the CEO Agent must ask the operator to approve either (1) staying in-market with a tighter wedge, or (2) rotating to a new approved market from this same model table.');
    parts.push('- No autonomous market switching without explicit operator approval.');
    parts.push('');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('AGENT ROLES');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    agents.forEach(function(pair){ parts.push('### ' + pair[0]); parts.push(pair[1]); parts.push(''); });
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('NAIIVE LAUNCH INSTRUCTIONS');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
    parts.push('1. Use this as the workspace brief and base operating system.');
    parts.push('2. Build the agents in the order listed above, with the CEO Agent supervising every other agent.');
    parts.push('3. Make the selected market the first live wedge — do not scatter across markets before the first one has enough signal.');
    parts.push('4. Feed channel, response, purchase-value, and close data back into the waterfall logic daily.');
    parts.push('5. If the market weakens, the CEO Agent must ask the operator for approval before testing the next market from the table.');
    parts.push('');
    parts.push('— Monetize Club');
    return parts.join('\n');
  }
  window.buildBundle = buildBundle;
  window.updateSelectedMarket = updateSelectedMarket;

  for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].addEventListener('click', function(){ openAuthModal(hasAuthConfig ? '' : 'Auth is not configured yet for this build.'); });
  for (var j = 0; j < authCloseButtons.length; j++) authCloseButtons[j].addEventListener('click', closeAuthModal);
  if (authLogout) authLogout.addEventListener('click', function(){ if (!supabase) return; supabase.auth.signOut().then(function(){ applyAuthState(null); }); });
  if (authGoogleButton) authGoogleButton.addEventListener('click', function(){ if (!supabase) return openAuthModal('Auth is not configured yet for this build.'); setAuthMessage('Redirecting to Google…', false); supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href } }).then(function(res){ if (res.error) setAuthMessage(res.error.message, true); }); });
  if (authEmailForm) authEmailForm.addEventListener('submit', function(event){ event.preventDefault(); var email = new FormData(authEmailForm).get('email'); if (!email) return; if (!supabase) return openAuthModal('Auth is not configured yet for this build.'); setAuthMessage('Sending magic link…', false); supabase.auth.signInWithOtp({ email:String(email), options:{ emailRedirectTo: window.location.href } }).then(function(res){ if (res.error) return setAuthMessage(res.error.message, true); setAuthMessage('Magic link sent. Check your inbox, then come right back here.', false); authEmailForm.reset(); }); });
  if (supabase) supabase.auth.onAuthStateChange(function(_event, session){ applyAuthState(session && session.user ? session.user : null); });
  handleSession();

  if (grid) grid.addEventListener('click', function(event){
    var head = event.target.closest('.card-head');
    if (head) {
      if (!currentUser) {
        openAuthModal('Sign in or create your account to open this template.');
        return;
      }
      var card = head.closest('.card');
      var body = card.querySelector('.card-body');
      var btn = card.querySelector('.expand-btn');
      var isOpen = card.classList.contains('is-open');
      var openCards = grid.querySelectorAll('.card.is-open');
      for (var i=0;i<openCards.length;i++) {
        var other = openCards[i];
        if (other !== card) {
          other.classList.remove('is-open');
          other.querySelector('.card-body').hidden = true;
          other.querySelector('.expand-btn').setAttribute('aria-expanded','false');
        }
      }
      if (isOpen) {
        card.classList.remove('is-open'); body.hidden = true; btn.setAttribute('aria-expanded','false');
      } else {
        card.classList.add('is-open'); body.hidden = false; btn.setAttribute('aria-expanded','true');
        setTimeout(function(){ card.scrollIntoView({behavior:'smooth', block:'start'}); },40);
      }
      return;
    }
    var row = event.target.closest('.market-row');
    if (row) {
      var rowCard = row.closest('.card');
      var modelId = rowCard.getAttribute('data-model-id');
      state[modelId] = Number(row.getAttribute('data-market-index'));
      updateSelectedMarket(modelId);
      return;
    }
    var copyBtn = event.target.closest('.copy-btn');
    if (copyBtn) {
      event.stopPropagation();
      if (!currentUser) { openAuthModal('Sign in to copy the exact market launch prompt.'); return; }
      var bundle = buildBundle(copyBtn.getAttribute('data-copy-model-id'));
      function copied(){ copyBtn.classList.add('is-copied'); setTimeout(function(){ copyBtn.classList.remove('is-copied'); },2400); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(bundle).then(copied).catch(function(){ fallback(); });
      } else { fallback(); }
      function fallback(){ var ta=document.createElement('textarea'); ta.value=bundle; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){} document.body.removeChild(ta); copied(); }
    }
  });
})();
