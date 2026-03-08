/**
 * Facebook Pixel + CAPI Integration
 * - Client-side: loads pixel, fires browser events
 * - Server-side: sends matching events via Edge Function with hashed user data
 * - Deduplication: shared event_id between browser & server events
 */

import { supabase } from "@/integrations/supabase/client";

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
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  (window as any).fbq("init", pixelId);
  (window as any).fbq("track", "PageView");
  pixelInitialized = true;
}

/**
 * Fire a browser-side pixel event with a shared event_id for dedup
 */
export function trackPixelEvent(
  eventName: string,
  params: Record<string, any> = {},
  eventId?: string
) {
  if (!(window as any).fbq) return;
  const id = eventId || generateEventId();
  (window as any).fbq("track", eventName, params, { eventID: id });
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
  customData?: Record<string, any>;
  // Auto-collected
  fbp?: string | null;
  fbc?: string | null;
  userAgent?: string;
}

/**
 * Send a server-side event via CAPI Edge Function.
 * The Edge Function handles:
 * - SHA-256 hashing of PII (phone, name, city, state, email)
 * - Forwarding IP from client
 * - Sending to Facebook Graph API
 */
export async function sendCAPIEvent(payload: CAPIEventPayload) {
  const body = {
    event_name: payload.eventName,
    event_id: payload.eventId,
    event_time: payload.eventTime || Math.floor(Date.now() / 1000),
    event_source_url: payload.eventSourceUrl,
    user_data: {
      ph: payload.userData.phone || null,
      fn: payload.userData.firstName || null,
      ln: payload.userData.lastName || null,
      ct: payload.userData.city || null,
      st: payload.userData.state || null,
      em: payload.userData.email || null,
      fbp: payload.fbp ?? getFbp(),
      fbc: payload.fbc ?? getFbc(),
      client_user_agent: payload.userAgent || navigator.userAgent,
    },
    custom_data: payload.customData || {},
  };

  const { data, error } = await supabase.functions.invoke("facebook-capi", {
    body,
  });

  if (error) {
    console.error("[CAPI] Error sending event:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Convenience: fire both Pixel + CAPI for the same event (deduplication via event_id)
 */
export function trackEvent(
  eventName: string,
  userData: CAPIUserData,
  customData: Record<string, any> = {}
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
