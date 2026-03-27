import { ReactNode } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";

interface SiteLayoutProps {
  children: ReactNode;
}

const SiteLayout = ({ children }: SiteLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <SiteNavbar />
      </header>
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default SiteLayout;
