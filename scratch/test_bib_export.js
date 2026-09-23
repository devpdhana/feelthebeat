const ExcelJS = require('exceljs');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const k = trimmed.substring(0, eqIdx).trim();
    const v = trimmed.substring(eqIdx + 1).trim().replace(/(^["']|["']$)/g, '');
    env[k] = v;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function calculateAge(dobStr) {
  if (!dobStr) return '';
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return '';
  const eventDate = new Date('2026-09-27');
  let age = eventDate.getFullYear() - birth.getFullYear();
  const m = eventDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && eventDate.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
}

function formatDate(dobStr) {
  if (!dobStr) return '';
  const d = new Date(dobStr);
  if (isNaN(d.getTime())) return dobStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function testBibExport() {
  let allRegistrations = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('payment_status', 'Successful')
      .range(from, from + step - 1);
    if (error) {
      console.error('Error fetching registrations:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allRegistrations = allRegistrations.concat(data);
    if (data.length < step) break;
    from += step;
  }

  console.log(`Fetched ${allRegistrations.length} successful registrations.`);

  // Sort logically: BIB Number ascending, then Category, then Name
  allRegistrations.sort((a, b) => {
    const bibA = parseInt(a.bib_number, 10);
    const bibB = parseInt(b.bib_number, 10);
    if (!isNaN(bibA) && !isNaN(bibB)) {
      return bibA - bibB;
    }
    if (!isNaN(bibA)) return -1;
    if (!isNaN(bibB)) return 1;
    const catComp = (a.race_category || '').localeCompare(b.race_category || '');
    if (catComp !== 0) return catComp;
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Feel The Beat Marathon';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('BIB LIST', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 20 },
  });

  // Exactly the 18 columns in exact requested order
  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'BIB Number', key: 'bib_number', width: 14 },
    { header: 'Runner Name', key: 'runner_name', width: 26 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Date of Birth', key: 'dob', width: 15 },
    { header: 'Age', key: 'age', width: 8 },
    { header: 'Race Category', key: 'race_category', width: 22 },
    { header: 'T-Shirt Size', key: 'tshirt_size', width: 14 },
    { header: 'Mobile Number', key: 'mobile', width: 16 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Emergency Contact Name', key: 'emergency_name', width: 24 },
    { header: 'Emergency Contact Number', key: 'emergency_mobile', width: 24 },
    { header: 'DAV Family Status', key: 'dav_family_member', width: 18 },
    { header: 'DAV Family Type', key: 'dav_family_type', width: 20 },
    { header: 'T-Shirt & Bib Distribution Method', key: 'distribution_method', width: 32 },
    { header: 'Distribution Venue', key: 'distribution_venue', width: 28 },
    { header: 'Payment Status', key: 'payment_status', width: 16 },
    { header: 'Registration ID', key: 'registration_id', width: 22 },
  ];

  // Header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0698F3' }, // Premium Brand Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0478C4' } },
      left: { style: 'thin', color: { argb: 'FF0478C4' } },
      bottom: { style: 'medium', color: { argb: 'FF0478C4' } },
      right: { style: 'thin', color: { argb: 'FF0478C4' } },
    };
  });

  // Enable AutoFilter on header row
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 18 },
  };

  allRegistrations.forEach((reg, index) => {
    const row = worksheet.addRow({
      sno: index + 1,
      bib_number: reg.bib_number != null ? String(reg.bib_number) : '',
      runner_name: reg.full_name || '',
      gender: reg.gender || '',
      dob: formatDate(reg.dob),
      age: calculateAge(reg.dob),
      race_category: reg.race_category || '',
      tshirt_size: reg.tshirt_size || '',
      mobile: reg.mobile ? String(reg.mobile).trim() : '',
      email: reg.email ? String(reg.email).trim().toLowerCase() : '',
      emergency_name: reg.emergency_name || '',
      emergency_mobile: reg.emergency_mobile ? String(reg.emergency_mobile).trim() : '',
      dav_family_member: reg.dav_family_member || 'No',
      dav_family_type: reg.dav_family_type || '',
      distribution_method: reg.school_name ? 'School Distribution' : 'Pre-Race Expo / Venue Collection',
      distribution_venue: reg.school_name || 'Deboer Ground, Vellore',
      payment_status: reg.payment_status || 'Successful',
      registration_id: reg.registration_number || reg.order_id || '',
    });

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      // Alignment rules
      if ([1, 2, 4, 5, 6, 8, 13, 17].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([9, 12].includes(colNumber)) {
        // Mobile numbers explicitly formatted as string text
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '@';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  fs.writeFileSync('scratch/FeelTheBeat_BIB_List.xlsx', buffer);
  console.log(`Generated FeelTheBeat_BIB_List.xlsx successfully with ${allRegistrations.length} rows.`);
}

testBibExport();
