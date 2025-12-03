import { Zap, Settings, Gauge, Cable, CircuitBoard, Fan } from "lucide-react";
import { Button } from "@/components/ui/button";

const productCategories = [
  {
    icon: Zap,
    title: "Electrical Components",
    description: "Circuit breakers, contactors, relays, switches, and protection devices from leading brands.",
    items: ["ABB", "Schneider Electric", "Siemens", "Mitsubishi"],
  },
  {
    icon: Settings,
    title: "Mechanical Parts",
    description: "Bearings, gearboxes, couplings, and transmission components for industrial machinery.",
    items: ["SKF", "NSK", "FAG", "NTN"],
  },
  {
    icon: Gauge,
    title: "Instrumentation",
    description: "Pressure gauges, flow meters, temperature sensors, and control instruments.",
    items: ["Yokogawa", "Endress+Hauser", "Honeywell"],
  },
  {
    icon: Cable,
    title: "Cables & Wiring",
    description: "Power cables, control cables, instrumentation wiring, and cable accessories.",
    items: ["Supreme", "Kabel Metal", "Eterna"],
  },
  {
    icon: CircuitBoard,
    title: "Automation & Control",
    description: "PLCs, HMIs, drives, and automation solutions for modern manufacturing.",
    items: ["Omron", "Allen-Bradley", "Delta"],
  },
  {
    icon: Fan,
    title: "Motors & Pumps",
    description: "Electric motors, industrial pumps, fans, and blowers for all applications.",
    items: ["Grundfos", "WEG", "Teco"],
  },
];

const Products = () => {
  return (
    <section id="products" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Comprehensive Industrial Solutions
          </h2>
          <p className="text-muted-foreground text-lg">
            From electrical components to mechanical systems, we offer a complete range 
            of products to meet your manufacturing and construction needs.
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
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Full Catalog
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
