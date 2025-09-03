(async () => {
  // -----------------------------
  // 1. CONFIGURATION
  // -----------------------------
  const CONFIG = {
    START_X: 742,              // Starting X coordinate
    START_Y: 1148,             // Starting Y coordinate
    PIXELS_PER_LINE: 100,      // Random pixels per line
    DELAY: 1000,               // Delay between paints (ms)
    THEME: {                    // UI theme colors
      primary: '#000000',
      secondary: '#111111',
      accent: '#222222',
      text: '#ffffff',
      highlight: '#775ce3',
      success: '#00ff00',
      error: '#ff0000'
    }
  };

  // -----------------------------
  // 2. STATE MANAGEMENT
  // -----------------------------
  const state = {
    running: false,
    paintedCount: 0,
    charges: { count: 0, max: 80, cooldownMs: 30000 },
    userInfo: null,
    lastPixel: null,
    minimized: false,
    menuOpen: false,
    language: 'en'
  };

  // -----------------------------
  // 3. UTILITY FUNCTIONS
  // -----------------------------
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const fetchAPI = async (url, options = {}) => {
    try {
      const res = await fetch(url, { credentials: 'include', ...options });
      return await res.json();
    } catch {
      return null;
    }
  };

  const getRandomPosition = () => ({
    x: Math.floor(Math.random() * CONFIG.PIXELS_PER_LINE),
    y: Math.floor(Math.random() * CONFIG.PIXELS_PER_LINE)
  });

  const paintPixel = async (x, y) => {
    const randomColor = Math.floor(Math.random() * 31) + 1;
    return await fetchAPI(`https://backend.wplace.live/s0/pixel/${CONFIG.START_X}/${CONFIG.START_Y}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coords: [x, y], colors: [randomColor] })
    });
  };

  const getCharge = async () => {
    const data = await fetchAPI('https://backend.wplace.live/me');
    if (data) {
      state.userInfo = data;
      state.charges = {
        count: Math.floor(data.charges.count),
        max: Math.floor(data.charges.max),
        cooldownMs: data.charges.cooldownMs
      };
      if (state.userInfo.level) state.userInfo.level = Math.floor(state.userInfo.level);
    }
    return state.charges;
  };

  const detectUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      state.language = data.country === 'BR' ? 'pt' : 'en';
    } catch {
      state.language = 'en';
    }
  };

  // -----------------------------
  // 4. PAINTING LOOP
  // -----------------------------
  const paintLoop = async () => {
    while (state.running) {
      const { count, cooldownMs } = state.charges;

      if (count < 1) {
        updateUI(state.language === 'pt' ? `⌛ Sem cargas. Esperando ${Math.ceil(cooldownMs/1000)}s...` : `⌛ No charges. Waiting ${Math.ceil(cooldownMs/1000)}s...`, 'status');
        await sleep(cooldownMs);
        await getCharge();
        continue;
      }

      const pos = getRandomPosition();
      const result = await paintPixel(pos.x, pos.y);

      if (result?.painted === 1) {
        state.paintedCount++;
        state.lastPixel = { x: CONFIG.START_X + pos.x, y: CONFIG.START_Y + pos.y, time: new Date() };
        state.charges.count--;
        updateUI(state.language === 'pt' ? '✅ Pixel pintado!' : '✅ Pixel painted!', 'success');
      } else {
        updateUI(state.language === 'pt' ? '❌ Falha ao pintar' : '❌ Failed to paint', 'error');
      }

      await sleep(CONFIG.DELAY);
      updateStats();
    }
  };

  // -----------------------------
  // 5. UI CREATION
  // -----------------------------
  const createUI = () => {
    if (state.menuOpen) return;
    state.menuOpen = true;

    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 250px; background:${CONFIG.THEME.primary};
      border: 1px solid ${CONFIG.THEME.accent}; border-radius: 8px; padding:0; z-index:9999; color:${CONFIG.THEME.text};
      font-family: 'Segoe UI', sans-serif;
    `;
    panel.innerHTML = `
      <div style="padding:10px; background:${CONFIG.THEME.secondary}; display:flex; justify-content:space-between; align-items:center;">
        <span>WPlace Auto-Farm</span>
        <button id="minBtn" style="background:none;color:white;border:none;cursor:pointer;">-</button>
      </div>
      <div id="content" style="padding:10px;">
        <button id="toggleBtn" style="width:100%;padding:8px;margin-bottom:10px;">Start</button>
        <div id="stats"></div>
        <div id="status">Ready to start</div>
      </div>
    `;
    document.body.appendChild(panel);

    const toggleBtn = panel.querySelector('#toggleBtn');
    const minBtn = panel.querySelector('#minBtn');
    const content = panel.querySelector('#content');

    toggleBtn.addEventListener('click', () => {
      state.running = !state.running;
      toggleBtn.textContent = state.running ? 'Stop' : 'Start';
      if (state.running) paintLoop();
      updateUI(state.running ? '🚀 Painting started!' : '⏸️ Painting paused', 'default');
    });

    minBtn.addEventListener('click', () => {
      state.minimized = !state.minimized;
      content.style.display = state.minimized ? 'none' : 'block';
    });
  };

  // -----------------------------
  // 6. UI UPDATES
  // -----------------------------
  window.updateUI = (message, type = 'default') => {
    const status = document.querySelector('#status');
    if (status) {
      status.textContent = message;
      status.style.color = type === 'success' ? CONFIG.THEME.success : type === 'error' ? CONFIG.THEME.error : CONFIG.THEME.text;
    }
  };

  window.updateStats = async () => {
    await getCharge();
    const stats = document.querySelector('#stats');
    if (stats) {
      stats.innerHTML = `
        Pixels painted: ${state.paintedCount}<br>
        Charges: ${state.charges.count}/${state.charges.max}<br>
        Level: ${state.userInfo?.level || 0}<br>
        User: ${state.userInfo?.name || 'N/A'}
      `;
    }
  };

  // -----------------------------
  // 7. EXECUTION
  // -----------------------------
  await detectUserLocation();
  createUI();
  await getCharge();
  updateStats();
})();
