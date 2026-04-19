const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Token doğrulama ve kullanıcıyı request'e ekleme
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Header'dan token'ı al (Bearer formatında)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bu işlem için giriş yapmanız gerekiyor' 
      });
    }

    // 2. Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Kullanıcıyı bul (Şifreyi hariç tut)
    // Hem 'id' hem 'userId' kontrolü ekledim ki hata payı kalmasın
    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı veya token geçersiz' 
      });
    }

    // 4. Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Hesabınız dondurulmuş. Lütfen üst yönetici ile görüşün.' 
      });
    }

    // 5. Kullanıcıyı request nesnesine ekle (Diğer fonksiyonlar buradan erişecek)
    req.user = user;
    next();
    
  } catch (error) {
    // Spesifik JWT hataları için kullanıcıya anlamlı mesajlar döner
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Geçersiz anahtar (Token)' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın' });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Yetkilendirme sırasında sunucu hatası oluştu' 
    });
  }
};

/**
 * @desc    Belirli rollere göre erişim kontrolü (Örn: Sadece admin)
 * @param   {...String} roles - Yetki verilecek roller ('admin', 'editor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Bu sayfaya girmek için '${req.user.role}' yetkisi yeterli değildir.` 
      });
    }
    next();
  };
};

/**
 * @desc    Kullanıcının modeldeki 'permissions' nesnesindeki yetkisine bakar
 * @param   {String} permission - Kontrol edilecek yetki adı ('announcements', 'events' vb.)
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    // 'super_admin' veya 'admin' rolündekiler tüm izinlere sahiptir
    if (req.user.role === 'admin') return next();
    
    // Editörlerin spesifik izinlerini kontrol et
    // Optional chaining (?.) kullanarak nesne yoksa hata almasını engelledik
    if (req.user?.permissions && req.user.permissions[permission] === true) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: `Yetki Hatası: '${permission}' yönetme izniniz bulunmuyor.` 
    });
  };
};

module.exports = { protect, authorize, checkPermission };