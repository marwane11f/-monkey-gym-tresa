let content = {};

async function checkAuth() {
  try {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    if (!data.authenticated) window.location.href = '/admin/login.html';
  } catch {
    window.location.href = '/admin/login.html';
  }
}

async function loadData() {
  try {
    const res = await fetch('/api/content');
    content = await res.json();
    populateForm(content);
    renderServicesAdmin(content.services || []);
    renderHeroPreview(content);
    renderAboutPreview(content);
    renderGalleryManager(content.gallery || []);
  } catch (err) {
    showNotification('Error loading data', 'error');
  }
}

function populateForm(data) {
  document.getElementById('editTitle').value = data.title || '';
  document.getElementById('editSubtitle').value = data.subtitle || '';
  document.getElementById('editDescription').value = data.description || '';
  document.getElementById('editLocation').value = data.location || '';
  document.getElementById('editOpeningHours').value = data.openingHours || '';
  document.getElementById('editContactEmail').value = data.contactEmail || '';
  document.getElementById('editContactPhone').value = data.contactPhone || '';
}

function renderServicesAdmin(services) {
  const container = document.getElementById('servicesAdmin');
  container.innerHTML = '';
  if (!services.length) {
    services = [
      { name: 'Premium Gym', description: 'Latest equipment, personal coaching', price: '£40/mo', duration: 'Unlimited' },
      { name: 'Spa & Wellness', description: 'Massages, facials and sauna', price: '£60', duration: '1h' }
    ];
  }
  services.forEach((svc, i) => {
    const div = document.createElement('div');
    div.className = 'service-entry';
    div.dataset.index = i;
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Service Name</label>
          <input type="text" class="svc-name" value="${escapeHtml(svc.name)}">
        </div>
        <div class="form-group">
          <label>Price</label>
          <input type="text" class="svc-price" value="${escapeHtml(svc.price)}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Description</label>
          <input type="text" class="svc-desc" value="${escapeHtml(svc.description)}">
        </div>
        <div class="form-group">
          <label>Duration</label>
          <input type="text" class="svc-duration" value="${escapeHtml(svc.duration)}">
        </div>
      </div>
      <button type="button" class="btn-secondary svc-remove" style="font-size:0.8rem;padding:8px 16px;border-color:#e74c3c;color:#e74c3c;margin-top:4px;"><i class="fas fa-trash"></i> Remove</button>
      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:20px 0;">
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.svc-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.service-entry').remove();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderHeroPreview(data) {
  const slots = ['hero1', 'hero2', 'hero3'];
  const imgs = [data.heroImage1, data.heroImage2, data.heroImage3];
  const vids = [data.heroVideo1, data.heroVideo2, data.heroVideo3];
  slots.forEach((slot, i) => {
    const slotEl = document.querySelector(`.hero-slot[data-slot="${slot}"]`);
    const imgBox = slotEl.querySelector('.preview-box:not(.video-preview)');
    const img = imgBox.querySelector('img');
    const imgSpan = imgBox.querySelector('span');
    if (imgs[i]) {
      img.src = imgs[i];
      img.style.display = 'block';
      imgSpan.style.display = 'none';
    } else {
      img.style.display = 'none';
      imgSpan.style.display = 'inline';
    }
    const vidBox = slotEl.querySelector('.video-preview');
    const vid = vidBox.querySelector('video');
    const vidSpan = vidBox.querySelector('span');
    if (vids[i]) {
      vid.src = vids[i];
      vid.style.display = 'block';
      vidSpan.style.display = 'none';
    } else {
      vid.style.display = 'none';
      vidSpan.style.display = 'inline';
    }
  });
}

function renderAboutPreview(data) {
  const fields = ['aboutImage', 'aboutImageSmall'];
  fields.forEach(field => {
    const box = document.querySelector(`.about-upload[data-field="${field}"]`).closest('.about-slot').querySelector('.preview-box');
    const img = box.querySelector('img');
    const span = box.querySelector('span');
    if (data[field]) {
      img.src = data[field];
      img.style.display = 'block';
      span.style.display = 'none';
    } else {
      img.style.display = 'none';
      span.style.display = 'inline';
    }
  });
}

function renderGalleryManager(images) {
  const container = document.getElementById('galleryManager');
  container.innerHTML = '';
  if (!images.length) {
    container.innerHTML = '<p style="grid-column:1/-1;color:var(--text-light);text-align:center;padding:40px 0;">No photos in gallery</p>';
    return;
  }
  images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-manager-item';
    div.innerHTML = `
      <img src="${img.url}" alt="">
      <button class="delete-btn" data-filename="${img.filename}"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteGalleryImage(btn.dataset.filename));
  });
}

function renderBookings(bookings) {
  const container = document.getElementById('bookingsList');
  container.innerHTML = '';
  if (!bookings.length) {
    container.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:40px 0;">No bookings yet.</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'bookings-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Client</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Service</th>
        <th>Schedule</th>
        <th>Message</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  bookings.forEach(b => {
    const tr = document.createElement('tr');
    const date = new Date(b.createdAt).toLocaleDateString('en-GB');
    tr.innerHTML = `
      <td>${date}</td>
      <td><strong>${escapeHtml(b.name)}</strong></td>
      <td><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></td>
      <td>${b.phone ? escapeHtml(b.phone) : '-'}</td>
      <td>${escapeHtml(b.service)}</td>
      <td>${b.date}<br><small>${b.time}</small></td>
      <td>${b.message ? escapeHtml(b.message.substring(0, 50)) + (b.message.length > 50 ? '...' : '') : '-'}</td>
      <td><span class="status-badge status-${b.status}">${b.status === 'pending' ? 'Pending' : b.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</span></td>
      <td class="actions-cell">
        ${b.status === 'pending' ? `<button class="btn-sm btn-confirm" data-id="${b.id}"><i class="fas fa-check"></i></button>` : ''}
        <button class="btn-sm btn-delete" data-id="${b.id}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  container.appendChild(table);

  container.querySelectorAll('.btn-confirm').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch('/api/admin/bookings/' + btn.dataset.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' })
      });
      loadBookings();
      showNotification('Booking confirmed', 'success');
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this booking?')) return;
      await fetch('/api/admin/bookings/' + btn.dataset.id, { method: 'DELETE' });
      loadBookings();
      showNotification('Booking deleted', 'success');
    });
  });
}

