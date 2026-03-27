import { CreditCard, Smartphone, ShieldCheck, TrendingUp } from "lucide-react";

const solutions = [
  {
    icon: CreditCard,
    title: "Travel Now, Pay Later",
    description: "Flexible EMI options that make every dream vacation affordable for your customers.",
  },
  {
    icon: Smartphone,
    title: "100% Digital Process",
    description: "Lightning-fast, paperless onboarding with seamless technology integration.",
  },
  {
    icon: ShieldCheck,
    title: "Travel Insurance",
    description: "Comprehensive coverage options to protect travelers throughout their journey.",
  },
  {
    icon: TrendingUp,
    title: "Point of Sale Financing",
    description: "Instant travel financing at the point of sale, boosting your conversion rates.",
  },
];

const SolutionsSection = () => {
  return (
    <section id="solutions" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Our <span className="text-primary">Solutions</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Innovative financial products designed specifically for the travel industry
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon size={24} className="text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
