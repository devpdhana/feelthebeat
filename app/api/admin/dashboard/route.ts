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

    // 1. Calculate Start of Today in Indian Standard Time (IST - Asia/Kolkata)
    const now = new Date();
    const istDateString = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const startOfTodayIST = new Date(`${istDateString}T00:00:00+05:30`).toISOString();

    // 2. High-performance exact count queries (Database-side HEAD requests)
    const [
      { count: totalRegistrations, error: regCountErr },
      { count: successfulPaymentsCount, error: paySuccessCountErr },
      { count: pendingPaymentsCount, error: payPendingCountErr },
      { count: todayRegistrationsCount, error: todayCountErr },
    ] = await Promise.all([
      supabaseAdmin
        .from("registrations")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .in("status", ["SUCCESSFUL", "Successful", "PAID", "paid"]),
      supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .in("status", ["PENDING", "pending", "CREATED", "created"]),
      supabaseAdmin
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfTodayIST),
    ]);

    if (regCountErr) console.error("[DASHBOARD] Total registrations count error:", regCountErr);
    if (paySuccessCountErr) console.error("[DASHBOARD] Successful payments count error:", paySuccessCountErr);
    if (payPendingCountErr) console.error("[DASHBOARD] Pending payments count error:", payPendingCountErr);
    if (todayCountErr) console.error("[DASHBOARD] Today registrations count error:", todayCountErr);

    // 3. Paginated metadata collector for registrations (Guarantees no 1,000-row PostgREST cap)
    const PAGE_SIZE = 1000;
    const regsList: Array<{
      race_category?: string | null;
      tshirt_size?: string | null;
      gender?: string | null;
      dob?: string | null;
      created_at?: string | null;
      payment_amount?: number | null;
    }> = [];

    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error: pageErr } = await supabaseAdmin
        .from("registrations")
        .select("race_category, tshirt_size, gender, dob, created_at, payment_amount")
        .range(from, from + PAGE_SIZE - 1);

      if (pageErr) {
        console.error(`[DASHBOARD] Registrations metadata page query error (offset ${from}):`, pageErr);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        regsList.push(...data);
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          from += PAGE_SIZE;
        }
      }
    }

    // 4. Calculate total revenue accurately from registrations & payments
    let totalRevenue = regsList.reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);

    // Fallback/validation if registration records haven't loaded
    if (totalRevenue === 0 && (successfulPaymentsCount || 0) > 0) {
      const { data: allPayData } = await supabaseAdmin
        .from("payments")
        .select("amount")
        .in("status", ["SUCCESSFUL", "Successful", "PAID", "paid"])
        .limit(10000);
      totalRevenue = (allPayData || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }

    // 5. Categories distribution
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

    // 6. T-Shirt Size distribution
    const tshirtMap: Record<string, number> = {};
    const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

    regsList.forEach((r) => {
      const raw = (r.tshirt_size || "").trim().toUpperCase();
      if (!raw || raw === "N/A" || raw === "NULL" || raw === "NONE") {
        return;
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

    // 7. Gender distribution & Boys/Girls counts
    const genderMap: Record<string, number> = {};
    let boysCount = 0;
    let girlsCount = 0;

    regsList.forEach((r) => {
      const g = (r.gender || "").trim();
      const cleanGender = g || "Unknown";
      genderMap[cleanGender] = (genderMap[cleanGender] || 0) + 1;

      const lowerG = g.toLowerCase();
      if (lowerG === "male" || lowerG === "boy" || lowerG === "boys" || lowerG === "m") {
        boysCount++;
      } else if (lowerG === "female" || lowerG === "girl" || lowerG === "girls" || lowerG === "f") {
        girlsCount++;
      }
    });

    const genderData = Object.keys(genderMap).map((gender) => ({
      gender,
      count: genderMap[gender],
    }));

    // 8. Daily registrations count (last 7 days in event timezone)
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

    // 9. Age Bracket distribution
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
        todayRegistrations: todayRegistrationsCount || 0,
        pendingPayments: pendingPaymentsCount || 0,
        successfulPayments: successfulPaymentsCount || 0,
        boysCount,
        girlsCount,
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
    console.error("[DASHBOARD] Exception loading dashboard metrics:", err);
    return NextResponse.json(
      { message: "Failed to gather statistics logs." },
      { status: 500 }
    );
  }
}
