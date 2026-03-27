import { motion } from "framer-motion";

const partners = [
  "Thomas Cook", "Veena World", "Cordelia Cruises", "PickYourTrail", "GT Holidays", "Akbar Travels"
];

const TrustBar = () => {
  return (
    <section className="py-8 border-b bg-card">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] shrink-0">
            Trusted by
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            {partners.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-xs font-heading font-semibold text-muted-foreground/30 select-none whitespace-nowrap"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
