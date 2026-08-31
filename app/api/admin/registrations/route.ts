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

export async function GET(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const paymentStatus = searchParams.get("paymentStatus")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);

    let query = supabaseAdmin
      .from("registrations")
      .select("*", { count: "exact" });

    // Category Filter
    if (category) {
      if (category.toLowerCase().includes("kids")) {
        query = query.or("race_category.ilike.%kids%,race_category.eq.2km-kids");
      } else if (category.toLowerCase().includes("adult")) {
        query = query.or("race_category.ilike.%adult%,race_category.eq.2km");
      } else if (category.includes("5")) {
        query = query.or("race_category.ilike.%5 km%,race_category.eq.5km");
      } else if (category.includes("10")) {
        query = query.or("race_category.ilike.%10 km%,race_category.eq.10km");
      } else {
        query = query.ilike("race_category", `%${category}%`);
      }
    }

    // Gender Filter
    if (gender) {
      query = query.ilike("gender", gender);
    }

    // Payment Status Filter
    if (paymentStatus) {
      if (paymentStatus.toUpperCase() === "SUCCESSFUL" || paymentStatus.toUpperCase() === "PAID") {
        query = query.or("payment_status.ilike.%success%,payment_status.ilike.%paid%");
      } else if (paymentStatus.toUpperCase() === "PENDING") {
        query = query.ilike("payment_status", "%pending%");
      } else if (paymentStatus.toUpperCase() === "FAILED") {
        query = query.ilike("payment_status", "%failed%");
      } else {
        query = query.ilike("payment_status", `%${paymentStatus}%`);
      }
    }

    // Search filter across name, email, mobile, and reg number
    if (search) {
      const sanitized = search.replace(/[,%]/g, "");
      query = query.or(
        `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,mobile.ilike.%${sanitized}%,registration_number.ilike.%${sanitized}%,order_id.ilike.%${sanitized}%,bib_name.ilike.%${sanitized}%`
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: registrations, count, error } = await query
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) {
      console.error("Registrations query error:", error);
      throw error;
    }

    const data = (registrations || []).map((reg) => {
      const isPaid = (reg.payment_status || "").toLowerCase().includes("success") || (reg.payment_status || "").toLowerCase().includes("paid");
      return {
        id: reg.id,
        orderId: reg.order_id || "N/A",
        bibNumber: reg.bib_number || null,
        registrationNumber: reg.registration_number,
        fullName: reg.full_name || "N/A",
        raceCategory: reg.race_category || "N/A",
        schoolName: reg.school_name || null,
        mobile: reg.mobile || "N/A",
        email: reg.email || "N/A",
        gender: reg.gender || "N/A",
        dob: reg.dob || "",
        age: reg.dob ? new Date().getFullYear() - new Date(reg.dob).getFullYear() : 0,
        tshirtSize: reg.tshirt_size || "N/A",
        tshirtBibVenue: reg.tshirt_bib_venue || "N/A",
        tshirtBibVenueAddress: reg.tshirt_bib_venue_address || "N/A",
        davFamilyMember: reg.dav_family_member || "N/A",
        davFamilyType: reg.dav_family_type || "N/A",
        davHearAbout: reg.dav_hear_about || "N/A",
        emergencyContactName: reg.emergency_name || "N/A",
        emergencyContactNumber: reg.emergency_mobile || "N/A",
        bloodGroup: reg.blood_group || "N/A",
        medicalCondition: reg.medical_conditions || "None",
        nationality: reg.nationality || "Indian",
        firstTimeRunner: reg.first_time_runner || "N/A",
        runningClub: reg.running_club || "N/A",
        disabilityStatus: reg.disability_status || "No",
        bibName: reg.bib_name || "N/A",
        paymentStatus: isPaid ? "SUCCESSFUL" : (reg.payment_status || "PENDING").toUpperCase(),
        paymentAmount: reg.payment_amount || 0,
        smsSent: Boolean(reg.sms_sent),
        smsSentAt: reg.sms_sent_at || null,
        smsStatus: reg.sms_status || (reg.sms_sent ? "SENT" : "NOT_SENT"),
        smsMessageId: reg.sms_message_id || null,
        smsError: reg.sms_error || null,
        whatsappSent: Boolean(reg.whatsapp_sent),
        whatsappSentAt: reg.whatsapp_sent_at || null,
        whatsappStatus: reg.whatsapp_status || (reg.whatsapp_sent ? "SENT" : "NOT_SENT"),
        whatsappMessageId: reg.whatsapp_message_id || null,
        whatsappError: reg.whatsapp_error || null,
        createdAt: reg.created_at ? reg.created_at.split("T")[0] : "",
      };
    });

    return NextResponse.json({
      success: true,
      registrations: data,
      items: data,
      data: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      },
    });
  } catch (err: any) {
    console.error("Fetch registrations error:", err);
    return NextResponse.json(
      { message: "Failed to query registrations from database." },
      { status: 500 }
    );
  }
}
