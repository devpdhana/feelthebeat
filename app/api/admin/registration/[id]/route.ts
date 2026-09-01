import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await context.params;

    const { data: reg, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !reg) {
      return NextResponse.json({ message: "Registration not found." }, { status: 404 });
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("registration_id", id)
      .maybeSingle();

    const details = {
      id: reg.id,
      orderId: reg.order_id || "N/A",
      bibNumber: reg.bib_number || null,
      registrationNumber: reg.registration_number,
      raceCategory: reg.race_category,
      schoolName: reg.school_name || null,
      fullName: reg.full_name,
      mobile: reg.mobile,
      email: reg.email,
      dob: reg.dob,
      age: reg.dob ? new Date().getFullYear() - new Date(reg.dob).getFullYear() : 0,
      gender: reg.gender,
      tshirtSize: reg.tshirt_size,
      tshirtBibVenue: reg.tshirt_bib_venue || "N/A",
      tshirtBibVenueAddress: reg.tshirt_bib_venue_address || "N/A",
      davFamilyMember: reg.dav_family_member || "N/A",
      davFamilyType: reg.dav_family_type || "N/A",
      davHearAbout: reg.dav_hear_about || "N/A",
      emergencyContactName: reg.emergency_name,
      emergencyContactNumber: reg.emergency_mobile,
      bloodGroup: reg.blood_group,
      medicalCondition: reg.medical_conditions,
      nationality: reg.nationality,
      firstTimeRunner: reg.first_time_runner,
      runningClub: reg.running_club || "N/A",
      disabilityStatus: reg.disability_status,
      bibName: reg.bib_name || "N/A",
      paymentStatus: reg.payment_status === "Successful" ? "SUCCESSFUL" : reg.payment_status,
      paymentAmount: reg.payment_amount || 0,
      whatsappSent: Boolean(reg.whatsapp_sent),
      whatsappSentAt: reg.whatsapp_sent_at || null,
      whatsappStatus: reg.whatsapp_status || (reg.whatsapp_sent ? "SENT" : "NOT_SENT"),
      whatsappMessageId: reg.whatsapp_message_id || null,
      whatsappError: reg.whatsapp_error || null,
      razorpayPaymentId: payment?.razorpay_payment_id || "N/A",
      razorpayOrderId: payment?.razorpay_order_id || "N/A",
      signature: payment?.razorpay_signature || "N/A",
      createdAt: reg.created_at ? new Date(reg.created_at).toLocaleString() : "",
      updatedAt: reg.created_at ? new Date(reg.created_at).toLocaleString() : "", // fallback
    };

    return NextResponse.json(details);
  } catch (err: any) {
    console.error("Individual fetch error:", err);
    return NextResponse.json(
      { message: "Failed to load individual details." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { id } = await context.params;

    // Delete associated payments first to prevent foreign key errors
    await supabaseAdmin
      .from("payments")
      .delete()
      .eq("registration_id", id);

    const { error: regDelError } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", id);

    if (regDelError) {
      throw regDelError;
    }

    return NextResponse.json({
      success: true,
      message: `Registration successfully deleted.`,
    });
  } catch (err: any) {
    console.error("Individual delete error:", err);
    return NextResponse.json(
      { message: "Failed to delete registration record." },
      { status: 500 }
    );
  }
}
