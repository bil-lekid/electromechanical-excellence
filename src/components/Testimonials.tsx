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
    <section id="testimonials" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {t("testimonialsTitle")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-foreground">
            {t("trustedByIndustry")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("testimonialsDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground/80 mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="border-t border-border pt-4">
                <div className="font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                <div className="text-sm text-primary font-medium">{testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
