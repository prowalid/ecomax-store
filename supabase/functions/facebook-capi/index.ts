import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SHA-256 hash helper (lowercase hex)
async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Normalize phone: remove spaces, dashes, +; ensure digits only
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-+()]/g, "");
}

type UserData = {
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  em?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
};

type FacebookRequestBody = {
  event_name?: string;
  event_id?: string;
  event_time?: number;
  event_source_url?: string;
  user_data?: UserData;
  custom_data?: Record<string, unknown>;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PIXEL_ID = Deno.env.get("FACEBOOK_PIXEL_ID");
    const ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const TEST_EVENT_CODE = Deno.env.get("FACEBOOK_TEST_EVENT_CODE"); // optional, for testing

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "Missing FACEBOOK_PIXEL_ID or FACEBOOK_ACCESS_TOKEN secrets",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as FacebookRequestBody;
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      user_data,
      custom_data,
    } = body;

    if (!event_name || !event_id) {
      return new Response(
        JSON.stringify({ error: "event_name and event_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP from request headers (forwarded by edge runtime)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    // Build user_data with hashing
    const hashedUserData: Record<string, unknown> = {};

    // Hash required fields (PII)
    if (user_data.ph) {
      hashedUserData.ph = [await sha256(normalizePhone(user_data.ph))];
    }
    if (user_data.fn) {
      hashedUserData.fn = [await sha256(user_data.fn)];
    }
    if (user_data.ln) {
      hashedUserData.ln = [await sha256(user_data.ln)];
    }
    if (user_data.ct) {
      hashedUserData.ct = [await sha256(user_data.ct)];
    }
    if (user_data.st) {
      hashedUserData.st = [await sha256(user_data.st)];
    }
    if (user_data.em) {
      hashedUserData.em = [await sha256(user_data.em)];
    }

    // Non-hashed fields
    if (clientIp) {
      hashedUserData.client_ip_address = clientIp;
    }
    if (user_data.client_user_agent) {
      hashedUserData.client_user_agent = user_data.client_user_agent;
    }
    if (user_data.fbp) {
      hashedUserData.fbp = user_data.fbp;
    }
    if (user_data.fbc) {
      hashedUserData.fbc = user_data.fbc;
    }

    // Build the event payload
    const eventPayload: Record<string, unknown> = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: "website",
      user_data: hashedUserData,
    };

    if (custom_data && Object.keys(custom_data).length > 0) {
      eventPayload.custom_data = custom_data;
    }

    const fbPayload: Record<string, unknown> = {
      data: [eventPayload],
    };

    if (TEST_EVENT_CODE) {
      fbPayload.test_event_code = TEST_EVENT_CODE;
    }

    // Send to Facebook Graph API
    const fbUrl = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const fbResponse = await fetch(fbUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbPayload),
    });

    const fbResult = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error("[CAPI] Facebook API error:", JSON.stringify(fbResult));
      return new Response(
        JSON.stringify({
          success: false,
          error: fbResult.error?.message || "Facebook API error",
          details: fbResult,
        }),
        { status: fbResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[CAPI] Event sent: ${event_name} (id: ${event_id}) — events_received: ${fbResult.events_received}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        events_received: fbResult.events_received,
        messages: fbResult.messages || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[CAPI] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
