import { CheckCircle, Award, TrendingUp, Users } from "lucide-react";

const achievements = [
  {
    icon: Award,
    number: "ISO 9001:2015",
    label: "Certified Quality Management",
  },
  {
    icon: TrendingUp,
    number: "99.5%",
    label: "On-Time Delivery Rate",
  },
  {
    icon: Users,
    number: "50+",
    label: "Brand Partnerships",
  },
  {
    icon: CheckCircle,
    number: "24/7",
    label: "Technical Support",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-block">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
              <div className="h-1 w-12 bg-primary mt-2" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-6 mb-6">
              Building Trust Through Quality & Reliability
            </h2>

            <p className="text-muted-foreground text-lg mb-6">
              For over 15 years, we have been the backbone of manufacturing and construction 
              industries, supplying premium electrical and mechanical components from 
              world-renowned brands.
            </p>

            <p className="text-muted-foreground mb-8">
              Our deep understanding of procurement challenges allows us to deliver 
              not just products, but comprehensive solutions that optimize your supply 
              chain and reduce operational downtime.
            </p>

            <div className="space-y-4">
              {[
                "Authorized distributor for major international brands",
                "Extensive inventory for immediate availability",
                "Competitive pricing with volume discounts",
                "Expert technical consultation included",
              ].map((item, index) => (
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
