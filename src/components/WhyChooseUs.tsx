import { Truck, Shield, HeadphonesIcon, Wallet, Clock, Package } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Authentic Products",
    description: "All products are sourced directly from manufacturers or authorized distributors with full warranty.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    description: "Same-day dispatch for in-stock items. Nationwide delivery with real-time tracking.",
  },
  {
    icon: Wallet,
    title: "Competitive Pricing",
    description: "Best market prices with flexible payment terms and volume discounts for repeat orders.",
  },
  {
    icon: HeadphonesIcon,
    title: "Technical Expertise",
    description: "Our engineers provide consultation to help you select the right products for your applications.",
  },
  {
    icon: Package,
    title: "Large Stock Availability",
    description: "Over 10,000 SKUs ready for immediate delivery from our centralized warehouse.",
  },
  {
    icon: Clock,
    title: "Quick Response Time",
    description: "Quotations within 2 hours, order processing same day, dedicated account managers.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
            Your Procurement Made Simple
          </h2>
          <p className="text-secondary-foreground/80 text-lg">
            We understand the pressures of procurement departments. Our solutions are 
            designed to make your job easier while ensuring quality and cost-efficiency.
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
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2 Hours</div>
              <div className="text-secondary-foreground/80">Average Quote Response</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15-30%</div>
              <div className="text-secondary-foreground/80">Cost Savings vs. Competitors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-secondary-foreground/80">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
