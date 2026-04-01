import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Invisible component that fires page view events on SPA route changes.
 * Must be placed inside <BrowserRouter>.
 */
const RouteTracker = () => {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate fires for the same path
    if (prevPath.current !== location.pathname) {
      trackPageView(location.pathname);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
};

export default RouteTracker;
