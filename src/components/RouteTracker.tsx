import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

const CLARITY_PROJECT_ID = "w582zyv5xn";

/**
 * Invisible component that fires page view events on SPA route changes.
 * Also initializes Microsoft Clarity on public routes (excludes /ops).
 * Must be placed inside <BrowserRouter>.
 */
const RouteTracker = () => {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);
  const clarityLoaded = useRef(false);

  // Initialize Clarity once, only on public routes — deferred to reduce main-thread blocking
  useEffect(() => {
    if (clarityLoaded.current) return;
    if (location.pathname.startsWith("/ops")) return;

    // Delay Clarity initialization to avoid blocking first paint
    const timer = setTimeout(() => {
      if (clarityLoaded.current) return;
      ((c: any, l: Document, a: string, r: string, i: string) => {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        const t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = "https://www.clarity.ms/tag/" + i;
        const y = l.getElementsByTagName(r)[0];
        y.parentNode!.insertBefore(t, y);
      })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
      clarityLoaded.current = true;
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top and track page view on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      // Reset scroll on route change (skip hash-only navigations)
      if (!location.hash) {
        window.scrollTo({ top: 0, left: 0 });
      }
      trackPageView(location.pathname);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
};

export default RouteTracker;
