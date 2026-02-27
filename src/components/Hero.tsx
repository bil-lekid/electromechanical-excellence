import { ArrowRight, Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-industrial.jpg";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center py-20 pt-28 md:pt-32 lg:pt-36" aria-label="Hero - CV Prima Putra Perkasa">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Industrial manufacturing facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/85 to-secondary/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-2xl animate-fade-in">
          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 bg-primary px-3 sm:px-4 py-1.5 sm:py-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-medium text-xs sm:text-sm">
                {t("quoteIn2Hours")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-3 sm:px-4 py-1.5 sm:py-2">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-medium text-xs sm:text-sm">
                {t("guarantee100Authentic")}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight">
            {t("heroPainPoint")}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-3 sm:mb-4 max-w-xl font-medium">
            {t("heroSubheadline")}
          </p>

          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/70 mb-6 sm:mb-8 max-w-xl">
            {t("heroDescription")}
          </p>

          {/* Key benefits */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[t("benefitStock"), t("benefitPrice"), t("benefitDelivery")].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/80">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a href="https://wa.me/6287885572522" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base px-6 sm:px-8 group w-full sm:w-auto"
              >
                {t("requestQuoteNow")}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="https://wa.me/6287885572522" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-secondary text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto"
              >
                {t("contactSales")}
              </Button>
            </a>
          </div>

          {/* Quick stats */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-4 sm:gap-8">
            <div className="group text-center sm:text-left">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">20+</div>
              <div className="text-primary-foreground/70 text-xs sm:text-sm">{t("yearsExperience")}</div>
            </div>
            <div className="group text-center sm:text-left">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">500+</div>
              <div className="text-primary-foreground/70 text-xs sm:text-sm">{t("activeClients")}</div>
            </div>
            <div className="group text-center sm:text-left">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/70 text-xs sm:text-sm">{t("productsSKU")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
