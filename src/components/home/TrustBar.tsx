import { motion } from "framer-motion";

const logos = [
  "Thomas Cook", "Veena World", "Cordelia Cruises", "PickYourTrail", "GT Holidays", "Akbar Travels"
];

const TrustBar = () => {
  return (
    <section className="py-10 border-b bg-background">
      <div className="container">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          Trusted by India's leading travel brands
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-sm font-heading font-semibold text-muted-foreground/40 select-none"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
