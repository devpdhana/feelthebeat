const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    envVars[key] = val.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboardData() {
  console.log("=== TESTING DASHBOARD BACKEND LOGIC ===");

  // 1. Overview counts
  const { count: totalRegistrations } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true });

  const { data: paymentsList } = await supabase
    .from("payments")
    .select("amount, status");

  const totalRevenue = paymentsList
    ?.filter((p) => (p.status || "").toLowerCase().includes("success") || (p.status || "").toLowerCase().includes("paid"))
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Single consolidated fetch of registrations
  const { data: allRegs, error: regError } = await supabase
    .from("registrations")
    .select("id, race_category, tshirt_size, gender, dob, created_at");

  if (regError) {
    console.error("Registrations query error:", regError);
    return;
  }

  console.log(`Fetched ${allRegs.length} registration records.`);

  // Categories distribution
  const categoryMap = {};
  allRegs.forEach((r) => {
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
  const tshirtMap = {};
  const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  allRegs.forEach((r) => {
    let raw = (r.tshirt_size || "").trim().toUpperCase();
    if (!raw || raw === "N/A" || raw === "NULL" || raw === "NONE") {
      raw = "Not Specified";
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

  console.log("Categories Data:", categoriesData);
  console.log("T-Shirt Data:", tshirtData);
  console.log("Total T-Shirts accounted for:", tshirtData.reduce((sum, t) => sum + t.count, 0));
}

testDashboardData();
