import * as XLSX from 'xlsx';
import path from 'node:path';

// Create sample Excel data
const testData = [
  {
    'Test Case ID': 'TC_001',
    'Flow Type': 'EstimateSize',
    'Audience Type': 'Verified',
    'Audience Definition': 'Heavy-Medium-Light Buyers',
    'Product Name': 'coke',
    'Heavy Buyers': '30',
    'Medium Buyers': '30',
    'Light Buyers': '40'
  },
  {
    'Test Case ID': 'TC_002',
    'Flow Type': 'EstimateSize',
    'Audience Type': 'Verified',
    'Audience Definition': 'Buyers',
    'Product Name': 'coke',
    'Heavy Buyers': '',
    'Medium Buyers': '',
    'Light Buyers': ''
  },
  {
    'Test Case ID': 'TC_003',
    'Flow Type': 'EstimateSize',
    'Audience Type': 'ProScore',
    'Audience Definition': 'Buyers',
    'Product Name': 'coke',
    'Heavy Buyers': '',
    'Medium Buyers': '',
    'Light Buyers': ''
  },
  {
    'Test Case ID': 'TC_004',
    'Flow Type': 'Activate',
    'Audience Type': 'Verified',
    'Audience Definition': 'Buyers',
    'Product Name': 'coke',
    'Heavy Buyers': '',
    'Medium Buyers': '',
    'Light Buyers': ''
  },
  {
    'Test Case ID': 'TC_005',
    'Flow Type': 'EstimateSize',
    'Audience Type': 'Verified',
    'Audience Definition': 'increasers',
    'Product Name': 'coke',
    'Heavy Buyers': '',
    'Medium Buyers': '',
    'Light Buyers': ''
  },
  {
    'Test Case ID': 'TC_006',
    'Flow Type': 'EstimateSize',
    'Audience Type': 'Verified',
    'Audience Definition': 'decreasers',
    'Product Name': 'coke',
    'Heavy Buyers': '',
    'Medium Buyers': '',
    'Light Buyers': ''
  }
];

// Create a new workbook
const worksheet = XLSX.utils.json_to_sheet(testData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Data');

// Write to file
const filePath = path.resolve(process.cwd(), 'data', 'Batch_Products.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`✓ Excel file created successfully at: ${filePath}`);
console.log(`✓ Total test scenarios: ${testData.length}`);
