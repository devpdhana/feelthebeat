import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function processDlrUpdate(payload: any) {
  const guid = payload?.guid || payload?.message_id || payload?.id || payload?.submissionid || payload?.msgid;
  const statusRaw = payload?.status || payload?.statustext || payload?.dlr_status || payload?.state || payload?.status_code || "";
  const errorReason = payload?.reason || payload?.error || payload?.errortext || payload?.description || null;

  if (!guid) {
    return { success: false, reason: "No guid found in DLR payload" };
  }

  const upperStatus = String(statusRaw).toUpperCase();
  let finalStatus = "DELIVERED";

  if (upperStatus.includes("READ") || upperStatus.includes("OPENED")) {
    finalStatus = "READ";
  } else if (upperStatus.includes("DELIVER")) {
    finalStatus = "DELIVERED";
  } else if (
    upperStatus.includes("FAIL") ||
    upperStatus.includes("UNDELIV") ||
    upperStatus.includes("REJECT") ||
    upperStatus.includes("EXPIRE") ||
    upperStatus.includes("INVALID")
  ) {
    finalStatus = "FAILED";
  } else if (upperStatus.includes("SENT") || upperStatus.includes("SUBMIT") || upperStatus.includes("ACCEPT")) {
    finalStatus = "SUBMITTED";
  } else {
    finalStatus = statusRaw || "DELIVERED";
  }

  // 1. Update registrations by whatsapp_message_id
  const { data: updatedByMsgId } = await supabaseAdmin
    .from("registrations")
    .update({
      whatsapp_status: finalStatus,
      whatsapp_error: finalStatus === "FAILED" ? (errorReason || "Delivery failed at provider/carrier level") : null,
    })
    .eq("whatsapp_message_id", guid)
    .select("id");

  // Fallback for registrations: If not matched by GUID, check if guid corresponds to registration_number or ID
  if (!updatedByMsgId || updatedByMsgId.length === 0) {
    await supabaseAdmin
      .from("registrations")
      .update({
        whatsapp_status: finalStatus,
        whatsapp_error: finalStatus === "FAILED" ? (errorReason || "Delivery failed at provider/carrier level") : null,
      })
      .or(`registration_number.eq.${guid},id.eq.${guid}`);
  }

  // 2. Update broadcast campaign recipients by message_id (GUID)
  try {
    const { data: campRecipients } = await supabaseAdmin
      .from("whatsapp_campaign_recipients")
      .update({
        status: finalStatus,
        error: finalStatus === "FAILED" ? (errorReason || "Delivery failed at provider/carrier level") : null,
      })
      .eq("message_id", guid)
      .select("campaign_id");

    if (campRecipients && campRecipients.length > 0) {
      const campaignId = campRecipients[0].campaign_id;
      if (campaignId) {
        // Sync aggregate delivery counts to whatsapp_campaigns
        const { data: allCampaignRecs } = await supabaseAdmin
          .from("whatsapp_campaign_recipients")
          .select("status")
          .eq("campaign_id", campaignId);

        if (allCampaignRecs) {
          const deliveredCount = allCampaignRecs.filter(
            (r) => r.status === "DELIVERED" || r.status === "READ"
          ).length;
          const failedCount = allCampaignRecs.filter((r) => r.status === "FAILED").length;

          await supabaseAdmin
            .from("whatsapp_campaigns")
            .update({
              sent_count: deliveredCount,
              failed_count: failedCount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", campaignId);
        }
      }
    }
  } catch (campUpdateErr) {
    console.warn("[WHATSAPP DLR] Error updating campaign recipients:", campUpdateErr);
  }

  return { success: true, finalStatus, guid };
}

export async function POST(req: Request) {
  try {
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((val, key) => {
          body[key] = val;
        });
      }
    } else {
      const text = await req.text().catch(() => "");
      try {
        body = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        params.forEach((val, key) => {
          body[key] = val;
        });
      }
    }

    console.log("[WHATSAPP DLR POST CALLBACK]:", JSON.stringify(body));
    const result = await processDlrUpdate(body);
    return NextResponse.json({ success: true, message: "DLR acknowledged", result });
  } catch (err: any) {
    console.error("[WHATSAPP DLR WEBHOOK ERROR]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      params[key] = val;
    });

    console.log("[WHATSAPP DLR GET CALLBACK]:", JSON.stringify(params));
    const result = await processDlrUpdate(params);
    return NextResponse.json({ status: "DLR endpoint active", result });
  } catch (err: any) {
    console.error("[WHATSAPP DLR GET ERROR]:", err);
    return NextResponse.json({ status: "DLR error", error: err.message }, { status: 200 });
  }
}
