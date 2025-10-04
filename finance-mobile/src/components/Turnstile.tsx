// src/components/Turnstile.tsx
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          action?: string;
          cData?: string;
          retry?: "auto" | "never";
          refreshExpired?: "auto" | "manual";
        }
      ) => number;
      reset?: (widgetId?: number) => void;
      remove?: (widgetId?: number) => void;
    };
  }
}

type Props = {
  sitekey: string;
  onToken: (token: string) => void;
  theme?: "light" | "dark" | "auto";
  action?: string;
};

export default function Turnstile({ sitekey, onToken, theme = "auto", action = "register" }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [ready, setReady] = useState<boolean>(Boolean(window.turnstile));

  // load script sekali
  useEffect(() => {
    if (window.turnstile) {
      setReady(true);
      return;
    }
    const id = "cf-turnstile-script";
    if (document.getElementById(id)) return;

    const s = document.createElement("script");
    s.id = id;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  // render widget
  useEffect(() => {
    if (!ready || !window.turnstile || !elRef.current) return;

    // reset widget sebelumnya
    if (widgetIdRef.current != null && window.turnstile.remove) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(elRef.current, {
      sitekey,
      theme,
      action,
      callback: (token: string) => onToken(token),
      "expired-callback": () => {
        onToken(""); // kosongkan token ketika expire
      },
      "error-callback": () => {
        onToken(""); // kosongkan juga saat error
      },
      refreshExpired: "auto",
    });

    return () => {
      if (widgetIdRef.current != null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, sitekey, theme, action, onToken]);

  return <div ref={elRef} />;
}
