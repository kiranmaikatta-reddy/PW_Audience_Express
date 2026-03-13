import { test } from '@playwright/test';
import { Browser } from '@playwright/test';
import { readTestDataFromExcel } from '../utils/excelDataReader.js';
import {
  connectToEc2Browser,
  getPageForTest,
  createBatch
} from '../utils/testHelpers.js';

test.describe('Batch Validation - Group 1', () => {

  // Load test data from Excel once
  const scenarios = readTestDataFromExcel('Batch_Products.xlsx');
  
  // Shared browser instance for all tests
  let sharedBrowser: Browser;
  let currentPage: any;

  // Connect to EC2 once before all tests
  test.beforeAll(async () => {
    sharedBrowser = await connectToEc2Browser();
  });

  // Before each test - prepare page and clear state
  test.beforeEach(async () => {
    console.log('[REPORT] Preparing page for new test...');
    currentPage = await getPageForTest(sharedBrowser);
    // Optionally clear browser cache/cookies
    await currentPage.context().clearCookies();
    console.log('[REPORT] ✓ Page prepared and ready');
  });

  // Create individual test for first 7 scenarios
  scenarios.slice(0, 7).forEach((scenario, index) => {
    test(`[${index + 1}/14] ${scenario.testCaseId} - ${scenario.audienceDefinition}`, async () => {
      test.setTimeout(120000); // 2 minutes per test case
      
      console.log(`\n[EXCEL] ===== Test Case ${index + 1} of 14 (Group 1) =====`);
      console.log(`[EXCEL] Test Case ID: ${scenario.testCaseId}`);
      console.log(`[EXCEL] Flow Type: ${scenario.flowType}`);
      console.log(`[EXCEL] Audience Type: ${scenario.audienceType}`);
      console.log(`[EXCEL] Audience Definition: ${scenario.audienceDefinition}`);
      console.log(`[EXCEL] Product Name: ${scenario.SearchExistingProduct}`);
      
      try {
        await createBatch(
          currentPage, 
          scenario.flowType, 
          scenario.audienceType, 
          scenario.audienceDefinition, 
          scenario.SearchExistingProduct,
          scenario.heavyBuyers,
          scenario.mediumBuyers,
          scenario.lightBuyers
        );
        console.log(`[EXCEL] ✓ Test case ${scenario.testCaseId} completed successfully`);
      } catch (error) {
        console.error(`[EXCEL] ✗ Test case ${scenario.testCaseId} failed: ${error}`);
        throw error;
      }
    });
  });

});

test.describe('Batch Validation - Group 2', () => {

  // Load test data from Excel once
  const scenarios = readTestDataFromExcel('Batch_Products.xlsx');
  
  // Shared browser instance for all tests
  let sharedBrowser: Browser;
  let currentPage: any;

  // Connect to EC2 once before all tests
  test.beforeAll(async () => {
    sharedBrowser = await connectToEc2Browser();
  });

  // Before each test - prepare page and clear state
  test.beforeEach(async () => {
    console.log('[REPORT] Preparing page for new test...');
    currentPage = await getPageForTest(sharedBrowser);
    // Optionally clear browser cache/cookies
    await currentPage.context().clearCookies();
    console.log('[REPORT] ✓ Page prepared and ready');
  });

  // Create individual test for next 7 scenarios
  scenarios.slice(7, 14).forEach((scenario, index) => {
    test(`[${index + 8}/14] ${scenario.testCaseId} - ${scenario.audienceDefinition}`, async () => {
      test.setTimeout(120000); // 2 minutes per test case
      
      console.log(`\n[EXCEL] ===== Test Case ${index + 8} of 14 (Group 2) =====`);
      console.log(`[EXCEL] Test Case ID: ${scenario.testCaseId}`);
      console.log(`[EXCEL] Flow Type: ${scenario.flowType}`);
      console.log(`[EXCEL] Audience Type: ${scenario.audienceType}`);
      console.log(`[EXCEL] Audience Definition: ${scenario.audienceDefinition}`);
      console.log(`[EXCEL] Product Name: ${scenario.SearchExistingProduct}`);
      
      try {
        await createBatch(
          currentPage, 
          scenario.flowType, 
          scenario.audienceType, 
          scenario.audienceDefinition, 
          scenario.SearchExistingProduct,
          scenario.heavyBuyers,
          scenario.mediumBuyers,
          scenario.lightBuyers
        );
        console.log(`[EXCEL] ✓ Test case ${scenario.testCaseId} completed successfully`);
      } catch (error) {
        console.error(`[EXCEL] ✗ Test case ${scenario.testCaseId} failed: ${error}`);
        throw error;
      }
    });
  });

});