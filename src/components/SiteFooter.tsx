import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Solutions",
    links: [
      { label: "Lending", href: "/solutions/lending" },
      { label: "Insurance", href: "/solutions/insurance" },
      { label: "Payments", href: "/solutions/payments" },
      { label: "Overview", href: "/solutions" },
    ],
  },
  {
    title: "For You",
    links: [
      { label: "Travel Agents", href: "/for-agents" },
      { label: "Travelers", href: "/for-travelers" },
      { label: "Developers", href: "/developers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/about" },
      { label: "Blog", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

const SiteFooter = () => {
  return (
    <footer className="bg-slate-deep text-muted-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-background">
                San<span className="text-emerald-glow">Kash</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-60">
              Powering travel growth through Lending, Insurance, and Payments.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold text-background text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-40">© {new Date().getFullYear()} SanKash. All rights reserved.</p>
          <p className="text-xs opacity-40">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
