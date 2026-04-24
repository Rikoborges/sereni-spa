const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://serenispa2.onrender.com/api';

const token    = localStorage.getItem('token');
const role     = localStorage.getItem('role');
const userName = localStorage.getItem('userName') || 'Client';

// Proteger rota — sem token vai para index
if (!token) { window.location.href = 'index.html'; }

// Admin não deve estar aqui
if (role === 'admin') { window.location.href = 'admin.html'; }

// ── SAUDAÇÃO ──
document.getElementById('dash-greeting').textContent = `Bonjour, ${userName.split(' ')[0]}`;
document.getElementById('dash-title').textContent = `Bonjour, ${userName.split(' ')[0]}`;

// ── LOGOUT ──
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// ── CARREGAR AGENDAMENTOS ──
async function loadAgendements() {
  try {
    const res = await fetch(`${API_URL}/agendements/mes-agendements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) { localStorage.clear(); window.location.href = 'index.html'; return; }

    const data = await res.json();
    renderAgendements(data);
    renderStats(data);
  } catch {
    document.getElementById('agendements-container').innerHTML =
      '<div class="empty-state"><p>Impossible de charger vos rendez-vous. Vérifiez votre connexion.</p></div>';
  }
}

function renderStats(agendements) {
  const total     = agendements.length;
  const confirmes = agendements.filter(a => a.statut === 'confirmé').length;
  const futurs    = agendements.filter(a => new Date(a.date) >= new Date() && a.statut !== 'annulé');
  const prochain  = futurs.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-confirme').textContent = confirmes;
  document.getElementById('stat-prochain').textContent = prochain
    ? new Date(prochain.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—';
}

function renderAgendements(agendements) {
  const container = document.getElementById('agendements-container');

  if (!agendements.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Vous n'avez pas encore de rendez-vous.</p>
        <button class="btn btn-primary" id="btn-empty-reserver">Prendre un rendez-vous</button>
      </div>`;
    document.getElementById('btn-empty-reserver').addEventListener('click', openBooking);
    return;
  }

  // Ordenar por data desc
  agendements.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = '<div class="agendement-list" id="agendement-list"></div>';
  const list = document.getElementById('agendement-list');

  agendements.forEach(a => {
    const date      = new Date(a.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const soinNom   = a.serviceId?.nom   || a.massageId?.nom   || 'Soin';
    const massNom   = a.massagisteId?.nom || '—';
    const statut    = a.statut || 'confirmé';
    const isFutur   = new Date(a.date) >= new Date();
    const badgeClass = statut === 'annulé' ? 'badge-annule' : statut === 'confirmé' ? 'badge-confirme' : 'badge-attente';

    const card = document.createElement('div');
    card.className = 'agendement-card';
    card.innerHTML = `
      <div class="agendement-info">
        <div class="agendement-soin">${soinNom}</div>
        <div class="agendement-meta">${date} · ${a.heure || ''} · ${massNom}</div>
      </div>
      <div class="agendement-actions">
        <span class="badge ${badgeClass}">${statut}</span>
        ${isFutur && statut !== 'annulé' ? `<button class="btn-annuler" data-id="${a._id}">Annuler</button>` : ''}
      </div>`;
    list.appendChild(card);
  });

  // Eventos de anulação
  document.querySelectorAll('.btn-annuler').forEach(btn => {
    btn.addEventListener('click', () => annuler(btn.dataset.id, btn));
  });
}

async function annuler(id, btn) {
  if (!confirm('Confirmer l\'annulation de ce rendez-vous ?')) return;
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API_URL}/agendements/${id}/annuler`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    loadAgendements();
  } catch {
    btn.textContent = 'Annuler';
    btn.disabled = false;
    alert('Erreur lors de l\'annulation.');
  }
}

// ── MODAL BOOKING ──
const modalBooking = document.getElementById('modal-booking');
const booking = { massagisteId: null, massagisteNom: null, serviceId: null, serviceNom: null, servicePrix: null, date: null, heure: null };
let currentStep = 1;

function openBooking() { currentStep = 1; goToStep(1); modalBooking.classList.add('active'); }
function closeBooking() { modalBooking.classList.remove('active'); }

document.getElementById('btn-nouvelle-reservation').addEventListener('click', openBooking);
document.getElementById('modal-booking-close').addEventListener('click', closeBooking);
modalBooking.addEventListener('click', e => { if (e.target === modalBooking) closeBooking(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBooking(); });

function goToStep(n) {
  currentStep = n;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  document.querySelectorAll('.step-dot').forEach(d => {
    const dn = parseInt(d.dataset.step);
    d.classList.toggle('active', dn === n);
    d.classList.toggle('done', dn < n);
  });
  const titles = { 1: 'Choisir un praticien', 2: 'Choisir un soin', 3: 'Date & créneau', 4: 'Confirmer' };
  document.getElementById('booking-title').textContent = titles[n];
}

// STEP 1
document.querySelectorAll('.massagiste-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.massagiste-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    booking.massagisteId  = opt.dataset.id;
    booking.massagisteNom = opt.dataset.nom;
    document.getElementById('step1-next').disabled = false;
  });
});
document.getElementById('step1-next').addEventListener('click', () => goToStep(2));

// STEP 2
document.querySelectorAll('.service-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    booking.serviceId  = opt.dataset.id;
    booking.serviceNom = opt.dataset.nom;
    booking.servicePrix = opt.dataset.prix;
    document.getElementById('step2-next').disabled = false;
  });
});
document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
document.getElementById('step2-next').addEventListener('click', () => { goToStep(3); loadSlots(); });

// STEP 3
const dateInput = document.getElementById('booking-date');
dateInput.min = new Date().toISOString().split('T')[0];
dateInput.value = dateInput.min;
dateInput.addEventListener('change', loadSlots);

async function loadSlots() {
  const date = dateInput.value;
  if (!date || !booking.massagisteId) return;
  booking.date  = date;
  booking.heure = null;
  document.getElementById('step3-next').disabled = true;
  document.getElementById('slots-loading').style.display = 'block';
  document.getElementById('slots-container').style.display = 'none';
  try {
    const res = await fetch(`${API_URL}/massagistes/${booking.massagisteId}/slots-disponibles?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    renderSlots(await res.json());
  } catch {
    renderSlots([
      { heure: '09:00', disponible: true }, { heure: '09:55', disponible: false },
      { heure: '10:50', disponible: true }, { heure: '11:45', disponible: true },
      { heure: '13:30', disponible: true }, { heure: '14:25', disponible: false },
      { heure: '15:20', disponible: true }, { heure: '16:15', disponible: true }
    ]);
  } finally {
    document.getElementById('slots-loading').style.display = 'none';
  }
}

