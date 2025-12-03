import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Contact Info */}
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("contactUs")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              {t("discussRequirements")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("contactDesc")}
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("officeAddress")}</h4>
                  <p className="text-muted-foreground">
                    Jl. Industri Raya No. 123<br />
                    Jakarta Industrial Park, 12345
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("phoneNumber")}</h4>
                  <p className="text-muted-foreground">
                    +62 21 1234 5678<br />
                    +62 812 3456 7890 (WhatsApp)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("email")}</h4>
                  <p className="text-muted-foreground">
                    sales@primaptra.com<br />
                    support@primaptra.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t("businessHours")}</h4>
                  <p className="text-muted-foreground">
                    Senin - Jumat: 08:00 - 17:00<br />
                    Sabtu: 08:00 - 12:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-card border border-border p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">{t("requestAQuote")}</h3>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("fullName")} *
                  </label>
                  <input
                    type="text"
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
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={t("requirementsPlaceholder")}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6"
              >
                {t("submitInquiry")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
