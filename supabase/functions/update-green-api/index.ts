import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instance_id, api_token } = await req.json();

    if (!instance_id || !api_token) {
      return new Response(
        JSON.stringify({ error: "instance_id and api_token are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate credentials by calling Green API's getStateInstance
    const checkUrl = `https://api.green-api.com/waInstance${instance_id}/getStateInstance/${api_token}`;
    const checkRes = await fetch(checkUrl);
    const checkData = await checkRes.json();

    if (!checkRes.ok || checkData.stateInstance === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: "بيانات Green API غير صالحة", details: checkData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store in Deno env is not persistent — we need to use Supabase Vault or store_settings
    // For now, update the store_settings to mark as configured
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Update store_settings
    // Read current notification settings and update api_configured flag
    const { data: existing } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "whatsapp_notifications")
      .single();

    const currentValue = (existing?.value as Record<string, any>) || {};
    const updatedValue = { ...currentValue, api_configured: true };

    const { error: dbError } = await supabase
      .from("store_settings")
      .update({
        value: updatedValue,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "whatsapp_notifications");

    if (dbError) {
      console.error("[update-green-api] DB update error:", dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        state: checkData.stateInstance,
        message: "تم التحقق من بيانات Green API بنجاح",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[update-green-api] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
