import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendRegistrationWhatsApp } from "@/lib/whatsapp";

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
  } catch (err) {
    return null;
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await context.params;

    // 1. Fetch registration record
    const { data: reg, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (regError || !reg) {
      return NextResponse.json({ message: "Registration record not found." }, { status: 404 });
    }

    // 2. Security check: Only allow resending for verified/successful registrations
    if (reg.payment_status !== "Successful") {
      return NextResponse.json(
        { message: "Cannot send confirmation WhatsApp for unpaid or unverified registration." },
        { status: 400 }
      );
    }

    // 3. Dispatch WhatsApp message
    const waResult = await sendRegistrationWhatsApp({
      id: reg.id,
      full_name: reg.full_name,
      mobile: reg.mobile,
      registration_number: reg.registration_number,
      race_category: reg.race_category,
      payment_amount: reg.payment_amount,
      tshirt_bib_venue: reg.tshirt_bib_venue,
      tshirt_bib_venue_address: reg.tshirt_bib_venue_address,
    });

    // 4. Update registration record with WhatsApp dispatch status
    if (waResult.success) {
      await supabaseAdmin
        .from("registrations")
        .update({
          whatsapp_sent: true,
          whatsapp_sent_at: new Date().toISOString(),
          whatsapp_message_id: waResult.messageId || null,
          whatsapp_status: "SENT",
          whatsapp_error: null,
        })
        .eq("id", reg.id);

      return NextResponse.json({
        success: true,
        message: `WhatsApp message successfully dispatched to ${reg.mobile}.`,
        whatsappStatus: "SENT",
        whatsappSentAt: new Date().toISOString(),
        messageId: waResult.messageId,
      });
    } else {
      await supabaseAdmin
        .from("registrations")
        .update({
          whatsapp_sent: false,
          whatsapp_status: "FAILED",
          whatsapp_error: waResult.error || "WhatsApp failed during resend",
        })
        .eq("id", reg.id);

      return NextResponse.json(
        {
          success: false,
          message: waResult.error || "Failed to deliver WhatsApp message.",
          whatsappStatus: "FAILED",
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("Admin resend WhatsApp error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to process WhatsApp resend." },
      { status: 500 }
    );
  }
}
