import { useLanguage } from "@/contexts/LanguageContext";

const Clients = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
            {t("trustedByIndustry")}
          </span>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">
            {t("clientsDesc")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Clients;
