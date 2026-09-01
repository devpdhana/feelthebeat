import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendBroadcastWhatsApp, normalizeMobileNumber } from "@/lib/whatsapp";

export interface CampaignState {
  id: string;
  campaign_name: string;
  template_id: string;
  status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  created_at: string;
  updated_at: string;
  failed_recipients: Array<{
    id: string;
    full_name: string;
    mobile: string;
    bib_number?: string | number | null;
    race_category: string;
    error?: string;
  }>;
}

let activeCampaign: CampaignState = {
  id: "INIT",
  campaign_name: "Bib & T-Shirt Collection Broadcast",
  template_id: "1792730",
  status: "IDLE",
  total_recipients: 0,
  sent_count: 0,
  failed_count: 0,
  pending_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  failed_recipients: [],
};

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
 * GET /api/admin/whatsapp/broadcast
 * Returns current broadcast stats, recipient readiness counts, and active/last campaign progress
 */
export async function GET(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    // 1. Query all registrations
    const { data: registrations, error } = await supabaseAdmin
      .from("registrations")
      .select("id, full_name, mobile, race_category, bib_number, payment_status, whatsapp_sent, whatsapp_status");

    if (error) {
      console.error("Broadcast stats query error:", error);
      return NextResponse.json({ message: "Database query error." }, { status: 500 });
    }

    const allRegs = registrations || [];
    const paidRegs = allRegs.filter((r) => {
      const p = (r.payment_status || "").toLowerCase();
      return p.includes("success") || p.includes("paid");
    });

    let validNumbers = 0;
    let invalidNumbers = 0;

    paidRegs.forEach((r) => {
      if (r.mobile && normalizeMobileNumber(r.mobile).isValid) {
        validNumbers++;
      } else {
        invalidNumbers++;
      }
    });

    // 2. Fetch the latest campaign from database if available
    let latestCampaign = activeCampaign;
    try {
      const { data: dbCampaigns } = await supabaseAdmin
        .from("whatsapp_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (dbCampaigns && dbCampaigns.length > 0) {
        const camp = dbCampaigns[0];
        // If activeCampaign is idle or different, sync with database
        if (activeCampaign.status !== "PROCESSING") {
          const { data: failedRecips } = await supabaseAdmin
            .from("whatsapp_campaign_recipients")
            .select("id, full_name, mobile, bib_number, race_category, error")
            .eq("campaign_id", camp.id)
            .eq("status", "FAILED");

          latestCampaign = {
            id: camp.id,
            campaign_name: camp.campaign_name,
            template_id: camp.template_id,
            status: camp.status,
            total_recipients: camp.total_recipients,
            sent_count: camp.sent_count,
            failed_count: camp.failed_count,
            pending_count: Math.max(0, camp.total_recipients - camp.sent_count - camp.failed_count),
            created_at: camp.created_at,
            updated_at: camp.updated_at,
            failed_recipients: failedRecips || [],
          };
          activeCampaign = latestCampaign;
        }
      }
    } catch (dbErr) {
      console.warn("Could not query whatsapp_campaigns table:", dbErr);
    }

    return NextResponse.json({
      success: true,
      totalRegistered: paidRegs.length,
      validWhatsAppNumbers: validNumbers,
      invalidOrMissingNumbers: invalidNumbers,
      campaign: activeCampaign,
    });
  } catch (err: any) {
    console.error("GET broadcast status error:", err);
    return NextResponse.json({ message: err.message || "Server error." }, { status: 500 });
  }
}

/**
 * POST /api/admin/whatsapp/broadcast
 * Initiates the Send-To-All broadcast campaign in controlled batches
 */
