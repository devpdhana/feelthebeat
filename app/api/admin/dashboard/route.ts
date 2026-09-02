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

    // 1. Overview counts
    const { count: totalRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true });

    const { data: paymentsList } = await supabaseAdmin
      .from("payments")
      .select("amount, status");

    const totalRevenue = paymentsList
      ?.filter((p) => (p.status || "").toLowerCase().includes("success") || (p.status || "").toLowerCase().includes("paid"))
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const { count: todayRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString());

    const pendingPayments = paymentsList?.filter((p) => (p.status || "").toLowerCase().includes("pending")).length || 0;
    const successfulPayments = paymentsList?.filter((p) => (p.status || "").toLowerCase().includes("success") || (p.status || "").toLowerCase().includes("paid")).length || 0;

    // 2. Query all registrations for aggregated metrics
    const { data: allRegistrations, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id, race_category, tshirt_size, gender, dob, created_at");

    if (regError) {
      console.error("[DASHBOARD] Registrations query error:", regError);
    }

    const regsList = allRegistrations || [];

    // Categories distribution
    const categoryMap: Record<string, number> = {};
    regsList.forEach((r) => {
      const raw = (r.race_category || "").trim();
      let cat = raw;
      if (raw === "2km-kids" || raw.toLowerCase().includes("kids")) {
        cat = "2 KM Kids Fun Run";
      } else if (raw === "2km" || raw.toLowerCase().includes("adult")) {
        cat = "2 KM Adult Run";
      } else if (raw === "5km" || raw.toLowerCase().includes("5 km") || raw.toLowerCase().includes("5km")) {
        cat = "5 KM Run";
      } else if (raw === "10km" || raw.toLowerCase().includes("10 km") || raw.toLowerCase().includes("10km")) {
        cat = "10 KM Run";
      } else if (!raw) {
        cat = "Unassigned";
      }

      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoriesData = Object.keys(categoryMap).map((category) => ({
      category,
      count: categoryMap[category],
    }));

    // T-Shirt Size distribution
    const tshirtMap: Record<string, number> = {};
    const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

    regsList.forEach((r) => {
      const raw = (r.tshirt_size || "").trim().toUpperCase();
      if (!raw || raw === "N/A" || raw === "NULL" || raw === "NONE") {
        return; // Exclude empty/null values
      }
      tshirtMap[raw] = (tshirtMap[raw] || 0) + 1;
    });

    const tshirtData = Object.keys(tshirtMap)
      .sort((a, b) => {
        const indexA = standardSizes.indexOf(a);
        const indexB = standardSizes.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      })
      .map((size) => ({
        size,
        count: tshirtMap[size],
      }));

    // Gender distribution
    const genderMap: Record<string, number> = {};
    regsList.forEach((r) => {
      const g = r.gender || "Unknown";
      genderMap[g] = (genderMap[g] || 0) + 1;
    });
    const genderData = Object.keys(genderMap).map((gender) => ({
      gender,
      count: genderMap[gender],
    }));

    // Daily registrations count (last 7 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap[label] = 0;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();
    regsList.forEach((reg) => {
      if (reg.created_at && new Date(reg.created_at).getTime() >= sevenDaysAgo) {
        const label = new Date(reg.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (dailyMap[label] !== undefined) {
          dailyMap[label]++;
        }
      }
    });

    const dailyData = Object.keys(dailyMap).map((date) => ({
      date,
      count: dailyMap[date],
    }));

    // Age Bracket distribution
    const ageBrackets = {
      "Under 18": 0,
      "18-35": 0,
      "36-50": 0,
      "50+": 0,
    };

    regsList.forEach((reg) => {
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
      success: true,
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
        tshirt: tshirtData,
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
