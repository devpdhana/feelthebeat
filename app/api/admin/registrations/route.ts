import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

export async function GET(req: Request) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const gender = searchParams.get("gender") || "";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    let query = supabaseAdmin
      .from("registrations")
      .select("*", { count: "exact" });

    if (category) {
      query = query.eq("race_category", category);
    }
    if (gender) {
      query = query.eq("gender", gender);
    }
    if (paymentStatus) {
      const matchStatus = paymentStatus === "SUCCESSFUL" ? "Successful" : paymentStatus;
      query = query.eq("payment_status", matchStatus);
    }
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,mobile.like.%${search}%,registration_number.ilike.%${search}%`
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

    const data = (registrations || []).map((reg) => ({
      id: reg.id,
      registrationNumber: reg.registration_number,
      fullName: reg.full_name,
      raceCategory: reg.race_category,
      mobile: reg.mobile,
      email: reg.email,
      gender: reg.gender,
      dob: reg.dob,
      age: reg.dob ? new Date().getFullYear() - new Date(reg.dob).getFullYear() : 0,
      tshirtSize: reg.tshirt_size,
      emergencyContactName: reg.emergency_name,
      emergencyContactNumber: reg.emergency_mobile,
      bloodGroup: reg.blood_group,
      medicalCondition: reg.medical_conditions,
      nationality: reg.nationality,
      firstTimeRunner: reg.first_time_runner,
      runningClub: reg.running_club || "N/A",
      disabilityStatus: reg.disability_status,
      timingCertificate: reg.official_timing_certificate,
      paymentStatus: reg.payment_status === "Successful" ? "SUCCESSFUL" : reg.payment_status,
      paymentAmount: reg.payment_amount || 0,
      createdAt: reg.created_at ? reg.created_at.split("T")[0] : "",
    }));

    return NextResponse.json({
      registrations: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error("Fetch registrations error:", err);
    return NextResponse.json(
      { message: "Failed to query registrations." },
      { status: 500 }
    );
  }
}
