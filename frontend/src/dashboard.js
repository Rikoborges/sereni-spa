const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://serenispa2.onrender.com/api';

// Redirecionar para login se não autenticado
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

// Mostrar saudação
const userName = localStorage.getItem('userName') || 'Client';
document.getElementById('dash-greeting').textContent = `Bonjour, ${userName}`;

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
});

// ─── AGENDEMENTS ────────────────────────────────────────────────────────────

async function chargerAgendements() {
  const container = document.getElementById('agendements-container');

  try {
    const res = await fetch(`${API_URL}/agendements/mes-agendements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
      return;
    }

    const agendements = await res.json();
    afficherAgendements(agendements);
    afficherStats(agendements);
  } catch {
    container.innerHTML = '<p style="color:var(--brun-light);font-size:14px;padding:1rem 0;">Erreur lors du chargement des rendez-vous.</p>';
  }
}

function afficherStats(agendements) {
  const total = agendements.length;
  const confirmes = agendements.filter(a => a.statut === 'confirmé').length;
  const prochains = agendements
    .filter(a => a.statut !== 'annulé' && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-confirme').textContent = confirmes;
  document.getElementById('stat-prochain').textContent = prochains.length > 0
    ? new Date(prochains[0].date + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—';
}

function afficherAgendements(agendements) {
  const container = document.getElementById('agendements-container');

  if (agendements.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Vous n'avez pas encore de rendez-vous.</p>
        <button class="btn btn-primary" onclick="openBooking()">Prendre rendez-vous</button>
      </div>`;
    return;
  }

  const html = agendements
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(a => {
      const soin = a.serviceId?.nom || 'Soin';
      const praticien = a.massagisteId?.nom || 'Praticien';
      const dateStr = new Date(a.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const badgeClass = a.statut === 'confirmé' ? 'badge-confirme' : a.statut === 'annulé' ? 'badge-annule' : 'badge-attente';
      const peutAnnuler = a.statut !== 'annulé' && new Date(a.date) >= new Date();

      return `
        <div class="agendement-card">
          <div class="agendement-info">
            <div class="agendement-soin">${soin}</div>
            <div class="agendement-meta">${praticien} · ${dateStr} à ${a.heure}</div>
          </div>
          <div class="agendement-actions">
            <span class="badge ${badgeClass}">${a.statut}</span>
            ${peutAnnuler ? `<button class="btn-annuler" onclick="annulerAgendement('${a._id}')">Annuler</button>` : ''}
          </div>
        </div>`;
    })
    .join('');

  container.innerHTML = `<div class="agendement-list">${html}</div>`;
}

async function annulerAgendement(id) {
  if (!confirm('Confirmer l\'annulation de ce rendez-vous ?')) return;

  try {
    const res = await fetch(`${API_URL}/agendements/${id}/annuler`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.erreur || 'Erreur lors de l\'annulation');
      return;
    }

    chargerAgendements();
  } catch {
    alert('Erreur réseau lors de l\'annulation');
  }
}

// ─── MODAL RÉSERVATION ──────────────────────────────────────────────────────

const booking = {
  massagisteId: null, massagisteNom: null,
  serviceId: null, serviceNom: null, servicePrix: null,
  date: null, heure: null
};

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('visible');
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('visible');
}

const modalBooking = document.getElementById('modal-booking');

async function openBooking() {
  Object.assign(booking, { massagisteId: null, massagisteNom: null, serviceId: null, serviceNom: null, servicePrix: null, date: null, heure: null });
  modalBooking.classList.add('active');
  await chargerEtape1();
  goToStep(1);
}

function closeBooking() {
  modalBooking.classList.remove('active');
}

document.getElementById('btn-nouvelle-reservation').addEventListener('click', openBooking);
document.getElementById('modal-booking-close').addEventListener('click', closeBooking);
modalBooking.addEventListener('click', e => { if (e.target === modalBooking) closeBooking(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBooking(); });

function goToStep(n) {
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

// Étape 1 — Massagistes (chargés depuis l'API)
async function chargerEtape1() {
  const step = document.getElementById('step-1');
  step.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--brun-light);font-size:14px;">Chargement...</div>';

  try {
    const res = await fetch(`${API_URL}/massagistes`);
    const massagistes = await res.json();

    if (!massagistes.length) {
      step.innerHTML = '<div style="padding:1rem;color:var(--brun-light);font-size:14px;">Aucun praticien disponible.</div>';
      return;
    }

    const initiales = nom => nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    step.innerHTML = massagistes.map(m => `
      <button class="massagiste-option" data-id="${m._id}" data-nom="${m.nom}">
        <div class="massagiste-option-avatar">${initiales(m.nom)}</div>
        <div class="massagiste-option-info"><strong>${m.nom}</strong><span>${m.specialite}</span></div>
      </button>
    `).join('') + `<div class="step-actions"><button class="btn btn-primary" id="step1-next" disabled>Continuer</button></div>`;

    document.querySelectorAll('.massagiste-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.massagiste-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        booking.massagisteId = opt.dataset.id;
        booking.massagisteNom = opt.dataset.nom;
        document.getElementById('step1-next').disabled = false;
      });
    });

    document.getElementById('step1-next').addEventListener('click', async () => {
      await chargerEtape2();
      goToStep(2);
    });
  } catch {
    step.innerHTML = '<div style="padding:1rem;color:red;font-size:14px;">Erreur lors du chargement des praticiens.</div>';
  }
}

