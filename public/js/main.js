let content = {};
const SERVICE_ICONS = ['fa-dumbbell', 'fa-bolt', 'fa-snowflake', 'fa-user-tie', 'fa-leaf', 'fa-fire'];
let lastBookingId = null;

// ==================== CONTENT ====================
async function loadContent() {
  try {
    const res = await fetch('/api/content');
    content = await res.json();
    renderContent();
  } catch (err) {
    console.error('Failed to load content:', err);
  }
}

function renderContent() {
  document.title = content.title || 'Monkey Gym Tresa';
  document.getElementById('heroTitle').textContent = content.title || 'Monkey Gym Tresa';
  document.getElementById('heroSubtitle').textContent = content.subtitle || 'Fitness · EMS · Crioterapia';
  document.getElementById('heroDesc').textContent = content.description ? content.description.substring(0, 120) + '...' : 'Non una classica palestra ma un vero centro di salute';
  document.getElementById('aboutDesc').textContent = content.description || '';
  document.getElementById('aboutHours').textContent = content.openingHours || 'Lun-Sab: 06:00-00:00 | Dom: 08:00-00:00';
  document.getElementById('contactEmail').textContent = content.contactEmail || 'monkeygmtresa@gmail.com';
  document.getElementById('contactPhone').textContent = content.contactPhone || '+41 91 226 40 06';
  document.getElementById('contactLocation').textContent = content.location || 'Tresa, Svizzera';
  document.getElementById('contactHours').textContent = content.openingHours || 'Lun-Sab: 06:00-00:00 | Dom: 08:00-00:00';
  document.getElementById('bookingLocation').textContent = content.location || 'Tresa, Svizzera';
  document.getElementById('bookingPhone').textContent = content.contactPhone || '+41 91 226 40 06';
  document.getElementById('bookingEmail').textContent = content.contactEmail || 'monkeygmtresa@gmail.com';
  document.getElementById('bookingHours').textContent = content.openingHours || 'Lun-Sab: 06:00-00:00 | Dom: 08:00-00:00';

  const aboutImg = document.getElementById('aboutImg');
  if (content.aboutImage) aboutImg.src = content.aboutImage;
  const aboutImgSmall = document.getElementById('aboutImgSmall');
  if (content.aboutImageSmall) aboutImgSmall.src = content.aboutImageSmall;

  renderServices(content.services || []);
  renderGallery(content.gallery || []);
  renderHeroSlider(content);
  populateServiceSelect(content.services || []);
  renderPricing();
  renderCoaches();
  renderTestimonials();
  initCounter();
  initMap();
  initScrollReveal();
}

