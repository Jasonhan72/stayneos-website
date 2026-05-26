"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function stripLocalePrefix(pathname: string) {
  return pathname.replace(/^\/(zh|fr)(?=\/|$)/, "") || "/";
}

function isStripeRoute(pathname: string | null) {
  const normalized = stripLocalePrefix(pathname || "/");
  return normalized.startsWith("/payment") || normalized.startsWith("/checkout");
}

function removeStripeInjectedElements() {
  const selectors = [
    'iframe[name^="__privateStripeFrame"]',
    'iframe[src*="stripe.com"]',
    'iframe[src*="stripe.network"]',
    'script[src*="js.stripe.com"]',
    'script[src*="stripe.network"]',
  ];

  for (const element of document.querySelectorAll(selectors.join(","))) {
    element.remove();
  }
}

export default function StripeElementScopeGuard() {
  const pathname = usePathname();
  const allowStripe = isStripeRoute(pathname);

  useEffect(() => {
    if (allowStripe) return;

    removeStripeInjectedElements();

    const observer = new MutationObserver(() => {
      removeStripeInjectedElements();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [allowStripe, pathname]);

  return null;
}
