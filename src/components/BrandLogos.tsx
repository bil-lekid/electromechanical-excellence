import { useLanguage } from "@/contexts/LanguageContext";

const BrandLogos = () => {
  const { t } = useLanguage();

  const brands = [
    { name: "Schneider Electric", logo: "SCHNEIDER" },
    { name: "ABB", logo: "ABB" },
    { name: "Siemens", logo: "SIEMENS" },
    { name: "Omron", logo: "OMRON" },
    { name: "Mitsubishi Electric", logo: "MITSUBISHI" },
    { name: "Phoenix Contact", logo: "PHOENIX" },
    { name: "SKF", logo: "SKF" },
    { name: "NSK", logo: "NSK" },
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
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
              title={brand.name}
            >
              <div className="px-4 py-2 bg-muted border border-border font-bold text-lg text-muted-foreground hover:text-primary transition-colors">
                {brand.logo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
