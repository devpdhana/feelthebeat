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

    // 1. Overview counts
    const { count: totalRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true });

    const { data: paymentsList } = await supabaseAdmin
      .from("payments")
      .select("amount, status");

    const totalRevenue = paymentsList
      ?.filter((p) => p.status === "SUCCESSFUL")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const { count: todayRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString());

    const pendingPayments = paymentsList?.filter((p) => p.status === "PENDING").length || 0;
    const successfulPayments = paymentsList?.filter((p) => p.status === "SUCCESSFUL").length || 0;

    // 2. Query categories distribution
    const { data: regsCategories } = await supabaseAdmin
      .from("registrations")
      .select("race_category");

    const categoryMap: Record<string, number> = {};
    regsCategories?.forEach((r) => {
      const cat = r.race_category || "Unknown";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoriesData = Object.keys(categoryMap).map((category) => ({
      category,
      count: categoryMap[category],
    }));

    // 3. Gender distribution
    const genderMap: Record<string, number> = {};
    regsCategories?.forEach((r: any) => {
      // Fetching all fields to compute genders
    });
    const { data: regsGenders } = await supabaseAdmin
      .from("registrations")
      .select("gender");
    
    regsGenders?.forEach((r) => {
      const g = r.gender || "Unknown";
      genderMap[g] = (genderMap[g] || 0) + 1;
    });
    const genderData = Object.keys(genderMap).map((gender) => ({
      gender,
      count: genderMap[gender],
    }));

    // 4. Daily registrations count (last 7 days)
    const { data: regsTimeline } = await supabaseAdmin
      .from("registrations")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap[label] = 0;
    }

    regsTimeline?.forEach((reg) => {
      const label = new Date(reg.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dailyMap[label] !== undefined) {
        dailyMap[label]++;
      }
    });

    const dailyData = Object.keys(dailyMap).map((date) => ({
      date,
      count: dailyMap[date],
    }));

    // 5. Age Bracket distribution
    const { data: dobList } = await supabaseAdmin
      .from("registrations")
      .select("dob");

    const ageBrackets = {
      "Under 18": 0,
      "18-35": 0,
      "36-50": 0,
      "50+": 0,
    };

    dobList?.forEach((reg) => {
      if (!reg.dob) return;
      const age = new Date().getFullYear() - new Date(reg.dob).getFullYear();
      if (age < 18) ageBrackets["Under 18"]++;
      else if (age <= 35) ageBrackets["18-35"]++;
      else if (age <= 50) ageBrackets["36-50"]++;
      else ageBrackets["50+"]++;
    });

    const ageData = Object.keys(ageBrackets).map((bracket) => ({
      bracket,
      count: ageBrackets[bracket as keyof typeof ageBrackets],
    }));

    return NextResponse.json({
      summary: {
        totalRegistrations: totalRegistrations || 0,
        totalRevenue,
        todayRegistrations: todayRegistrations || 0,
        pendingPayments,
        successfulPayments,
      },
      charts: {
        daily: dailyData,
        categories: categoriesData,
        gender: genderData,
        age: ageData,
      },
    });
  } catch (err: any) {
    console.error("Dashboard metrics load error:", err);
    return NextResponse.json(
      { message: "Failed to gather statistics logs." },
      { status: 500 }
    );
  }
}
