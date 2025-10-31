const fs = require('fs');
const csv = require('csv-parser');

const filePath = process.argv[2] || '/Users/vruttipatel/Downloads/student_data.csv';
const role = process.argv[3] || 'student';

function pickInstitute(row) {
  return row.institute || row.Institute || row.department || row.Department || '';
}

function normalizeRow(rawRow) {
  const row = {};
  for (const k of Object.keys(rawRow)) {
    const v = rawRow[k];
    row[k.trim()] = typeof v === 'string' ? v.trim() : v;
  }
  return row;
}

(async () => {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', () => {
      const errors = [];
      const ok = [];
      let rn = 0;
      for (const raw of rows) {
        rn++;
        const row = normalizeRow(raw);
        // Basic checks per student rules
        if (!row.email || !row.password || !row.firstName || !row.lastName) {
          errors.push({ rowNumber: rn, row, error: 'Missing email/password/firstName/lastName' });
          continue;
        }
        const institute = pickInstitute(row);
        if (role === 'student') {
          if (!row.enrollmentNumber || !institute || !row.branch || (row.year === undefined || row.year === '')) {
            errors.push({ rowNumber: rn, row, error: 'Missing enrollmentNumber, institute/department, branch, or year for student' });
            continue;
          }
          if (isNaN(Number(row.year))) {
            errors.push({ rowNumber: rn, row, error: 'Year must be a number' });
            continue;
          }
        }
        ok.push({ rowNumber: rn, row });
      }
      console.log('Validation result for file:', filePath);
      console.log('Total rows:', rows.length);
      console.log('Valid rows:', ok.length);
      if (ok.length) console.log('Sample valid row:', ok[0]);
      console.log('Errors count:', errors.length);
      if (errors.length) {
        console.log('Errors:');
        for (const e of errors) {
          console.log(`Row ${e.rowNumber}: ${e.error}`);
        }
      }
    });
})();
