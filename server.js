const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'content.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const MEMBERS_FILE = path.join(__dirname, 'data', 'members.json');
const NEWSLETTER_FILE = path.join(__dirname, 'data', 'newsletter.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'vertex2024';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.mov'].includes(ext)) cb(null, true);
    else cb(new Error('Only images/videos allowed'));
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(session({
  secret: 'vertex-gym-spa-pool-2024',
  resave: false,
  saveUninitialized: false
}));

function ensureData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      title: 'Monkey Gym Tresa',
      subtitle: 'Il tuo centro di salute e fitness',
      description: 'Non una classica palestra ma un vero centro di salute. Palestra con macchinari MATRIX, EMS, crioterapia, personal trainer esperti.',
      location: 'Zona artigianale, Madonna del Piano 10, 6995 Tresa, Svizzera',
      contactEmail: 'monkeygmtresa@gmail.com',
      contactPhone: '+41 91 226 40 06',
      openingHours: 'Lun-Sab: 06:00-00:00 | Dom: 08:00-00:00',
      services: [
        { name: 'Palestra MATRIX', description: 'Macchinari MATRIX di ultima generazione per un allenamento efficiente', price: 'CHF 80/mese', duration: 'Accesso illimitato' },
        { name: 'EMS', description: 'Innovativo sistema di elettrostimolazione, l\'unico in zona. Tute leggerissime, senza fili', price: 'CHF 60/sessione', duration: '30 min' },
        { name: 'Crioterapia', description: 'Trattamento innovativo per recupero muscolare e benessere totale', price: 'CHF 40/sessione', duration: '15 min' },
        { name: 'Personal Training', description: 'Trainer esperti per programmi personalizzati', price: 'CHF 50/sessione', duration: '1h' },
        { name: 'Yoga & Pilates', description: 'Lezioni di yoga, pilates, tonificazione e GAG', price: 'CHF 25/lezione', duration: '1h' },
        { name: 'Area Funzionale', description: 'Sala corsi e area funzionale completa per allenamenti di gruppo', price: 'CHF 35/sessione', duration: 'Accesso libero' }
      ],
      aboutImage: '',
      aboutImageSmall: '',
      heroImages: [],
      gallery: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(MEMBERS_FILE)) {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(NEWSLETTER_FILE)) {
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify([], null, 2));
  }
}
ensureData();

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getBookings() {
  return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf-8'));
}

function saveBookings(data) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2));
}

function getMembers() {
  return JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf-8'));
}
function saveMembers(data) {
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(data, null, 2));
}
function getNewsletters() {
  return JSON.parse(fs.readFileSync(NEWSLETTER_FILE, 'utf-8'));
}
function saveNewsletters(data) {
  fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2));
}

function isAuthenticated(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function isMember(req, res, next) {
  if (req.session.memberId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Public API
app.get('/api/content', (req, res) => {
  res.json(getData());
});

// Public booking
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, service, date, time, message } = req.body;
  if (!name || !email || !service || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const bookings = getBookings();
  const booking = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name, email, phone: phone || '', service, date, time,
    message: message || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  bookings.push(booking);
  saveBookings(bookings);
  res.json({ success: true, booking });
});

// Newsletter
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const list = getNewsletters();
  if (list.find(e => e.email === email)) {
    return res.json({ success: true, message: 'Already subscribed' });
  }
  list.push({ email, createdAt: new Date().toISOString() });
  saveNewsletters(list);
  res.json({ success: true });
});

// Member registration
app.post('/api/member/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const members = getMembers();
  if (members.find(m => m.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const member = { id: crypto.randomUUID(), name, email, password: hash, createdAt: new Date().toISOString() };
  members.push(member);
  saveMembers(members);
  req.session.memberId = member.id;
  req.session.memberName = member.name;
  res.json({ success: true, member: { id: member.id, name: member.name, email: member.email } });
});

// Member login
app.post('/api/member/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const members = getMembers();
  const member = members.find(m => m.email === email);
  if (!member || !(await bcrypt.compare(password, member.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.memberId = member.id;
  req.session.memberName = member.name;
  res.json({ success: true, member: { id: member.id, name: member.name, email: member.email } });
});

// Member check
app.get('/api/member/check', (req, res) => {
  res.json({ authenticated: !!req.session.memberId, name: req.session.memberName || '' });
});

// Member logout
app.post('/api/member/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Member booking history
app.get('/api/member/bookings', isMember, (req, res) => {
  const bookings = getBookings();
  const members = getMembers();
  const member = members.find(m => m.id === req.session.memberId);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  const myBookings = bookings.filter(b => b.email === member.email);
  res.json(myBookings);
});

// Stripe payment intent (mock)
app.post('/api/create-payment', (req, res) => {
  const { amount, description } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  res.json({
    success: true,
    paymentId: 'pi_' + Date.now().toString(36),
    amount,
    description: description || 'Monkey Gym Tresa payment',
    status: 'succeeded',
    message: 'Payment successful (demo mode)'
  });
});

// Admin Auth
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// Admin: update content
app.put('/api/admin/content', isAuthenticated, (req, res) => {
  const data = getData();
  const updatable = ['title', 'subtitle', 'description', 'location', 'contactEmail', 'contactPhone', 'openingHours', 'services', 'heroImages', 'aboutImage', 'aboutImageSmall'];
  for (const key of updatable) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  saveData(data);
  res.json({ success: true, data });
});

// Admin: upload image
app.post('/api/admin/upload', isAuthenticated, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ success: true, filename: req.file.filename, url: '/uploads/' + req.file.filename });
});

// Admin: upload multiple images to gallery
app.post('/api/admin/upload-gallery', isAuthenticated, upload.array('images', 20), (req, res) => {
  const files = req.files.map(f => ({ filename: f.filename, url: '/uploads/' + f.filename }));
  const data = getData();
  data.gallery.push(...files);
  saveData(data);
  res.json({ success: true, images: files, gallery: data.gallery });
});

// Admin: delete image from gallery
app.delete('/api/admin/gallery/:filename', isAuthenticated, (req, res) => {
  const data = getData();
  data.gallery = data.gallery.filter(img => img.filename !== req.params.filename);
  saveData(data);
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true, gallery: data.gallery });
});

