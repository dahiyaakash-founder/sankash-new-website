import { Link } from "react-router-dom";
import sankashMark from "@/assets/sankash-mark.png";

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
      { label: "Travel Agents", href: "/for-travel-agents" },
      { label: "Travelers", href: "/for-travelers" },
      { label: "Integrations", href: "/developers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/about" },
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
    <footer className="bg-brand-deep">
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center" aria-label="SanKash home">
              <img src={sankashMark} alt="SanKash logo" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-[13px] text-primary-foreground/40 leading-relaxed">
              Lending. Insurance. Payments.<br />Built for travel growth.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold text-primary-foreground/80 text-[13px] mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[13px] text-primary-foreground/35 hover:text-primary-foreground/60 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/8 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-primary-foreground/25">© {new Date().getFullYear()} SanKash. All rights reserved.</p>
          <p className="text-[11px] text-primary-foreground/25">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
