// public/schedule.js

// ---- BASE URL for Railway backend ----
const API_BASE = 'https://expresstravels.up.railway.app'; // <-- Railway backend URL

// ----- UI refs -----
const routeSelect = document.getElementById('routeSelect');
const dateInput   = document.getElementById('dateInput');
const loadBtn     = document.getElementById('loadBtn');
const busList     = document.getElementById('busList');
const statusNote  = document.getElementById('statusNote');

// Route → Start/End city labels (both directions)
const routeCityMap = {
  101: [{ start: 'Colombo', end: 'Kandy' }, { start: 'Kandy', end: 'Colombo' }],
  102: [{ start: 'Colombo', end: 'Galle' }, { start: 'Galle', end: 'Colombo' }],
  103: [{ start: 'Colombo', end: 'Jaffna' }, { start: 'Jaffna', end: 'Colombo' }],
  104: [{ start: 'Anuradhapura', end: 'Colombo' }, { start: 'Colombo', end: 'Anuradhapura' }],
  105: [{ start: 'Colombo', end: 'Matara' }, { start: 'Matara', end: 'Colombo' }]
};

// Base start time per route
function baseStartForRoute(routeId, selectedDate) {
  const d = selectedDate ? new Date(selectedDate) : new Date();
  d.setHours(6, 0, 0, 0);
  return d;
}

// Format time only
function formatTimeOnly(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Fetch routes from Railway backend
async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/routes`);
  const routes = await res.json();

  routeSelect.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'All Routes';
  routeSelect.appendChild(all);

  routes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = String(r.route_id);
    opt.textContent = `${r.route_id} — ${r.name}`;
    routeSelect.appendChild(opt);
  });
}

// Build 45-min interval schedule
function buildScheduledTimes(buses, selectedDate) {
  const byRoute = new Map();
  buses.forEach(b => {
    const r = Number(b.route_id);
    if (!byRoute.has(r)) byRoute.set(r, []);
    byRoute.get(r).push(b);
  });

  const scheduled = new Map();
  for (const [routeId, list] of byRoute.entries()) {
    list.sort((a, b) => Number(a.bus_id) - Number(b.bus_id));
    const base = baseStartForRoute(routeId, selectedDate);
    list.forEach((bus, idx) => {
      const t = new Date(base.getTime() + idx * 45 * 60 * 1000);
      scheduled.set(bus.bus_id, t);
    });
  }
  return scheduled;
}

// Load buses & render table
async function loadBuses() {
  busList.innerHTML = '';
  statusNote.textContent = 'Loading…';
  loadBtn.disabled = true;

  const route = routeSelect.value;
  const selectedDate = dateInput.value;

  const url = new URL(`${API_BASE}/buses`);
  if (route && route !== 'all') url.searchParams.set('route_id', route);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buses = await res.json();

    const scheduleMap = buildScheduledTimes(buses, selectedDate);

    const list = [...buses];
    if (route === 'all') {
      list.sort((a, b) =>
        Number(a.route_id) - Number(b.route_id) ||
        Number(a.bus_id)  - Number(b.bus_id)
      );
    } else {
      list.sort((a, b) => Number(a.bus_id) - Number(b.bus_id));
    }

    list.forEach(b => {
      const routeId = Number(b.route_id);
      const directions = routeCityMap[routeId] || [{ start: '—', end: '—' }];
      const startTime = scheduleMap.get(b.bus_id);
      const timeOnly = startTime ? formatTimeOnly(startTime) : '—';

      directions.forEach(direction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.bus_id}</td>
          <td>${routeId}</td>
          <td>${timeOnly}</td>
          <td>${direction.start}</td>
          <td>${direction.end}</td>
        `;
        busList.appendChild(tr);
      });
    });

    statusNote.textContent =
      `Showing ${list.length} buses (${route === 'all' ? 'sorted by route' : 'for route ' + route}).`;
  } catch (e) {
    statusNote.textContent = 'Failed to load buses.';
    console.error(e);
  } finally {
    loadBtn.disabled = false;
  }
}

// Boot
(async function boot() {
  await fetchRoutes();
  dateInput.value = toYMD(new Date());
  await loadBuses();

  loadBtn.addEventListener('click', loadBuses);
})();


