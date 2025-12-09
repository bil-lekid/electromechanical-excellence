import { useLanguage } from "@/contexts/LanguageContext";
import abbLogo from "@/assets/logos/abb-logo.png";
import siemensLogo from "@/assets/logos/siemens-logo.png";
import mitsubishiLogo from "@/assets/logos/mitsubishi-electric-logo.png";

const BrandLogos = () => {
  const { t } = useLanguage();

  const brands = [
    { name: "Schneider Electric", logo: null, text: "Schneider Electric" },
    { name: "ABB", logo: abbLogo, text: null },
    { name: "Siemens", logo: siemensLogo, text: null },
    { name: "Omron", logo: null, text: "OMRON" },
    { name: "Mitsubishi Electric", logo: mitsubishiLogo, text: null },
    { name: "Phoenix Contact", logo: null, text: "PHOENIX CONTACT" },
    { name: "SKF", logo: null, text: "SKF" },
    { name: "NSK", logo: null, text: "NSK" },
  ];

  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t("authorizedDistributorFor")}
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer flex items-center justify-center h-12"
              title={brand.name}
            >
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-8 md:h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-bold text-lg md:text-xl text-muted-foreground hover:text-foreground transition-colors tracking-tight">
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
