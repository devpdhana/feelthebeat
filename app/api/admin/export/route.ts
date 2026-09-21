import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import ExcelJS from "exceljs";

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

    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get("type")?.toLowerCase() || "excel"; // "excel" or "bib"

    // 1. Fetch ALL registrations in batches of 1,000 (handles >1000 records without PostgREST truncation)
    const PAGE_SIZE = 1000;
    const allRegistrations: any[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error: batchErr } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (batchErr) {
        console.error("[EXPORT] Batch query error at offset " + from, batchErr);
        return NextResponse.json(
          { message: "Failed to retrieve registrations from database." },
          { status: 500 }
        );
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

    // 2. Export BIB CSV (Exactly 6 columns only in exact order)
    if (exportType === "bib" || exportType === "csv") {
      const headers = [
        "Registration Number",
        "Full Name",
        "Bib Number",
        "Bib Name",
        "T-Shirt Size",
        "Category",
      ];

      let csv = headers.map((h) => `"${h}"`).join(",") + "\n";

      allRegistrations.forEach((reg) => {
        const row = [
          reg.registration_number || "",
          reg.full_name || "",
          reg.bib_number || "",
          reg.bib_name || "",
          reg.tshirt_size || "",
          reg.race_category || "",
        ];
        csv += row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="feel-the-beat-bib-export.csv"',
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // 3. Export Full Excel Workbook (.xlsx)
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Feel The Beat Marathon Admin";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Registrations", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Defined Columns with removed T-Shirt/Bib Venue & Address, and renamed D.A.V fields
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

    // Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0698F3" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 28;

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
        blood_group: reg.blood_group || "",
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

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="FTB2026-All-Registrations.xlsx"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[EXPORT] Exception during export generation:", err);
    return NextResponse.json(
      { message: "Failed to generate export file." },
      { status: 500 }
    );
  }
}
