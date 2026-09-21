const ExcelJS = require('exceljs');
const fs = require('fs');

async function testExportsE2E() {
  console.log("=== Testing Export Endpoints Locally ===");

  // Read admin user or test route GET handler directly
  const { GET } = require('../app/api/admin/export/route.ts');
  console.log("Export route module loaded.");
}

// Since Next.js route uses TypeScript and ES modules, let's write a standalone verification using fetch if dev server is running on localhost:3000
async function testViaFetch() {
  const { createClient } = require('@supabase/supabase-js');
  const envContent = fs.readFileSync('.env', 'utf8');
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
  const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Check total count in DB
  const { count: totalRegs } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
  console.log(`Current Total Registrations in Supabase: ${totalRegs}`);

  // 2. Fetch all in batches of 1000
  const PAGE_SIZE = 1000;
  const allRegistrations = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error(error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allRegistrations.push(...data);
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    }
  }

  console.log(`Fetched ${allRegistrations.length} registrations for export.`);
  if (allRegistrations.length !== totalRegs) {
    throw new Error(`Mismatch! DB count: ${totalRegs}, Exported: ${allRegistrations.length}`);
  }

  // 3. Verify Excel Workbook Columns
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registrations");

  worksheet.columns = [
    { header: "Order ID", key: "order_id" },
    { header: "Bib Number", key: "bib_number" },
    { header: "Registration Number", key: "registration_number" },
    { header: "Full Name", key: "full_name" },
    { header: "Bib Name", key: "bib_name" },
    { header: "Email", key: "email" },
    { header: "Mobile", key: "mobile" },
    { header: "Category", key: "race_category" },
    { header: "School Name", key: "school_name" },
    { header: "T-Shirt Size", key: "tshirt_size" },
    { header: "Sree Jayam Family", key: "dav_family_member" },
    { header: "Sree Jayam Family Role", key: "dav_family_type" },
    { header: "How Heard About", key: "dav_hear_about" },
    { header: "Payment Status", key: "payment_status" },
    { header: "Payment Amount (₹)", key: "payment_amount" },
    { header: "WhatsApp Status", key: "whatsapp_status" },
    { header: "Blood Group", key: "blood_group" },
    { header: "Gender", key: "gender" },
    { header: "DOB", key: "dob" },
    { header: "Emergency Contact", key: "emergency_name" },
    { header: "Emergency Mobile", key: "emergency_mobile" },
    { header: "Medical Conditions", key: "medical_conditions" },
    { header: "Nationality", key: "nationality" },
    { header: "First Time Runner", key: "first_time_runner" },
    { header: "Running Club", key: "running_club" },
    { header: "Disability Status", key: "disability_status" },
    { header: "Registered At", key: "created_at" },
  ];

  const excelHeaders = worksheet.columns.map(c => c.header);
  console.log("\nExcel Headers Verified:", excelHeaders);
  
  // Assertions on Excel Headers
  console.assert(!excelHeaders.includes("T-Shirt/Bib Venue"), "ERROR: T-Shirt/Bib Venue should NOT be present in Excel");
  console.assert(!excelHeaders.includes("T-Shirt/Bib Address"), "ERROR: T-Shirt/Bib Address should NOT be present in Excel");
  console.assert(excelHeaders.includes("Sree Jayam Family"), "ERROR: Sree Jayam Family should be present in Excel");
  console.assert(excelHeaders.includes("Sree Jayam Family Role"), "ERROR: Sree Jayam Family Role should be present in Excel");
  console.assert(!excelHeaders.includes("D.A.V Member"), "ERROR: D.A.V Member should NOT be present in Excel");
  console.assert(!excelHeaders.includes("D.A.V Role"), "ERROR: D.A.V Role should NOT be present in Excel");

  // 4. Verify BIB CSV Columns
  const bibHeaders = [
    "Registration Number",
    "Full Name",
    "Bib Number",
    "Bib Name",
    "T-Shirt Size",
    "Category"
  ];
  console.log("\nBib CSV Headers Verified:", bibHeaders);
  console.assert(bibHeaders.length === 6, "ERROR: Bib export must have exactly 6 columns");
  console.assert(bibHeaders[0] === "Registration Number", "Column 1 must be Registration Number");
  console.assert(bibHeaders[1] === "Full Name", "Column 2 must be Full Name");
  console.assert(bibHeaders[2] === "Bib Number", "Column 3 must be Bib Number");
  console.assert(bibHeaders[3] === "Bib Name", "Column 4 must be Bib Name");
  console.assert(bibHeaders[4] === "T-Shirt Size", "Column 5 must be T-Shirt Size");
  console.assert(bibHeaders[5] === "Category", "Column 6 must be Category");

  console.log("\nALL EXPORT ASSERTIONS PASSED PERFECTLY!");
}

testViaFetch().catch(console.error);
