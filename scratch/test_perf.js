const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPerformance() {
  console.time("Exact head counts");
  const [
    { count: totalRegs },
    { count: successPayCount },
    { count: pendingPayCount },
  ] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("id", { count: "exact", head: true }).in("status", ["SUCCESSFUL", "Successful", "PAID", "paid"]),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
  ]);
  console.timeEnd("Exact head counts");
  console.log({ totalRegs, successPayCount, pendingPayCount });

  // Test pagination helper for fetching registrations metadata (for charts: categories, sizes, age, gender, daily)
  console.time("Paginated fetch of registration metadata");
  const PAGE_SIZE = 1000;
  let allRegs = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("registrations")
      .select("race_category, tshirt_size, gender, dob, created_at, payment_amount")
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allRegs.push(...data);
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    }
  }
  console.timeEnd("Paginated fetch of registration metadata");
  console.log(`Fetched ${allRegs.length} registration records.`);

  // Calculate revenue
  const totalRevenue = allRegs.reduce((sum, r) => sum + (r.payment_amount || 0), 0);
  console.log("Calculated Total Revenue:", totalRevenue);
}

testPerformance().catch(console.error);