function renderSlots(slots) {
  const grid = document.getElementById('slots-grid');
  grid.innerHTML = '';
  slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (!slot.disponible ? ' indisponible' : '');
    btn.textContent = slot.heure;
    btn.disabled = !slot.disponible;
    if (slot.disponible) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        booking.heure = slot.heure;
        document.getElementById('step3-next').disabled = false;
      });
    }
    grid.appendChild(btn);
  });
  document.getElementById('slots-container').style.display = 'block';
}

document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
document.getElementById('step3-next').addEventListener('click', () => {
  document.getElementById('booking-summary').innerHTML = `
    <div class="booking-summary-row"><span>Praticien</span><span>${booking.massagisteNom}</span></div>
    <div class="booking-summary-row"><span>Soin</span><span>${booking.serviceNom}</span></div>
    <div class="booking-summary-row"><span>Date</span><span>${new Date(booking.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
    <div class="booking-summary-row"><span>Heure</span><span>${booking.heure}</span></div>
    <div class="booking-summary-row" style="border-top:1px solid var(--ivory-mid);margin-top:8px;padding-top:8px;">
      <span>Total</span><span style="color:var(--mocha);font-family:var(--ff-title);font-size:1.1rem;">${booking.servicePrix} €</span>
    </div>`;
  goToStep(4);
});

// STEP 4
document.getElementById('step4-back').addEventListener('click', () => goToStep(3));
document.getElementById('btn-confirmer').addEventListener('click', async () => {
  const errEl = document.getElementById('booking-error');
  errEl.classList.remove('visible');
  const btn = document.getElementById('btn-confirmer');
  btn.textContent = 'Confirmation...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API_URL}/agendements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ massagisteId: booking.massagisteId, serviceId: booking.serviceId, date: booking.date, heure: booking.heure })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || 'Erreur lors de la réservation');
    closeBooking();
    loadAgendements();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('visible');
    btn.textContent = 'Confirmer';
    btn.disabled = false;
  }
});

// ── INIT ──
loadAgendements();