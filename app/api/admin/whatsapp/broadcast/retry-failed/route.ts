import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendBroadcastWhatsApp } from "@/lib/whatsapp";

async function authenticateAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let token = authHeader?.split(" ")[1];

  if (!token || token === "undefined" || token === "null" || token === "") {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(^| )sb-access-token=([^;]+)/);
    token = match ? match[2] : undefined;
  }

  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/whatsapp/broadcast/retry-failed
 * Retries only the recipients whose status was FAILED
 */
export async function POST(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let targetsToRetry: Array<{
      id?: string;
      campaign_id?: string;
      registration_id?: string;
      full_name: string;
      mobile: string;
      bib_number?: string | number | null;
      race_category: string;
    }> = body.recipients || [];

    // If no custom list passed in body, fetch all failed from whatsapp_campaign_recipients table
    if (targetsToRetry.length === 0) {
      const { data: failedRecips, error } = await supabaseAdmin
        .from("whatsapp_campaign_recipients")
        .select("id, campaign_id, registration_id, full_name, mobile, bib_number, race_category, status")
        .eq("status", "FAILED");

      if (!error && failedRecips && failedRecips.length > 0) {
        targetsToRetry = failedRecips;
      }
    }

    if (targetsToRetry.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No failed recipients found to retry.",
        retried: 0,
        sent: 0,
        failed: 0,
      });
    }

    let retriedSuccess = 0;
    let retriedFailed = 0;
    const stillFailed: any[] = [];

    for (const runner of targetsToRetry) {
      try {
        const res = await sendBroadcastWhatsApp({
          mobile: runner.mobile,
          full_name: runner.full_name,
          bib_number: runner.bib_number,
          race_category: runner.race_category,
        });

        if (res.success) {
          retriedSuccess++;
          // Update DB record to SENT
          if (runner.id) {
            await supabaseAdmin
              .from("whatsapp_campaign_recipients")
              .update({
                status: "SENT",
                message_id: res.messageId || null,
                error: null,
                sent_at: new Date().toISOString(),
              })
              .eq("id", runner.id);
          }
        } else {
          retriedFailed++;
          stillFailed.push({ ...runner, error: res.error });
          if (runner.id) {
            await supabaseAdmin
              .from("whatsapp_campaign_recipients")
              .update({
                status: "FAILED",
                error: res.error || "Retry delivery failed",
              })
              .eq("id", runner.id);
          }
        }
      } catch (err: any) {
        retriedFailed++;
        stillFailed.push({ ...runner, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Retried ${targetsToRetry.length} failed recipients. Sent: ${retriedSuccess}, Failed: ${retriedFailed}`,
      retried: targetsToRetry.length,
      sent: retriedSuccess,
      failed: retriedFailed,
      stillFailed,
    });
  } catch (err: any) {
    console.error("Retry failed broadcast error:", err);
    return NextResponse.json({ message: err.message || "Failed to retry broadcast." }, { status: 500 });
  }
}
