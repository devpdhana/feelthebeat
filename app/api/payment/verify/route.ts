import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { racePrices } from "@/data/registrationConfig";

async function sendConfirmationEmail(registration: any, categoryName: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    const mailOptions = {
      from: `"Team Feel The Beat" <noreply@feelthebeatrun2026.com>`,
      to: registration.email,
      subject: `Feel The Beat Run 2026 Registration Confirmation`,
      html: `
        <div style="background-color: #0c0c0c; color: #ffffff; font-family: monospace, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #1c1c1c;">
          <h2 style="color: #5184EE; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px;">FEEL THE BEAT RUN 2026</h2>
          <span style="color: #555555; font-size: 10px;">// SYSTEM_CONFIRMATION_NOTICE</span>
          <hr style="border: 0; border-top: 1px solid #1c1c1c; margin: 20px 0;" />
          <p style="font-size: 14px; line-height: 1.6;">Hi <strong>${registration.full_name.toUpperCase()}</strong>,</p>
          <p style="font-size: 13px; line-height: 1.6; color: #aaaaaa;">Your registration for Feel The Beat Run 2026 has been successfully confirmed. See your receipt telemetry data below:</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0; background-color: #101010; border: 1px solid #1c1c1c;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">REGISTRATION NUMBER:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #5184EE; font-weight: bold;">${registration.registration_number}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">RACE CATEGORY:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">${categoryName.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">EVENT DATE:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">SUNDAY, SEPTEMBER 27, 2026</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">START TIME:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">06:30 AM</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">VENUE:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">VELLORE FORT GATE, TAMIL NADU</td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #555555;">PAYMENT STATUS:</td>
              <td style="padding: 10px; color: #00F59B; font-weight: bold;">PAID</td>
            </tr>
          </table>

          <p style="font-size: 11px; color: #666666; margin-top: 30px; line-height: 1.5;">
            * Print this email or download your PDF receipt from the success portal to collect your BIB during the Pre-Race Expo.
          </p>
          <hr style="border: 0; border-top: 1px solid #1c1c1c; margin: 20px 0;" />
          <span style="font-size: 9px; color: #444444;">TEAM FEEL THE BEAT // SECURE GRID_METRICS</span>
        </div>
      `,
    };

    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log("Mock Email Sent to:", registration.email);
    }
  } catch (err) {
    console.error("Nodemailer error:", err);
  }
}

async function sendConfirmationSMS(registration: any, categoryName: string) {
  try {
    const textMsg = `Hi ${registration.full_name},

Your registration for Feel The Beat Run 2026 has been successfully confirmed.

Registration No:
${registration.registration_number}

Category:
${categoryName}

Date:
27 September 2026

Venue:
Vellore

Start Time:
6:30 AM

Payment:
Successful

Thank you for registering.

Team Feel The Beat`;

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        body: textMsg,
        to: registration.mobile,
        from: process.env.TWILIO_PHONE_NUMBER || "",
      });
    } else {
      console.log("------------------- MOCK SMS OUT -------------------");
      console.log(textMsg);
      console.log("----------------------------------------------------");
    }
  } catch (err) {
    console.error("SMS notification warning:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      raceCategory,
      fullName,
      mobile,
      email,
      dob,
      gender,
      tshirtSize,
      emergencyContactName,
      emergencyContactNumber,
      bloodGroup,
      medicalCondition,
      nationality,
      firstTimeRunner,
      runningClub,
      disabilityStatus,
      timingCertificate,
    } = body;

    // 1. Verify payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "mocksecret");
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json(
        { message: "Signature verification failed. Invalid transaction." },
        { status: 400 }
      );
    }

    const priceObj = racePrices[raceCategory];
    if (!priceObj) {
      return NextResponse.json(
        { message: "Invalid race category specified." },
        { status: 400 }
      );
    }

    // 2. Fetch payment record
    const { data: paymentLog, error: payGetError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (payGetError || !paymentLog) {
      return NextResponse.json(
        { message: "Order ID not logged in system." },
        { status: 404 }
      );
    }

    if (paymentLog.status === "SUCCESSFUL") {
      // Already verified, fetch existing registration
      const { data: existingReg } = await supabaseAdmin
        .from("registrations")
        .select("registration_number")
        .eq("payment_id", paymentLog.id)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        registrationNumber: existingReg?.registration_number,
      });
    }

    // 3. Generate sequential registration number
    const { count, error: countError } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("Count query error:", countError);
    }

    const registrationNumber = `FTB2026-${String((count || 0) + 1).padStart(6, "0")}`;

    // 4. Create registration entry in Supabase
    const { data: registration, error: regInsertError } = await supabaseAdmin
      .from("registrations")
      .insert({
        registration_number: registrationNumber,
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        email: email.toLowerCase().trim(),
        dob: dob,
        gender,
        race_category: priceObj.name,
        tshirt_size: tshirtSize,
        emergency_name: emergencyContactName.trim(),
        emergency_mobile: emergencyContactNumber.trim(),
        blood_group: bloodGroup,
        medical_conditions: medicalCondition,
        nationality: nationality.trim(),
        first_time_runner: firstTimeRunner,
        running_club: runningClub ? runningClub.trim() : null,
        disability_status: disabilityStatus,
        official_timing_certificate: timingCertificate,
        payment_status: "Successful",
        payment_amount: Number(priceObj.fee),
      })
      .select()
      .single();

    if (regInsertError) {
      console.error("Registration insert error:", regInsertError);
      throw new Error("Failed to insert registration record.");
    }

    // 5. Update payment details
    const { error: payUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        registration_id: registration.id,
        razorpay_payment_id,
        razorpay_signature,
        status: "SUCCESSFUL",
      })
      .eq("id", paymentLog.id);

    if (payUpdateError) {
      console.error("Payment update error:", payUpdateError);
      // Fail-safe audit logging could go here
    }

    // 6. Trigger communications asynchronously
    await sendConfirmationEmail(registration, priceObj.name);
    await sendConfirmationSMS(registration, priceObj.name);

    return NextResponse.json({
      success: true,
      registrationNumber: registration.registration_number,
    });
  } catch (err: any) {
    console.error("Payment verification failure:", err);
    return NextResponse.json(
      { message: err.message || "Failed to verify transaction." },
      { status: 500 }
    );
  }
}
