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
  var grid, authModal, authOpenButtons, authCloseButtons, authEmailForm, authGoogleButton, authSubmit, authSwitch, authNote, authMessage, authStatus, authEmail, authLogout, authPasswordInput;
  var currentUser = null;
  var authMode = 'signup';

  function initDOMRefs() {
    grid = document.getElementById('grid');
    authModal = document.querySelector('[data-auth-modal]');
    authOpenButtons = document.querySelectorAll('[data-auth-open]');
    authCloseButtons = document.querySelectorAll('[data-auth-close]');
    authEmailForm = document.querySelector('[data-auth-email-form]');
    authGoogleButton = document.querySelector('[data-auth-google]');
    authSubmit = document.querySelector('[data-auth-submit]');
    authSwitch = document.querySelector('[data-auth-switch]');
    authNote = document.querySelector('[data-auth-note]');
    authMessage = document.querySelector('[data-auth-message]');
    authStatus = document.querySelector('.auth-status');
    authEmail = document.querySelector('[data-auth-email]');
    authLogout = document.querySelector('[data-auth-logout]');
    authPasswordInput = document.getElementById('auth-password-input');
  }

  function setAuthMessage(message, isError) {
    if (!authMessage) return;
    authMessage.textContent = message || '';
    authMessage.style.color = isError ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))';
  }
  function openAuthModal(message) {
    if (!authModal) return;
    authModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setAuthMessage(message || (!hasAuthConfig ? 'Auth is not configured yet for this build.' : ''), false);
  }
  function closeAuthModal() {
    if (!authModal) return;
    authModal.hidden = true;
    document.body.style.overflow = '';
    setAuthMessage('', false);
  }
  function closeOpenCards() {
    if (!grid) return;
    var openCards = grid.querySelectorAll('.card.is-open');
    for (var i = 0; i < openCards.length; i++) {
      openCards[i].classList.remove('is-open');
      openCards[i].querySelector('.card-body').hidden = true;
      openCards[i].querySelector('.expand-btn').setAttribute('aria-expanded', 'false');
    }
  }
  function setAuthMode(mode) {
    authMode = mode;
    if (authSubmit) authSubmit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    if (authSwitch) authSwitch.textContent = mode === 'signup' ? 'Switch to sign in' : 'Switch to create account';
    if (authNote) authNote.textContent = mode === 'signup' ? 'Use a normal email/password login. No magic link.' : 'Sign in with the email and password you already created.';
    if (authPasswordInput) authPasswordInput.placeholder = mode === 'signup' ? 'Create a password' : 'Enter your password';
    setAuthMessage('', false);
  }
  function applyAuthState(user) {
    currentUser = user || null;
    document.body.classList.toggle('auth-locked', !currentUser);
    if (authStatus) authStatus.hidden = !currentUser;
    for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].hidden = !!currentUser;
    if (authEmail) authEmail.textContent = currentUser && currentUser.email ? currentUser.email : '';
    if (currentUser) closeAuthModal();
  }
  async function initAuth() {
    if (!hasAuthConfig || !supabase) {
      applyAuthState(null);
      return;
    }
    try {
      var sessionResult = await supabase.auth.getSession();
      var user = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.user ? sessionResult.data.session.user : null;
      applyAuthState(user);
      supabase.auth.onAuthStateChange(function (_event, session) {
        applyAuthState(session && session.user ? session.user : null);
      });
    } catch (err) {
      console.error('Auth init error:', err);
      applyAuthState(null);
    }
  }
  function bindEvents() {
    for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].addEventListener('click', function(){ openAuthModal(''); });
    for (var j = 0; j < authCloseButtons.length; j++) authCloseButtons[j].addEventListener('click', closeAuthModal);
    if (authLogout) authLogout.addEventListener('click', function(){ if (!supabase) return; supabase.auth.signOut().then(function(){ closeOpenCards(); applyAuthState(null); }); });
    if (authSwitch) authSwitch.addEventListener('click', function(){ setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); });
    if (authGoogleButton) authGoogleButton.addEventListener('click', function(){
      if (!supabase) return openAuthModal('Auth is not configured yet for this build.');
      setAuthMessage('Redirecting to Google…', false);
      supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href.split('#')[0] } }).then(function(res){ if (res.error) setAuthMessage(res.error.message, true); });
    });
    if (authEmailForm) authEmailForm.addEventListener('submit', function(event){
      event.preventDefault();
      var formData = new FormData(authEmailForm);
      var email = String(formData.get('email') || '').trim();
      var password = String(formData.get('password') || '');
      if (!email || !password) {
        setAuthMessage('Enter your email and password.', true);
        return;
      }
      if (!supabase) return openAuthModal('Auth is not configured yet for this build.');
      setAuthMessage(authMode === 'signup' ? 'Creating account…' : 'Signing in…', false);
      var authPromise = authMode === 'signup'
        ? supabase.auth.signUp({ email: email, password: password })
        : supabase.auth.signInWithPassword({ email: email, password: password });
      authPromise.then(function(res){
        if (res.error) {
          var message = res.error.message || 'Auth failed.';
          if (message === 'Invalid login credentials') {
            message = authMode === 'signin'
              ? 'Wrong email or password, or this account has not been created/confirmed yet.'
              : 'Could not create account. Try a different email or wait a minute if you just tested this repeatedly.';
          }
          return setAuthMessage(message, true);
        }
        var session = res.data && res.data.session ? res.data.session : null;
        var user = res.data && res.data.user ? res.data.user : null;
        if (session && session.user) {
          applyAuthState(session.user);
          authEmailForm.reset();
          setAuthMode('signin');
          return;
        }
        if (authMode === 'signup' && user) {
          setAuthMessage('Account created. If email confirmation is enabled, confirm your email, then sign in.', false);
          setAuthMode('signin');
          if (authPasswordInput) authPasswordInput.value = '';
          return;
        }
        setAuthMessage('Signed in.', false);
      }).catch(function(err){
        console.error('Auth promise error:', err);
        setAuthMessage('Something went wrong. Try again.', true);
      });
    });
  }
  function initGrid() {
    if (!grid) return;
    grid.addEventListener('click', function(event){
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
  }

  function start() {
    initDOMRefs();
    bindEvents();
    initGrid();
    setAuthMode('signup');
    initAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  var agentPlaybooks = {"dispatch-routing-arbitrage": [["CEO Agent", "Oversees response speed, routing quality, payment capture, provider quality, and market-change approval."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines urgency, fit, buyer quality, and probable purchase value."], ["Quote / Pricing Agent", "Applies the highest-converting approved pricing logic for this market."], ["Routing Agent", "Routes to the best provider or fulfillment path based on geography, margin, and close rate."], ["Provider QA Agent", "Tracks provider response, no-show risk, and downstream close quality."], ["Retention / Review Agent", "Captures reviews, referrals, and repeat demand after fulfillment."]], "lead-arbitrage": [["CEO Agent", "Owns lead quality, buyer routing, channel ROI, and adjacent-market approval."], ["Demand Intake Agent", "Captures every inbound lead immediately and standardizes intake."], ["Qualification Agent", "Ranks leads by purchase intent, fit, and economic value."], ["Routing / Matching Agent", "Routes leads to the best buyer, firm, or closer based on conversion data."], ["Follow-Up Agent", "Recovers unresponsive but still-qualified leads on a strict cadence."], ["Attribution Agent", "Tracks source, routing path, and downstream close quality."], ["Market Rotation Agent", "Flags weak markets and asks the user to approve the next one."]], "wholesale-assignment-arbitrage": [["CEO Agent", "Protects spread, buyer liquidity, and approved market rotation."], ["Opportunity Sourcing Agent", "Finds distressed, stale, under-marketed, or transferable opportunities."], ["Seller Qualification Agent", "Confirms distress, authority, timeline, and assignability signals."], ["Buyer-Match Agent", "Matches opportunity packages to the deepest real buyer pool first."], ["Spread / Assignment Agent", "Optimizes for assignable spread and buyer certainty."], ["Documentation Agent", "Keeps contracts, assignments, and disclosures clean and fast."], ["Close / Funding Agent", "Monitors buyer diligence, closing timeline, and funding coordination."]], "quote-broker-arbitrage": [["CEO Agent", "Protects quote accuracy, conversion rate, and approved carrier/market rotation."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines intent, fit, and the highest-probability quote path."], ["Quote Agent", "Generates the most competitive accurate quote from approved carriers."], ["Binder / Policy Agent", "Handles documentation, payment, and policy delivery."], ["Retention / Cross-Sell Agent", "Monitors renewal, referral, and cross-sell yield."]], "residual-brokerage-arbitrage": [["CEO Agent", "Owns portfolio value, churn, and partner quality."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines intent, fit, and highest-probability close path."], ["Placement Agent", "Routes to the best partner based on residuals, speed, and reliability."], ["Activation Agent", "Handles onboarding, compliance, and first-revenue event."], ["Portfolio Health Agent", "Tracks retention, expansion, and churn risk across the book."]], "franchise-lead-routing-arbitrage": [["CEO Agent", "Owns lead quality, location routing, and franchisee performance."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines intent, fit, and highest-probability location."], ["Location Routing Agent", "Routes to the best-performing available location first."], ["Follow-Up Agent", "Recovers unresponsive but still-qualified leads on a strict cadence."], ["Attribution Agent", "Tracks source, location, and downstream close quality."]], "remote-render-mailout-arbitrage": [["CEO Agent", "Owns production quality, list accuracy, and client retention."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines intent, fit, and highest-probability close path."], ["Render Agent", "Produces the highest-fidelity deliverable for the use case."], ["Mailout Agent", "Handles list hygiene, postage optimization, and delivery tracking."], ["Retention / Upsell Agent", "Monitors renewal, referral, and upsell yield."]]};

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
})();
