import { createContext, useContext, useState, ReactNode } from "react";

type Language = "id" | "en";

interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  home: { id: "Beranda", en: "Home" },
  aboutUs: { id: "Tentang Kami", en: "About Us" },
  products: { id: "Produk", en: "Products" },
  whyChooseUs: { id: "Mengapa Kami", en: "Why Choose Us" },
  contact: { id: "Kontak", en: "Contact" },
  blogs: { id: "Blog", en: "Blogs" },
  requestQuote: { id: "Minta Penawaran", en: "Request Quote" },
  trustedPartner: { id: "Mitra Industri Terpercaya Anda", en: "Your Trusted Industrial Partner" },
  
  // Hero - Enhanced value proposition
  electricalMechanicalSupplier: { id: "Supplier Elektrikal & Mekanikal", en: "Electrical & Mechanical Supplier" },
  heroPainPoint: { 
    id: "Solusi Pengadaan Komponen Elektrikal & Mekanikal Terpercaya", 
    en: "Your Trusted Electrical & Mechanical Components Partner" 
  },
  heroSubheadline: {
    id: "Stok tersedia, harga transparan, pengiriman tepat waktu.",
    en: "Stock available, transparent pricing, on-time delivery."
  },
  heroDescription: { 
    id: "Kami memahami tekanan deadline pengadaan Anda. Dapatkan penawaran dalam 2 jam, produk 100% original dengan garansi, dan pengiriman yang bisa Anda andalkan.", 
    en: "We understand your procurement deadline pressure. Get quotes in 2 hours, 100% original products with warranty, and delivery you can rely on." 
  },
  quoteIn2Hours: { id: "Penawaran 2 Jam", en: "Quote in 2 Hours" },
  guarantee100Authentic: { id: "100% Produk Asli", en: "100% Authentic Products" },
  benefitStock: { id: "Stok Ready", en: "Ready Stock" },
  benefitPrice: { id: "Harga Transparan", en: "Transparent Pricing" },
  benefitDelivery: { id: "Pengiriman Tepat Waktu", en: "On-Time Delivery" },
  requestQuoteNow: { id: "Minta Penawaran Sekarang", en: "Request Quote Now" },
  yourComplete: { id: "Solusi", en: "Your Complete" },
  industrialSolutions: { id: "Industri", en: "Industrial Solutions" },
  partner: { id: "Lengkap Anda", en: "Partner" },
  exploreProducts: { id: "Jelajahi Produk", en: "Explore Products" },
  contactSales: { id: "Hubungi Sales", en: "Contact Sales" },
  yearsExperience: { id: "Tahun Pengalaman", en: "Years Experience" },
  activeClients: { id: "Klien Aktif", en: "Active Clients" },
  productsSKU: { id: "SKU Produk", en: "Products SKU" },

  // Brand Logos
  authorizedDistributorFor: { id: "Distributor Resmi Untuk", en: "Authorized Distributor For" },

  // Testimonials
  testimonialsTitle: { id: "Testimoni", en: "Testimonials" },
  trustedByIndustry: { id: "Dipercaya Industri Terkemuka", en: "Trusted by Leading Industries" },
  testimonialsDesc: { 
    id: "Lihat apa kata klien kami tentang pengalaman bekerja sama dengan PT Prima Putra Perkasa.", 
    en: "See what our clients say about their experience working with PT Prima Putra Perkasa." 
  },
  purchasingManager: { id: "Purchasing Manager", en: "Purchasing Manager" },
  procurementHead: { id: "Head of Procurement", en: "Head of Procurement" },
  maintenanceManager: { id: "Maintenance Manager", en: "Maintenance Manager" },
  testimonial1: { 
    id: "Respons cepat dan produk selalu original. Sudah 5 tahun kami percayakan pengadaan komponen elektrikal ke Prima Putra Perkasa.", 
    en: "Fast response and products are always original. We have trusted our electrical component procurement to Prima Putra Perkasa for 5 years." 
  },
  testimonial2: { 
    id: "Harga kompetitif dengan kualitas yang tidak perlu diragukan lagi. Tim teknis mereka sangat membantu dalam pemilihan produk.", 
    en: "Competitive prices with unquestionable quality. Their technical team is very helpful in product selection." 
  },
  testimonial3: { 
    id: "Pengiriman selalu tepat waktu, bahkan untuk pesanan mendadak. Partner yang bisa diandalkan untuk kebutuhan maintenance kami.", 
    en: "Delivery is always on time, even for urgent orders. A reliable partner for our maintenance needs." 
  },

  // Floating CTA
  quickQuote: { id: "Quick Quote", en: "Quick Quote" },
  callNow: { id: "Telepon Sekarang", en: "Call Now" },
  chatWithUs: { id: "Chat dengan Kami", en: "Chat with Us" },

  // About
  aboutUsTitle: { id: "Tentang Kami", en: "About Us" },
  buildingTrust: { id: "Membangun Kepercayaan Melalui Kualitas & Keandalan", en: "Building Trust Through Quality & Reliability" },
  aboutDesc1: { 
    id: "Selama lebih dari 15 tahun, kami telah menjadi tulang punggung industri manufaktur dan konstruksi, memasok komponen elektrikal dan mekanikal premium dari merek-merek ternama dunia.", 
    en: "For over 15 years, we have been the backbone of manufacturing and construction industries, supplying premium electrical and mechanical components from world-renowned brands." 
  },
  aboutDesc2: { 
    id: "Pemahaman kami yang mendalam tentang tantangan pengadaan memungkinkan kami memberikan tidak hanya produk, tetapi solusi komprehensif yang mengoptimalkan rantai pasokan Anda dan mengurangi waktu henti operasional.", 
    en: "Our deep understanding of procurement challenges allows us to deliver not just products, but comprehensive solutions that optimize your supply chain and reduce operational downtime." 
  },
  authorizedDistributor: { id: "Distributor resmi untuk merek internasional utama", en: "Authorized distributor for major international brands" },
  extensiveInventory: { id: "Inventaris luas untuk ketersediaan segera", en: "Extensive inventory for immediate availability" },
  competitivePricing: { id: "Harga kompetitif dengan diskon volume", en: "Competitive pricing with volume discounts" },
  expertConsultation: { id: "Konsultasi teknis ahli termasuk", en: "Expert technical consultation included" },
  certifiedQuality: { id: "Manajemen Kualitas Tersertifikasi", en: "Certified Quality Management" },
  onTimeDelivery: { id: "Tingkat Pengiriman Tepat Waktu", en: "On-Time Delivery Rate" },
  brandPartnerships: { id: "Kemitraan Merek", en: "Brand Partnerships" },
  technicalSupport: { id: "Dukungan Teknis", en: "Technical Support" },

  // Products
  ourProducts: { id: "Produk Kami", en: "Our Products" },
  comprehensiveSolutions: { id: "Solusi Industri Komprehensif", en: "Comprehensive Industrial Solutions" },
  productsDesc: { 
    id: "Dari komponen elektrikal hingga sistem mekanikal, kami menawarkan rangkaian produk lengkap untuk memenuhi kebutuhan manufaktur dan konstruksi Anda.", 
    en: "From electrical components to mechanical systems, we offer a complete range of products to meet your manufacturing and construction needs." 
  },
  electricalComponents: { id: "Komponen Elektrikal", en: "Electrical Components" },
  electricalDesc: { id: "Circuit breaker, kontaktor, relay, sakelar, dan perangkat proteksi dari merek terkemuka.", en: "Circuit breakers, contactors, relays, switches, and protection devices from leading brands." },
  mechanicalParts: { id: "Komponen Mekanikal", en: "Mechanical Parts" },
  mechanicalDesc: { id: "Bearing, gearbox, kopling, dan komponen transmisi untuk mesin industri.", en: "Bearings, gearboxes, couplings, and transmission components for industrial machinery." },
  instrumentation: { id: "Instrumentasi", en: "Instrumentation" },
  instrumentationDesc: { id: "Pengukur tekanan, flow meter, sensor suhu, dan instrumen kontrol.", en: "Pressure gauges, flow meters, temperature sensors, and control instruments." },
  cablesWiring: { id: "Kabel & Pengkabelan", en: "Cables & Wiring" },
  cablesDesc: { id: "Kabel daya, kabel kontrol, pengkabelan instrumentasi, dan aksesori kabel.", en: "Power cables, control cables, instrumentation wiring, and cable accessories." },
  automationControl: { id: "Otomasi & Kontrol", en: "Automation & Control" },
  automationDesc: { id: "PLC, HMI, drive, dan solusi otomasi untuk manufaktur modern.", en: "PLCs, HMIs, drives, and automation solutions for modern manufacturing." },
  motorsPumps: { id: "Motor & Pompa", en: "Motors & Pumps" },
  motorsPumpsDesc: { id: "Motor listrik, pompa industri, kipas, dan blower untuk semua aplikasi.", en: "Electric motors, industrial pumps, fans, and blowers for all applications." },
  viewFullCatalog: { id: "Lihat Katalog Lengkap", en: "View Full Catalog" },

  // Why Choose Us
  whyChooseUsTitle: { id: "Mengapa Memilih Kami", en: "Why Choose Us" },
  procurementSimple: { id: "Pengadaan Anda Jadi Mudah", en: "Your Procurement Made Simple" },
  whyChooseDesc: { 
    id: "Kami memahami tekanan departemen pengadaan. Solusi kami dirancang untuk mempermudah pekerjaan Anda sambil memastikan kualitas dan efisiensi biaya.", 
    en: "We understand the pressures of procurement departments. Our solutions are designed to make your job easier while ensuring quality and cost-efficiency." 
  },
  authenticProducts: { id: "Produk 100% Asli", en: "100% Authentic Products" },
  authenticDesc: { id: "Semua produk bersumber langsung dari produsen atau distributor resmi dengan garansi penuh.", en: "All products are sourced directly from manufacturers or authorized distributors with full warranty." },
  fastDelivery: { id: "Pengiriman Cepat & Andal", en: "Fast & Reliable Delivery" },
  fastDeliveryDesc: { id: "Pengiriman hari yang sama untuk barang tersedia. Pengiriman nasional dengan pelacakan real-time.", en: "Same-day dispatch for in-stock items. Nationwide delivery with real-time tracking." },
  competitivePricingTitle: { id: "Harga Kompetitif", en: "Competitive Pricing" },
  competitivePricingDesc: { id: "Harga pasar terbaik dengan syarat pembayaran fleksibel dan diskon volume untuk pesanan berulang.", en: "Best market prices with flexible payment terms and volume discounts for repeat orders." },
  technicalExpertise: { id: "Keahlian Teknis", en: "Technical Expertise" },
  technicalExpertiseDesc: { id: "Insinyur kami memberikan konsultasi untuk membantu Anda memilih produk yang tepat untuk aplikasi Anda.", en: "Our engineers provide consultation to help you select the right products for your applications." },
  largeStock: { id: "Ketersediaan Stok Besar", en: "Large Stock Availability" },
  largeStockDesc: { id: "Lebih dari 10.000 SKU siap untuk pengiriman segera dari gudang terpusat kami.", en: "Over 10,000 SKUs ready for immediate delivery from our centralized warehouse." },
  quickResponse: { id: "Waktu Respons Cepat", en: "Quick Response Time" },
  quickResponseDesc: { id: "Penawaran dalam 2 jam, pemrosesan pesanan hari yang sama, manajer akun khusus.", en: "Quotations within 2 hours, order processing same day, dedicated account managers." },
  avgQuoteResponse: { id: "Rata-rata Respons Penawaran", en: "Average Quote Response" },
  hours: { id: "Jam", en: "Hours" },
  costSavings: { id: "Penghematan Biaya vs. Kompetitor", en: "Cost Savings vs. Competitors" },
  customerSatisfaction: { id: "Kepuasan Pelanggan", en: "Customer Satisfaction" },

  // Contact
  contactUs: { id: "Hubungi Kami", en: "Contact Us" },
  discussRequirements: { id: "Mari Diskusikan Kebutuhan Anda", en: "Let's Discuss Your Requirements" },
  contactDesc: { 
    id: "Tim sales kami siap membantu Anda menemukan produk yang tepat dan memberikan penawaran kompetitif untuk kebutuhan pengadaan Anda.", 
    en: "Our sales team is ready to help you find the right products and provide competitive quotations for your procurement needs." 
  },
  officeAddress: { id: "Alamat Kantor", en: "Office Address" },
  phoneNumber: { id: "Nomor Telepon", en: "Phone Number" },
  email: { id: "Email", en: "Email" },
  businessHours: { id: "Jam Kerja", en: "Business Hours" },
  requestAQuote: { id: "Minta Penawaran", en: "Request a Quote" },
  fullName: { id: "Nama Lengkap", en: "Full Name" },
  companyName: { id: "Nama Perusahaan", en: "Company Name" },
  emailAddress: { id: "Alamat Email", en: "Email Address" },
  productRequirements: { id: "Kebutuhan Produk", en: "Product Requirements" },
  submitInquiry: { id: "Kirim Pertanyaan", en: "Submit Inquiry" },
  yourName: { id: "Nama Anda", en: "Your name" },
  companyNamePlaceholder: { id: "Nama perusahaan", en: "Company name" },
  emailPlaceholder: { id: "email@perusahaan.com", en: "email@company.com" },
  phonePlaceholder: { id: "+62 xxx xxxx xxxx", en: "+62 xxx xxxx xxxx" },
  requirementsPlaceholder: { 
    id: "Silakan jelaskan produk yang Anda butuhkan, jumlah, dan persyaratan khusus lainnya...", 
    en: "Please describe the products you need, quantities, and any specific requirements..." 
  },

  // Footer
  footerDesc: { id: "Mitra terpercaya Anda untuk perlengkapan industri elektrikal dan mekanikal sejak 2009.", en: "Your trusted partner for electrical and mechanical industrial supplies since 2009." },
  quickLinks: { id: "Tautan Cepat", en: "Quick Links" },
  productCatalog: { id: "Katalog Produk", en: "Product Catalog" },
  termsConditions: { id: "Syarat & Ketentuan", en: "Terms & Conditions" },
  privacyPolicy: { id: "Kebijakan Privasi", en: "Privacy Policy" },
  authorizedBrands: { id: "Merek Resmi", en: "Authorized Brands" },
  allRightsReserved: { id: "Hak cipta dilindungi.", en: "All rights reserved." },
  isoCertified: { id: "Perusahaan Bersertifikat ISO 9001:2015", en: "ISO 9001:2015 Certified Company" },

  // Products Page
  allProducts: { id: "Semua Produk", en: "All Products" },
  searchProducts: { id: "Cari produk...", en: "Search products..." },
  addProduct: { id: "Tambah Produk", en: "Add Product" },
  editProduct: { id: "Edit Produk", en: "Edit Product" },
  deleteProduct: { id: "Hapus Produk", en: "Delete Product" },
  productName: { id: "Nama Produk", en: "Product Name" },
  description: { id: "Deskripsi", en: "Description" },
  category: { id: "Kategori", en: "Category" },
  brand: { id: "Merek", en: "Brand" },
  imageUrl: { id: "URL Gambar", en: "Image URL" },
  featured: { id: "Unggulan", en: "Featured" },
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  noProducts: { id: "Belum ada produk", en: "No products yet" },

  // Blog Page
  allBlogs: { id: "Semua Blog", en: "All Blogs" },
  searchBlogs: { id: "Cari blog...", en: "Search blogs..." },
  addBlog: { id: "Tambah Blog", en: "Add Blog" },
  editBlog: { id: "Edit Blog", en: "Edit Blog" },
  deleteBlog: { id: "Hapus Blog", en: "Delete Blog" },
  blogTitle: { id: "Judul Blog", en: "Blog Title" },
  content: { id: "Konten", en: "Content" },
  excerpt: { id: "Ringkasan", en: "Excerpt" },
  author: { id: "Penulis", en: "Author" },
  published: { id: "Dipublikasikan", en: "Published" },
  noBlogs: { id: "Belum ada blog", en: "No blogs yet" },
  readMore: { id: "Baca Selengkapnya", en: "Read More" },

  // Common
  loading: { id: "Memuat...", en: "Loading..." },
  error: { id: "Terjadi kesalahan", en: "An error occurred" },
  success: { id: "Berhasil", en: "Success" },
  confirm: { id: "Konfirmasi", en: "Confirm" },
  actions: { id: "Aksi", en: "Actions" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("id");

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
