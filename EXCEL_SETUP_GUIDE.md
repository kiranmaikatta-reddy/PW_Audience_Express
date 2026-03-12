# Excel Test Data Configuration Guide

## Overview
The test suite now reads test scenarios from an Excel file (`data/Batch_Products.xlsx`) instead of hardcoded values. This allows you to easily add, modify, or remove test cases without changing the test code.

## Excel File Location
- **File**: `data/Batch_Products.xlsx`
- **Sheet Name**: `Test Data`

## Column Definitions

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| Test Case ID | Unique identifier for the test case | TC_001 | Yes |
| Flow Type | Type of flow to execute | EstimateSize, Activate | Yes |
| Audience Type | Type of audience to create | Verified, ProScore | Yes |
| Audience Definition | Specific audience filter | Buyers, Heavy-Medium-Light Buyers, increasers, decreasers | Yes |
| Product Name | Product name to search and select | coke, Coca-Cola | Yes |
| Heavy Buyers | Percentage for heavy buyers (Heavy-Medium-Light Buyers only) | 30 | No |
| Medium Buyers | Percentage for medium buyers (Heavy-Medium-Light Buyers only) | 30 | No |
| Light Buyers | Percentage for light buyers (Heavy-Medium-Light Buyers only) | 40 | No |

## Current Test Cases

The Excel file includes 6 test cases matching the original hardcoded test suite:

1. **TC_001**: EstimateSize + Verified + Heavy-Medium-Light Buyers (30/30/40)
2. **TC_002**: EstimateSize + Verified + Buyers
3. **TC_003**: EstimateSize + ProScore + Buyers
4. **TC_004**: Activate + Verified + Buyers
5. **TC_005**: EstimateSize + Verified + increasers
6. **TC_006**: EstimateSize + Verified + decreasers

## How to Add New Test Cases

1. Open `data/Batch_Products.xlsx` in Excel or any spreadsheet application
2. Add a new row with:
   - A unique Test Case ID (e.g., TC_007)
   - Flow Type: `EstimateSize` or `Activate`
   - Audience Type: `Verified` or `ProScore`
   - Audience Definition: Choose from available options
   - Product Name: The product to search for
   - Optional: Heavy/Medium/Light Buyer percentages (only for Heavy-Medium-Light Buyers workflow)
3. Save the file
4. The tests will automatically include the new test case on the next run

## How to Modify Product Names

Simply edit the `Product Name` column for any test case. For example:
- Change from: `coke`
- Change to: `Coca-Cola` or `pepsi`

The code will automatically use the updated product name when searching and selecting products.

## How to Modify Heavy/Medium/Light Buyer Percentages

If you need to adjust the distribution for Heavy-Medium-Light Buyers scenarios:
1. Open the Excel file
2. Find the test case with audience definition "Heavy-Medium-Light Buyers"
3. Update the values in Heavy Buyers, Medium Buyers, and Light Buyers columns
4. Save the file

## Using the Excel Reader Utility

The `utils/excelDataReader.ts` file provides two main functions:

### `readTestDataFromExcel(fileName: string): TestScenario[]`
Reads all test scenarios from the specified Excel file.

```typescript
const scenarios = readTestDataFromExcel('Batch_Products.xlsx');
// Returns array of TestScenario objects
```

### `getTestScenarioById(fileName: string, testCaseId: string): TestScenario | undefined`
Gets a specific test scenario by its ID.

```typescript
const scenario = getTestScenarioById('Batch_Products.xlsx', 'TC_001');
// Returns specific TestScenario or undefined if not found
```

## Regenerating the Excel File

If you need to reset the Excel file to the original state, run:

```bash
npm run generate:excel
```

(This command can be added to package.json scripts if needed)

Or manually run:
```bash
node scripts/createExcelData.js
```

## Troubleshooting

### Excel file not found
- Ensure the file path is correct: `data/Batch_Products.xlsx`
- Check that the file exists in the workspace

### Product not found error
- Verify the product name in the Excel file matches the exact spelling
- Ensure the product exists in the application being tested

### Heavy/Medium/Light Buyers not filled
- Only applies to test cases with audience definition "Heavy-Medium-Light Buyers"
- Ensure values are provided in the Excel file for these columns
- Values should be numeric strings

## Best Practices

1. **Keep IDs unique**: Always use unique Test Case IDs
2. **Document changes**: If adding new test cases, add comments in the spreadsheet
3. **Validate data**: Ensure all required columns are filled before running tests
4. **Backup Excel file**: Before making major changes, save a backup copy
5. **Version control**: Commit the Excel file changes to your repository
