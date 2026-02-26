import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "Budi Santoso",
      position: t("purchasingManager"),
      company: "PT Astra Manufacturing",
      quote: t("testimonial1"),
      rating: 5,
    },
    {
      name: "Dewi Pratiwi",
      position: t("procurementHead"),
      company: "PT Indofood Sukses",
      quote: t("testimonial2"),
      rating: 5,
    },
    {
      name: "Ahmad Hidayat",
      position: t("maintenanceManager"),
      company: "PT Krakatau Steel",
      quote: t("testimonial3"),
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="min-h-screen flex items-center py-12 sm:py-16 lg:py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
            {t("testimonialsTitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6 text-foreground">
            {t("trustedByIndustry")}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            {t("testimonialsDesc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-5 sm:p-6 lg:p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
            >
              <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-primary/20 mb-3 sm:mb-4 group-hover:text-primary/40 transition-colors" />
              
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground/80 mb-4 sm:mb-6 italic leading-relaxed text-sm sm:text-base">
                "{testimonial.quote}"
              </p>

              <div className="border-t border-border pt-3 sm:pt-4">
                <div className="font-bold text-foreground text-sm sm:text-base">{testimonial.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.position}</div>
                <div className="text-xs sm:text-sm text-primary font-medium">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
