import { Truck, Shield, HeadphonesIcon, Wallet, Clock, Package, TrendingUp, Award, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useRef } from "react";

const AnimatedNumber = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-primary">
      {count}{suffix}
    </div>
  );
};

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

  const stats = [
    { icon: Clock, value: 2, suffix: " " + t("hours"), label: t("avgQuoteResponse") },
    { icon: TrendingUp, value: 25, suffix: "%", label: t("costSavings") },
    { icon: Award, value: 98, suffix: "%", label: t("customerSatisfaction") },
  ];

  return (
    <section id="why-us" className="py-12 sm:py-16 lg:py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">{t("whyChooseUsTitle")}</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6">
            {t("procurementSimple")}
          </h2>
          <p className="text-secondary-foreground/80 text-sm sm:text-base lg:text-lg">
            {t("whyChooseDesc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-secondary-foreground/70 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Value proposition banner with animated numbers */}
        <div className="mt-8 sm:mt-12 lg:mt-16 bg-primary/10 border border-primary/30 p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mb-2 sm:mb-4" />
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                <div className="text-secondary-foreground/80 mt-1 sm:mt-2 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
