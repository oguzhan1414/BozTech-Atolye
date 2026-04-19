const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes'); // 👈 Henüz hazır değilse kapalı kalsın
const eventRoutes = require('./src/routes/eventRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const photoRoutes = require('./src/routes/photoRoutes');
const userRoutes = require('./src/routes/userRoutes');
const clubInfoRoutes = require('./src/routes/clubInfoRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const boardMemberRoutes = require('./src/routes/boardMemberRoutes');

const app = express();

// Railway gibi reverse proxy ortamlarinda protocol/host dogru okunur.
app.set('trust proxy', 1);

const normalizeOrigin = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, '').toLowerCase();
};

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const envAllowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(',')
]
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    ...defaultAllowedOrigins.map((origin) => normalizeOrigin(origin)),
    ...envAllowedOrigins,
  ])
];

console.log(`🌍 CORS izinli originler: ${allowedOrigins.join(', ')}`);

const corsOptions = {
  origin: (origin, callback) => {
    // Browser olmayan isteklerde origin gelmeyebilir (health check, curl vb.)
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS izin hatasi: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI bulunamadı. Railway Variables alanına ekleyin.');
  process.exit(1);
}

const isAtlasSrv = typeof mongoUri === 'string' && mongoUri.startsWith('mongodb+srv://');

if (isAtlasSrv) {
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
    .split(',')
    .map(server => server.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log(`🌐 DNS sunucuları ayarlandı: ${dnsServers.join(', ')}`);
  }
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB bağlantısı başarılı');
    createInitialAdmin();
  })
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// İlk admin kullanıcısını oluştur
const createInitialAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('⚠️ ADMIN_EMAIL veya ADMIN_PASSWORD tanimli degil, ilk admin olusturma atlandi.');
      return;
    }

    const User = require('./src/models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        permissions: {
          announcements: true,
          events: true,
          applications: true,
          photos: true,
          users: true
        }
      });
      console.log('✅ İlk admin kullanıcısı oluşturuldu');
    }
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
  }
};

// Routes - Sadece hazır olanı açıyoruz
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/club-info', clubInfoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/board-members', boardMemberRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tech Club API çalışıyor',
    status: 'Auth sistemi aktif, diğerleri beklemede'
  });
});

// Railway health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint bulunamadı' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Hata:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
});