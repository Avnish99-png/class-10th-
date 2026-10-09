// Configuration for Think Unlimited - Class 10 Maths Made Easy
// Easily modify pricing, contact numbers, social handles, and policies here.

module.exports = {
  brand: {
    name: 'Think Unlimited',
    tagline: 'Maths se darr? Ab nahi.',
    subTagline: 'Formula • Trick • Example — sab ek hi jagah'
  },

  product: {
    id: 'c10-maths-formula-book',
    title: 'Class 10 Maths Made Easy',
    subtitle: 'CBSE Board Exam Edition 2026/27',
    tag: 'Limited-time offer',
    price: 39,          // Price in INR
    pricePaise: 3900,   // For Razorpay (1 INR = 100 paise)
    originalPrice: 79,  // Crossed-out price
    pages: 20,
    chapters: 14,
    format: 'Instant-download PDF'
  },

  contacts: {
    phonePrimary: '9243791529',
    phoneSecondary: '9644095290',
    whatsapp: '9243791529',
    whatsappLink: 'https://wa.me/919243791529?text=Hi%20Think%20Unlimited!%20Mujhe%20Class%2010%20Maths%20e-book%20ke%20baare%20mein%20poochna%20hai',
    supportEmail: 'a2043728022@gmail.com',
    upiId: '9243791529@axl',
    upiQrImage: '/images/upi-qr.png'
  },

  upi: {
    id: '9243791529@axl',
    qrImage: '/images/upi-qr.png',
    payeeName: 'Think Unlimited',
    amount: 39
  },


  socials: {
    instagram: '@thinkunlimited_ed',
    instagramUrl: 'https://instagram.com/thinkunlimited_ed',
    telegram: '@thinkunlimited_cbse',
    telegramUrl: 'https://t.me/thinkunlimited_cbse'
  },

  security: {
    tokenExpiryHours: 48,
    maxDownloadsAllowed: 5
  },

  refundPolicy: {
    summary: 'Agar payment ke baad file access mein koi dikkat aati hai aur hamari support team solve nahi kar paati, to 24 ghante ke andar 100% refund mil jayega.',
    fullText: 'Since this is a digital instant-download study material, refunds are provided if there is a technical issue in accessing or downloading the PDF that our team cannot resolve within 24 hours of purchase. Contact our WhatsApp support at 9243791529 or email a2043728022@gmail.com with your Payment ID.'
  },

  analytics: {
    metaPixelId: process.env.META_PIXEL_ID || 'META_PIXEL_ID_PLACEHOLDER',
    googleAnalyticsId: process.env.GA_MEASUREMENT_ID || 'G-MEASUREMENT_ID_PLACEHOLDER'
  }
};
