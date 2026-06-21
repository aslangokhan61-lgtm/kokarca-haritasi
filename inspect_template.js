const XLSX = require('xlsx');
const path = require('path');

const filePath = 'belgeler/2026 SURVEY KAYIT FORMU.xlsx';
console.log('Reading file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames.find(n => n.includes("2026")) || workbook.SheetNames[0];
    console.log('Sheet Name:', sheetName);
    const ws = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    console.log('Range:', range);

    // Let's inspect the first 5 rows and columns H to P (index 7 to 15)
    for (let r = 0; r <= 5; r++) {
        let rowStr = `Row ${r}: `;
        for (let c = 7; c <= 15; c++) {
            let ref = XLSX.utils.encode_cell({ r: r, c: c });
            let cell = ws[ref];
            if (cell) {
                rowStr += `[Col ${XLSX.utils.encode_col(c)}: v="${cell.v}", t="${cell.t}", w="${cell.w || ''}"] `;
            } else {
                rowStr += `[Col ${XLSX.utils.encode_col(c)}: empty] `;
            }
        }
        console.log(rowStr);
    }
} catch (e) {
    console.error('Error:', e);
}