async function loadBookings() {
  try {
    const res = await fetch('/api/admin/bookings');
    const data = await res.json();
    renderBookings(data);
  } catch {
    showNotification('Error loading bookings', 'error');
  }
}

async function deleteGalleryImage(filename) {
  if (!confirm('Delete this image?')) return;
  try {
    const res = await fetch('/api/admin/gallery/' + filename, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      renderGalleryManager(data.gallery);
      showNotification('Image deleted', 'success');
    }
  } catch {
    showNotification('Error deleting image', 'error');
  }
}

function showNotification(msg, type) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'notification ' + type;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Tab switching
document.querySelectorAll('.admin-sidebar a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.admin-sidebar a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + link.dataset.tab).classList.add('active');
    if (link.dataset.tab === 'bookings') loadBookings();
  if (link.dataset.tab === 'members') loadMembers();
  if (link.dataset.tab === 'newsletter') loadNewsletter();
  if (link.dataset.tab === 'stats') loadStats();
  });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin/login.html';
});

// Info form
document.getElementById('infoForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const payload = {
    title: form.title.value,
    subtitle: form.subtitle.value,
    description: form.description.value,
    location: form.location.value,
    openingHours: form.openingHours.value,
    contactEmail: form.contactEmail.value,
    contactPhone: form.contactPhone.value
  };
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  try {
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) showNotification('Info updated', 'success');
  } catch {
    showNotification('Error saving', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save';
});

