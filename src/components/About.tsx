import { CheckCircle, Award, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const achievements = [
    {
      icon: Award,
      number: "ISO 9001:2015",
      label: t("certifiedQuality"),
    },
    {
      icon: TrendingUp,
      number: "99.5%",
      label: t("onTimeDelivery"),
    },
    {
      icon: Users,
      number: "50+",
      label: t("brandPartnerships"),
    },
    {
      icon: CheckCircle,
      number: "24/7",
      label: t("technicalSupport"),
    },
  ];

  const benefits = [
    t("authorizedDistributor"),
    t("extensiveInventory"),
    t("competitivePricing"),
    t("expertConsultation"),
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-block">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t("aboutUsTitle")}</span>
              <div className="h-1 w-12 bg-primary mt-2" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-6 mb-6">
              {t("buildingTrust")}
            </h2>

            <p className="text-muted-foreground text-lg mb-6">
              {t("aboutDesc1")}
            </p>

            <p className="text-muted-foreground mb-8">
              {t("aboutDesc2")}
            </p>

            <div className="space-y-4">
              {benefits.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Achievements */}
          <div className="grid grid-cols-2 gap-6">
            {achievements.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border p-6 hover:border-primary/50 transition-colors group"
              >
                <item.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {item.number}
                </div>
                <div className="text-muted-foreground text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
