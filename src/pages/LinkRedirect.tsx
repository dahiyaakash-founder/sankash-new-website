import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const OLD_APP_ORIGIN = "https://app.sankash.in";

/**
 * Redirects /link?id=xxx (and any other query params) to the old SanKash app.
 * Preserves the full path and query string.
 */
const LinkRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    const destination = `${OLD_APP_ORIGIN}/link${location.search}`;
    window.location.replace(destination);
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Redirecting…</p>
    </div>
  );
};

export default LinkRedirect;
