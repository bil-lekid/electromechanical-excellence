import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground" role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm sm:text-lg">PP</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-lg leading-tight">PRIMA PUTRA</span>
                <span className="text-primary text-xs sm:text-sm font-medium leading-tight">PERKASA</span>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-xs sm:text-sm mb-3 sm:mb-4">
              {t("footerDesc")}
            </p>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-secondary-foreground/70">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>(021) 6246441</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-all">sales@primaputraperkasa.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <span>Lindeteves Trade Centre Lt. 2 Blok B20 No. 6, Jl. Hayam Wuruk No. 127, Jakarta Barat</span>
              </div>
            </div>
          </div>

          {/* Layanan */}
          <div className="hidden sm:block">
            <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">{t("servicesTitle")}</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-secondary-foreground/70">
              <li><span>{t("electricalComponents")}</span></li>
              <li><span>{t("mechanicalParts")}</span></li>
              <li><span>{t("pipeFitting")}</span></li>
              <li><span>{t("toolsEquipment")}</span></li>
              <li><span>{t("safetyPPE")}</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">{t("quickLinks")}</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-secondary-foreground/70">
              <li><a href="#about" className="hover:text-primary transition-colors">{t("aboutUs")}</a></li>
              <li><a href="#why-us" className="hover:text-primary transition-colors">{t("whyChooseUs")}</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">{t("contact")}</a></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">{t("authorizedBrands")}</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-secondary-foreground/70">
              <span>Schneider</span>
              <span>Omron</span>
              <span>Panasonic</span>
              <span>Legrand</span>
              <span>SKF</span>
              <span>Bosch</span>
              <span>Makita</span>
              <span>Chint</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm text-secondary-foreground/60 text-center sm:text-left">
            <span>© 2025 CV Prima Putra Perkasa. {t("allRightsReserved")}</span>
            <span>General Supplier Electrical & Mechanical</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
