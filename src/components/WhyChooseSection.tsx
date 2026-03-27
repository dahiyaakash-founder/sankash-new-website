import { Banknote, Users, Zap, HeartHandshake } from "lucide-react";

const reasons = [
  {
    icon: Banknote,
    title: "Simple Payments",
    description: "No waiting — get paid in T+1 upon booking confirmation.",
  },
  {
    icon: Users,
    title: "Higher Margins",
    description: "Attract more travelers, effortlessly boosting your profits.",
  },
  {
    icon: Zap,
    title: "Instant Approval",
    description: "Real-time credit decisions with minimal documentation.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Support",
    description: "A dedicated relationship manager for every travel partner.",
  },
];

const WhyChooseSection = () => {
  return (
    <section id="about" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Why choose <span className="text-primary">SanKash</span>?
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((item) => (
            <div key={item.title} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <item.icon size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
