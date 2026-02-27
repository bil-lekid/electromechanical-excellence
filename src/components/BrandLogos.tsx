import { useLanguage } from "@/contexts/LanguageContext";
import abbLogo from "@/assets/logos/abb-logo.png";
import siemensLogo from "@/assets/logos/siemens-logo.png";
import mitsubishiLogo from "@/assets/logos/mitsubishi-electric-logo.png";

const BrandLogos = () => {
  const { t } = useLanguage();

  const brands = [
    { name: "Schneider Electric", logo: null, text: "SCHNEIDER" },
    { name: "Omron", logo: null, text: "OMRON" },
    { name: "Panasonic", logo: null, text: "PANASONIC" },
    { name: "Legrand", logo: null, text: "LEGRAND" },
    { name: "SKF", logo: null, text: "SKF" },
    { name: "Bosch", logo: null, text: "BOSCH" },
    { name: "Makita", logo: null, text: "MAKITA" },
    { name: "Chint", logo: null, text: "CHINT" },
  ];

  return (
    <section className="py-8 sm:py-12 bg-background border-y border-border" aria-label="Brand resmi yang kami distribusikan">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-muted-foreground text-xs sm:text-sm font-medium uppercase tracking-wider">
            {t("authorizedDistributorFor")}
          </span>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer flex items-center justify-center h-8 sm:h-10 md:h-12 w-full"
              title={brand.name}
            >
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-6 sm:h-8 md:h-10 w-auto object-contain max-w-full"
                />
              ) : (
                <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground hover:text-foreground transition-colors tracking-tight text-center">
                  {brand.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
