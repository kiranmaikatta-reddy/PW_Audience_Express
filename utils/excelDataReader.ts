import XLSX from 'xlsx';
import path from 'node:path';

export interface TestScenario {
  testCaseId: string;
  flowType: string;
  audienceType: string;
  audienceDefinition: string;
  productName: string;
  heavyBuyers?: string;
  mediumBuyers?: string;
  lightBuyers?: string;
}

/**
 * Reads test data from Excel file
 * @param fileName - Excel file name in the data folder
 * @returns Array of test scenarios
 */
export function readTestDataFromExcel(fileName: string): TestScenario[] {
  const filePath = path.resolve(process.cwd(), 'data', fileName);
  
  console.log(`[EXCEL] Reading test data from: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[worksheetName];
    
    // Convert sheet to JSON with headers from first row
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    // Transform data to TestScenario interface
    const testScenarios: TestScenario[] = rawData.map((row: any) => ({
      testCaseId: row['Test Case ID']?.toString() || '',
      flowType: row['Flow Type']?.toString() || '',
      audienceType: row['Audience Type']?.toString() || '',
      audienceDefinition: row['Audience Definition']?.toString() || '',
      productName: row['Product Name']?.toString() || '',
      heavyBuyers: row['Heavy Buyers']?.toString() || '',
      mediumBuyers: row['Medium Buyers']?.toString() || '',
      lightBuyers: row['Light Buyers']?.toString() || '',
    }));
    
    console.log(`[EXCEL] Successfully loaded ${testScenarios.length} test scenarios`);
    testScenarios.forEach((scenario) => {
      console.log(`[EXCEL] Test Case: ${scenario.testCaseId} - ${scenario.flowType} / ${scenario.audienceType} / ${scenario.audienceDefinition} / ${scenario.productName}`);
    });
    
    return testScenarios;
  } catch (error) {
    console.error(`[EXCEL ERROR] Failed to read Excel file: ${error}`);
    throw new Error(`Failed to read test data from Excel: ${error}`);
  }
}

/**
 * Gets a specific test scenario by test case ID
 */
export function getTestScenarioById(fileName: string, testCaseId: string): TestScenario | undefined {
  const scenarios = readTestDataFromExcel(fileName);
  return scenarios.find(s => s.testCaseId === testCaseId);
}
