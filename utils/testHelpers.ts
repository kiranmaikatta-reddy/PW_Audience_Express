import { test, expect, chromium, Browser, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// HTML Report Generator
export function generateHTMLReport(testName: string, results: { status: string; message: string }[]): void {
  const timestamp = new Date().toLocaleString();
  const reportDir = 'html-reports';
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testName} - Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .results {
            margin-top: 20px;
        }
        .result-item {
            padding: 10px;
            margin: 10px 0;
            border-left: 4px solid #28a745;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .result-item.passed {
            border-left-color: #28a745;
            background-color: #d4edda;
        }
        .result-item.failed {
            border-left-color: #dc3545;
            background-color: #f8d7da;
        }
        .status {
            font-weight: bold;
            margin-right: 10px;
        }
        .status.passed {
            color: #28a745;
        }
        .status.failed {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${testName}</h1>
        <div class="timestamp">Generated on: ${timestamp}</div>
        <div class="results">
            ${results.map((result) => `
                <div class="result-item ${result.status.toLowerCase()}">
                    <span class="status ${result.status.toLowerCase()}">${result.status.toUpperCase()}:</span>
                    <span>${result.message}</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
  
  const reportPath = path.join(reportDir, `${testName}-${Date.now()}.html`);
  fs.writeFileSync(reportPath, htmlContent, 'utf-8');
  console.log(`[REPORT] HTML report generated: ${reportPath}`);
}

// Utility function to generate unique batch names
export function generateUniqueBatchName(): string {
  let prefix ='12thMar_Auto';
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const batchName = `${prefix}-${timestamp}-${randomSuffix}`;
  console.log(`[REPORT] Generated unique batch name: ${batchName}`);
  return batchName;
}

// Helper to connect to EC2 browser instance
export async function connectToEc2Browser(): Promise<Browser> {
  console.log('[REPORT] Connecting to EC2 Chrome instance...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('[REPORT] Connected to EC2 successfully');
  return browser;
}

// Helper to get or create a page from browser
export async function getPageForTest(browser: Browser): Promise<Page> {
  const contexts = browser.contexts();
  const context = contexts.length > 0 ? contexts[0] : await browser.newContext();
  const pages = context.pages();
  let page = pages.length > 0 ? pages[0] : await context.newPage();

  console.log('[REPORT] Navigating to audience-batches page...');
  await page.goto('http://ec2-13-61-208-154.eu-north-1.compute.amazonaws.com/audience-batches');
  await page.waitForLoadState('networkidle');
  return page;
}

// Helper for the batch creation flow; accepts page and batch name
export async function fillBatchDetails(page: Page, batchName: string, flowType: string) {  
  console.log(`[REPORT] Filling batch details - Name: ${batchName}, FlowType: ${flowType}`);
  await page.getByRole('textbox', { name: 'Batch Name *' }).fill(batchName);
  
  // Assertion: Verify batch name was filled
  await expect(page.getByRole('textbox', { name: 'Batch Name *' })).toHaveValue(batchName);
  console.log('[REPORT] ✓ Batch name filled successfully');
  
  await page.getByRole('textbox', { name: 'Description' }).fill('Creating batch for VerifyBuyers flow');

  if (flowType === 'EstimateSize') {
    await page.getByRole('button', { name: 'Estimate Size' }).click();
  } else if (flowType === 'Activate') {
    await page.getByRole('button', { name: 'Activate' }).click();
    await page.locator('select').first().selectOption('COKE FARM INC');
  }

  await page.locator('select').first().selectOption('COKE FARM INC');
  
  // Check if Continue button is enabled before clicking
  const continueButton = page.locator('app-batch-metadata-modal').getByRole('button', { name: 'Continue' });
  if (await continueButton.isEnabled()) {
    await continueButton.click();
  } else {
    console.warn('[REPORT] Continue button is not enabled');
  }
}

export async function addAudienceFor_VerifiedFlow(page: Page, audiType: string, audiDefinition: string, SearchExistingProduct: string, heavyBuyers?: string, mediumBuyers?: string, lightBuyers?: string) {
  await page.getByRole('button', { name: 'Create First Audience', exact: true }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).fill(audiType + "_" + audiDefinition + "_" + generateUniqueBatchName());
  console.log(SearchExistingProduct);
  await page.getByRole('textbox', { name: 'Audience Description' }).click();
  await page.getByRole('textbox', { name: 'Audience Description' }).fill('Creating audience for VerifyBuyers flow');
  await page.getByRole('button', { name: 'TYPE Select type' }).click();
  await page.getByLabel('Audience Type Click to learn').selectOption(audiType);
  
  if (audiDefinition === 'Heavy-Medium-Light Buyers') {
    await page.getByLabel('Audience Definition').selectOption('Heavy-Medium-Light Buyers');
    // Fill Heavy Buyers
    await page.locator('#heavyBuyers').fill(heavyBuyers || '30');
    // Fill Medium Buyers
    await page.locator('#mediumBuyers').fill(mediumBuyers || '30');
    // Fill Light Buyers
    await page.locator('#lightBuyers').fill(lightBuyers || '40');
  }else {
    await page.getByLabel('Audience Definition').selectOption(audiDefinition);
  }
  
  await page.getByRole('button', { name: 'SCOPE No products selected' }).click();
  await page.getByRole('button', { name: 'Select Products' }).click();
  await page.getByRole('textbox', { name: 'Search products' }).click();
  await page.getByRole('textbox', { name: 'Search products' }).fill(SearchExistingProduct);
  console.log(`[REPORT] Searching for product: ${SearchExistingProduct}`);
 
  await page.getByRole('textbox', { name: 'Search products' }).press('Enter');
  await page.getByRole('button', { name: 'Add' }).first().click();
  
  // Assertion: Verify product was added (OK button appears)
  await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();
  console.log(`[REPORT] ✓ Product "${SearchExistingProduct}" search and selection completed`);
  
  await page.getByRole('button', { name: 'OK' }).click();
  console.log('[REPORT] ✓ Verified Buyers audience configured successfully');
}

export async function searchBatchDetails(page: Page, batchName: string): Promise<{ status: string; message: string }[]> {
  console.log(`[REPORT] Searching for batch: ${batchName}`);
  
  const reportResults: { status: string; message: string }[] = [];
  
  // Search for the batch and open details
  const searchBox = page.getByRole('textbox', { name: 'Search batches...' });
  await searchBox.click();
  await searchBox.fill(batchName);
  await searchBox.press('Enter');
  
  // Wait for search results to load
  await page.waitForLoadState('networkidle');
  console.log('[REPORT] Search results loaded, looking for batch...');
  
  // Find and click the batch row - with retry logic
  const batchRow = page.getByText(batchName).first();
  try {
    await expect(batchRow).toBeVisible({ timeout: 5000 });
    console.log('[REPORT] ✓ Batch found in search results');
    reportResults.push({ status: 'passed', message: `Batch found in search results: "${batchName}"` });
    
    // Scroll into view and click
    await batchRow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000); // Allow element to stabilize
    await batchRow.click({ force: true });
    
    console.log('[REPORT] ✓ Clicked on batch to open details');
    reportResults.push({ status: 'passed', message: 'Successfully clicked on batch to open details' });
  } catch (error) {
    console.error('[ERROR] Failed to find or click batch:', error);
    reportResults.push({ status: 'failed', message: `Failed to find or click batch: ${error}` });
    throw new Error(`Batch "${batchName}" not found in search results`);
  }
  
  // Wait for modal/dialog to appear
  await page.waitForLoadState('networkidle');
  
  return reportResults;
}

export async function validateBatchDetails(page: Page, batchName: string, flowType: string, audiType: string, audiDefinition: string, reportResults: { status: string; message: string }[]): Promise<void> {
  console.log('[REPORT] Validating batch details...');
  
  // Validate batch details dialog content
  const dialogElement = page.getByRole('dialog');
 
  test.setTimeout(90000);
  try {
    // Wait for dialog to be visible
    await expect(dialogElement).toBeVisible({ timeout: 50000 });
    console.log('[REPORT] Batch details dialog is visible, validating content...');
    reportResults.push({ status: 'passed', message: 'Batch details dialog is visible' });
    
    // Validate dialog exists and is stable
    await expect(dialogElement).toBeVisible();
    console.log('[REPORT] ✓ Dialog is visible');
    reportResults.push({ status: 'passed', message: 'Dialog is visible and stable' });
    
    // Validate all required text content   
    let requiredTexts: (string | { text: string; alternatives: string[] })[];
    
    if(flowType === 'EstimateSize' && audiType === 'Verified' && audiDefinition === 'buyers'){ 
      requiredTexts = [
        { text: 'Sized', alternatives: ['Processing'] },
        'Dollars > $0', 
        'Buyers', 
        'Type:Verified'
      ];  
    } else if (flowType === 'EstimateSize' && audiType === 'Verified' && audiDefinition === 'Heavy-Medium-Light Buyers') {
      requiredTexts = ['Sized', 'Dollars > $0', 'Heavy-Medium-Light Buyers', 'Type:Verified','heavy','medium','light'];
    }else{
      // Default validation texts for other flow types 
      requiredTexts = ['Sized', 'Dollars > $0', 'Buyers', 'Type:Verified'];
    }
    test.setTimeout(90000);
    for (const textItem of requiredTexts) {
      let text: string;
      let alternatives: string[] = [];
      
      if (typeof textItem === 'string') {
        text = textItem;
      } else {
        text = textItem.text;
        alternatives = textItem.alternatives || [];
      }
      
      try {
        // Try to find the main text
        try {
          await expect(dialogElement).toContainText(text);
          console.log(`[REPORT] ✓ Dialog contains: "${text}"`);
          reportResults.push({ status: 'passed', message: `Dialog contains: "${text}"` });
        } catch (mainError) {
          // If main text not found and we have alternatives, try them
          if (alternatives.length > 0) {
            let foundAlternative = false;
            for (const alt of alternatives) {
              try {
                await expect(dialogElement).toContainText(alt);
                console.log(`[REPORT] ✓ Dialog contains: "${alt}" (alternative to "${text}")`);
                reportResults.push({ status: 'passed', message: `Dialog contains: "${alt}" (alternative to "${text}")` });
                foundAlternative = true;
                break;
              } catch {
                // Continue to next alternative
              }
            }
            if (!foundAlternative) {
              throw new Error(`Dialog missing "${text}" and all alternatives: ${alternatives.join(', ')}`);
            }
          } else {
            throw mainError;
          }
        }
      } catch (error) {
        console.error(`[ERROR] Dialog missing text: "${text}" or alternatives`);
        reportResults.push({ status: 'failed', message: `Dialog missing expected text or alternatives for: "${text}"` });
        throw error;
      }
    }
    
    console.log('[REPORT] ✓ All batch details validations passed');
    reportResults.push({ status: 'passed', message: 'All batch details validations passed' });
    
    // Generate HTML report with results
    generateHTMLReport(`Batch-Validation-${batchName}`, reportResults);
    
    // Close the dialog after validation
    const closeModalButton = page.getByRole('button', { name: 'Close modal' });
    await page.getByText('Close').click();
    reportResults.push({ status: 'passed', message: 'Dialog closed successfully' });
  } catch (error) {
    console.error('[ERROR] Batch details validation failed:', error);
    // Generate HTML report even on failure
    generateHTMLReport(`Batch-Validation-${batchName}`, reportResults);
    throw error;
  }
}

export async function searchBatchAndValidateDetails(page: Page, batchName: string, flowType: string, audiType: string, audiDefinition: string) {
  const reportResults = await searchBatchDetails(page, batchName);
  await validateBatchDetails(page, batchName, flowType, audiType, audiDefinition, reportResults);
}

export async function createBatch(page: Page, FlowType: string, audiType: string, audiDefinition: string, SearchExistingProduct: string, heavyBuyers?: string, mediumBuyers?: string, lightBuyers?: string) {
  console.log(`[REPORT] Starting batch creation - FlowType: ${FlowType}, AudienceType: ${audiType}, Product: ${SearchExistingProduct}`);
  // Open batch view
  await page.getByRole('link', { name: 'Product Groups' }).click();
  await page.getByRole('link', { name: 'Batch View' }).click();
  await page.getByRole('button', { name: 'Create Batch' }).click();
  
  let batchName = generateUniqueBatchName();
  await fillBatchDetails(page, batchName, FlowType);
  
 if (audiType === 'Verified') {
    await addAudienceFor_VerifiedFlow(page, audiType, audiDefinition, SearchExistingProduct, heavyBuyers, mediumBuyers, lightBuyers);
    // Select Time range as 13 weeks
    await page.getByRole('button', { name: 'Select Time' }).click();
    await page.getByRole('button', { name: '13 Weeks' }).click();
    await page.getByRole('button', { name: 'Add Selection' }).click();
    await page.getByRole('button', { name: 'Apply Selection' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Continue to batch summary page - check if button is enabled before clicking
    const continueButton = page.getByRole('button', { name: 'Continue' }).first();
    try {
      const isEnabled = await continueButton.isEnabled();
      if (isEnabled) {
        console.log('[REPORT] Continue button is enabled, clicking...');
        await continueButton.click();
        await page.waitForLoadState('networkidle');
      } else {
        console.warn('[REPORT] Continue button is not enabled in batch summary');
      }
    } catch (error) {
      console.error('[ERROR] Error checking Continue button:', error);
    }
  }

  if (FlowType === 'EstimateSize' && audiType === 'Verified') {
    // Calculate audience size and activate batch
    await page.locator('app-batch-form-actions').getByRole('button', { name: 'Calculate Size' }).click();
  }
 
  // Search for the batch and validate details
  await searchBatchAndValidateDetails(page, batchName, FlowType, audiType, audiDefinition);
}
