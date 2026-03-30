import { useEffect, useState } from "react";
import sankashLogo from "@/assets/sankash-logo-primary.svg";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { AGENT_LOGIN_URL, AGENT_SIGNUP_URL } from "@/lib/constants";

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

const MOBILE_NAV_TOP = 56;

const SiteNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
  };

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
          <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground">
              Agent Signup
            </Button>
          </a>
          <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="text-[13px]">Agent Login</Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu — true fixed full-screen overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/60"
          style={{ top: `${MOBILE_NAV_TOP}px` }}
        >
          <div
            className="grid overflow-hidden"
            style={{
              height: `calc(100dvh - ${MOBILE_NAV_TOP}px)`,
              maxHeight: `calc(100vh - ${MOBILE_NAV_TOP}px)`,
              gridTemplateRows: "minmax(0,1fr) auto",
            }}
          >
          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pt-2 pb-4">
            <div className="space-y-0.5">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground"
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="space-y-0.5 pb-1 pl-3">
                        {item.dropdown.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            onClick={closeMobileMenu}
                            className="block rounded-lg px-3 py-2 text-[13px] text-muted-foreground"
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
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="shrink-0 border-t border-border/60 bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="flex-1">
                <Button variant="outline" size="default" className="w-full text-sm">Agent Signup</Button>
              </a>
              <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="flex-1">
                <Button size="default" className="w-full text-sm">Agent Login</Button>
              </a>
            </div>
          </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteNavbar;