// Add service
document.getElementById('addServiceBtn').addEventListener('click', () => {
  const container = document.getElementById('servicesAdmin');
  const div = document.createElement('div');
  div.className = 'service-entry';
  div.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Service Name</label>
        <input type="text" class="svc-name" placeholder="Service Name">
      </div>
      <div class="form-group">
        <label>Price</label>
        <input type="text" class="svc-price" placeholder="£60">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="svc-desc" placeholder="Description">
      </div>
      <div class="form-group">
        <label>Duration</label>
        <input type="text" class="svc-duration" placeholder="1h30">
      </div>
    </div>
    <button type="button" class="btn-secondary svc-remove" style="font-size:0.8rem;padding:8px 16px;border-color:#e74c3c;color:#e74c3c;margin-top:4px;"><i class="fas fa-trash"></i> Remove</button>
    <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:20px 0;">
  `;
  container.appendChild(div);
  div.querySelector('.svc-remove').addEventListener('click', function() {
    this.closest('.service-entry').remove();
  });
});

// Save services
document.getElementById('saveServicesBtn').addEventListener('click', async () => {
  const entries = document.querySelectorAll('#servicesAdmin .service-entry');
  const services = [];
  entries.forEach(entry => {
    const name = entry.querySelector('.svc-name').value.trim();
    const price = entry.querySelector('.svc-price').value.trim();
    const desc = entry.querySelector('.svc-desc').value.trim();
    const duration = entry.querySelector('.svc-duration').value.trim();
    if (name) {
      services.push({ name, price, description: desc, duration });
    }
  });
  if (!services.length) return showNotification('Add at least one service', 'error');
  try {
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    });
    const data = await res.json();
    if (data.success) showNotification('Services updated', 'success');
  } catch {
    showNotification('Error saving', 'error');
  }
});

// About images upload
document.getElementById('uploadAboutBtn').addEventListener('click', async () => {
  const formData = new FormData();
  let hasFile = false;
  document.querySelectorAll('.about-upload').forEach(input => {
    if (input.files[0]) {
      formData.append(input.dataset.field, input.files[0]);
      hasFile = true;
    }
  });
  if (!hasFile) return showNotification('Select at least one image', 'error');
  const btn = document.getElementById('uploadAboutBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload...';
  try {
    const res = await fetch('/api/admin/about-images', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      renderAboutPreview(data.data);
      showNotification('Images updated', 'success');
      document.querySelectorAll('.about-upload').forEach(i => i.value = '');
    }
  } catch {
    showNotification('Upload error', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Update Images';
});

// Hero upload
document.getElementById('uploadHeroBtn').addEventListener('click', async () => {
  const formData = new FormData();
  let hasFile = false;
  document.querySelectorAll('.hero-upload').forEach(input => {
    if (input.files[0]) {
      formData.append(input.dataset.field, input.files[0]);
      hasFile = true;
    }
  });
  if (!hasFile) return showNotification('Select at least one image', 'error');
  const btn = document.getElementById('uploadHeroBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload...';
  try {
    const res = await fetch('/api/admin/hero', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      renderHeroPreview(data.data);
      showNotification('Hero images updated', 'success');
      document.querySelectorAll('.hero-upload').forEach(i => i.value = '');
    }
  } catch {
    showNotification('Upload error', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Update Images';
});

// Hero delete
document.querySelectorAll('.hero-delete').forEach(btn => {
  btn.addEventListener('click', async function() {
    const slot = this.dataset.slot;
    if (!confirm('Delete hero image ' + slot + '?')) return;
    try {
      const res = await fetch('/api/admin/hero/' + slot, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        renderHeroPreview(data.data);
        showNotification('Hero image ' + slot + ' deleted', 'success');
      }
    } catch {
      showNotification('Delete error', 'error');
    }
  });
});

// Gallery upload
document.getElementById('uploadGalleryBtn').addEventListener('click', async () => {
  const input = document.getElementById('galleryInput');
  if (!input.files.length) return showNotification('Select images', 'error');
  const formData = new FormData();
  for (const file of input.files) formData.append('images', file);
  const btn = document.getElementById('uploadGalleryBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload...';
  try {
    const res = await fetch('/api/admin/upload-gallery', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      renderGalleryManager(data.gallery);
      showNotification(data.images.length + ' photo(s) added', 'success');
      input.value = '';
    }
  } catch {
    showNotification('Upload error', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload"></i> Update Images';
});

// Members
async function loadMembers() {
  try {
    const res = await fetch('/api/admin/members');
    const members = await res.json();
    const container = document.getElementById('membersList');
    if (!members.length) {
      container.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:40px 0;">No registered members.</p>';
      return;
    }
    let html = `<table><thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Actions</th></tr></thead><tbody>`;
    members.forEach(m => {
      const d = new Date(m.createdAt).toLocaleDateString('en-GB');
      html += `<tr><td><strong>${escapeHtml(m.name)}</strong></td><td>${escapeHtml(m.email)}</td><td>${d}</td><td><button class="btn-sm btn-delete" data-id="${m.id}"><i class="fas fa-trash"></i></button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this member?')) return;
        await fetch('/api/admin/members/' + btn.dataset.id, { method: 'DELETE' });
        loadMembers();
        showNotification('Member deleted', 'success');
      });
    });
  } catch { showNotification('Error loading members', 'error'); }
}

// Newsletter
async function loadNewsletter() {
  try {
    const res = await fetch('/api/admin/newsletter');
    const list = await res.json();
    const container = document.getElementById('newsletterList');
    if (!list.length) {
      container.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:40px 0;">No subscribers.</p>';
      return;
    }
    let html = `<table><thead><tr><th>Email</th><th>Date</th></tr></thead><tbody>`;
    list.forEach(e => {
      const d = new Date(e.createdAt).toLocaleDateString('en-GB');
      html += `<tr><td>${escapeHtml(e.email)}</td><td>${d}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch { showNotification('Error loading newsletter', 'error'); }
}

// Stats
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const stats = await res.json();
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><i class="fas fa-users"></i><div class="stat-number">${stats.members}</div><div class="stat-label">Members</div></div>
      <div class="stat-card"><i class="fas fa-calendar-check"></i><div class="stat-number">${stats.bookings}</div><div class="stat-label">Bookings</div></div>
      <div class="stat-card"><i class="fas fa-clock"></i><div class="stat-number">${stats.pendingBookings}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card"><i class="fas fa-envelope"></i><div class="stat-number">${stats.newsletter}</div><div class="stat-label">Newsletter</div></div>
    `;
  } catch { showNotification('Error loading stats', 'error'); }
}

checkAuth();
loadData();
