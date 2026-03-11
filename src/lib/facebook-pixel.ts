/**
 * Facebook Pixel + CAPI Integration
 * - Client-side: loads pixel, fires browser events
 * - Server-side: sends matching events via Edge Function with hashed user data
 * - Deduplication: shared event_id between browser & server events
 */

import { api } from "./api";

type FBQ = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FBQ;
    _fbq?: FBQ;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getFbp(): string | null {
  return getCookie("_fbp");
}

export function getFbc(): string | null {
  // First check cookie
  const cookie = getCookie("_fbc");
  if (cookie) return cookie;
  // Fallback: build from fbclid URL param
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`;
  }
  return null;
}

// ─── Pixel (Browser-side) ──────────────────────────────────────────

let pixelInitialized = false;

export function initPixel(pixelId: string) {
  if (pixelInitialized || !pixelId) return;

  // Standard Facebook Pixel base code
  (function (f: Window, b: Document, e: string, v: string, n?: FBQ, t?: HTMLScriptElement, s?: Element) {
    if (f.fbq) return;
    n = f.fbq = ((...args: unknown[]) => {
      if (!n) return;
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue?.push(args);
      }
    }) as FBQ;
    f.fbq = n;
    if (!f._fbq) {
      f._fbq = n;
    }
    n.push = (...args: unknown[]) => {
      n?.queue?.push(args);
    };
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq?.("init", pixelId);
  pixelInitialized = true;
}

/**
 * Fire a browser-side pixel event with a shared event_id for dedup
 */
export function trackPixelEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string
) {
  if (!window.fbq) return;
  const id = eventId || generateEventId();
  window.fbq("track", eventName, params, { eventID: id });
  return id;
}

// ─── CAPI (Server-side via Edge Function) ──────────────────────────

export interface CAPIUserData {
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  email?: string;
}

export interface CAPIEventPayload {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl: string;
  userData: CAPIUserData;
  customData?: Record<string, unknown>;
  // Auto-collected
  fbp?: string | null;
  fbc?: string | null;
  userAgent?: string;
}

function normalizeUserData(userData: CAPIUserData) {
  const normalized = { ...userData };

  if (normalized.firstName && !normalized.lastName) {
    const parts = normalized.firstName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      normalized.firstName = parts[0];
      normalized.lastName = parts.slice(1).join(" ");
    }
  }

  return normalized;
}

/**
 * Send a server-side event via CAPI Edge Function.
 * The Edge Function handles:
 * - SHA-256 hashing of PII (phone, name, city, state, email)
 * - Forwarding IP from client
 * - Sending to Facebook Graph API
 */
export async function sendCAPIEvent(payload: CAPIEventPayload) {
  const userData = normalizeUserData(payload.userData);
  const body = {
    event_name: payload.eventName,
    event_id: payload.eventId,
    event_time: payload.eventTime || Math.floor(Date.now() / 1000),
    event_source_url: payload.eventSourceUrl,
    user_data: {
      ph: userData.phone || null,
      fn: userData.firstName || null,
      ln: userData.lastName || null,
      ct: userData.city || null,
      st: userData.state || null,
      em: userData.email || null,
      fbp: payload.fbp ?? getFbp(),
      fbc: payload.fbc ?? getFbc(),
      client_user_agent: payload.userAgent || navigator.userAgent,
    },
    custom_data: payload.customData || {},
  };

  try {
    const data = await api.post('/integrations/facebook-capi', body);

    if (!data.success) {
      console.error("[CAPI] Error sending event:", data);
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[CAPI] Backend failure:", error);
    return { success: false, error };
  }
}

/**
 * Convenience: fire both Pixel + CAPI for the same event (deduplication via event_id)
 */
export async function trackEvent(
  eventName: string,
  userData: CAPIUserData,
  customData: Record<string, unknown> = {}
) {
  const eventId = generateEventId();

  // 1. Browser-side pixel
  trackPixelEvent(eventName, customData, eventId);

  // 2. Server-side CAPI
  sendCAPIEvent({
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    userData,
    customData,
    fbp: getFbp(),
    fbc: getFbc(),
    userAgent: navigator.userAgent,
  });

  return eventId;
}
