import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { racePrices } from "@/data/registrationConfig";
import { sendRegistrationWhatsApp } from "@/lib/whatsapp";

/**
 * POST /api/payment/check-status
 * Server-side payment status checker directly querying Razorpay API.
 * Handles the "money deducted but browser errored / dismissed" case safely & idempotently.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, ...formData } = body;

    if (!razorpay_order_id) {
      return NextResponse.json(
        { message: "Missing razorpay_order_id." },
        { status: 400 }
      );
    }

    // 1. Idempotency check: Does a registration already exist for this order?
    const { data: existingReg } = await supabaseAdmin
      .from("registrations")
      .select("id, registration_number, order_id, bib_number, bib_name, payment_status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (existingReg) {
      console.log("[PAYMENT] Existing verified registration found");
      return NextResponse.json({
        success: true,
        status: "PAID",
        registrationNumber: existingReg.registration_number,
        orderId: existingReg.order_id,
        bibNumber: existingReg.bib_number,
        bibName: existingReg.bib_name,
        alreadyProcessed: true,
      });
    }

    // 2. Fetch payment log
    const { data: paymentLog } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    // 3. Query Razorpay API directly from server
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { message: "Razorpay server credentials missing." },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

    const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}/payments`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      console.error(`[PAYMENT CHECK-STATUS] Razorpay API query error (${rzpRes.status}):`, errText);
      return NextResponse.json(
        { success: false, status: "UNKNOWN", message: "Unable to verify with payment gateway. Please retry in a moment." },
        { status: 502 }
      );
    }

    const rzpData = await rzpRes.json();
    const paymentsList = rzpData.items || [];

    // Find any captured/successful payment for this order
    const capturedPayment = paymentsList.find(
      (p: any) => p.status === "captured" || p.status === "paid"
    );

    if (!capturedPayment) {
      const pendingPayment = paymentsList.find((p: any) => p.status === "authorized" || p.status === "created");
      if (pendingPayment) {
        return NextResponse.json({
          success: false,
          status: "PENDING",
          message: "Payment is currently processing at the bank. Please wait a moment and check status again.",
        });
      }

      return NextResponse.json({
        success: false,
        status: "UNPAID",
        message: "No successful payment found for this order. You may retry payment safely.",
      });
    }

    console.log("[PAYMENT] Payment verified and registration created");

    // 4. Create registration record safely
    const raceCategory = formData.raceCategory || "2km-kids";
    const priceObj = racePrices[raceCategory] || racePrices["2km-kids"];
    const fullName = (formData.fullName || formData.full_name || "Runner").trim();
    const mobile = (formData.mobile || "").trim();
    const email = (formData.email || "").toLowerCase().trim();

    const { count } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true });

    const registrationNumber = `FTB2026-${String((count || 0) + 1).padStart(6, "0")}`;

    const { data: registration, error: regInsertError } = await supabaseAdmin
      .from("registrations")
      .insert({
        registration_number: registrationNumber,
        full_name: fullName,
        mobile: mobile,
        email: email,
        dob: formData.dob || "2000-01-01",
        gender: formData.gender || "Other",
        race_category: priceObj.name,
        school_name: raceCategory === "2km-kids" && formData.schoolName ? formData.schoolName.trim() : null,
        tshirt_size: formData.tshirtSize || "M",
        dav_family_member: formData.davFamilyMember || "No",
        dav_family_type: formData.davFamilyMember === "Yes" ? formData.davFamilyType : null,
        dav_hear_about: formData.davFamilyMember === "No" ? formData.davHearAbout : null,
        emergency_name: (formData.emergencyContactName || fullName).trim(),
        emergency_mobile: (formData.emergencyContactNumber || mobile).trim(),
        blood_group: formData.bloodGroup || "O+",
        medical_conditions: formData.medicalCondition || "None",
        nationality: (formData.nationality || "Indian").trim(),
        first_time_runner: formData.firstTimeRunner || "No",
        running_club: formData.runningClub ? formData.runningClub.trim() : null,
        disability_status: formData.disabilityStatus || "No",
        bib_name: (formData.bibName || fullName).trim(),
        payment_status: "Successful",
        payment_amount: Number(priceObj.fee),
        razorpay_order_id: razorpay_order_id,
      })
      .select()
      .single();

    if (regInsertError || !registration) {
      console.error("[PAYMENT CHECK-STATUS] Registration insert error:", regInsertError);
      return NextResponse.json(
        {
          success: false,
          status: "PAID_RECOVERY_PENDING",
          paymentCaptured: true,
          orderId: razorpay_order_id,
          paymentId: capturedPayment.id,
          message: "Payment was captured successfully! We are finishing your registration record. Please do not pay again.",
        },
        { status: 500 }
      );
    }

    // 5. Update payment record
    if (paymentLog) {
      await supabaseAdmin
        .from("payments")
        .update({
          registration_id: registration.id,
          razorpay_payment_id: capturedPayment.id,
          status: "SUCCESSFUL",
        })
        .eq("id", paymentLog.id);
    }

    // 6. Dispatch notifications asynchronously (non-blocking)
    (async () => {
      try {
        let freshRegistration = registration;
        const { data: freshRecord } = await supabaseAdmin
          .from("registrations")
          .select("*")
          .eq("id", registration.id)
          .single();

        if (freshRecord) {
          freshRegistration = freshRecord;
        }

        const runnerDetails = {
          id: freshRegistration.id,
          full_name: freshRegistration.full_name,
          mobile: freshRegistration.mobile,
          registration_number: freshRegistration.registration_number,
          order_id: freshRegistration.order_id,
          bib_number: freshRegistration.bib_number,
          bib_name: freshRegistration.bib_name,
          race_category: freshRegistration.race_category,
          payment_amount: freshRegistration.payment_amount,
        };
        await sendRegistrationWhatsApp(runnerDetails);
      } catch (e) {
        console.error("[PAYMENT CHECK-STATUS] Notification error:", e);
      }
    })();

    return NextResponse.json({
      success: true,
      status: "PAID",
      registrationNumber: registration.registration_number,
      orderId: registration.order_id,
      bibNumber: registration.bib_number,
      bibName: registration.bib_name,
    });
  } catch (err: any) {
    console.error("[PAYMENT CHECK-STATUS] Exception:", err);
    return NextResponse.json(
      { message: err.message || "Failed to check payment status." },
      { status: 500 }
    );
  }
}
