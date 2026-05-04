const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#0f172a; font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px; background:#1e293b; border-radius:20px; overflow:hidden; border:1px solid #334155; box-shadow:0 20px 40px rgba(0,0,0,0.4);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%); padding:36px 32px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.1); border-radius:12px; padding:6px 18px; margin-bottom:14px;">
                <span style="color:#93c5fd; font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase;">Yozgat Bozok Üniversitesi</span>
              </div>
              <div style="font-size:28px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">BozTech R&D Kulübü</div>
            </td>
          </tr>

          <!-- Divider Line -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg,#1d4ed8,#6366f1,#1d4ed8);"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 36px; color:#cbd5e1; font-size:15px; line-height:1.85;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#162032; padding:22px 32px; text-align:center; border-top:1px solid #2d3f55;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">Bu mail BozTech R&D Kulübü başvuru sistemi tarafından otomatik gönderilmiştir.</p>
              <p style="margin:8px 0 0;">
                <a href="https://boztechrd.com.tr" style="color:#60a5fa; font-size:12px; text-decoration:none; font-weight:600;">boztechrd.com.tr</a>
                <span style="color:#475569; font-size:12px;"> &bull; Yozgat Bozok Üniversitesi</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

exports.getApprovalTemplate = (name) => {
  const content = `
    <p style="font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 20px;">Merhaba ${name}, hoş geldin! 🎉</p>
    <p style="margin:0 0 14px;">Başvurunu inceledik ve seni ekibimize almak istedik. Artık <strong style="color:#60a5fa;">BozTech R&D Kulübü</strong>'nün bir parçasısın!</p>
    <p style="margin:0 0 14px;">Önümüzdeki günlerde WhatsApp ve diğer iletişim kanallarımıza ekliyeceğiz, detayları seninle paylaşacağız. Maillerini takip et.</p>
    <p style="margin:0 0 28px;">Birlikte güzel şeyler yapacağız. </p>
    <div style="border-top:1px solid #334155; padding-top:20px;">
      <p style="color:#94a3b8; margin:0 0 4px; font-size:14px;">Görüşürüz,</p>
      <p style="font-weight:700; color:#e2e8f0; margin:0; font-size:15px;">BozTech R&D Kulübü</p>
    </div>
  `;
  return getBaseTemplate(content);
};

exports.getRejectionTemplate = (name) => {
  const content = `
    <p style="font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 20px;">Merhaba ${name},</p>
    <p style="margin:0 0 14px;">Başvurduğun için gerçekten teşekkürler, bu bizim için önemli.</p>
    <p style="margin:0 0 14px;">Bu dönem kontenjanımız çok sınırlıydı ve zor bir seçim yapmak zorunda kaldık. Seninle bu sefer çalışamayacak olmak üzücü.</p>
    <p style="margin:0 0 28px;">Bir sonraki alım döneminde tekrar başvurabilirsin, seni görmekten memnuniyet duyarız. Bol şans! </p>
    <div style="border-top:1px solid #334155; padding-top:20px;">
      <p style="color:#94a3b8; margin:0 0 4px; font-size:14px;">İyi çalışmalar,</p>
      <p style="font-weight:700; color:#e2e8f0; margin:0; font-size:15px;">BozTech R&D Kulübü</p>
    </div>
  `;
  return getBaseTemplate(content);
};

exports.getInterviewTemplate = (name) => {
  const content = `
    <p style="font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 20px;">Merhaba ${name}! </p>
    <p style="margin:0 0 14px;">Başvurunu inceledik ve seni biraz daha tanımak istedik — seni <strong style="color:#fbbf24;">mülakata</strong> davet ediyoruz.</p>
    <p style="margin:0 0 14px;">Çok resmi bir şey değil, kısa bir sohbet olacak. Mülakat tarihi ve saatiyle ilgili kısa süre içinde tekrar yazacağız.</p>
    <p style="margin:0 0 28px;">O zamana kadar projelerimize göz atabilirsin. Görüşmek üzere! </p>
    <div style="border-top:1px solid #334155; padding-top:20px;">
      <p style="color:#94a3b8; margin:0 0 4px; font-size:14px;">Yakında görüşürüz,</p>
      <p style="font-weight:700; color:#e2e8f0; margin:0; font-size:15px;">BozTech R&D Kulübü</p>
    </div>
  `;
  return getBaseTemplate(content);
};

exports.getCustomEmailTemplate = (name, customMessage) => {
  const formattedMessage = customMessage.replace(/\n/g, '<br/>');
  const content = `
    <p style="font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 20px;">Merhaba ${name},</p>
    <p style="margin:0 0 28px;">${formattedMessage}</p>
    <div style="border-top:1px solid #334155; padding-top:20px;">
      <p style="color:#94a3b8; margin:0 0 4px; font-size:14px;">İyi çalışmalar,</p>
      <p style="font-weight:700; color:#e2e8f0; margin:0; font-size:15px;">BozTech R&D Kulübü</p>
    </div>
  `;
  return getBaseTemplate(content);
};
