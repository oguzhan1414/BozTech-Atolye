const ClubInfo = require('../models/ClubInfo');

// @desc    Tum bolumlerin verilerini getir
// @route   GET /api/club-info
// @access  Public
const getAllSectionsInfo = async (req, res) => {
  try {
    const sections = await ClubInfo.find({});

    const data = sections.reduce((acc, item) => {
      acc[item.section] = item.data;
      return acc;
    }, {});

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Tum ClubInfo bolumleri getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatasi' });
  }
};

// @desc    Bir bölümün verilerini getir
// @route   GET /api/club-info/:section
// @access  Public
const getSectionInfo = async (req, res) => {
  try {
    const { section } = req.params;
    const info = await ClubInfo.findOne({ section });
    
    res.json({
      success: true,
      data: info ? info.data : null
    });
  } catch (error) {
    console.error('ClubInfo getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// @desc    Bir bölümün verilerini güncelle
// @route   PUT /api/club-info/:section
// @access  Private (Admin veya clubInfo yetkisine sahip olanlar)
const updateSectionInfo = async (req, res) => {
  try {
    const { section } = req.params;
    const bodyData = req.body;

    let info = await ClubInfo.findOne({ section });

    if (info) {
      info.data = bodyData;
      info.updatedBy = req.user ? req.user._id : undefined;
      await info.save();
    } else {
      info = await ClubInfo.create({
        section,
        data: bodyData,
        updatedBy: req.user ? req.user._id : undefined
      });
    }

    res.json({
      success: true,
      message: `${section} başarıyla güncellendi`,
      data: info.data
    });
  } catch (error) {
    console.error('ClubInfo güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

module.exports = {
  getAllSectionsInfo,
  getSectionInfo,
  updateSectionInfo
};
