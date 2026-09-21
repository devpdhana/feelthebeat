const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/)?.[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/)?.[1];

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testExportLogic() {
  console.log("=== Testing Server-Side Batch Fetch for Export ===");
  
  const PAGE_SIZE = 1000;
  const allRegistrations = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Batch query error:", error);
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

  console.log(`Successfully fetched ALL ${allRegistrations.length} registrations in batches.`);

  // 1. Test Excel Workbook Generation
  console.log("\n--- Generating Excel (.xlsx) ---");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registrations");

  worksheet.columns = [
    { header: "Order ID", key: "order_id", width: 18 },
    { header: "Bib Number", key: "bib_number", width: 14 },
    { header: "Registration Number", key: "registration_number", width: 22 },
    { header: "Full Name", key: "full_name", width: 24 },
    { header: "Bib Name", key: "bib_name", width: 20 },
    { header: "Email", key: "email", width: 28 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "Category", key: "race_category", width: 22 },
    { header: "School Name", key: "school_name", width: 24 },
    { header: "T-Shirt Size", key: "tshirt_size", width: 14 },
    { header: "Sree Jayam Family", key: "dav_family_member", width: 18 },
    { header: "Sree Jayam Family Role", key: "dav_family_type", width: 22 },
    { header: "How Heard About", key: "dav_hear_about", width: 24 },
    { header: "Payment Status", key: "payment_status", width: 16 },
    { header: "Payment Amount (₹)", key: "payment_amount", width: 18 },
    { header: "WhatsApp Status", key: "whatsapp_status", width: 18 },
    { header: "Blood Group", key: "blood_group", width: 14 },
    { header: "Gender", key: "gender", width: 12 },
    { header: "DOB", key: "dob", width: 14 },
    { header: "Emergency Contact", key: "emergency_name", width: 22 },
    { header: "Emergency Mobile", key: "emergency_mobile", width: 18 },
    { header: "Medical Conditions", key: "medical_conditions", width: 22 },
    { header: "Nationality", key: "nationality", width: 14 },
    { header: "First Time Runner", key: "first_time_runner", width: 18 },
    { header: "Running Club", key: "running_club", width: 20 },
    { header: "Disability Status", key: "disability_status", width: 16 },
    { header: "Registered At", key: "created_at", width: 22 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0698F3" },
  };

  allRegistrations.forEach((reg) => {
    worksheet.addRow({
      order_id: reg.order_id || "",
      bib_number: reg.bib_number || "",
      registration_number: reg.registration_number || "",
      full_name: reg.full_name || "",
      bib_name: reg.bib_name || "",
      email: reg.email || "",
      mobile: reg.mobile || "",
      race_category: reg.race_category || "",
      school_name: reg.school_name || "",
      tshirt_size: reg.tshirt_size || "",
      dav_family_member: reg.dav_family_member || "",
      dav_family_type: reg.dav_family_type || "",
      dav_hear_about: reg.dav_hear_about || "",
      payment_status: reg.payment_status || "",
      payment_amount: reg.payment_amount || 0,
      whatsapp_status: reg.whatsapp_status || (reg.whatsapp_sent ? "SENT" : "NOT_SENT"),
      bloodGroup: reg.blood_group || "",
      gender: reg.gender || "",
      dob: reg.dob || "",
      emergency_name: reg.emergency_name || "",
      emergency_mobile: reg.emergency_mobile || "",
      medical_conditions: reg.medical_conditions || "None",
      nationality: reg.nationality || "Indian",
      first_time_runner: reg.first_time_runner || "No",
      running_club: reg.running_club || "",
      disability_status: reg.disability_status || "No",
      created_at: reg.created_at ? reg.created_at.replace("T", " ").substring(0, 19) : "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  console.log(`Excel generated successfully! Buffer size: ${buffer.byteLength} bytes. Rows count: ${worksheet.rowCount}`);

  // 2. Test BIB CSV Export (6 columns only)
  console.log("\n--- Generating BIB CSV (6 Columns Only) ---");
  const bibHeaders = [
    "Registration Number",
    "Full Name",
    "Bib Number",
    "Bib Name",
    "T-Shirt Size",
    "Category"
  ];

  let bibCsv = bibHeaders.map(h => `"${h}"`).join(",") + "\n";
  allRegistrations.forEach((reg) => {
    const row = [
      reg.registration_number || "",
      reg.full_name || "",
      reg.bib_number || "",
      reg.bib_name || "",
      reg.tshirt_size || "",
      reg.race_category || ""
    ];
    bibCsv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
  });

  console.log(`BIB CSV generated successfully! Lines count: ${bibCsv.split("\n").length - 1}`);
  console.log("Sample first 3 rows of BIB CSV:\n" + bibCsv.split("\n").slice(0, 4).join("\n"));
}

testExportLogic().catch(console.error);
