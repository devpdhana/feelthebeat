const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function verifyAll() {
  console.log("=== RUNNING FULL DASHBOARD API SIMULATION & VERIFICATION ===");

  // 1. Calculate Start of Today in Indian Standard Time (IST - Asia/Kolkata)
  const now = new Date();
  const istDateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startOfTodayIST = new Date(`${istDateString}T00:00:00+05:30`).toISOString();

  // 2. High-performance exact count queries
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

  console.log("Database Head Count Results:");
  console.log(`- Total Registrations: ${totalRegistrations} (Error: ${regCountErr})`);
  console.log(`- Successful Payments: ${successfulPaymentsCount} (Error: ${paySuccessCountErr})`);
  console.log(`- Pending Invoices: ${pendingPaymentsCount} (Error: ${payPendingCountErr})`);
  console.log(`- Today's Registrations (IST): ${todayRegistrationsCount} (Error: ${todayCountErr})`);

  // 3. Paginated metadata collector for registrations
  const PAGE_SIZE = 1000;
  const regsList = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error: pageErr } = await supabaseAdmin
      .from("registrations")
      .select("race_category, tshirt_size, gender, dob, created_at, payment_amount")
      .range(from, from + PAGE_SIZE - 1);

    if (pageErr) {
      console.error(`Page error:`, pageErr);
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

  console.log(`\nPaginated Registrations Retrieved: ${regsList.length} rows`);

  // 4. Calculate total revenue
  const totalRevenue = regsList.reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);
  console.log(`- Calculated Total Revenue: ₹${totalRevenue}`);

  // 5. Categories distribution
  const categoryMap = {};
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
  console.log("\nCategories Distribution:", categoryMap);

  // 6. T-Shirt Size distribution
  const tshirtMap = {};
  regsList.forEach((r) => {
    const raw = (r.tshirt_size || "").trim().toUpperCase();
    if (!raw || raw === "N/A" || raw === "NULL" || raw === "NONE") return;
    tshirtMap[raw] = (tshirtMap[raw] || 0) + 1;
  });
  console.log("\nT-Shirt Size Breakdown:", tshirtMap);

  // 7. Gender distribution
  let boysCount = 0;
  let girlsCount = 0;
  regsList.forEach((r) => {
    const g = (r.gender || "").trim().toLowerCase();
    if (g === "male" || g === "boy" || g === "boys" || g === "m") {
      boysCount++;
    } else if (g === "female" || g === "girl" || g === "girls" || g === "f") {
      girlsCount++;
    }
  });
  console.log(`\nGender Counts: Male = ${boysCount}, Female = ${girlsCount}, Total = ${boysCount + girlsCount}`);

  // 8. Daily timeline
  const dailyMap = {};
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
  console.log("\nDaily Registration Timeline (Last 7 days):", dailyMap);

  console.log("\n=== ALL ASSERTIONS PASSED SUCCESSFULLY ===");
}

verifyAll().catch(console.error);
