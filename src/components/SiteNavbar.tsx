import { useState } from "react";
import sankashLogo from "@/assets/sankash-logo-primary.svg";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const solutionsDropdown = [
  { label: "Overview", href: "/solutions", desc: "Lending · Insurance · Payments" },
  { label: "Lending", href: "/solutions/lending", desc: "Travel financing & EMI" },
  { label: "Insurance", href: "/solutions/insurance", desc: "Embedded travel protection" },
  { label: "Payments", href: "/solutions/payments", desc: "Settlement & collections" },
];

const navItems = [
  { label: "Solutions", dropdown: solutionsDropdown },
  { label: "For Travel Agents", href: "/for-travel-agents" },
  { label: "For Travelers", href: "/for-travelers" },
  { label: "Integrations", href: "/developers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SiteNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b">
      <div className="container mx-auto flex items-center justify-between h-14 lg:h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex h-12 lg:h-14 items-center shrink-0 pr-2" aria-label="SanKash home">
          <img src={sankashLogo} alt="SanKash logo" className="h-11 lg:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
                  {item.label}
                  <ChevronDown size={12} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-1 w-56">
                    <div className="bg-card rounded-xl border shadow-card-hover p-1.5">
                      {item.dropdown.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="text-[13px] font-medium">{child.label}</div>
                          <div className="text-[11px] text-muted-foreground">{child.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.href!}
                className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                  isActive(item.href!) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <a href="https://app.sankash.in/agent/onboarding/signup" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground">
              Agent Signup
            </Button>
          </a>
          <a href="https://app.sankash.in/agent/auth/login" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="text-[13px]">Agent Login</Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b max-h-[85vh] overflow-y-auto">
          <div className="container py-3 space-y-0.5">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg"
                  >
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="pl-4 space-y-0.5 pb-1">
                      {item.dropdown.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground rounded-lg"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium rounded-lg"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex gap-2 pt-3 px-3 border-t mt-2">
              <a href="https://app.sankash.in/agent/onboarding/signup" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-sm">Agent Signup</Button>
              </a>
              <a href="https://app.sankash.in/agent/auth/login" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="sm" className="w-full text-sm">Agent Login</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteNavbar;
