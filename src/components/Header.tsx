import { useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { label: t("home"), href: "/#home" },
    { label: t("aboutUs"), href: "/#about" },
    { label: t("whyChooseUs"), href: "/#why-us" },
    { label: t("contact"), href: "/#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border" role="banner" itemScope itemType="https://schema.org/WPHeader">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground text-xs sm:text-sm py-1.5 sm:py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="tel:+62216246441" className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">(021) 6246441</span>
            </a>
            <a href="mailto:sales@primaputraperkasa.com" className="flex items-center gap-1.5 sm:gap-2 hover:text-primary transition-colors">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">sales@primaputraperkasa.com</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden lg:inline text-secondary-foreground/80">{t("trustedPartner")}</span>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4 py-3 sm:py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm sm:text-lg">PP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm sm:text-lg leading-tight">PRIMA PUTRA</span>
              <span className="text-primary text-xs sm:text-sm font-medium leading-tight">PERKASA</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
            <a href="https://wa.me/6287885572522" target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("requestQuote")}
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a href="https://wa.me/6287885572522" target="_blank" rel="noopener noreferrer">
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                  {t("requestQuote")}
                </Button>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
