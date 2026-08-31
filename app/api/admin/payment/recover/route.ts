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
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/payment/recover
 * Recovers a successful/captured payment into a registration record without recharging.
 */
export async function POST(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, registrationData } = await req.json();

    if (!razorpay_order_id) {
      return NextResponse.json({ message: "Missing razorpay_order_id." }, { status: 400 });
    }

    // 1. Check if registration already exists
    const { data: existingReg } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json({
        success: true,
        message: "Registration already exists for this payment.",
        registration: existingReg,
        alreadyExisted: true,
      });
    }

    // 2. Fetch payment record
    const { data: paymentLog } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    // 3. Count for registration number
    const { count } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true });

    const registrationNumber = `FTB2026-${String((count || 0) + 1).padStart(6, "0")}`;

    const regPayload = {
      registration_number: registrationNumber,
      full_name: registrationData.full_name || registrationData.fullName || "Runner",
      mobile: (registrationData.mobile || "").trim(),
      email: (registrationData.email || "").toLowerCase().trim(),
      dob: registrationData.dob,
      gender: registrationData.gender,
      race_category: registrationData.race_category || registrationData.raceCategory || "2 KM Kids Fun Run",
      school_name: registrationData.school_name || registrationData.schoolName || null,
      tshirt_size: registrationData.tshirt_size || registrationData.tshirtSize || "M",
      dav_family_member: registrationData.dav_family_member || "No",
      dav_family_type: registrationData.dav_family_type || null,
      dav_hear_about: registrationData.dav_hear_about || "Social Media",
      emergency_name: registrationData.emergency_name || registrationData.emergencyContactName || "Emergency Contact",
      emergency_mobile: registrationData.emergency_mobile || registrationData.emergencyContactNumber || registrationData.mobile,
      blood_group: registrationData.blood_group || "B+",
      medical_conditions: registrationData.medical_conditions || "None",
      nationality: registrationData.nationality || "Indian",
      first_time_runner: registrationData.first_time_runner || "No",
      running_club: registrationData.running_club || null,
      disability_status: registrationData.disability_status || "No",
      bib_name: (registrationData.bib_name || registrationData.bibName || registrationData.full_name || "RUNNER").trim(),
      payment_status: "Successful",
      payment_amount: Number(paymentLog?.amount || 1),
      razorpay_order_id: razorpay_order_id,
    };

    const { data: newReg, error: regInsertError } = await supabaseAdmin
      .from("registrations")
      .insert(regPayload)
      .select()
      .single();

    if (regInsertError || !newReg) {
      console.error("Admin payment recovery insert error:", regInsertError);
      return NextResponse.json(
        { message: regInsertError?.message || "Failed to create registration record." },
        { status: 500 }
      );
    }

    // 4. Update payment record
    if (paymentLog) {
      await supabaseAdmin
        .from("payments")
        .update({
          registration_id: newReg.id,
          razorpay_payment_id: razorpay_payment_id || paymentLog.razorpay_payment_id,
          status: "SUCCESSFUL",
        })
        .eq("id", paymentLog.id);
    }

    // 5. Send WhatsApp notification
    try {
      await sendRegistrationWhatsApp({
        id: newReg.id,
        full_name: newReg.full_name,
        mobile: newReg.mobile,
        registration_number: newReg.registration_number,
        order_id: newReg.order_id,
        bib_number: newReg.bib_number,
        bib_name: newReg.bib_name,
        race_category: newReg.race_category,
        payment_amount: newReg.payment_amount,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Payment successfully recovered and registration created.",
      registration: newReg,
    });
  } catch (err: any) {
    console.error("Admin payment recovery exception:", err);
    return NextResponse.json({ message: err.message || "Recovery failed." }, { status: 500 });
  }
}
