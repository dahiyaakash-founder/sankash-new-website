import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  {
    label: "Solutions",
    children: [
      { label: "Overview", href: "/solutions", desc: "All products at a glance" },
      { label: "Lending", href: "/solutions/lending", desc: "Travel financing & EMI" },
      { label: "Insurance", href: "/solutions/insurance", desc: "Travel protection" },
      { label: "Payments", href: "/solutions/payments", desc: "Seamless transactions" },
    ],
  },
  { label: "For Agents", href: "/for-agents" },
  { label: "For Travelers", href: "/for-travelers" },
  { label: "Developers", href: "/developers" },
  { label: "About", href: "/about" },
];

const SiteNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">
            San<span className="text-primary">Kash</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg">
                  {item.label}
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-64">
                    <div className="bg-surface-elevated rounded-xl border shadow-card-hover p-2 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="text-sm font-medium">{child.label}</div>
                          <div className="text-xs text-muted-foreground">{child.desc}</div>
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
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href!) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/contact">
            <Button variant="outline-primary" size="sm">Book a Demo</Button>
          </Link>
          <Button size="sm" variant="default">Agent Login</Button>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg"
                  >
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="pl-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg"
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
                  className="block px-3 py-3 text-sm font-medium rounded-lg"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex gap-2 pt-3 px-3">
              <Link to="/contact" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline-primary" size="sm" className="w-full">Book a Demo</Button>
              </Link>
              <Button size="sm" className="flex-1">Agent Login</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteNavbar;
