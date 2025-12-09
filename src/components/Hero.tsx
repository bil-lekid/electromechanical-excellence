import { ArrowRight, Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-industrial.jpg";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative flex items-center" style={{ height: 'calc(100vh - var(--header-height))', marginTop: 'var(--header-height)' }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Industrial manufacturing facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-fade-in">
          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-primary px-4 py-2">
              <Clock className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-medium text-sm">
                {t("quoteIn2Hours")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-4 py-2">
              <Shield className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-medium text-sm">
                {t("guarantee100Authentic")}
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            {t("heroPainPoint")}
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/90 mb-4 max-w-xl font-medium">
            {t("heroSubheadline")}
          </p>

          <p className="text-base md:text-lg text-primary-foreground/70 mb-8 max-w-xl">
            {t("heroDescription")}
          </p>

          {/* Key benefits */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[t("benefitStock"), t("benefitPrice"), t("benefitDelivery")].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 group"
            >
              {t("requestQuoteNow")}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-secondary text-base px-8"
            >
              {t("contactSales")}
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-8">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">15+</div>
              <div className="text-primary-foreground/70 text-sm">{t("yearsExperience")}</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">500+</div>
              <div className="text-primary-foreground/70 text-sm">{t("activeClients")}</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/70 text-sm">{t("productsSKU")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