function renderServices(services) {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = '';
  services.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'service-card scroll-reveal';
    div.innerHTML = `
      <div class="service-card-icon"><i class="fas ${SERVICE_ICONS[i % SERVICE_ICONS.length]}"></i></div>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <div class="service-card-meta">
        <span class="service-price">${s.price}</span>
        <span class="service-duration"><i class="far fa-clock"></i> ${s.duration}</span>
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderGallery(images) {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  if (!images.length) {
    const defaults = [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80'
    ];
    defaults.forEach((url, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item scroll-reveal';
      div.innerHTML = `<img src="${url}" alt="Monkey Gym gallery" loading="lazy">`;
      div.addEventListener('click', () => openLightbox(url));
      grid.appendChild(div);
    });
    return;
  }
  images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item scroll-reveal';
    div.innerHTML = `<img src="${img.url}" alt="Monkey Gym gallery" loading="lazy">`;
    div.addEventListener('click', () => openLightbox(img.url));
    grid.appendChild(div);
  });
}

function renderHeroSlider(data) {
  const slider = document.getElementById('heroSlider');
  const slots = [1, 2, 3];
  const items = slots.map(i => ({
    img: data['heroImage' + i],
    video: data['heroVideo' + i]
  })).filter(s => s.img || s.video);
  const introVideo = slider.querySelector('.hero-intro-video');
  if (items.length) {
    if (introVideo) introVideo.style.display = 'none';
    items.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'slide' + (i === 0 ? ' active' : '');
      if (s.video) {
        div.innerHTML = `<video class="hero-slider-video" src="${s.video}" autoplay muted loop playsinline></video>`;
      } else {
        div.style.backgroundImage = `url('${s.img}')`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
      }
      slider.appendChild(div);
    });
  } else {
    if (introVideo) introVideo.style.display = '';
  }
  let current = 0;
  setInterval(() => {
    const slides = slider.querySelectorAll('.slide');
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
}

function populateServiceSelect(services) {
  const sel = document.getElementById('bkService');
  sel.innerHTML = `<option value="">Scegli un servizio</option>`;
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name + ' — ' + s.price;
    sel.appendChild(opt);
  });
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  lb.querySelector('img').src = src;
  lb.classList.add('active');
}

function resetBooking() {
  document.getElementById('bookingForm').style.display = 'block';
  document.getElementById('bookingSuccess').classList.remove('show');
  document.getElementById('bookingForm').reset();
}

// ==================== PRICING ====================
const PLANS = {
  monthly: [
    { name: 'Base', price: '80', icon: 'fa-dumbbell', features: ['Accesso palestra MATRIX', 'Area cardio & pesi', 'Spogliatoi & docce', 'Orario 06:00-00:00'], featured: false },
    { name: 'Plus', price: '120', icon: 'fa-bolt', features: ['Tutto del piano Base', 'Accesso area EMS', '2 sessioni crioterapia/mese', '2 corsi di gruppo/settimana'], featured: true },
    { name: 'Premium', price: '180', icon: 'fa-crown', features: ['Tutto del piano Plus', 'Personal training 4x/mese', 'Corsi illimitati', 'Convenzione casse malati'], featured: false }
  ],
  yearly: [
    { name: 'Base', price: '816', icon: 'fa-dumbbell', features: ['Accesso palestra MATRIX', 'Area cardio & pesi', 'Spogliatoi & docce', 'Orario 06:00-00:00'], featured: false },
    { name: 'Plus', price: '1,224', icon: 'fa-bolt', features: ['Tutto del piano Base', 'Accesso area EMS', '4 sessioni crioterapia/mese', '4 corsi di gruppo/settimana'], featured: true },
    { name: 'Premium', price: '1,836', icon: 'fa-crown', features: ['Tutto del piano Plus', 'Personal training 8x/mese', 'Corsi illimitati', 'Convenzione casse malati'], featured: false }
  ]
};

let pricingYearly = false;

function renderPricing() {
  const grid = document.getElementById('pricingGrid');
  const plans = pricingYearly ? PLANS.yearly : PLANS.monthly;
  grid.innerHTML = '';
  plans.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'pricing-card scroll-reveal' + (p.featured ? ' featured' : '');
    div.innerHTML = `
      ${p.featured ? `<div class="pricing-badge">Popular</div>` : ''}
      <div class="pricing-card-icon"><i class="fas ${p.icon}"></i></div>
      <h3>${p.name}</h3>
      <div class="pricing-price">CHF ${p.price}</div>
      <div class="pricing-period">${pricingYearly ? '/ anno' : '/ mese'}</div>
      <ul class="pricing-features">
        ${p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
      </ul>
      <button class="btn-${p.featured ? 'primary' : 'neon'} btn-full">Choose</button>
    `;
    grid.appendChild(div);
  });
}

// ==================== COACHES ====================
const COACHES = [
  { name: 'Marco Rossi', title: 'Head Coach — Fitness & EMS', img: 'https://images.unsplash.com/photo-1567013127542-410d9f0e90eb?w=200&q=80', desc: 'Specialista EMS, 10 anni di esperienza' },
  { name: 'Giulia Bianchi', title: 'Yoga & Pilates', img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&q=80', desc: 'Istruttrice Yoga Hatha e Pilates certificata' },
  { name: 'Luca Verdi', title: 'Personal Trainer', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&q=80', desc: 'Laurea in Scienze Motorie, 8 anni di coaching' },
  { name: 'Sofia Neri', title: 'Crioterapia & Recupero', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', desc: 'Esperta in terapie di recupero e benessere' }
];

function renderCoaches() {
  const grid = document.getElementById('coachesGrid');
  grid.innerHTML = '';
  COACHES.forEach(c => {
    const div = document.createElement('div');
    div.className = 'coach-card scroll-reveal';
    div.innerHTML = `
      <img class="coach-img" src="${c.img}" alt="${c.name}" loading="lazy">
      <h3>${c.name}</h3>
      <div class="coach-title">${c.title}</div>
      <p>${c.desc}</p>
      <div class="coach-social">
        <a href="https://www.instagram.com/monkeygymtresa" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://facebook.com/monkeygymtresa" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
      </div>
    `;
    grid.appendChild(div);
  });
}

// ==================== TESTIMONIALS ====================
const TESTIMONIALS = [
  { text: 'Struttura incredibile, trainer appassionati. Ho trasformato il mio corpo in soli 3 mesi.', name: 'Marco F.', title: 'Membro da 6 mesi', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { text: 'L\'EMS è rivoluzionario, la crioterapia mi ha cambiato il recupero. Il miglior centro in Ticino!', name: 'Chiara M.', title: 'Membro da 1 anno', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { text: 'I corsi di yoga con Giulia sono fantastici. L\'atmosfera è unica e motivante!', name: 'Andrea R.', title: 'Membro da 3 mesi', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { text: 'Raccomando Monkey Gym a tutti i miei amici. Il personal training mi ha aiutato a raggiungere i miei obiettivi.', name: 'Elena S.', title: 'Membro da 8 mesi', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' }
];

let testimonialIndex = 0;

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const nav = document.getElementById('testimonialNav');
  track.innerHTML = '';
  nav.innerHTML = '';
  TESTIMONIALS.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'testimonial-card';
    div.innerHTML = `
      <div class="testimonial-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
      <blockquote>"${t.text}"</blockquote>
      <div class="testimonial-author">
        <img src="${t.img}" alt="${t.name}">
        <div><strong>${t.name}</strong><br><span>${t.title}</span></div>
      </div>
    `;
    track.appendChild(div);
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToTestimonial(i));
    nav.appendChild(dot);
  });
}

function goToTestimonial(i) {
  testimonialIndex = i;
  const track = document.getElementById('testimonialsTrack');
  track.style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll('.testimonial-dot').forEach((d, j) => d.classList.toggle('active', j === i));
}

setInterval(() => {
  goToTestimonial((testimonialIndex + 1) % TESTIMONIALS.length);
}, 5000);

// ==================== COUNTER ====================
function initCounter() {
  const counters = document.querySelectorAll('.counter-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const increment = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target + '+';
      clearInterval(timer);
    } else {
      el.textContent = current;
    }
  }, 30);
}

// ==================== MAP ====================
function initMap() {
  if (typeof L === 'undefined') return;
  const map = L.map('map').setView([45.9985, 8.8801], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  L.marker([45.9985, 8.8801]).addTo(map)
    .bindPopup('<strong>Monkey Gym Tresa</strong><br>Zona artigianale, Madonna del Piano 10, 6995 Tresa')
    .openPopup();
}

// ==================== QR CODE ====================
function showQR() {
  const modal = document.getElementById('qrModal');
  const container = document.getElementById('qrCodeModal');
  container.innerHTML = '';
  const data = lastBookingId || 'VERTEX-' + Date.now().toString(36).toUpperCase();
  new QRCode(container, { text: data, width: 200, height: 200 });
  modal.classList.add('active');
}

// ==================== MEMBER ====================
async function checkMember() {
  try {
    const res = await fetch('/api/member/check');
    const data = await res.json();
    if (data.authenticated) {
      document.getElementById('memberLoginBtn').innerHTML = '<i class="fas fa-user-check"></i>';
      document.getElementById('memberLoginBtn').title = data.name;
      document.getElementById('memberName').textContent = data.name;
      document.getElementById('dashboardName').textContent = data.name + ' — Dashboard';
      loadMemberBookings();
    }
  } catch {}
}

function closeMemberModal() {
  document.getElementById('memberModal').classList.remove('active');
}

function showRegister() {
  document.getElementById('memberLoginForm').style.display = 'none';
  document.getElementById('memberRegisterForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('memberLoginForm').style.display = 'block';
  document.getElementById('memberRegisterForm').style.display = 'none';
}

async function loadMemberBookings() {
  try {
    const res = await fetch('/api/member/bookings');
    const bookings = await res.json();
    renderMemberBookings(bookings);
  } catch {}
}

function renderMemberBookings(bookings) {
  const container = document.getElementById('memberBookings');
  if (!bookings.length) {
    container.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:20px;">No bookings yet.</p>';
    return;
  }
  let html = '<div class="member-bookings-list">';
  bookings.forEach(b => {
    const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' };
    const d = new Date(b.createdAt).toLocaleDateString();
    html += `
      <div class="member-booking-item">
        <div class="mb-header"><strong>${b.service}</strong> <span class="status-badge status-${b.status}">${statusLabels[b.status] || b.status}</span></div>
        <div class="mb-details">${b.date} at ${b.time} — ${b.name}</div>
        <div class="mb-ref">ID: ${b.id}</div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ==================== CHAT WIDGET ====================
const CHAT_BOT_RESPONSES = {
  'abbonamento': 'Offriamo tre piani: Base (CHF 80/mese), Plus (CHF 120/mese) e Premium (CHF 180/mese). Annuale con 20% di sconto!',
  'prezzo': 'Base: CHF 80/mese | Plus: CHF 120/mese | Premium: CHF 180/mese. Annuale: CHF 816 | CHF 1,224 | CHF 1,836.',
  'corso': 'Offriamo Functional Training, Yoga, Pilates, HIIT, Spinning, EMS, GAG e molto altro. Vedi il nostro orario!',
  'ems': 'Il nostro sistema EMS è l\'unico in zona. Senza fili, tute leggerissime, massima potenza. Provalo subito!',
  'crioterapia': 'La crioterapia aiuta il recupero muscolare, riduce le infiammazioni e migliora la circolazione.',
  'orario': 'Siamo aperti Lun-Sab 06:00-00:00 e Dom 08:00-00:00.',
  'dove': 'Ci troviamo a Madonna del Piano 10, 6995 Tresa, Svizzera. Visita la pagina Contatti per la mappa.',
  'parcheggio': 'Parcheggio gratuito disponibile per tutti i membri.',
  'gratis': 'Sì! Offriamo 7 giorni di prova gratuita con accesso completo a tutte le strutture.',
  'salute': 'Siamo convenzionati con tutte le casse malati svizzere. Recupera fino a CHF 1,000!',
  'default': 'Grazie della domanda! Contatta il nostro team al +41 91 226 40 06 o via email a monkeygmtresa@gmail.com.'
};

function getBotResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [keyword, response] of Object.entries(CHAT_BOT_RESPONSES)) {
    if (keyword !== 'default' && lower.includes(keyword)) return response;
  }
  return CHAT_BOT_RESPONSES.default;
}

