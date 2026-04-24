const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://serenispa2.onrender.com/api';

// Rediriger si déjà connecté
const token = localStorage.getItem('token');
if (token) {
  const role = localStorage.getItem('role');
  window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
}

// État de la réservation
const booking = { massagisteId: null, massagisteNom: null, serviceId: null, serviceNom: null, servicePrix: null, date: null, heure: null };
let currentStep = 1;

// Helpers
function showError(id, msg) { 
  const el = document.getElementById(id); 
  el.textContent = msg; 
  el.classList.add('visible'); 
}

function clearError(id) { 
  const el = document.getElementById(id); 
  if (el) el.classList.remove('visible'); 
}

// Menu burger
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => { 
    burger.classList.remove('open'); 
    mobileMenu.classList.remove('open'); 
  });
});

// Modal authentification
const modalAuth = document.getElementById('modal-auth');

function openAuth() { 
  modalAuth.classList.add('active'); 
}

function closeAuth() { 
  modalAuth.classList.remove('active'); 
}

document.getElementById('btn-reserver').addEventListener('click', openAuth);
document.getElementById('btn-reserver-mobile').addEventListener('click', openAuth);
document.getElementById('btn-hero-reserver').addEventListener('click', openAuth);
document.getElementById('btn-strip-reserver').addEventListener('click', openAuth);
document.getElementById('modal-auth-close').addEventListener('click', closeAuth);

modalAuth.addEventListener('click', e => { 
  if (e.target === modalAuth) closeAuth(); 
});

// Onglets authentification
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// CONNEXION
document.getElementById('btn-login').addEventListener('click', async () => {
  clearError('login-error');
  const email = document.getElementById('login-email').value.trim();
  const motDePasse = document.getElementById('login-password').value;
  
  if (!email || !motDePasse) { 
    showError('login-error', 'Veuillez remplir tous les champs.'); 
    return; 
  }
  
  try {
    const res = await fetch(`${API_URL}/auth/connexion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, motDePasse })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || 'Identifiants incorrects');
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role || 'client');
    localStorage.setItem('userName', data.nom || email);
    
    closeAuth();
    
    if (data.role === 'admin') { 
      window.location.href = 'admin.html'; 
      return; 
    }
    
    openBooking();
  } catch (err) { 
    showError('login-error', err.message); 
  }
});

// INSCRIPTION
document.getElementById('btn-register').addEventListener('click', async () => {
  clearError('register-error');
  const nom = document.getElementById('register-nom').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const telephone = document.getElementById('register-telephone').value.trim();
  const motDePasse = document.getElementById('register-password').value;
  
  if (!nom || !email || !telephone || !motDePasse) { 
    showError('register-error', 'Veuillez remplir tous les champs.'); 
    return; 
  }
  
  if (motDePasse.length < 6) { 
    showError('register-error', 'Mot de passe trop court (min. 6 caractères).'); 
    return; 
  }
  
  try {
    const res = await fetch(`${API_URL}/auth/inscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, telephone, motDePasse })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || 'Erreur lors de la création du compte');
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', 'client');
    localStorage.setItem('userName', nom);
    
    closeAuth();
    openBooking();
  } catch (err) { 
    showError('register-error', err.message); 
  }
});

// Modal réservation
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

document.getElementById('modal-booking-close').addEventListener('click', closeBooking);

modalBooking.addEventListener('click', e => {
  if (e.target === modalBooking) closeBooking();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAuth();
    closeBooking();
  }
});

// Navigation des étapes
function goToStep(n) {
  currentStep = n;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');

  document.querySelectorAll('.step-dot').forEach(d => {
    const dn = parseInt(d.dataset.step);
    d.classList.toggle('active', dn === n);
    d.classList.toggle('done', dn < n);
  });

  const titles = {
    1: 'Choisir un praticien',
    2: 'Choisir un soin',
    3: 'Date & créneau',
    4: 'Confirmer'
  };
  document.getElementById('booking-title').textContent = titles[n];
}

// ÉTAPE 1 — MASSAGISTES (chargés depuis l'API)
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

// ÉTAPE 2 — SERVICES (chargés depuis l'API)
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

// ÉTAPE 3 — DATE + CRÉNEAUX
const dateInput = document.getElementById('booking-date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;
dateInput.value = today;

dateInput.addEventListener('change', chargerCreneaux);

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
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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

// ÉTAPE 4 — CONFIRMER
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError('booking-error', err.message);
    btn.textContent = 'Confirmer';
    btn.disabled = false;
  }
});

// FAQ Accordéon
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = '0';
    });
    
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// Animations au scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.anim-up').forEach(el => observer.observe(el));

// ─── RGPD BANNER ────────────────────────────────────────────────────────────
(function () {
  const banner = document.getElementById('rgpd-banner');
  if (!banner) return;

  if (localStorage.getItem('rgpd') === 'accepted' || localStorage.getItem('rgpd') === 'refused') {
    banner.classList.add('hidden');
  }

  document.getElementById('rgpd-accept')?.addEventListener('click', () => {
    localStorage.setItem('rgpd', 'accepted');
    banner.classList.add('hidden');
  });

  document.getElementById('rgpd-refuse')?.addEventListener('click', () => {
    localStorage.setItem('rgpd', 'refused');
    banner.classList.add('hidden');
  });

  document.getElementById('rgpd-reopen')?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('rgpd');
    banner.classList.remove('hidden');
  });
})();