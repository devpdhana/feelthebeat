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

    // Helper functions for BIB Export formatting
    const calculateAge = (dobStr: string | null | undefined): number | string => {
      if (!dobStr) return "";
      const birth = new Date(dobStr);
      if (isNaN(birth.getTime())) return "";
      const eventDate = new Date("2026-09-27");
      let age = eventDate.getFullYear() - birth.getFullYear();
      const m = eventDate.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && eventDate.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : "";
    };

    const formatDate = (dobStr: string | null | undefined): string => {
      if (!dobStr) return "";
      const d = new Date(dobStr);
      if (isNaN(d.getTime())) return dobStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // 2. Export BIB Excel Workbook (.xlsx)
    if (exportType === "bib") {
      // Filter only successful paid registrations eligible for BIB allocation
      const eligibleBibRegistrations = allRegistrations.filter(
        (reg) => !reg.payment_status || reg.payment_status.toLowerCase() === "successful"
      );

      // Sort by BIB Number ascending (numerically), then Category, then Runner Name
      eligibleBibRegistrations.sort((a, b) => {
        const bibA = parseInt(a.bib_number, 10);
        const bibB = parseInt(b.bib_number, 10);
        if (!isNaN(bibA) && !isNaN(bibB)) {
          return bibA - bibB;
        }
        if (!isNaN(bibA)) return -1;
        if (!isNaN(bibB)) return 1;
        const catComp = (a.race_category || "").localeCompare(b.race_category || "");
        if (catComp !== 0) return catComp;
        return (a.full_name || "").localeCompare(b.full_name || "");
      });

      const bibWorkbook = new ExcelJS.Workbook();
      bibWorkbook.creator = "Feel The Beat Marathon Admin";
      bibWorkbook.created = new Date();

      const bibSheet = bibWorkbook.addWorksheet("BIB LIST", {
        views: [{ state: "frozen", ySplit: 1 }],
        properties: { defaultRowHeight: 20 },
      });

      // 14 Standard Columns with Blood Group added and distribution/DAV/payment removed
      bibSheet.columns = [
        { header: "S.No", key: "sno", width: 8 },
        { header: "BIB Number", key: "bib_number", width: 14 },
        { header: "Runner Name", key: "runner_name", width: 26 },
        { header: "Gender", key: "gender", width: 12 },
        { header: "Date of Birth", key: "dob", width: 15 },
        { header: "Age", key: "age", width: 8 },
        { header: "Race Category", key: "race_category", width: 22 },
        { header: "T-Shirt Size", key: "tshirt_size", width: 14 },
        { header: "Mobile Number", key: "mobile", width: 16 },
        { header: "Email", key: "email", width: 30 },
        { header: "Emergency Contact Name", key: "emergency_name", width: 24 },
        { header: "Emergency Contact Number", key: "emergency_mobile", width: 24 },
        { header: "Blood Group", key: "blood_group", width: 14 },
        { header: "Registration ID", key: "registration_id", width: 22 },
      ];

      // Header row styling
      const bibHeaderRow = bibSheet.getRow(1);
      bibHeaderRow.height = 28;
      bibHeaderRow.eachCell((cell) => {
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0698F3" }, // Brand Blue
        };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FF0478C4" } },
          left: { style: "thin", color: { argb: "FF0478C4" } },
          bottom: { style: "medium", color: { argb: "FF0478C4" } },
          right: { style: "thin", color: { argb: "FF0478C4" } },
        };
      });

      // Enable AutoFilter on header row
      bibSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 14 },
      };

      eligibleBibRegistrations.forEach((reg, index) => {
        const row = bibSheet.addRow({
          sno: index + 1,
          bib_number: reg.bib_number != null ? String(reg.bib_number) : "",
          runner_name: reg.full_name || "",
          gender: reg.gender || "",
          dob: formatDate(reg.dob),
          age: calculateAge(reg.dob),
          race_category: reg.race_category || "",
          tshirt_size: reg.tshirt_size || "",
          mobile: reg.mobile ? String(reg.mobile).trim() : "",
          email: reg.email ? String(reg.email).trim().toLowerCase() : "",
          emergency_name: reg.emergency_name || "",
          emergency_mobile: reg.emergency_mobile ? String(reg.emergency_mobile).trim() : "",
          blood_group: reg.blood_group || "",
          registration_id: reg.registration_number || reg.order_id || "",
        });

        row.height = 20;
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Calibri", size: 10 };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };

          // Alignment rules
          if ([1, 2, 4, 5, 6, 8, 13].includes(colNumber)) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else if ([9, 12].includes(colNumber)) {
            // Mobile numbers explicitly formatted as string text to prevent scientific notation
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.numFmt = "@";
          } else {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      const buffer = await bibWorkbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="FeelTheBeat_BIB_List.xlsx"',
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