export async function POST(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    // Duplicate protection: Check if a broadcast is already running
    if (activeCampaign.status === "PROCESSING") {
      return NextResponse.json(
        {
          message: "A broadcast campaign is currently in progress. Please wait for it to complete.",
          campaign: activeCampaign,
        },
        { status: 409 }
      );
    }

    // Fetch all eligible paid registrations across 2 KM, 5 KM, and 10 KM
    const { data: registrations, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("id, full_name, mobile, race_category, bib_number, payment_status")
      .order("created_at", { ascending: true });

    if (fetchError || !registrations) {
      return NextResponse.json({ message: "Failed to load recipient registrations." }, { status: 500 });
    }

    const eligibleRecipients = registrations.filter((r) => {
      const isPaid = (r.payment_status || "").toLowerCase().includes("success") || (r.payment_status || "").toLowerCase().includes("paid");
      return isPaid && r.full_name && r.mobile && r.race_category;
    });

    if (eligibleRecipients.length === 0) {
      return NextResponse.json(
        { message: "No eligible paid registrations found to receive broadcast." },
        { status: 400 }
      );
    }

    const campaignId = `CAMP_WA_${Date.now()}`;

    // Initialize campaign state
    activeCampaign = {
      id: campaignId,
      campaign_name: "Bib & T-Shirt Collection Broadcast",
      template_id: "1792730",
      status: "PROCESSING",
      total_recipients: eligibleRecipients.length,
      sent_count: 0,
      failed_count: 0,
      pending_count: eligibleRecipients.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      failed_recipients: [],
    };

    // 1. Record campaign in Supabase database
    try {
      await supabaseAdmin.from("whatsapp_campaigns").insert({
        id: campaignId,
        campaign_name: activeCampaign.campaign_name,
        template_id: activeCampaign.template_id,
        status: "PROCESSING",
        total_recipients: activeCampaign.total_recipients,
        sent_count: 0,
        failed_count: 0,
      });

      // Batch insert recipient records with PENDING status
      const recipientInserts = eligibleRecipients.map((r) => ({
        campaign_id: campaignId,
        registration_id: r.id,
        full_name: r.full_name,
        mobile: r.mobile,
        bib_number: r.bib_number ? String(r.bib_number) : null,
        race_category: r.race_category,
        status: "PENDING",
      }));

      // Insert in chunks of 100 for safety
      for (let i = 0; i < recipientInserts.length; i += 100) {
        await supabaseAdmin
          .from("whatsapp_campaign_recipients")
          .insert(recipientInserts.slice(i, i + 100));
      }
    } catch (insertErr) {
      console.warn("Could not insert campaign records into database:", insertErr);
    }

    // 2. Process broadcast asynchronously in controlled server batches
    (async () => {
      const BATCH_SIZE = 25;
      const DELAY_BETWEEN_BATCHES_MS = 250;

      for (let i = 0; i < eligibleRecipients.length; i += BATCH_SIZE) {
        const batch = eligibleRecipients.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (runner) => {
            try {
              const res = await sendBroadcastWhatsApp({
                mobile: runner.mobile,
                full_name: runner.full_name,
                bib_number: runner.bib_number,
                race_category: runner.race_category,
              });

              if (res.success) {
                activeCampaign.sent_count++;
                // Update recipient record in DB
                await supabaseAdmin
                  .from("whatsapp_campaign_recipients")
                  .update({
                    status: "SENT",
                    message_id: res.messageId || null,
                    error: null,
                    sent_at: new Date().toISOString(),
                  })
                  .eq("campaign_id", campaignId)
                  .eq("registration_id", runner.id);
              } else {
                activeCampaign.failed_count++;
                activeCampaign.failed_recipients.push({
                  id: runner.id,
                  full_name: runner.full_name,
                  mobile: runner.mobile,
                  bib_number: runner.bib_number,
                  race_category: runner.race_category,
                  error: res.error,
                });
                // Update recipient record in DB
                await supabaseAdmin
                  .from("whatsapp_campaign_recipients")
                  .update({
                    status: "FAILED",
                    error: res.error || "Delivery failed",
                  })
                  .eq("campaign_id", campaignId)
                  .eq("registration_id", runner.id);
              }
            } catch (err: any) {
              activeCampaign.failed_count++;
              activeCampaign.failed_recipients.push({
                id: runner.id,
                full_name: runner.full_name,
                mobile: runner.mobile,
                bib_number: runner.bib_number,
                race_category: runner.race_category,
                error: err.message,
              });
              await supabaseAdmin
                .from("whatsapp_campaign_recipients")
                .update({
                  status: "FAILED",
                  error: err.message || "Exception during delivery",
                })
                .eq("campaign_id", campaignId)
                .eq("registration_id", runner.id);
            } finally {
              activeCampaign.pending_count = Math.max(
                0,
                activeCampaign.total_recipients - activeCampaign.sent_count - activeCampaign.failed_count
              );
              activeCampaign.updated_at = new Date().toISOString();
            }
          })
        );

        // Update campaign counters in DB
        try {
          await supabaseAdmin
            .from("whatsapp_campaigns")
            .update({
              sent_count: activeCampaign.sent_count,
              failed_count: activeCampaign.failed_count,
              updated_at: new Date().toISOString(),
            })
            .eq("id", campaignId);
        } catch {}

        if (i + BATCH_SIZE < eligibleRecipients.length) {
          await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
        }
      }

      activeCampaign.status = "COMPLETED";
      activeCampaign.pending_count = 0;
      activeCampaign.updated_at = new Date().toISOString();

      // Final update in DB
      try {
        await supabaseAdmin
          .from("whatsapp_campaigns")
          .update({
            status: "COMPLETED",
            sent_count: activeCampaign.sent_count,
            failed_count: activeCampaign.failed_count,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaignId);
      } catch {}
    })();

    return NextResponse.json({
      success: true,
      message: `Broadcast started for ${eligibleRecipients.length} participants.`,
      campaign: activeCampaign,
    });
  } catch (err: any) {
    console.error("Broadcast POST error:", err);
    return NextResponse.json({ message: err.message || "Failed to start broadcast." }, { status: 500 });
  }
}
