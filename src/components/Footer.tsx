import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">IS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">INDUSTRIAL</span>
                <span className="text-primary text-sm font-medium leading-tight">SUPPLY CO.</span>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-sm mb-4">
              Your trusted partner for electrical and mechanical industrial supplies since 2009.
            </p>
            <div className="space-y-2 text-sm text-secondary-foreground/70">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>sales@industrialsupply.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Jl. Industri Raya No. 123, Jakarta</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold mb-6">Products</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><a href="#" className="hover:text-primary transition-colors">Electrical Components</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mechanical Parts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Instrumentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cables & Wiring</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Motors & Pumps</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Automation Systems</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#products" className="hover:text-primary transition-colors">Product Catalog</a></li>
              <li><a href="#why-us" className="hover:text-primary transition-colors">Why Choose Us</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold mb-6">Authorized Brands</h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-secondary-foreground/70">
              <span>ABB</span>
              <span>Schneider</span>
              <span>Siemens</span>
              <span>Mitsubishi</span>
              <span>SKF</span>
              <span>NSK</span>
              <span>Omron</span>
              <span>Grundfos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
            <span>© 2024 Industrial Supply Co. All rights reserved.</span>
            <span>ISO 9001:2015 Certified Company</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
