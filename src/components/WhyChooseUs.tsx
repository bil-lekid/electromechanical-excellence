import { Truck, Shield, HeadphonesIcon, Wallet, Clock, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseUs = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t("authenticProducts"),
      description: t("authenticDesc"),
    },
    {
      icon: Truck,
      title: t("fastDelivery"),
      description: t("fastDeliveryDesc"),
    },
    {
      icon: Wallet,
      title: t("competitivePricingTitle"),
      description: t("competitivePricingDesc"),
    },
    {
      icon: HeadphonesIcon,
      title: t("technicalExpertise"),
      description: t("technicalExpertiseDesc"),
    },
    {
      icon: Package,
      title: t("largeStock"),
      description: t("largeStockDesc"),
    },
    {
      icon: Clock,
      title: t("quickResponse"),
      description: t("quickResponseDesc"),
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("whyChooseUsTitle")}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
            {t("procurementSimple")}
          </h2>
          <p className="text-secondary-foreground/80 text-lg">
            {t("whyChooseDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Value proposition banner */}
        <div className="mt-16 bg-primary/10 border border-primary/30 p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2 Jam</div>
              <div className="text-secondary-foreground/80">{t("avgQuoteResponse")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15-30%</div>
              <div className="text-secondary-foreground/80">{t("costSavings")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-secondary-foreground/80">{t("customerSatisfaction")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
