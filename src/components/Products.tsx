import { Zap, Settings, Gauge, Cable, CircuitBoard, Fan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Products = () => {
  const { t } = useLanguage();

  const productCategories = [
    {
      icon: Zap,
      title: t("electricalComponents"),
      description: t("electricalDesc"),
      items: ["ABB", "Schneider Electric", "Siemens", "Mitsubishi"],
    },
    {
      icon: Settings,
      title: t("mechanicalParts"),
      description: t("mechanicalDesc"),
      items: ["SKF", "NSK", "FAG", "NTN"],
    },
    {
      icon: Gauge,
      title: t("instrumentation"),
      description: t("instrumentationDesc"),
      items: ["Yokogawa", "Endress+Hauser", "Honeywell"],
    },
    {
      icon: Cable,
      title: t("cablesWiring"),
      description: t("cablesDesc"),
      items: ["Supreme", "Kabel Metal", "Eterna"],
    },
    {
      icon: CircuitBoard,
      title: t("automationControl"),
      description: t("automationDesc"),
      items: ["Omron", "Allen-Bradley", "Delta"],
    },
    {
      icon: Fan,
      title: t("motorsPumps"),
      description: t("motorsPumpsDesc"),
      items: ["Grundfos", "WEG", "Teco"],
    },
  ];

  return (
    <section id="products" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("ourProducts")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            {t("comprehensiveSolutions")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("productsDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productCategories.map((category, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 hover:border-primary transition-colors group"
            >
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <category.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">{category.title}</h3>
              <p className="text-muted-foreground mb-4">{category.description}</p>

              <div className="flex flex-wrap gap-2">
                {category.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 border border-border"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t("viewFullCatalog")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Products;