function addChatMessage(text, isUser) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
  div.innerHTML = `<div class="chat-msg-content">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.scroll-reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

// ==================== EASTER EGGS ====================
console.log('%c🐒 Monkey Gym Tresa — Il tuo centro di salute', 'font-size:20px;color:#00ff41;font-weight:bold;');
console.log('%cBenvenuto nella Matrix — Fitness · EMS · Crioterapia', 'font-size:14px;color:#0A8C8C;');

let konami = '';
document.addEventListener('keydown', e => {
  konami += e.key;
  konami = konami.slice(-10);
  if (konami === 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba') {
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => document.body.style.filter = '', 3000);
    konami = '';
  }
});

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  checkMember();
  initScrollReveal();

  // Mobile menu
  document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.querySelector('.nav-links').classList.remove('open'));
  });

  // Lightbox
  document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('lightbox-close')) {
      this.classList.remove('active');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('lightbox').classList.remove('active');
  });

  // Contact form
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send'; btn.disabled = false; }, 2000);
      this.reset();
    }, 1000);
  });

  // Booking form
  document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    const payload = {
      name: document.getElementById('bkName').value,
      email: document.getElementById('bkEmail').value,
      phone: document.getElementById('bkPhone').value,
      service: document.getElementById('bkService').value,
      date: document.getElementById('bkDate').value,
      time: document.getElementById('bkTime').value,
      message: document.getElementById('bkMessage').value
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        lastBookingId = data.booking.id;
        const msg = encodeURIComponent(
          `Nuova prenotazione Monkey Gym:\n\n` +
          `Nome: ${payload.name}\n` +
          `Email: ${payload.email}\n` +
          `Telefono: ${payload.phone}\n` +
          `Servizio: ${payload.service}\n` +
          `Data: ${payload.date}\n` +
          `Ora: ${payload.time}\n` +
          `Messaggio: ${payload.message || '—'}`
        );
        window.open(`https://wa.me/41912264006?text=${msg}`, '_blank');
        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, { text: lastBookingId, width: 120, height: 120 });
        this.style.display = 'none';
        document.getElementById('bookingSuccess').classList.add('show');
      } else {
        alert('Error during booking. Please try again.');
      }
    } catch {
      alert('Connection error. Please try again.');
    }
    btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Booking';
    btn.disabled = false;
  });

  const dateInput = document.getElementById('bkDate');
  const today = new Date();
  dateInput.min = today.toISOString().split('T')[0];
  dateInput.value = today.toISOString().split('T')[0];

  // Newsletter
  document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    const input = this.querySelector('input');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value })
      });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = '<i class="fas fa-check"></i> Iscritto!';
        input.value = '';
        setTimeout(() => { btn.innerHTML = 'Iscriviti'; btn.disabled = false; }, 2000);
      }
    } catch {
      btn.innerHTML = 'Error';
      setTimeout(() => { btn.innerHTML = 'Subscribe'; btn.disabled = false; }, 2000);
    }
  });

  // Pricing toggle
  document.getElementById('pricingSwitch').addEventListener('click', () => {
    pricingYearly = !pricingYearly;
    document.getElementById('pricingSwitch').classList.toggle('active');
    document.getElementById('monthlyLabel').classList.toggle('active', !pricingYearly);
    document.getElementById('yearlyLabel').classList.toggle('active', pricingYearly);
    renderPricing();
  });
  document.getElementById('monthlyLabel').addEventListener('click', () => {
    if (pricingYearly) document.getElementById('pricingSwitch').click();
  });
  document.getElementById('yearlyLabel').addEventListener('click', () => {
    if (!pricingYearly) document.getElementById('pricingSwitch').click();
  });

  // Chat widget
  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => {
      chatPanel.classList.toggle('open');
      if (chatPanel.classList.contains('open') && chatInput) chatInput.focus();
    });
  }
  if (chatClose && chatPanel) {
    chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));
  }
  function sendChat() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, true);
    chatInput.value = '';
    setTimeout(() => addChatMessage(getBotResponse(text), false), 400);
  }
  if (chatSend) chatSend.addEventListener('click', sendChat);
  if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });

  // Member modal
  document.getElementById('memberLoginBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('memberModal').classList.add('active');
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('loginError');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        checkMember();
        closeMemberModal();
      } else {
        err.textContent = 'Invalid email or password';
      }
    } catch { err.textContent = 'Connection error'; }
  });

  // Register form
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('regError');
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    try {
      const res = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        checkMember();
        closeMemberModal();
      } else {
        err.textContent = data.error || 'Registration failed';
      }
    } catch { err.textContent = 'Connection error'; }
  });

  // Member logout
  document.getElementById('memberLogoutBtn').addEventListener('click', async () => {
    await fetch('/api/member/logout', { method: 'POST' });
    document.getElementById('memberLoginBtn').innerHTML = '<i class="fas fa-user"></i>';
    closeMemberModal();
  });
});
