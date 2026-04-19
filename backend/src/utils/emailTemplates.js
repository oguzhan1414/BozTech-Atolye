const getBaseTemplate = (title, content) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
  <div style="background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">BozTech Atölye</h1>
    <p style="color: #cbd5e1; margin: 10px 0 0 0; font-size: 14px;">Geleceği Birlikte Kodluyoruz</p>
  </div>
  <div style="padding: 40px 30px; color: #334155; font-size: 16px; line-height: 1.6;">
    <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; margin-bottom: 20px;">${title}</h2>
    ${content}
    <br/><br/>
    <p style="margin: 0;">Sevgilerle,</p>
    <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b;">BozTech Yönetim Ekibi</p>
  </div>
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 12px; margin: 0;">Bu e-posta BozTech Atölye başvuru sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">Yozgat Bozok Üniversitesi</p>
  </div>
</div>
`;

exports.getApprovalTemplate = (name) => {
  const content = `
    <p>Merhaba <strong>${name}</strong>,</p>
    <p>Sana harika bir haberimiz var! BozTech Atölye başvurun yönetim ekibimiz tarafından incelenmiş ve <strong><span style="color: #10b981;">olumlu</span></strong> sonuçlanmıştır.</p>
    <p>Yüzlerce aday arasından sıyrılarak ekibimize katılmaya hak kazandın. Seninle birlikte projeler geliştirecek olmak bizi çok heyecanlandırıyor.</p>
    <p>Oryantasyon programı ve ilk toplantımızın detayları için çok yakında seninle tekrar iletişime geçeceğiz.</p>
  `;
  return getBaseTemplate('Tebrikler! Aramıza Katıldın 🎉', content);
};

exports.getRejectionTemplate = (name) => {
  const content = `
    <p>Merhaba <strong>${name}</strong>,</p>
    <p>BozTech Atölye'ye göstermiş olduğun büyük ilgi ve başvurun için sana çok teşekkür ederiz.</p>
    <p>Başvurun mühendislik ve yönetim ekibimiz tarafından detaylıca incelendi. Ancak, mevcut kontenjan limitlerimiz ve devam eden proje gereksinimlerimiz nedeniyle şu an için başvuruna maalesef <strong><span style="color: #ef4444;">olumsuz</span></strong> dönüş yapmak durumundayız.</p>
    <p>Seni projelerimize çok uygun görsek de sınırlı kapasitemiz nedeniyle zor kararlar vermekteyiz. Gelecek dönem alımlarında ve ilerleyen organizasyonlarımızda seni aramızda görmek dileğiyle, akademik hayatında başarılar dileriz.</p>
  `;
  return getBaseTemplate('Başvurunuz Hakkında', content);
};

exports.getInterviewTemplate = (name) => {
  const content = `
    <p>Merhaba <strong>${name}</strong>,</p>
    <p>BozTech Atölye'ye göstermiş olduğun yetenekli başvurun için bizi şaşırttın, teşekkür ederiz.</p>
    <p>Ön başvurun teknik ekibimiz tarafından incelendi ve seni daha yakından tanımak için <strong><span style="color: #f59e0b;">MÜLAKATA</span></strong> davet etmeye karar verdik!</p>
    <p>Mülakat tarihini ve saatini planlamak üzere en kısa sürede seninle bizzat iletişime geçeceğiz. Bu süreçte takıma katılmak için projelerimizi inceleyebilirsin.</p>
  `;
  return getBaseTemplate('Mülakata Davet Edildiniz 🗓️', content);
};

exports.getCustomEmailTemplate = (name, customMessage) => {
  const formattedMessage = customMessage.replace(/\n/g, '<br/>');
  const content = `
    <p>Merhaba <strong>${name}</strong>,</p>
    <p>${formattedMessage}</p>
  `;
  return getBaseTemplate('BozTech Atölye\'den Mesajınız Var', content);
};
