const Application = require('../models/Application');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const sendEmail = require('../utils/sendEmail');
const { getApprovalTemplate, getRejectionTemplate, getCustomEmailTemplate, getInterviewTemplate } = require('../utils/emailTemplates');

// @desc    Yeni başvuru yap
// @route   POST /api/applications
// @access  Public
const createApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      firstName, lastName, email, phone, studentNumber,
      faculty, department, grade, motivation, experience,
      eventId, projectId 
    } = req.body;

    // Aynı email ile aynı etkinliğe başvuru kontrolü
    if (eventId) {
      const existingEventApp = await Application.findOne({
        email,
        eventId,
        status: { $in: ['pending', 'approved', 'waiting'] }
      });

      if (existingEventApp) {
        return res.status(400).json({
          success: false,
          message: 'Bu etkinliğe zaten başvurdunuz!'
        });
      }
    }

    // Aynı email ile aynı projeye başvuru kontrolü
    if (projectId) {
      const existingProjectApp = await Application.findOne({
        email,
        projectId,
        status: { $in: ['pending', 'approved', 'waiting'] }
      });

      if (existingProjectApp) {
        return res.status(400).json({
          success: false,
          message: 'Bu projeye zaten başvurdunuz!'
        });
      }
    }

    // IP ve User Agent bilgilerini al
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const application = await Application.create({
      firstName,
      lastName,
      email,
      phone,
      studentNumber,
      faculty,
      department,
      grade,
      motivation,
      experience,
      eventId,
      projectId,
      ipAddress,
      userAgent,
      statusHistory: [{
        status: 'pending',
        note: 'Başvuru alındı',
        changedAt: new Date()
      }]
    });

    // Event varsa katılımcı sayısını güncelle
    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { participants: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Başvurunuz başarıyla alındı!',
      data: {
        id: application._id,
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Başvuru hatası:', error);
    
    // Unique constraint hatası
    if (error.code === 11000) {
      if (error.keyPattern?.studentNumber) {
        return res.status(400).json({
          success: false,
          message: 'Bu öğrenci numarası ile daha önce başvuru yapılmış!'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Başvuru sırasında bir hata oluştu'
    });
  }
};

// @desc    Tüm başvuruları getir (Admin)
// @route   GET /api/applications
// @access  Private (Admin/Editor)
const getApplications = async (req, res) => {
  try {
    const { status, eventId, projectId, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};

    // Filtreler
    if (status) filter.status = status;
    if (eventId) filter.eventId = eventId;
    if (projectId) filter.projectId = projectId;
    
    // Arama (isim, email, öğrenci no)
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('eventId', 'title date')
      .populate('projectId', 'title')
      .populate('reviewedBy', 'name email');

    // Toplam sayı
    const total = await Application.countDocuments(filter);

    // İstatistikler
    const stats = {
      total: await Application.countDocuments(),
      pending: await Application.countDocuments({ status: 'pending' }),
      approved: await Application.countDocuments({ status: 'approved' }),
      rejected: await Application.countDocuments({ status: 'rejected' }),
      waiting: await Application.countDocuments({ status: 'waiting' })
    };

    res.json({
      success: true,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Başvurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Tek bir başvuruyu getir
// @route   GET /api/applications/:id
// @access  Private (Admin/Editor)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('eventId', 'title date location')
      .populate('projectId', 'title')
      .populate('reviewedBy', 'name email')
      .populate('statusHistory.changedBy', 'name')
      .populate('adminNotes.createdBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Başvuru getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Başvuru durumunu güncelle (Onayla/Reddet/Beklet)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin/Editor)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['approved', 'rejected', 'waiting', 'interview'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    // Durum geçmişine ekle
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Başvuru ${status === 'approved' ? 'onaylandı' : status === 'rejected' ? 'reddedildi' : 'beklemeye alındı'}`,
      changedAt: new Date()
    });

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    // EMAİL GÖNDERİMİ (API'yi bloklamaması için kendi Async yapısı çalışacak)
    if (status === 'approved' || status === 'rejected' || status === 'interview') {
      try {
        let subject = 'BozTech Başvurunuz Hakkında';
        let html = '';

        if (status === 'approved') {
           subject = 'Tebrikler! Aramıza Katıldın 🎉';
           html = getApprovalTemplate(application.firstName);
        } else if (status === 'rejected') {
           html = getRejectionTemplate(application.firstName);
        } else if (status === 'interview') {
           subject = 'Mülakata Davet Edildiniz 🗓️';
           html = getInterviewTemplate(application.firstName);
        }

        sendEmail({
          email: application.email,
          subject: subject,
          html: html
        });
      } catch (mailError) {
        console.error('Mail tetiklenirken hata oluştu:', mailError);
      }
    }

    res.json({
      success: true,
      message: `Başvuru ${status === 'approved' ? 'onaylandı' : status === 'rejected' ? 'reddedildi' : 'beklemeye alındı'}`,
      data: application
    });

  } catch (error) {
    console.error('Başvuru güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Başvuruya not ekle (Admin)
// @route   POST /api/applications/:id/notes
// @access  Private (Admin/Editor)
const addApplicationNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Not boş olamaz'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    application.adminNotes.push({
      note,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await application.save();

    res.json({
      success: true,
      message: 'Not eklendi',
      data: application.adminNotes[application.adminNotes.length - 1]
    });

  } catch (error) {
    console.error('Not eklenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Adaya Özel Mail Gönder
// @route   POST /api/applications/:id/send-email
// @access  Private (Admin/Editor)
const sendCustomEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Doldurulması zorunlu alanlar eksik.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı' });
    }

    const html = getCustomEmailTemplate(application.firstName, message);
    
    const sent = await sendEmail({
      email: application.email,
      subject: subject,
      html: html,
      message: message
    });

    if (sent) {
      res.json({ success: true, message: 'Mail başarıyla iletildi.' });
    } else {
      res.status(500).json({ success: false, message: 'Mail gönderimi (SMTP) başarısız oldu.' });
    }

  } catch (error) {
    console.error('Özel mail gönderim hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// @desc    Başvuruları Excel olarak dışa aktar
// @route   GET /api/applications/export/excel
// @access  Private (Admin)
const exportToExcel = async (req, res) => {
  try {
    const { status, eventId, projectId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (eventId) filter.eventId = eventId;
    if (projectId) filter.projectId = projectId;

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .populate('eventId', 'title')
      .populate('projectId', 'title');

    // Excel workbook oluştur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Başvurular');

    // Kolonları tanımla
    worksheet.columns = [
      { header: 'Ad Soyad', key: 'fullName', width: 25 },
      { header: 'E-posta', key: 'email', width: 30 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Öğrenci No', key: 'studentNumber', width: 15 },
      { header: 'Fakülte', key: 'faculty', width: 20 },
      { header: 'Bölüm', key: 'department', width: 25 },
      { header: 'Sınıf', key: 'grade', width: 15 },
      { header: 'Etkinlik/Proje', key: 'event', width: 25 },
      { header: 'Durum', key: 'status', width: 15 },
      { header: 'Başvuru Tarihi', key: 'appliedAt', width: 20 },
      { header: 'Değerlendirme Tarihi', key: 'reviewedAt', width: 20 }
    ];

    // Verileri ekle
    applications.forEach(app => {
      worksheet.addRow({
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        studentNumber: app.studentNumber,
        faculty: app.faculty,
        department: app.department,
        grade: app.grade,
        event: app.eventId?.title || app.projectId?.title || '-',
        status: app.status === 'pending' ? 'Beklemede' : 
                app.status === 'approved' ? 'Onaylandı' : 
                app.status === 'rejected' ? 'Reddedildi' : 'Bekleme',
        appliedAt: app.appliedAt.toLocaleDateString('tr-TR'),
        reviewedAt: app.reviewedAt ? app.reviewedAt.toLocaleDateString('tr-TR') : '-'
      });
    });

    // Başlık satırını stilize et
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Response header'larını ayarla
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=basvurular_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Excel dosyasını gönder
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Excel oluşturulurken hata oluştu'
    });
  }
};

// @desc    Başvuruları CSV olarak dışa aktar
// @route   GET /api/applications/export/csv
// @access  Private (Admin)
const exportToCSV = async (req, res) => {
  try {
    const { status, eventId, projectId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (eventId) filter.eventId = eventId;
    if (projectId) filter.projectId = projectId;

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .populate('eventId', 'title')
      .populate('projectId', 'title');

    // CSV başlıkları
    const headers = [
      'Ad Soyad',
      'E-posta',
      'Telefon',
      'Öğrenci No',
      'Fakülte',
      'Bölüm',
      'Sınıf',
      'Etkinlik/Proje',
      'Durum',
      'Başvuru Tarihi',
      'Motivasyon',
      'Deneyim'
    ];

    let csv = headers.join(',') + '\n';

    // Verileri CSV formatına çevir
    applications.forEach(app => {
      const row = [
        `"${app.fullName}"`,
        `"${app.email}"`,
        `"${app.phone}"`,
        `"${app.studentNumber}"`,
        `"${app.faculty}"`,
        `"${app.department}"`,
        `"${app.grade}"`,
        `"${app.eventId?.title || app.projectId?.title || '-'}"`,
        `"${app.status}"`,
        `"${app.appliedAt.toLocaleDateString('tr-TR')}"`,
        `"${app.motivation.replace(/"/g, '""')}"`,
        `"${app.experience ? app.experience.replace(/"/g, '""') : ''}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=basvurular_${new Date().toISOString().split('T')[0]}.csv`
    );

    res.send(csv);

  } catch (error) {
    console.error('CSV export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'CSV oluşturulurken hata oluştu'
    });
  }
};

// @desc    İstatistikleri getir
// @route   GET /api/applications/stats
// @access  Private (Admin)
const getApplicationStats = async (req, res) => {
  try {
    const stats = {
      total: await Application.countDocuments(),
      pending: await Application.countDocuments({ status: 'pending' }),
      approved: await Application.countDocuments({ status: 'approved' }),
      rejected: await Application.countDocuments({ status: 'rejected' }),
      waiting: await Application.countDocuments({ status: 'waiting' }),
      
      // Fakülte bazlı dağılım
      byFaculty: await Application.aggregate([
        { $group: { _id: '$faculty', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Bölüm bazlı dağılım
      byDepartment: await Application.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Sınıf bazlı dağılım
      byGrade: await Application.aggregate([
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // Aylık başvuru trendi
      monthlyTrend: await Application.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$appliedAt' },
              month: { $month: '$appliedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Kullanıcının kendi başvurularını getir
// @route   GET /api/applications/my-applications
// @access  Private (Kullanıcı kendi başvuruları için)
const getMyApplications = async (req, res) => {
  try {
    // Not: Bu endpoint için kullanıcının giriş yapması gerekir
    // Ama şimdilik email ile sorgulayalım
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email adresi gerekli'
      });
    }

    const applications = await Application.find({ email })
      .sort({ appliedAt: -1 })
      .populate('eventId', 'title date')
      .populate('projectId', 'title');

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Başvurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Başvuruyu sil (Admin)
// @route   DELETE /api/applications/:id
// @access  Private (Admin only)
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Başvuru bulunamadı' });
    }

    res.json({ success: true, message: 'Başvuru silindi' });
  } catch (error) {
    console.error('Başvuru silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  exportToExcel,
  exportToCSV,
  getApplicationStats,
  getMyApplications,
  sendCustomEmail,
  deleteApplication
};