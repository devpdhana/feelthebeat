import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendRegistrationSMS } from "@/lib/sms";

async function authenticateAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
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

    // 2. Security check: Only allow resending SMS for verified/successful registrations
    if (reg.payment_status !== "Successful") {
      return NextResponse.json(
        { message: "Cannot send confirmation SMS for unpaid or unverified registration." },
        { status: 400 }
      );
    }

    // 3. Dispatch SMS
    const smsResult = await sendRegistrationSMS({
      id: reg.id,
      full_name: reg.full_name,
      mobile: reg.mobile,
      registration_number: reg.registration_number,
      race_category: reg.race_category,
      payment_amount: reg.payment_amount,
      tshirt_bib_venue: reg.tshirt_bib_venue,
      tshirt_bib_venue_address: reg.tshirt_bib_venue_address,
    });

    // 4. Update registration table with latest SMS dispatch details
    if (smsResult.success) {
      await supabaseAdmin
        .from("registrations")
        .update({
          sms_sent: true,
          sms_sent_at: new Date().toISOString(),
          sms_message_id: smsResult.messageId || null,
          sms_status: "SENT",
          sms_error: null,
        })
        .eq("id", reg.id);

      return NextResponse.json({
        success: true,
        message: `SMS successfully sent to ${reg.mobile}.`,
        smsStatus: "SENT",
        smsSentAt: new Date().toISOString(),
        messageId: smsResult.messageId,
      });
    } else {
      await supabaseAdmin
        .from("registrations")
        .update({
          sms_sent: false,
          sms_status: "FAILED",
          sms_error: smsResult.error || "SMS failed during resend",
        })
        .eq("id", reg.id);

      return NextResponse.json(
        {
          success: false,
          message: smsResult.error || "Failed to deliver SMS.",
          smsStatus: "FAILED",
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("Admin resend SMS error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to process SMS resend." },
      { status: 500 }
    );
  }
}