// Admin: upload about images
app.post('/api/admin/about-images', isAuthenticated, upload.fields([
  { name: 'aboutImage', maxCount: 1 },
  { name: 'aboutImageSmall', maxCount: 1 }
]), (req, res) => {
  const data = getData();
  if (req.files?.aboutImage) data.aboutImage = '/uploads/' + req.files.aboutImage[0].filename;
  if (req.files?.aboutImageSmall) data.aboutImageSmall = '/uploads/' + req.files.aboutImageSmall[0].filename;
  saveData(data);
  res.json({ success: true, data });
});

// Admin: set hero images/videos
app.post('/api/admin/hero', isAuthenticated, upload.fields([
  { name: 'hero1', maxCount: 1 },
  { name: 'hero2', maxCount: 1 },
  { name: 'hero3', maxCount: 1 },
  { name: 'herovideo1', maxCount: 1 },
  { name: 'herovideo2', maxCount: 1 },
  { name: 'herovideo3', maxCount: 1 }
]), (req, res) => {
  const data = getData();
  const updates = {};
  if (req.files?.hero1) updates.heroImage1 = '/uploads/' + req.files.hero1[0].filename;
  if (req.files?.hero2) updates.heroImage2 = '/uploads/' + req.files.hero2[0].filename;
  if (req.files?.hero3) updates.heroImage3 = '/uploads/' + req.files.hero3[0].filename;
  if (req.files?.herovideo1) updates.heroVideo1 = '/uploads/' + req.files.herovideo1[0].filename;
  if (req.files?.herovideo2) updates.heroVideo2 = '/uploads/' + req.files.herovideo2[0].filename;
  if (req.files?.herovideo3) updates.heroVideo3 = '/uploads/' + req.files.herovideo3[0].filename;
  Object.assign(data, updates);
  saveData(data);
  res.json({ success: true, data });
});

// Admin: delete hero image/video
app.delete('/api/admin/hero/:slot', isAuthenticated, (req, res) => {
  const data = getData();
  const slot = req.params.slot;
  const imgKey = 'heroImage' + slot;
  const vidKey = 'heroVideo' + slot;
  if (data[imgKey]) {
    const path = '.' + data[imgKey];
    try { require('fs').unlinkSync(path); } catch {}
  }
  if (data[vidKey]) {
    const path = '.' + data[vidKey];
    try { require('fs').unlinkSync(path); } catch {}
  }
  data[imgKey] = '';
  data[vidKey] = '';
  saveData(data);
  res.json({ success: true, data });
});

// Admin: get bookings
app.get('/api/admin/bookings', isAuthenticated, (req, res) => {
  res.json(getBookings());
});

// Admin: update booking status
app.patch('/api/admin/bookings/:id', isAuthenticated, (req, res) => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.body.status) booking.status = req.body.status;
  saveBookings(bookings);
  res.json({ success: true, booking });
});

// Admin: delete booking
app.delete('/api/admin/bookings/:id', isAuthenticated, (req, res) => {
  let bookings = getBookings();
  bookings = bookings.filter(b => b.id !== req.params.id);
  saveBookings(bookings);
  res.json({ success: true });
});

// Admin: get newsletter subscribers
app.get('/api/admin/newsletter', isAuthenticated, (req, res) => {
  res.json(getNewsletters());
});

// Admin: get members
app.get('/api/admin/members', isAuthenticated, (req, res) => {
  const members = getMembers();
  res.json(members.map(m => ({ id: m.id, name: m.name, email: m.email, createdAt: m.createdAt })));
});

// Admin: delete member
app.delete('/api/admin/members/:id', isAuthenticated, (req, res) => {
  let members = getMembers();
  members = members.filter(m => m.id !== req.params.id);
  saveMembers(members);
  res.json({ success: true });
});

// Admin: member counter
app.get('/api/admin/stats', isAuthenticated, (req, res) => {
  const members = getMembers();
  const bookings = getBookings();
  const newsletter = getNewsletters();
  res.json({
    members: members.length,
    bookings: bookings.length,
    newsletter: newsletter.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  });
});

// fallback for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return;
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Monkey Gym Tresa running at http://localhost:${PORT}`);
});
