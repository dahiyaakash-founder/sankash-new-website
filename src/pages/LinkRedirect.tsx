import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LEGACY_APP_HOSTS = {
  prod: "app.sankash.in",
  uat: "app-uat.sankash.in",
  dev: "app-dev.sankash.in",
};

function getLegacyEnvironment(pathname: string) {
  if (pathname.startsWith("/uat/")) return { env: "uat" as const, pathname: pathname.replace(/^\/uat/, "") };
  if (pathname.startsWith("/dev/")) return { env: "dev" as const, pathname: pathname.replace(/^\/dev/, "") };
  return { env: "prod" as const, pathname };
}

function buildLegacyRedirect(pathname: string, search: string) {
  const legacy = getLegacyEnvironment(pathname);
  const destination = new URL(`https://${LEGACY_APP_HOSTS[legacy.env]}`);
  destination.search = search;

  if (legacy.pathname.startsWith("/customer_check_eligibility/") || legacy.pathname.startsWith("/cce/")) {
    destination.pathname = `/api/v1/link${legacy.pathname}`;
    return destination.toString();
  }

  if (legacy.pathname.startsWith("/qr/")) {
    destination.pathname = `/api/v1${legacy.pathname}`;
    return destination.toString();
  }

  const promiseMatch = legacy.pathname.match(/^\/link\/app\/promise\/([^/]+)$/);
  if (promiseMatch) {
    destination.pathname = `/api/v1/link/app/promise/${promiseMatch[1]}`;
    return destination.toString();
  }

  const shortLinkMatch = legacy.pathname.match(/^\/link\/([a-zA-Z0-9]{7})$/);
  if (shortLinkMatch) {
    destination.pathname = `/api/v1/link/${shortLinkMatch[1]}`;
    return destination.toString();
  }

  if (legacy.pathname === "/link") {
    const id = new URLSearchParams(search).get("id");
    if (id) {
      destination.pathname = `/api/v1/link/${encodeURIComponent(id)}`;
      return destination.toString();
    }
  }

  return `https://${LEGACY_APP_HOSTS[legacy.env]}${legacy.pathname}${search}`;
}

/**
 * Mirrors the old Express redirects for legacy SanKash app links.
 */
const LinkRedirect = () => {
  const location = useLocation();

  useEffect(() => {
    const destination = buildLegacyRedirect(location.pathname, location.search);
    window.location.replace(destination);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Redirecting…</p>
    </div>
  );
};

export default LinkRedirect;
