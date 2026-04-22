
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
  var authEmailForm = document.querySelector('[data-auth-email-form]');
  var authGoogleButton = document.querySelector('[data-auth-google]');
  var authMessage = document.querySelector('[data-auth-message]');
  var authStatus = document.querySelector('.auth-status');
  var authEmail = document.querySelector('[data-auth-email]');
  var authLogout = document.querySelector('[data-auth-logout]');
  var currentUser = null;
  var agentPlaybooks = {"dispatch-routing-arbitrage": [["CEO Agent", "Oversees response speed, routing quality, payment capture, provider quality, and market-change approval."], ["Demand Capture Agent", "Monitors inbound channels and responds inside the fastest conversion window."], ["Qualification Agent", "Determines urgency, fit, buyer quality, and probable purchase value."], ["Quote / Pricing Agent", "Applies the highest-converting approved pricing logic for this market."], ["Routing Agent", "Routes to the best provider or fulfillment path based on geography, margin, and close rate."], ["Provider QA Agent", "Tracks provider response, no-show risk, and downstream close quality."], ["Retention / Review Agent", "Captures reviews, referrals, and repeat demand after fulfillment."]], "lead-arbitrage": [["CEO Agent", "Owns lead quality, buyer routing, channel ROI, and adjacent-market approval."], ["Demand Intake Agent", "Captures every inbound lead immediately and standardizes intake."], ["Qualification Agent", "Ranks leads by purchase intent, fit, and economic value."], ["Routing / Matching Agent", "Routes leads to the best buyer, firm, or closer based on conversion data."], ["Follow-Up Agent", "Recovers unresponsive but still-qualified leads on a strict cadence."], ["Attribution Agent", "Tracks source, routing path, and downstream close quality."], ["Market Rotation Agent", "Flags weak markets and asks the user to approve the next one."]], "wholesale-assignment-arbitrage": [["CEO Agent", "Protects spread, buyer liquidity, and approved market rotation."], ["Opportunity Sourcing Agent", "Finds distressed, stale, under-marketed, or transferable opportunities."], ["Seller Qualification Agent", "Confirms distress, authority, timeline, and assignability signals."], ["Buyer-Match Agent", "Matches opportunity packages to the deepest real buyer pool first."], ["Spread / Assignment Agent", "Optimizes for assignable spread and buyer certainty."], ["Documentation Agent", "Keeps clean buyer-ready packets, assignment logic, and close-critical details in order."], ["Disposition / Follow-Up Agent", "Works buyer list urgency, follow-up, and fallback routing when the first buyer stalls."]], "quote-broker-arbitrage": [["CEO Agent", "Optimizes quote request conversion, close quality, and broker margin while protecting market-rotation decisions."], ["Intake Agent", "Captures the request, normalizes key details, and starts the quote loop instantly."], ["Qualification Agent", "Separates real buyers from low-intent noise and scores quote quality."], ["Provider / Carrier Routing Agent", "Sends each opportunity to the best-fit provider path based on historical conversion and payout."], ["Quote Comparison Agent", "Packages quotes into the strongest buyer-facing presentation."], ["Close / Booking Agent", "Pushes for the booked outcome and next step immediately."], ["Retention Agent", "Creates repeat, referral, and re-quote loops after the initial close."]], "residual-brokerage-arbitrage": [["CEO Agent", "Owns retention, downstream yield, and approval before adjacent-market expansion."], ["Demand Capture Agent", "Captures inbound or outbound opportunities with strong residual value."], ["Qualification Agent", "Prioritizes prospects with durable repeat economics or long-tail payout value."], ["Placement Agent", "Routes the deal to the best-fit buyer, provider, or platform for long-term residual yield."], ["Onboarding Agent", "Makes handoff frictionless so fewer deals die in implementation."], ["Retention / Expansion Agent", "Increases lifetime value through expansion, stickiness, and review/referral loops."], ["Residual Tracking Agent", "Monitors recurring payout quality and flags churn risk early."]], "franchise-multi-location-lead-routing-arbitrage": [["CEO Agent", "Protects lead routing quality, location response-time discipline, and expansion sequencing."], ["Lead Intake Agent", "Captures inbound demand across all covered geographies."], ["Location Qualification Agent", "Matches demand to the right region, operator, or territory."], ["Routing Agent", "Sends leads to the highest-performing location or buyer path."], ["Follow-Up Agent", "Rescues leads when locations are slow or fail first contact."], ["QA / Attribution Agent", "Tracks which territories close, which leak, and where the next expansion should happen."], ["Expansion Agent", "Flags the next high-fragmentation geography and asks for approval before expansion."]], "remote-render-mailout-arbitrage": [["CEO Agent", "Owns response speed, appointment yield, creative throughput, and market-rotation approval."], ["Lead Sourcing Agent", "Finds high-probability properties, businesses, or assets worth outreach."], ["Render / Creative Agent", "Generates the visual upgrade, mockup, or concept package that gets attention."], ["Mail / Outreach Agent", "Deploys the physical or digital outbound sequence."], ["Follow-Up Agent", "Handles responses fast and moves interest to quote, consult, or appointment."], ["Close / Routing Agent", "Routes the booked opportunity to the right closer or provider path."], ["Performance Agent", "Measures which creative + market combinations actually convert and recommends the next test."]]};

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
    var sessionResult = await supabase.auth.getSession();
    applyAuthState(sessionResult && sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : null);
    supabase.auth.onAuthStateChange(function (_event, session) {
      applyAuthState(session && session.user ? session.user : null);
    });
  }
  for (var i = 0; i < authOpenButtons.length; i++) authOpenButtons[i].addEventListener('click', function(){ openAuthModal(''); });
  for (var j = 0; j < authCloseButtons.length; j++) authCloseButtons[j].addEventListener('click', closeAuthModal);
  if (authLogout) authLogout.addEventListener('click', function(){ if (!supabase) return; supabase.auth.signOut().then(function(){ closeOpenCards(); applyAuthState(null); }); });
  if (authGoogleButton) authGoogleButton.addEventListener('click', function(){
    if (!supabase) return openAuthModal('Auth is not configured yet for this build.');
    setAuthMessage('Redirecting to Google…', false);
    supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.href.split('#')[0] } }).then(function(res){ if (res.error) setAuthMessage(res.error.message, true); });
  });
  if (authEmailForm) authEmailForm.addEventListener('submit', function(event){
    event.preventDefault();
    var email = String(new FormData(authEmailForm).get('email') || '').trim();
    if (!email) return;
    if (!supabase) return openAuthModal('Auth is not configured yet for this build.');
    setAuthMessage('Sending magic link…', false);
    supabase.auth.signInWithOtp({ email: email, options:{ emailRedirectTo: window.location.href.split('#')[0] } }).then(function(res){
      if (res.error) return setAuthMessage(res.error.message, true);
      setAuthMessage('Magic link sent. Check your inbox, then come right back here.', false);
      authEmailForm.reset();
    });
  });
  initAuth();

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
