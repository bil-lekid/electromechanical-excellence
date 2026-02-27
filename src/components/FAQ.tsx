import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";

const FAQ = () => {
  const { t, language } = useLanguage();

  const faqs = [
    {
      q: language === "id" ? "Apa saja kategori produk yang tersedia di CV Prima Putra Perkasa?" : "What product categories are available at CV Prima Putra Perkasa?",
      a: language === "id" 
        ? "Kami menyediakan 6 kategori utama: Komponen Elektrikal (circuit breaker, kontaktor, relay), Komponen Mekanikal (bearing, gearbox), Pipa & Fitting, Cat, Perkakas (Makita, Bosch), serta Safety & APD." 
        : "We provide 6 main categories: Electrical Components (circuit breakers, contactors, relays), Mechanical Components (bearings, gearboxes), Pipes & Fittings, Paint, Tools (Makita, Bosch), and Safety & PPE.",
    },
    {
      q: language === "id" ? "Apakah produk yang dijual dijamin asli dan bergaransi?" : "Are the products sold guaranteed authentic and warranted?",
      a: language === "id" 
        ? "Ya, 100% produk kami asli dan bersumber langsung dari produsen atau distributor resmi. Semua produk dilengkapi garansi resmi dan kami membantu proses klaim garansi." 
        : "Yes, 100% of our products are authentic and sourced directly from manufacturers or authorized distributors. All products come with official warranty and we assist with warranty claims.",
    },
    {
      q: language === "id" ? "Berapa lama waktu pengiriman pesanan?" : "How long does order delivery take?",
      a: language === "id" 
        ? "Untuk barang ready stock, pengiriman bisa dilakukan di hari yang sama (same-day delivery). Untuk barang indent atau custom, estimasi waktu akan diinformasikan saat konfirmasi pesanan." 
        : "For ready stock items, delivery can be done the same day. For indent or custom items, the estimated time will be communicated upon order confirmation.",
    },
    {
      q: language === "id" ? "Apakah ada minimum order untuk pembelian?" : "Is there a minimum order for purchases?",
      a: language === "id" 
        ? "Tidak ada minimum order. Kami melayani pembelian dalam jumlah kecil maupun besar dengan harga kompetitif. Diskon volume tersedia untuk pesanan berulang." 
        : "There is no minimum order. We serve both small and large purchases at competitive prices. Volume discounts are available for repeat orders.",
    },
    {
      q: language === "id" ? "Bagaimana cara mendapatkan penawaran harga?" : "How can I get a price quotation?",
      a: language === "id" 
        ? "Anda bisa menghubungi kami melalui WhatsApp di +62 878-8557-2522, telepon (021) 6246441, atau email sales@primaputraperkasa.com. Kami memberikan penawaran dalam waktu 2 jam." 
        : "You can contact us via WhatsApp at +62 878-8557-2522, phone (021) 6246441, or email sales@primaputraperkasa.com. We provide quotations within 2 hours.",
    },
    {
      q: language === "id" ? "Di mana lokasi kantor CV Prima Putra Perkasa?" : "Where is CV Prima Putra Perkasa's office located?",
      a: language === "id" 
        ? "Kantor kami berlokasi di Lindeteves Trade Centre Lt. 2 Blok B20 No. 6, Jl. Hayam Wuruk No. 127, Jakarta Barat. Jam operasional: Senin-Jumat 08:00-17:00, Sabtu 08:00-12:00." 
        : "Our office is located at Lindeteves Trade Centre 2nd Floor Block B20 No. 6, Jl. Hayam Wuruk No. 127, West Jakarta. Operating hours: Mon-Fri 08:00-17:00, Sat 08:00-12:00.",
    },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
    script.id = "faq-jsonld";
    const existing = document.getElementById("faq-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById("faq-jsonld");
      if (el) el.remove();
    };
  }, [language]);

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-background" aria-label="Pertanyaan yang sering diajukan">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 sm:mt-4 mb-4">
            {language === "id" ? "Pertanyaan yang Sering Diajukan" : "Frequently Asked Questions"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {language === "id" 
              ? "Temukan jawaban atas pertanyaan umum tentang produk dan layanan kami." 
              : "Find answers to common questions about our products and services."}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`} className="border border-border bg-card px-4 sm:px-6">
              <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-foreground hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
