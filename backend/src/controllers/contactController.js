const sendEmail = require('../utils/sendEmail');
const BoardMember = require('../models/BoardMember');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen tüm alanları eksiksiz doldurun' 
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">Yeni İletişim Formu Mesajı</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Gönderen:</strong> ${name}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <strong>Mesaj İçeriği:</strong><br/><br/>
            ${message.replace(/\n/g, '<br/>')}
          </p>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
          Bu e-posta BozTech Atölye sisteminden otomatik yönlendirilmiştir. Yanıtlamak için lütfen doğrudan ziyaretçinin mail adresini kopyalayın.
        </p>
      </div>
    `;

    await sendEmail({
      email: process.env.SMTP_USER, // Admin'in kendi mail hesabına düşer
      subject: `BozTech İletişim: ${name} size ulaştı`,
      html: htmlContent
    });

    res.status(200).json({ 
      success: true, 
      message: 'Mesajınız başarıyla iletildi.' 
    });

  } catch (error) {
    console.error('İletişim formu SMTP hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu yoğunluğu nedeniyle mesaj gönderilemedi.' 
    });
  }
};

exports.sendMessageToBoardMember = async (req, res) => {
  try {
    const { boardMemberId, senderName, senderEmail, message } = req.body;
    
    if (!boardMemberId || !senderName || !senderEmail || !message) {
      return res.status(400).json({ success: false, message: 'Lütfen tüm alanları eksiksiz doldurun' });
    }

    const member = await BoardMember.findById(boardMemberId);
    if (!member || !member.email) {
      return res.status(404).json({ success: false, message: 'Bu yöneticinin aktif bir mail adresi bulunmuyor.' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">Platform Üzerinden Size Yeni Bir Mesaj Var!</h2>
        <p>Merhaba <strong>${member.name}</strong>,</p>
        <p>BozTech Atölye sistemi üzerinden profiliniz ziyaret edilerek aşağıdaki mesaj bırakıldı:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Gönderen:</strong> ${senderName}</p>
          <p><strong>E-posta:</strong> ${senderEmail}</p>
          <p style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <strong>Mesaj İçeriği:</strong><br/><br/>
            ${message.replace(/\n/g, '<br/>')}
          </p>
        </div>
        <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
          <strong>Not:</strong> Bu e-postayı doğrudan yanıtlayarak (Reply) iletişime geçen ziyaretçiye ( ${senderEmail} ) veya kişiye ait bir alıcıya otomatik geri dönüş yapabilirsiniz.
        </p>
      </div>
    `;

    await sendEmail({
      email: member.email,
      replyTo: senderEmail,
      subject: `[BozTech Atölye] ${senderName} adlı kişiden mesaj`,
      html: htmlContent
    });

    res.status(200).json({ success: true, message: 'Mesajınız yöneticiye başarıyla iletildi.' });

  } catch (error) {
    console.error('Board Member mesaj gönderim hatası:', error);
    res.status(500).json({ success: false, message: 'Sistem hatası, mesaj iletilemedi.' });
  }
};
