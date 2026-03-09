import { test, expect, chromium, Browser, Page } from '@playwright/test';

// Utility function to generate unique batch names
function generateUniqueBatchName(): string {
  let prefix ='09Auto_';
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const batchName = `${prefix}-${timestamp}-${randomSuffix}`;
  console.log(`[REPORT] Generated unique batch name: ${batchName}`);
  return batchName;
}

// Helper that encapsulates the pre-condition of connecting to an existing Chrome instance
async function connectToEc2(): Promise<{ browser: Browser; page: Page }> {
  // connect to running chrome
  console.log('[REPORT] Connecting to EC2 Chrome instance...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const context = contexts.length > 0 ? contexts[0] : await browser.newContext();
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  console.log('[REPORT] Navigating to audience-batches page...');
  await page.goto('http://ec2-13-61-208-154.eu-north-1.compute.amazonaws.com/audience-batches');
  await page.waitForLoadState('networkidle');
  console.log('[REPORT] Connected to EC2 successfully');
  return { browser, page };
}

// Helper for the batch creation flow; accepts page and batch name
async function fillBatchDetails(page: Page, batchName: string, flowType: string) {  
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

async function addAudienceFor_ProScoreBuyers(page: Page, flowType: string) {
  await page.getByRole('button', { name: 'Create First Audience', exact: true }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).fill('addAudienceFor_ProScoreBuyers');
  
  // Assertion: Verify audience name was filled
  await expect(page.getByRole('textbox', { name: 'Audience Name *' })).toHaveValue('addAudienceFor_ProScoreBuyers');
  console.log('[REPORT] ✓ Audience name filled successfully');
  
  await page.getByRole('textbox', { name: 'Audience Description' }).click();
  await page.getByRole('textbox', { name: 'Audience Description' }).fill('addAudienceFor_ProScoreBuyers');
  await page.getByRole('button', { name: 'TYPE Select type' }).click();
  await page.getByLabel('Audience Type Click to learn').selectOption('proscore');
  await page.getByLabel('Audience Definition').selectOption('buyers-of');
  await page.getByRole('button', { name: 'SCOPE No products selected' }).click();
  await page.getByRole('button', { name: 'Select Products' }).click();
  await page.getByRole('button', { name: 'Air Fresheners' }).getByRole('checkbox').check();
  
  // Assertion: Verify checkbox was selected
  await expect(page.getByRole('button', { name: 'Air Fresheners' }).getByRole('checkbox')).toBeChecked();
  console.log('[REPORT] ✓ Product selected successfully');
  
  await page.getByRole('button', { name: 'Apply Selection' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('app-batch-form-actions').getByRole('button', { name: 'Calculate Size' }).click();
  await page.getByRole('button', { name: 'View Batches' }).click();
  
  console.log('[REPORT] ✓ ProScore Buyers audience added successfully');
}

async function addAudienceFor_VerifiedBuyers(page: Page) {
  await page.getByRole('button', { name: 'Create First Audience', exact: true }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).click();
  await page.getByRole('textbox', { name: 'Audience Name *' }).fill('Audience_March06-01');
  
  // Assertion: Verify audience name was filled
  await expect(page.getByRole('textbox', { name: 'Audience Name *' })).toHaveValue('Audience_March06-01');
  console.log('[REPORT] ✓ Verified Buyers audience name filled');
  
  await page.getByRole('textbox', { name: 'Audience Description' }).click();
  await page.getByRole('textbox', { name: 'Audience Description' }).fill('Creating audience for VerifyBuyers flow');
  await page.getByRole('button', { name: 'TYPE Select type' }).click();
  await page.getByLabel('Audience Type Click to learn').selectOption('verified');
  await page.getByLabel('Audience Definition').selectOption('Buyers');
  await page.getByRole('button', { name: 'SCOPE No products selected' }).click();
  await page.getByRole('button', { name: 'Select Products' }).click();
  await page.getByRole('textbox', { name: 'Search products' }).click();
  await page.getByRole('textbox', { name: 'Search products' }).fill('coke');
  await page.getByRole('textbox', { name: 'Search products' }).press('Enter');
  await page.getByRole('button', { name: 'Add' }).first().click();
  
  // Assertion: Verify product was added (OK button appears)
  await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();
  console.log('[REPORT] ✓ Product search and selection completed');
  
  await page.getByRole('button', { name: 'OK' }).click();
  console.log('[REPORT] ✓ Verified Buyers audience configured successfully');
}

async function copyBatch(page: Page) {
  await page.getByRole('link', { name: 'Product Groups' }).click();
  await page.getByRole('link', { name: 'Batch View' }).click();

  await page.getByRole('textbox', { name: 'Search batches...' }).click();
  await page.getByRole('textbox', { name: 'Search batches...' }).fill('09Auto');
  await page.getByRole('textbox', { name: 'Search batches...' }).press('Enter');
  
  // Assertion: Verify search results contain Copy batch button
  await expect(page.getByRole('button', { name: 'Copy batch' }).first()).toBeVisible();
  console.log('[REPORT] ✓ Auto batch found');
  
  await page.getByRole('button', { name: 'Copy batch' }).first().click();
  
  // Check if Continue button in modal is enabled before clicking
  const modalContinueButton = page.locator('app-batch-metadata-modal').getByRole('button', { name: 'Continue' });
  if (await modalContinueButton.isEnabled()) {
    console.log('[REPORT] Modal Continue button is enabled, clicking...');
    await modalContinueButton.click();
    await page.waitForLoadState('networkidle');
  } else {
    console.warn('[REPORT] Modal Continue button is not enabled');
  }
  
  // Check if Continue button is enabled before clicking - use first() to handle multiple matches
  const continueButton = page.getByRole('button', { name: 'Continue' }).first();
  try {
    const isEnabled = await continueButton.isEnabled();
    if (isEnabled) {
      console.log('[REPORT] Continue button is enabled, clicking...');
      await continueButton.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.warn('[REPORT] Continue button is not enabled');
    }
  } catch (error) {
    console.error('[ERROR] Error checking Continue button:', error);
  }
  
  await page.locator('app-batch-form-actions').getByRole('button', { name: 'Calculate Size' }).click();
  await page.getByRole('button', { name: 'View Batches' }).click();

  await page.getByRole('textbox', { name: 'Search batches...' }).click();
  await page.getByRole('textbox', { name: 'Search batches...' }).fill('Copy of Auto');
  await page.getByRole('textbox', { name: 'Search batches...' }).press('Enter');
  
  // Assertion: Verify batch copy was successful
  await expect(page.getByText(/Copy of Auto/).first()).toBeVisible();
  console.log('[REPORT] ✓ Batch copied successfully');
}
  

async function createBatch(page: Page, FlowType: string, audiType: string) {
  console.log(`[REPORT] Starting batch creation - FlowType: ${FlowType}, AudienceType: ${audiType}`);
  // Open batch view
  await page.getByRole('link', { name: 'Product Groups' }).click();
  await page.getByRole('link', { name: 'Batch View' }).click();
  await page.getByRole('button', { name: 'Create Batch' }).click();
  
  let batchName = generateUniqueBatchName();
  await fillBatchDetails(page, batchName, FlowType);
  
  if (audiType === 'ProScoreBuyers') {
    await addAudienceFor_ProScoreBuyers(page, audiType);
  } else if (audiType === 'VerifiedBuyers') {
    await addAudienceFor_VerifiedBuyers(page);
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

  if (FlowType === 'EstimateSize' && audiType === 'VerifiedBuyers') {
    // Calculate audience size and activate batch
    await page.locator('app-batch-form-actions').getByRole('button', { name: 'Calculate Size' }).click();
  } else if (FlowType === 'Activate' && audiType === 'VerifiedBuyers') {
    await page.getByRole('button', { name: 'Create First Destination' }).click();
    await page.getByRole('button', { name: 'Amazon-134 Amazon-' }).click();
    await page.getByRole('button', { name: 'Add Destination' }).click();
    await page.getByRole('button', { name: 'Save & Continue' }).click();
    await page.getByRole('button', { name: 'Add All' }).click();
    await page.locator('app-batch-form-actions').getByRole('button', { name: 'Activate' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'View Batches' }).click();
  }

  await page.getByRole('textbox', { name: 'Search batches...' }).click();
  await page.getByRole('textbox', { name: 'Search batches...' }).fill(batchName);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search batches...' }).click();
  await page.getByRole('textbox', { name: 'Search batches...' }).fill(batchName);
  await page.getByRole('textbox', { name: 'Search batches...' }).press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  
  // Assertion: Verify batch was created successfully
  await expect(page.getByText(batchName)).toBeVisible();
  console.log(`[REPORT] ✓ Batch created successfully: ${batchName}`);
  
  await page.getByText(batchName).click();
}


test.describe('Using Running Chrome Browser', () => {
  test('create new Batch', async () => {
    // Increase test timeout to 90 seconds
    test.setTimeout(90000);
    const { browser, page } = await connectToEc2();
      await createBatch(page, 'EstimateSize', 'VerifiedBuyers');
      //  await createBatch(page, 'Activate', 'VerifiedBuyers');
      // await createBatch(page, 'EstimateSize', 'ProScoreBuyers'); 
      // await copyBatch(page);
    
  });
});

