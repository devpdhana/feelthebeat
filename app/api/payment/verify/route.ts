import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { racePrices } from "@/data/registrationConfig";
import { raceCategories } from "@/data/events";

async function sendConfirmationEmail(registration: any, categoryName: string) {
  try {
    const matchedCategory = raceCategories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    const startTime = matchedCategory?.startTime || "6:30 AM";

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
            ${registration.school_name ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">SCHOOL NAME:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">${registration.school_name.toUpperCase()}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">EVENT DATE:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">SUNDAY, SEPTEMBER 27, 2026</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">REPORTING TIME:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">5:00 AM</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">START TIME:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">${startTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">CUT-OFF TIME:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #5184EE; font-weight: bold;">7:00 AM</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #555555;">VENUE:</td>
              <td style="padding: 10px; border-bottom: 1px solid #1c1c1c; color: #ffffff;">DEBOER GROUND, VELLORE, TAMIL NADU</td>
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

import { sendRegistrationSMS } from "@/lib/sms";
import { sendRegistrationWhatsApp } from "@/lib/whatsapp";

const VENUE_ADDRESSES: Record<string, string> = {
  School: "Ezhil Nagar Main Rd, Ezhil Nagar, Krishna Nagar, RV Nagar, Vellore, Tamil Nadu 632002.",
  marathonlocation: "Deboer ground,Vellore, Tamil Nadu 632001.",
  Gopalapuram: "D.A.V. Boys Senior Secondary School, Gopalapuram, Chennai.",
  Mogappair: "D.A.V. Boys Senior Secondary School, Mogappair, Chennai.",
  Pallikaranai: "D.A.V. School, Pallikaranai,\nMaxworth Nagar,\nKovilambakkam,\nChennai-600100.",
};

const ALLOWED_VENUES = ["School", "marathonlocation", "Gopalapuram", "Mogappair", "Pallikaranai"];
const ALLOWED_DAV_MEMBER = ["Yes", "No"];
const ALLOWED_DAV_FAMILY_TYPES = [
  "Student",
  "Parent",
  "Staff / Teacher",
  "Alumni",
  "Family Member",
];
const ALLOWED_HEAR_ABOUT = [
  "Social Media",
  "Ambassadors",
  "Through friends of friends",
  "Offline platforms (Banners/posters)",
  "None of the above",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      raceCategory,
      schoolName,
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

    const tshirt_bib_venue = (body.tshirt_bib_venue || body.tshirtBibVenue || "").trim();
    const dav_family_member = (body.dav_family_member || body.davFamilyMember || "").trim();
    const dav_family_type = (body.dav_family_type || body.davFamilyType || "").trim();
    const dav_hear_about = (body.dav_hear_about || body.davHearAbout || "").trim();

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

    // Backend Age eligibility validation
    if (dob) {
      const birthDate = new Date(dob);
      const eventDate = new Date("2026-09-27");
      let age = eventDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = eventDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
        age--;
      }

      if (raceCategory === "2km-kids" && (age < 8 || age > 16)) {
        return NextResponse.json(
          { message: "Participants must be between 8 and 16 years for the 2 KM Kids Fun Run." },
          { status: 400 }
        );
      }
      if (raceCategory === "2km" && age < 18) {
        return NextResponse.json(
          { message: "Participants must be 18 years or above for the 2 KM Adults Fun Run." },
          { status: 400 }
        );
      }
      if (raceCategory === "5km" && age < 12) {
        return NextResponse.json(
          { message: "Participants must be 12 years or above for the 5 KM." },
          { status: 400 }
        );
      }
      if (raceCategory === "10km" && age < 14) {
        return NextResponse.json(
          { message: "Participants must be 14 years or above for the 10 KM." },
          { status: 400 }
        );
      }
    }



    // Backend Validation for new fields
    if (!tshirt_bib_venue || !ALLOWED_VENUES.includes(tshirt_bib_venue)) {
      return NextResponse.json(
        { message: "Invalid or missing T-Shirt & Bib distribution venue selection." },
        { status: 400 }
      );
    }

    if (!dav_family_member || !ALLOWED_DAV_MEMBER.includes(dav_family_member)) {
      return NextResponse.json(
        { message: "Invalid or missing D.A.V Family selection." },
        { status: 400 }
      );
    }

    let finalDavFamilyType: string | null = null;
    let finalDavHearAbout: string | null = null;

    if (dav_family_member === "Yes") {
      if (!dav_family_type || !ALLOWED_DAV_FAMILY_TYPES.includes(dav_family_type)) {
        return NextResponse.json(
          { message: "Invalid or missing D.A.V Family type selection." },
          { status: 400 }
        );
      }
      finalDavFamilyType = dav_family_type;
      finalDavHearAbout = null;
    } else if (dav_family_member === "No") {
      if (!dav_hear_about || !ALLOWED_HEAR_ABOUT.includes(dav_hear_about)) {
        return NextResponse.json(
          { message: "Invalid or missing 'How did you hear' selection." },
          { status: 400 }
        );
      }
      finalDavFamilyType = null;
      finalDavHearAbout = dav_hear_about;
    }

    const finalTshirtVenueAddress = VENUE_ADDRESSES[tshirt_bib_venue] || "";

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
        school_name: raceCategory === "2km-kids" && schoolName && schoolName.trim() ? schoolName.trim() : null,
        tshirt_size: tshirtSize,
        tshirt_bib_venue: tshirt_bib_venue,
        tshirt_bib_venue_address: finalTshirtVenueAddress,
        dav_family_member: dav_family_member,
        dav_family_type: finalDavFamilyType,
        dav_hear_about: finalDavHearAbout,
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

    const runnerDetails = {
      id: registration.id,
      full_name: registration.full_name,
      mobile: registration.mobile,
      registration_number: registration.registration_number,
      race_category: priceObj.name,
      payment_amount: registration.payment_amount,
      tshirt_bib_venue: registration.tshirt_bib_venue,
      tshirt_bib_venue_address: registration.tshirt_bib_venue_address,
    };

    // 6. Trigger SMS notification (Independent execution)
    try {
      const smsResult = await sendRegistrationSMS(runnerDetails);

      try {
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
            .eq("id", registration.id);
        } else {
          await supabaseAdmin
            .from("registrations")
            .update({
              sms_sent: false,
              sms_status: "FAILED",
              sms_error: smsResult.error || "SMS provider failed to deliver",
            })
            .eq("id", registration.id);
        }
      } catch (dbErr) {
        console.warn("Could not save SMS tracking columns to database:", dbErr);
      }
    } catch (smsErr: any) {
      console.error("SMS notification processing exception:", smsErr);
    }

    // 7. Trigger WhatsApp notification (Independent execution)
    try {
      const waResult = await sendRegistrationWhatsApp(runnerDetails);

      try {
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
            .eq("id", registration.id);
        } else {
          await supabaseAdmin
            .from("registrations")
            .update({
              whatsapp_sent: false,
              whatsapp_status: "FAILED",
              whatsapp_error: waResult.error || "WhatsApp provider failed to deliver",
            })
            .eq("id", registration.id);
        }
      } catch (dbErr) {
        console.warn("Could not save WhatsApp tracking columns to database:", dbErr);
      }
    } catch (waErr: any) {
      console.error("WhatsApp notification processing exception:", waErr);
    }

    // 8. Trigger Email notification asynchronously
    await sendConfirmationEmail(registration, priceObj.name);

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