// Étape 2 — Services (chargés depuis l'API)
async function chargerEtape2() {
  const step = document.getElementById('step-2');
  step.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--brun-light);font-size:14px;">Chargement...</div>';

  try {
    const res = await fetch(`${API_URL}/services`);
    const services = await res.json();

    if (!services.length) {
      step.innerHTML = '<div style="padding:1rem;color:var(--brun-light);font-size:14px;">Aucun soin disponible.</div>';
      return;
    }

    step.innerHTML = services.map(s => `
      <button class="service-option" data-id="${s._id}" data-nom="${s.nom}" data-prix="${s.prix}">
        <div>
          <div class="service-option-name">${s.nom}</div>
          <div class="service-option-meta">${s.dureeMinutes || 55} min</div>
        </div>
        <div class="service-option-price">${s.prix} €</div>
      </button>
    `).join('') + `
      <div class="step-actions">
        <button class="btn btn-back" id="step2-back">Retour</button>
        <button class="btn btn-primary" id="step2-next" disabled>Continuer</button>
      </div>`;

    document.querySelectorAll('.service-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        booking.serviceId = opt.dataset.id;
        booking.serviceNom = opt.dataset.nom;
        booking.servicePrix = opt.dataset.prix;
        document.getElementById('step2-next').disabled = false;
      });
    });

    document.getElementById('step2-back').addEventListener('click', async () => {
      await chargerEtape1();
      goToStep(1);
    });
    document.getElementById('step2-next').addEventListener('click', () => {
      goToStep(3);
      chargerCreneaux();
    });
  } catch {
    step.innerHTML = '<div style="padding:1rem;color:red;font-size:14px;">Erreur lors du chargement des soins.</div>';
  }
}

// Étape 3 — Date + créneaux
const dateInput = document.getElementById('booking-date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;
dateInput.value = today;
dateInput.addEventListener('change', chargerCreneaux);

document.getElementById('step3-back').addEventListener('click', async () => {
  await chargerEtape2();
  goToStep(2);
});
document.getElementById('step3-next').addEventListener('click', () => {
  document.getElementById('booking-summary').innerHTML = `
    <div class="booking-summary-row"><span>Praticien</span><span>${booking.massagisteNom}</span></div>
    <div class="booking-summary-row"><span>Soin</span><span>${booking.serviceNom}</span></div>
    <div class="booking-summary-row"><span>Date</span><span>${new Date(booking.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
    <div class="booking-summary-row"><span>Heure</span><span>${booking.heure}</span></div>
    <div class="booking-summary-row" style="border-top:1px solid var(--ivory-mid);margin-top:8px;padding-top:8px;"><span>Total</span><span style="color:var(--mocha);font-family:var(--ff-title);font-size:1.1rem;">${booking.servicePrix} €</span></div>
  `;
  goToStep(4);
});

async function chargerCreneaux() {
  if (!booking.massagisteId) return;

  // Auto-avancer si dimanche (jour 0)
  const d = new Date(dateInput.value + 'T12:00');
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
    dateInput.value = d.toISOString().split('T')[0];
  }

  const date = dateInput.value;
  if (!date) return;

  booking.date = date;
  booking.heure = null;
  document.getElementById('step3-next').disabled = true;

  const loadingEl = document.getElementById('slots-loading');
  loadingEl.textContent = 'Chargement...';
  loadingEl.style.color = 'var(--brun-light)';
  loadingEl.style.display = 'block';
  document.getElementById('slots-container').style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/massagistes/${booking.massagisteId}/slots-disponibles?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const data = await res.json();
      loadingEl.textContent = data.erreur || 'Indisponible ce jour — choisissez une autre date.';
      loadingEl.style.color = 'var(--mocha)';
      return;
    }

    const creneaux = await res.json();
    afficherCreneaux(creneaux);
  } catch {
    loadingEl.textContent = 'Erreur réseau — réessayez.';
    loadingEl.style.color = 'var(--mocha)';
  }
}

function afficherCreneaux(creneaux) {
  const grid = document.getElementById('slots-grid');
  grid.innerHTML = '';
  creneaux.forEach(creneau => {
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (creneau.disponible ? '' : ' indisponible');
    btn.textContent = creneau.heure;
    btn.disabled = !creneau.disponible;
    if (creneau.disponible) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        booking.heure = creneau.heure;
        document.getElementById('step3-next').disabled = false;
      });
    }
    grid.appendChild(btn);
  });
  document.getElementById('slots-loading').style.display = 'none';
  document.getElementById('slots-container').style.display = 'block';
}

// Étape 4 — Confirmer
document.getElementById('step4-back').addEventListener('click', () => goToStep(3));
document.getElementById('btn-confirmer').addEventListener('click', async () => {
  clearError('booking-error');
  const btn = document.getElementById('btn-confirmer');
  btn.textContent = 'Confirmation...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/agendements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        massagisteId: booking.massagisteId,
        serviceId: booking.serviceId,
        date: booking.date,
        heure: booking.heure
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || 'Erreur lors de la réservation');

    closeBooking();
    chargerAgendements();
  } catch (err) {
    showError('booking-error', err.message);
    btn.textContent = 'Confirmer';
    btn.disabled = false;
  }
});

// ─── INIT ───────────────────────────────────────────────────────────────────
chargerAgendements();
