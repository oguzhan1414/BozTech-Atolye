export const announcements = [
  {
    id: 1,
    type: 'Teknik',
    title: 'Hackathon Kayıtları Başladı',
    description: 'Bu yıl büyük markanın sponsorluğunda düzenlenecek hackathonumuz için kayıtlar başladı. Toplam 50.000 TL ödüllü yarışmamıza sizleri bekliyoruz.',
    date: '12 Ekim 2023',
    link: '#'
  },
  {
    id: 2,
    type: 'Genel',
    title: 'React Workshop Serisi',
    description: 'Temel seviyeden ileri seviyeye 4 haftalık React eğitimimiz başlıyor. Her seviyeye uygun içeriklerle hazırlandı.',
    date: '15 Ekim 2023',
    link: '#'
  },
  {
    id: 3,
    type: 'Genel',
    title: 'Yeni Dönem Üye Alımı',
    description: 'Kulübümüze katılmak isteyen arkadaşlar için mülakat takvimi belirledik. Başvuru formunu doldurmayı unutmayın.',
    date: '18 Ekim 2023',
    link: '#'
  }
];

export const upcomingEvents = [
  {
    id: 1,
    date: '24 Ekim 2023',
    title: 'Yapay Zeka ve Gelecek Zirvesi',
    description: 'Sektör liderlerinden yapay zekanın iş dünyasındaki etkilerini dinleyin ve network ağınızı genişletin.',
    time: '14:00 - 17:00',
    location: 'ONC CAN',
    category: 'Konferans',
    link: '#'
  },
  {
    id: 2,
    date: '02 Kasım 2023',
    title: 'UI/UX Design Workshop',
    description: 'Tasarım prensipleri ve kullanıcı deneyimi üzerine interaktif workshop.',
    time: '14:00 - 14:30',
    location: 'TO2',
    category: 'Workshop',
    link: '#'
  },
  {
    id: 3,
    date: '08 Kasım 2023',
    title: 'Cyber Security Meetup',
    description: 'Siber güvenlik uzmanları ile networking ve teknik paylaşım etkinliği.',
    time: '15:00 - 16:00',
    location: 'TO1',
    category: 'Meetup',
    link: '#'
  },
  {
    id: 4,
    date: '15 Kasım 2023',
    title: 'Open Source Contributions',
    description: 'Açık kaynak projelere nasıl katkıda bulunabileceğinizi öğrenin.',
    time: '15:00 - 17:00',
    location: 'TO1',
    category: 'Workshop',
    link: '#'
  }
];

export const pastEvents = [
  {
    id: 1,
    title: 'Yatışma Çayı',
    date: 'Eylül 2023',
    description: 'Yeni dönem öğrencileriyle tanışma ve kaynaşma etkinliği',
    participants: 120,
    image: '/images/event1.jpg'
  },
  {
    id: 2,
    title: 'Ağaçlıkta 2023 Yaz Kampı',
    date: 'Temmuz 2023',
    description: '3 günlük doğa kampı ve teknik workshoplar',
    participants: 45,
    image: '/images/event2.jpg'
  },
  {
    id: 3,
    title: 'Haziran 2023 Proje Sergisi',
    date: 'Haziran 2023',
    description: 'Dönem boyunca geliştirilen projelerin sergisi ve demo günü',
    participants: 200,
    image: '/images/event3.jpg'
  },
  {
    id: 4,
    title: 'Mayıs 2023 Öğretmenlik Paneli',
    date: 'Mayıs 2023',
    description: 'Eğitim teknolojileri ve dijital dönüşüm üzerine panel',
    participants: 85,
    image: '/images/event4.jpg'
  }
];
// eventsData.js'de
import event1 from '../images/gallery/event1.jpeg';
import event2 from '../images/gallery/event2.jpeg';
import event3 from '../images/gallery/event3.jpeg';
import event4 from '../images/gallery/event4.jpeg';
export const photoGallery = [
  { id: 1, title: 'Hackathon 2023', category: 'Teknik', image: event1 },
  { id: 2, title: 'Workshop Etkinliği', category: 'Eğitim', image: event2 },
  { id: 3, title: 'Networking Gecesi', category: 'Sosyal', image: event3 },
  { id: 4, title: 'Proje Sunumları', category: 'Teknik', image: event4 },
];


// src/constants/data.js
export const PROJECTS = [
  {
    id: "akilli-ulasim",
    title: "Akıllı Ulaşım Sistemi",
    desc: "YOLO tabanlı nesne tespiti ile ambulanslara öncelik veren sistem.",
    longDesc: "Bu proje, derin öğrenme algoritmaları kullanarak trafik akışını optimize eder. Görüntü işleme teknikleriyle acil durum araçlarını tespit edip trafik ışıklarını otonom olarak yönetir.",
    img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=500",
    tag: "Yapay Zeka",
    tech: ["Python", "YOLOv8", "OpenCV", "PyQt5"]
  },
  {
    id: "hava-savunma",
    title: "Hava Savunma Sistemi",
    desc: "Adamları gördün baba çuçuvçuçuv.",
    longDesc: "Arduino ve OTG bağlantısı kullanarak geliştirilen, gerçek zamanlı nesne takibi yapabilen bir savunma mekanizması prototipidir.",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500",
    tag: "Robotik",
    tech: ["C++", "Arduino", "Computer Vision"]
  }
];

export const BOARD_MEMBERS = [
  { 
    name: "Oğuzhan Şekerci", 
    role: "Kulüp Başkanı", 
    img: "https://via.placeholder.com/150", 
    linkedin: "#", 
    github: "#" 
  },
  { 
    name: "Ahmet Yılmaz", 
    role: "Teknik Sorumlu", 
    img: "https://via.placeholder.com/150", 
    linkedin: "#", 
    github: "#" 
  }
];