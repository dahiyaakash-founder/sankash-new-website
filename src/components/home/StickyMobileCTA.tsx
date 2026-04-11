import { useState, useEffect } from "react";
import { Upload, Calculator, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const StickyMobileCTA = () => {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isMobile || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg px-3 py-2.5 flex gap-2 animate-in slide-in-from-bottom-4 duration-300">
      <Link to="/for-travelers#quote-upload-section" className="flex-1">
        <button className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-2.5 px-2 active:scale-[0.98] transition-transform">
          <Upload size={13} /> Review Quote
        </button>
      </Link>
      <Link to="/for-travelers#emi-section" className="flex-1">
        <button className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-primary text-primary text-xs font-semibold py-2.5 px-2 active:scale-[0.98] transition-transform">
          <Calculator size={13} /> Check EMI
        </button>
      </Link>
      <Link to="/for-travelers#build-trip-section" className="flex-1">
        <button className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-brand-green text-brand-green text-xs font-semibold py-2.5 px-2 active:scale-[0.98] transition-transform">
          <Compass size={13} /> Build Trip
        </button>
      </Link>
    </div>
  );
};

export default StickyMobileCTA;
