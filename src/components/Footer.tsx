const Footer = () => {
  return (
    <footer className="bg-foreground text-background/70 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xl font-extrabold text-background">
                San<span className="text-primary">Kash</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              India's largest travel-focused financial platform, bridging the gap between travel and finance.
            </p>
          </div>

          {[
            {
              title: "Company",
              links: ["About Us", "Careers", "Blog", "Press"],
            },
            {
              title: "Solutions",
              links: ["Travel Now Pay Later", "POS Financing", "Travel Insurance", "Agent Platform"],
            },
            {
              title: "Support",
              links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-background mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm">
          © {new Date().getFullYear()} SanKash. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
