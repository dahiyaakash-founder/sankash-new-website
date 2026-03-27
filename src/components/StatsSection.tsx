const stats = [
  { value: "8K+", label: "Travel Agents" },
  { value: "500K+", label: "Customers Serviced" },
  { value: "20%", label: "Surge in Queries" },
  { value: "40%", label: "Higher Conversion" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary-foreground">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-primary-foreground/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
