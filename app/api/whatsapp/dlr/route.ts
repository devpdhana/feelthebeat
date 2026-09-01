import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[WHATSAPP DLR] Webhook status update received");

    // ValueFirst DLR typical format:
    // { guid: "...", status: "DELIVERED" | "FAILED" | "UNDELIVERED", reason: "...", ... }
    const guid = body?.guid || body?.message_id || body?.id;
    const status = body?.status || body?.statustext || body?.dlr_status;
    const errorReason = body?.reason || body?.error || body?.errortext || null;

    if (guid) {
      const isDelivered = String(status).toUpperCase().includes("DELIVER");
      const isFailed = String(status).toUpperCase().includes("FAIL") || String(status).toUpperCase().includes("UNDELIV") || String(status).toUpperCase().includes("REJECT");

      await supabaseAdmin
        .from("registrations")
        .update({
          whatsapp_status: isDelivered ? "DELIVERED" : isFailed ? "FAILED" : status,
          whatsapp_error: errorReason,
        })
        .eq("whatsapp_message_id", guid);
    }

    return NextResponse.json({ success: true, message: "DLR acknowledged" });
  } catch (err: any) {
    console.error("[WHATSAPP DLR WEBHOOK ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  console.log("[WHATSAPP DLR GET CALLBACK]:", url.search);
  return NextResponse.json({ status: "DLR endpoint active" });
}
