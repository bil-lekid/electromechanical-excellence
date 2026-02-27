import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name is too long'),
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().min(8, 'Phone number is too short').max(20, 'Phone number is too long'),
  requirements: z.string().min(10, 'Please provide more details').max(2000, 'Requirements text is too long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsSubmitting(true);
    
    try {
      toast.success(t('inquirySubmitted') || 'Thank you! Your inquiry has been submitted.');
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        requirements: '',
      });
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="min-h-screen flex items-center py-12 sm:py-16 lg:py-20 bg-muted" aria-label="Hubungi CV Prima Putra Perkasa" itemScope itemType="https://schema.org/ContactPage">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Left - Contact Info */}
          <div>
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">{t("contactUs")}</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 sm:mt-4 mb-4 sm:mb-6">
              {t("discussRequirements")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
              {t("contactDesc")}
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t("officeAddress")}</h4>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Lindeteves Trade Centre Lt. 2 Blok B20 No. 6<br />
                    Jl. Hayam Wuruk No. 127, Jakarta Barat
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t("phoneNumber")}</h4>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    (021) 6246441<br />
                    +62 878-8557-2522 (WhatsApp)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t("email")}</h4>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    sales@primaputraperkasa.com
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{t("businessHours")}</h4>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Senin - Jumat: 08:00 - 17:00<br />
                    Sabtu: 08:00 - 12:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-card border border-border p-5 sm:p-6 lg:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">{t("requestAQuote")}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("fullName")} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("yourName")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("companyName")} *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("companyNamePlaceholder")}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("emailAddress")} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("phoneNumber")} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("productRequirements")} *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={t("requirementsPlaceholder")}
                />
              </div>

              <a href="https://wa.me/6287885572522" target="_blank" rel="noopener noreferrer">
                <Button 
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
                >
                  {t("submitInquiry")}
                </Button>
              </a>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
