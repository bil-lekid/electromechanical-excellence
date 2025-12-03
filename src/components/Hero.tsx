import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-industrial.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-32">
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
        <div className="max-w-2xl">
          <div className="inline-block bg-primary px-4 py-2 mb-6">
            <span className="text-primary-foreground font-medium text-sm tracking-wider uppercase">
              Electrical & Mechanical Supplier
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Your Complete
            <span className="block text-primary-foreground/90">Industrial Solutions</span>
            <span className="block">Partner</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl">
            Providing high-quality electrical and mechanical components to manufacturing 
            facilities and contractors. Trusted by leading industries across the region.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
            >
              Explore Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-secondary text-base px-8"
            >
              Contact Sales
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">15+</div>
              <div className="text-primary-foreground/70 text-sm">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">500+</div>
              <div className="text-primary-foreground/70 text-sm">Active Clients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/70 text-sm">Products SKU</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
