const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTodayIST() {
  const now = new Date();
  const istDateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startOfTodayIST = new Date(`${istDateString}T00:00:00+05:30`).toISOString();
  console.log("IST Date String:", istDateString);
  console.log("Start of Today IST (ISO):", startOfTodayIST);

  const { count: todayCount, error } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfTodayIST);

  console.log("Today's registrations in IST:", todayCount, error);
}

testTodayIST().catch(console.error);
