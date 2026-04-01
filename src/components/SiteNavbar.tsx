import { useEffect, useState } from "react";
import sankashLogo from "@/assets/sankash-logo-primary.svg";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AGENT_LOGIN_URL, AGENT_SIGNUP_URL } from "@/lib/constants";
import { trackAgentSignupClick, trackAgentLoginClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "For Travel Agents", href: "/for-travel-agents" },
  { label: "For Travelers", href: "/for-travelers" },
  { label: "Solutions", href: "/solutions" },
  { label: "Integrations", href: "/developers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const MOBILE_NAV_TOP = 56;

const SiteNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const { body, documentElement } = document;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyOverscroll = body.style.overscrollBehavior;
    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyWidth = body.style.width;
    const originalHtmlOverflow = documentElement.style.overflow;
    const originalHtmlOverscroll = documentElement.style.overscrollBehavior;
    const scrollY = window.scrollY;

    if (mobileOpen) {
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      documentElement.style.overflow = "hidden";
      documentElement.style.overscrollBehavior = "none";
    }

    return () => {
      body.style.overflow = originalBodyOverflow;
      body.style.overscrollBehavior = originalBodyOverscroll;
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.width = originalBodyWidth;
      documentElement.style.overflow = originalHtmlOverflow;
      documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      if (mobileOpen) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => setMobileOpen(false);

  const mobileMenu = mobileOpen ? (
    <div
      aria-label="Mobile navigation menu"
      aria-modal="true"
      className="fixed left-0 right-0 bottom-0 z-[9998] bg-background md:hidden"
      role="dialog"
      style={{ top: `${MOBILE_NAV_TOP}px` }}
    >
      <div
        className="flex flex-col overflow-hidden bg-background"
        style={{ height: `calc(100dvh - ${MOBILE_NAV_TOP}px)` }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-4">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={closeMobileMenu}
                className="block rounded-lg px-3 py-3 text-[15px] font-medium text-foreground transition-colors active:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { trackAgentSignupClick(); closeMobileMenu(); }} className="flex-1">
              <Button variant="outline" size="default" className="w-full text-sm">
                Agent Signup
              </Button>
            </a>
            <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => { trackAgentLoginClick(); closeMobileMenu(); }} className="flex-1">
              <Button size="default" className="w-full text-sm">
                Agent Login
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 border-b z-[9999]",
          mobileOpen ? "bg-background" : "bg-background/90 backdrop-blur-xl",
        )}
      >
        <div className="container mx-auto flex items-center justify-between h-14 lg:h-16 px-4">
          <Link to="/" className="flex h-12 lg:h-14 items-center shrink-0 pr-2" aria-label="SanKash home">
            <img src={sankashLogo} alt="SanKash logo" className="h-11 lg:h-12 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                  isActive(item.href) ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a href={AGENT_SIGNUP_URL} target="_blank" rel="noopener noreferrer" onClick={trackAgentSignupClick}>
              <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground">
                Agent Signup
              </Button>
            </a>
            <a href={AGENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" onClick={trackAgentLoginClick}>
              <Button size="sm" className="text-[13px]">
                Agent Login
              </Button>
            </a>
          </div>

          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileMenu}
    </>
  );
};

export default SiteNavbar;
