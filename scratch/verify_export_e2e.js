const ExcelJS = require('exceljs');
const fs = require('fs');

async function validateExportOutput() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('scratch/FeelTheBeat_BIB_List.xlsx');
  const ws = wb.getWorksheet('BIB LIST');

  console.log('=== VALIDATION REPORT ===');
  console.log('1. Sheet Name:', ws.name, ws.name === 'BIB LIST' ? '✅ PASS' : '❌ FAIL');
  console.log('2. Total Rows (including header):', ws.rowCount);
  console.log('3. Total Data Rows (Runners):', ws.rowCount - 1);
  console.log('4. Column Count:', ws.columnCount, ws.columnCount === 18 ? '✅ PASS' : '❌ FAIL');

  const expectedHeaders = [
    'S.No',
    'BIB Number',
    'Runner Name',
    'Gender',
    'Date of Birth',
    'Age',
    'Race Category',
    'T-Shirt Size',
    'Mobile Number',
    'Email',
    'Emergency Contact Name',
    'Emergency Contact Number',
    'DAV Family Status',
    'DAV Family Type',
    'T-Shirt & Bib Distribution Method',
    'Distribution Venue',
    'Payment Status',
    'Registration ID'
  ];

  const actualHeaders = ws.getRow(1).values.filter(Boolean);
  let headersMatch = true;
  expectedHeaders.forEach((h, idx) => {
    if (actualHeaders[idx] !== h) {
      console.error(`Header mismatch at index ${idx}: expected "${h}", got "${actualHeaders[idx]}"`);
      headersMatch = false;
    }
  });
  console.log('5. Exact Header Order & Names:', headersMatch ? '✅ PASS' : '❌ FAIL');

  // Category counts and Gender counts
  const catCounts = {};
  const genderCounts = {};
  let objectOrNullFound = false;

  for (let r = 2; r <= ws.rowCount; r++) {
    const rowValues = ws.getRow(r).values;
    const cat = rowValues[7]; // Race Category
    const gender = rowValues[4]; // Gender
    const mobile = String(rowValues[9] || '');

    catCounts[cat] = (catCounts[cat] || 0) + 1;
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;

    // Check for scientific notation in mobile
    if (mobile.includes('e+') || mobile.includes('E+')) {
      console.error(`Row ${r}: Scientific notation detected in mobile: ${mobile}`);
    }

    rowValues.forEach((v) => {
      const s = String(v);
      if (s.includes('[object') || s === 'undefined' || s === 'null') {
        objectOrNullFound = true;
        console.error(`Row ${r}: Invalid value detected: ${s}`);
      }
    });
  }

  console.log('6. Category Distribution:', catCounts);
  console.log('7. Gender Distribution:', genderCounts);
  console.log('8. No [object Object] / null / undefined / scientific notation:', !objectOrNullFound ? '✅ PASS' : '❌ FAIL');
}

validateExportOutput();
