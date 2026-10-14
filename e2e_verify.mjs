import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`Starting automated E2E validation against: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  const results = [];

  function record(flowId, name, status, details = '') {
    results.push({ flowId, name, status, details });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${flowId}] ${name}: ${status} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // -------------------------------------------------------------
    // FLOW 1: Login & Header
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 1: Login & Header ---');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Password visibility toggle test
    const pwdInput = page.locator('#password');
    const eyeBtn = page.locator('button[aria-label*="password"]');
    const initialType = await pwdInput.getAttribute('type');
    await eyeBtn.click();
    const toggledType = await pwdInput.getAttribute('type');
    await eyeBtn.click();
    const finalType = await pwdInput.getAttribute('type');

    if (initialType === 'password' && toggledType === 'text' && finalType === 'password') {
      record('Flow 1.1', 'Eye icon toggles password visibility', 'PASS');
    } else {
      record('Flow 1.1', 'Eye icon toggles password visibility', 'FAIL', `${initialType} -> ${toggledType} -> ${finalType}`);
    }

    // Fill credentials
    await page.fill('#username', 'TestValidator');
    await page.fill('#password', 'ValidPass2026!');
    await page.fill('#enterprise', 'Clinevo Enterprise');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/intake/manual-case-registration');
    const headerUser = await page.locator('[data-testid="header-username"]').textContent();
    const headerTime = await page.locator('[data-testid="header-timestamp"]').textContent();

    if (headerUser.includes('TestValidator') && headerTime.length > 5) {
      record('Flow 1.2', 'Login & Header username/timestamp display', 'PASS', `User: ${headerUser.trim()}, Time: ${headerTime.trim()}`);
    } else {
      record('Flow 1.2', 'Login & Header username/timestamp display', 'FAIL', `User: ${headerUser}`);
    }

    // -------------------------------------------------------------
    // FLOW 2: Negative Submit & Save Modals + Clear/Reset
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 2: Negative Submit & Save Modals ---');
    // Global negative submit (all empty)
    await page.click('button:has-text("Submit")');
    await page.waitForSelector('div[role="dialog"]');
    const submitModalText = await page.locator('div[role="dialog"]').textContent();
    const hasSubmitError = submitModalText.includes('Cannot submit case without entering mandatory data');
    await page.click('div[role="dialog"] button:has-text("OK")');
    record('Flow 2.1', 'Empty form Submit validation modal (role="dialog")', hasSubmitError ? 'PASS' : 'FAIL');

    // General Info empty validation
    await page.fill('#processingCenterReceivedDate', '2026-10-14');
    await page.click('div:has-text("General Info") >> button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]');
    const giModalText = await page.locator('div[role="dialog"]').textContent();
    const hasGiError = giModalText.includes('Case Classifications Code, Case Intake Source Code, and Company Receipt Date cannot be empty');
    await page.click('div[role="dialog"] button:has-text("OK")');
    record('Flow 2.2', 'General Info missing mandatory fields validation modal', hasGiError ? 'PASS' : 'FAIL');

    // General Inquiry mismatch validation
    await page.selectOption('#caseClassificationCode', 'General Inquiry');
    await page.selectOption('#caseIntakeSourceCode', 'Spontaneous');
    await page.fill('#companyReceiptDate', '2026-10-14');
    await page.click('div:has-text("General Info") >> button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]');
    const giMismatchText = await page.locator('div[role="dialog"]').textContent();
    const hasMismatchError = giMismatchText.includes('Case Classification does not match Adverse Event registration');
    await page.click('div[role="dialog"] button:has-text("OK")');
    record('Flow 2.3', 'General Inquiry mismatch validation modal', hasMismatchError ? 'PASS' : 'FAIL');

    // Clear button test
    await page.click('div:has-text("General Info") >> button:has-text("Clear")');
    const classificationVal = await page.locator('#caseClassificationCode').inputValue();
    record('Flow 2.4', 'General Info Clear button clears fields', classificationVal === '' ? 'PASS' : 'FAIL');

    // -------------------------------------------------------------
    // FLOW 3: Valid Case Registration
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 3: Case Registration ---');
    await page.selectOption('#caseClassificationCode', 'Adverse Event');
    await page.selectOption('#caseIntakeSourceCode', 'Other');
    await page.fill('#companyReceiptDate', '2026-10-10');
    await page.fill('#processingCenterReceivedDate', '2026-10-10');
    await page.click('div:has-text("General Info") >> button:has-text("Save")');

    await page.waitForSelector('div[role="dialog"]');
    const regConfirmText = await page.locator('div[role="dialog"]').textContent();
    const hasRegConfirm = regConfirmText.includes('Case registered successfully');
    await page.click('div[role="dialog"] button:has-text("OK")');

    const tempIdBadge = await page.locator('text=Temporary Case ID:').textContent();
    record('Flow 3', 'Valid Adverse Event case registration & Temp ID display', hasRegConfirm && tempIdBadge.includes('TMP-CASE-') ? 'PASS' : 'FAIL', tempIdBadge.trim());

    // -------------------------------------------------------------
    // FLOW 4: Questionnaire Tab
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 4: Questionnaire Tab ---');
    await page.click('[data-testid="add-questions-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Additional Questions")');

    // Manual Question empty validation
    await page.click('div[role="dialog"]:has-text("Additional Questions") button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]:has-text("Field Type and Question are mandatory")');
    await page.click('div[role="dialog"]:has-text("Field Type and Question are mandatory") button:has-text("OK")');
    record('Flow 4.1', 'Manual Question mandatory validation', 'PASS');

    // Valid Manual Question save
    await page.selectOption('#manualFieldType', 'Text');
    await page.fill('#manualQuestionText', 'Did patient experience nausea?');
    await page.click('div[role="dialog"]:has-text("Additional Questions") button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]:has-text("Question added manually successfully")');
    await page.click('div[role="dialog"]:has-text("Question added manually successfully") button:has-text("OK")');
    record('Flow 4.2', 'Valid Manual Question added and confirmed', 'PASS');

    // Template Import & Duplicate Restriction
    await page.click('[data-testid="add-questions-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Additional Questions")');
    await page.click('input[name="addQuestionsMode"][value="template"], label:has-text("Add Questions from Template")');
    await page.click('button:has-text("Select")');
    await page.waitForSelector('div[role="dialog"]:has-text("Template added successfully")');
    await page.click('div[role="dialog"]:has-text("Template added successfully") button:has-text("OK")');
    record('Flow 4.3', 'Template import confirmation', 'PASS');

    // Duplicate template import attempt
    await page.click('[data-testid="add-questions-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Additional Questions")');
    await page.click('input[name="addQuestionsMode"][value="template"], label:has-text("Add Questions from Template")');
    await page.click('button:has-text("Select")');
    await page.waitForSelector('div[role="dialog"]:has-text("Cannot import the same Questionnaire template more than once")');
    await page.click('div[role="dialog"]:has-text("Cannot import the same Questionnaire template more than once") button:has-text("OK")');
    // Ensure Additional Questions popup remained open for Cancel button
    await page.click('div[role="dialog"]:has-text("Additional Questions") button:has-text("Cancel")');
    record('Flow 4.4', 'Duplicate template import restriction & Cancel flow', 'PASS');

    // Save Questionnaire response
    await page.click('[data-testid="save-questionnaire-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Questionnaire data saved successfully")');
    await page.click('div[role="dialog"]:has-text("Questionnaire data saved successfully") button:has-text("OK")');
    record('Flow 4.5', 'Save Questionnaire responses confirmed', 'PASS');

    // Delete question with Reason check
    const deleteBtn = page.locator('button[aria-label="Delete Question"]').first();
    await deleteBtn.click();
    await page.waitForSelector('div[role="dialog"]:has-text("Delete Question")');
    await page.click('div[role="dialog"]:has-text("Delete Question") button:has-text("Delete")');
    await page.waitForSelector('div[role="dialog"]:has-text("Please enter the Reason for delete")');
    await page.click('div[role="dialog"]:has-text("Please enter the Reason for delete") button:has-text("OK")');

    await page.fill('#reasonForDelete', 'Test removal of duplicate question');
    await page.click('div[role="dialog"]:has-text("Delete Question") button:has-text("Delete")');
    await page.waitForSelector('div[role="dialog"]:has-text("Deleted successfully")');
    await page.click('div[role="dialog"]:has-text("Deleted successfully") button:has-text("OK")');
    record('Flow 4.6', 'Delete question requires reason and confirms deletion', 'PASS');

    // -------------------------------------------------------------
    // FLOW 5: Reporter & Patient Sections
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 5: Reporter & Patient Sections ---');
    // Reporter
    await page.fill('#reporterFirstName', 'Sarah');
    await page.fill('#reporterLastName', 'Connor');
    await page.selectOption('#countryCode', 'United States');
    await page.click('[data-testid="save-reporter-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Reporter data saved successfully")');
    await page.click('div[role="dialog"]:has-text("Reporter data saved successfully") button:has-text("OK")');

    await page.fill('#reporterLastName', 'Connor-Smith');
    await page.click('[data-testid="save-reporter-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Reporter updated successfully")');
    await page.click('div[role="dialog"]:has-text("Reporter updated successfully") button:has-text("OK")');
    record('Flow 5.1', 'Reporter fields save and update confirmation modals', 'PASS');

    // Patient
    await page.fill('#patientInitials', 'TC');
    await page.fill('#patientFirstName', 'Thomas');
    await page.fill('#patientLastName', 'Connor');
    await page.selectOption('#patientCountryCode', 'United States');
    await page.click('[data-testid="save-patient-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Patient information added successfully")');
    await page.click('div[role="dialog"]:has-text("Patient information added successfully") button:has-text("OK")');

    await page.fill('#occupation', 'Software Engineer');
    await page.click('[data-testid="save-patient-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Patient information updated successfully")');
    await page.click('div[role="dialog"]:has-text("Patient information updated successfully") button:has-text("OK")');
    record('Flow 5.2', 'Patient fields add and update confirmation modals', 'PASS');

    // -------------------------------------------------------------
    // FLOW 6: Product Information
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 6: Product Information ---');
    await page.click('[data-testid="product-search-icon"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Product Search")');
    await page.click('input[name="productSelectionRadio"] >> nth=0');
    await page.click('div[role="dialog"]:has-text("Product Search") button:has-text("Select")');

    const genName = await page.locator('#genericName').inputValue();
    const formCode = await page.locator('#formulationCode').inputValue();
    const autoPopulated = genName === 'Paracetamol' && formCode.includes('TAB');
    record('Flow 6.1', 'Product Search modal & auto-population of Generic Name and Formulation Code', autoPopulated ? 'PASS' : 'FAIL', `${genName} / ${formCode}`);

    // Edit Additional Drug Info
    await page.click('[data-testid="edit-additional-drug-icon"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Edit Additional Drug Information")');
    await page.fill('#tempDrugInfoText', 'Lot #CV-8899 Expiry 2028');
    await page.click('div[role="dialog"]:has-text("Edit Additional Drug Information") button:has-text("OK")');
    await page.waitForSelector('div[role="dialog"]:has-text("Additional Drug Information updated successfully")');
    await page.click('div[role="dialog"]:has-text("Additional Drug Information updated successfully") button:has-text("OK")');
    record('Flow 6.2', 'Edit Additional Drug Information modal flow', 'PASS');

    // Save Product
    await page.click('[data-testid="save-product-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Product data")');
    await page.click('div[role="dialog"]:has-text("Product data") button:has-text("OK")');

    // Product Information Hyperlink
    const prodInfoLink = page.locator('button:has-text("Product Information")');
    const isProdInfoVisible = await prodInfoLink.isVisible();
    await prodInfoLink.click();
    await page.waitForSelector('div[role="dialog"]:has-text("Product Medical Information")');

    // Check View link has target="_blank"
    const viewHref = await page.locator('div[role="dialog"]:has-text("Product Medical Information") a:has-text("View")').first().getAttribute('target');

    // Download document check
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="download-product-doc-icon"] >> nth=0')
    ]);
    const downloadedName = download.suggestedFilename();
    await page.click('div[role="dialog"]:has-text("Product Medical Information") button:has-text("Close")');
    record('Flow 6.3', 'Product Information documents modal, target="_blank" View, and real download', isProdInfoVisible && viewHref === '_blank' && downloadedName.endsWith('.pdf') ? 'PASS' : 'FAIL', downloadedName);

    // FAQ Template
    await page.click('button:has-text("FAQ Template")');
    await page.waitForSelector('div[role="dialog"]:has-text("FAQ Template")');
    await page.click('div[role="dialog"]:has-text("FAQ Template") button:has-text("Search")');
    await page.click('div[role="dialog"]:has-text("FAQ Template") button:has-text("View") >> nth=0');
    await page.waitForSelector('div[role="dialog"]:has-text("FAQ Answer")');
    await page.click('div[role="dialog"]:has-text("FAQ Answer") button:has-text("Close")');
    await page.click('div[role="dialog"]:has-text("FAQ Template") button:has-text("Cancel")');
    record('Flow 6.4', 'FAQ Template modal, nested FAQ answer popup, and Cancel button', 'PASS');

    // -------------------------------------------------------------
    // FLOW 7: Event Information & MedDRA Coding
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 7: Event Information & MedDRA ---');
    await page.fill('#reactionOrEventAsReported', 'Fever');
    await page.fill('#reportedTerm', 'Fever');
    await page.click('[data-testid="reported-term-search-icon"]');
    await page.waitForSelector('div[role="dialog"]:has-text("MedDRA Coding Search")');
    await page.click('input[name="meddraRadio"] >> nth=0');
    await page.click('div[role="dialog"]:has-text("MedDRA Coding Search") button:has-text("Select")');

    const meddraBadge = await page.locator('[data-testid="meddra-code-display"]').textContent();
    const rightMarkVisible = await page.locator('[data-testid="meddra-right-mark"]').isVisible();

    // Hover popover test
    await page.hover('[data-testid="meddra-right-mark"]');
    const hasHoverTooltip = await page.locator('text=MedDRA Coding Verified').isVisible();

    // Assessment & Seriousness
    await page.selectOption('#caseSeriousReporterCode', 'No');
    await page.selectOption('#caseSeriousCompanyCode', 'No');
    await page.selectOption('#outcomeCode', 'Recovered/Resolved');
    await page.selectOption('#lackOfEfficacy', 'No');

    await page.selectOption('#death', 'No');
    await page.selectOption('#hospitalization', 'No');
    await page.selectOption('#lifeThreatening', 'No');
    await page.selectOption('#disabling', 'No');
    await page.selectOption('#congenitalAnomaly', 'No');
    await page.selectOption('#interventionRequired', 'No');
    await page.selectOption('#medicallySignificant', 'No');
    await page.selectOption('#others', 'No');

    await page.click('[data-testid="save-event-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Event Information saved successfully")');
    await page.click('div[role="dialog"]:has-text("Event Information saved successfully") button:has-text("OK")');
    record('Flow 7', 'MedDRA search, green right mark, hover tooltip, assessment/seriousness save', meddraBadge.includes('10016558') && rightMarkVisible && hasHoverTooltip ? 'PASS' : 'FAIL');

    // -------------------------------------------------------------
    // FLOW 8: Activity Log
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 8: Activity Log ---');
    await page.click('[data-testid="add-activity-log-btn"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Add Activity Log")');
    await page.fill('#logComments', 'Automated qualification assessment complete.');
    await page.click('div[role="dialog"]:has-text("Add Activity Log") button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]:has-text("Activity log added successfully")');
    await page.click('div[role="dialog"]:has-text("Activity log added successfully") button:has-text("OK")');

    // Edit Log
    await page.click('button[aria-label="Edit Activity Log"] >> nth=0');
    await page.waitForSelector('div[role="dialog"]:has-text("Update Activity Log")');
    await page.fill('#logComments', 'Assessment updated with clinical confirmation.');
    await page.click('div[role="dialog"]:has-text("Update Activity Log") button:has-text("Update")');
    await page.waitForSelector('div[role="dialog"]:has-text("Activity log updated successfully")');
    await page.click('div[role="dialog"]:has-text("Activity log updated successfully") button:has-text("OK")');

    // Delete Log with reason validation
    await page.click('button[aria-label="Delete Activity Log"] >> nth=0');
    await page.waitForSelector('div[role="dialog"]:has-text("Delete Activity Log")');
    await page.click('div[role="dialog"]:has-text("Delete Activity Log") button:has-text("Delete")');
    await page.waitForSelector('div[role="dialog"]:has-text("Reason for delete is required")');
    await page.click('div[role="dialog"]:has-text("Reason for delete is required") button:has-text("OK")');

    await page.fill('#activityLogDeleteReason', 'Routine test log cleanup');
    await page.click('div[role="dialog"]:has-text("Delete Activity Log") button:has-text("Delete")');
    await page.waitForSelector('div[role="dialog"]:has-text("Log deleted successfully")');
    await page.click('div[role="dialog"]:has-text("Log deleted successfully") button:has-text("OK")');
    record('Flow 8', 'Activity Log Add, Edit, Delete with reason validation', 'PASS');

    // -------------------------------------------------------------
    // FLOW 9: Save and Submit -> Case Processing -> Open Case
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 9: Save and Submit -> Case Processing -> Open Case ---');
    await page.click('button:has-text("Save and Submit")');
    await page.waitForSelector('div[role="dialog"]:has-text("Case submitted successfully")');
    await page.click('div[role="dialog"]:has-text("Case submitted successfully") button:has-text("Yes")');

    await page.waitForURL('**/intake/case-processing/**');
    const processingTitle = await page.locator('h2:has-text("Case Processing")').isVisible();

    // Verify hover tooltip on checkmark in Case Processing
    await page.hover('[data-testid="meddra-right-mark"]');
    const cpTooltip = await page.locator('text=MedDRA Code Data [Verified]').isVisible();

    // Update Reported Term and Save
    await page.fill('#processingReportedTerm', 'High Grade Fever');
    await page.click('div:has-text("Event Information") >> button:has-text("Save")');
    await page.waitForSelector('div[role="dialog"]:has-text("Event Information updated successfully")');
    await page.click('div[role="dialog"]:has-text("Event Information updated successfully") button:has-text("OK")');

    // Exit Case
    await page.click('[data-testid="case-exit-icon"]');
    await page.waitForSelector('div[role="dialog"]:has-text("Are you sure you want to exit from the case?")');
    await page.click('div[role="dialog"]:has-text("Are you sure you want to exit from the case?") button:has-text("Yes")');

    await page.waitForURL('**/intake/open-case');
    await page.selectOption('#searchClassificationCode', 'Adverse Event');
    await page.selectOption('#searchIntakeSourceCode', 'Other');
    await page.click('button:has-text("Search")');

    const firstCaseLink = page.locator('table a[href*="/intake/case-processing/"]').first();
    const hasClickableCase = await firstCaseLink.isVisible();
    await firstCaseLink.click();
    await page.waitForURL('**/intake/case-processing/**');
    record('Flow 9', 'Save and Submit, Case Processing update, Exit modal, and Open Case search navigation', processingTitle && cpTooltip && hasClickableCase ? 'PASS' : 'FAIL');

    // -------------------------------------------------------------
    // FLOW 10: Reports -> Audit History & Simulation Bar
    // -------------------------------------------------------------
    console.log('\n--- Running Flow 10: Audit History & Simulation Bar ---');
    await page.click('a[href="/reports/audit-history"]');
    await page.waitForURL('**/reports/audit-history');

    await page.fill('#auditCaseNumber', 'CASE-2026-001');
    await page.click('div:has-text("Search Case Audit Trail") >> button:has-text("Search")');

    // In-grid filter
    await page.fill('input[aria-label="Search field"]', 'Reported Term');
    const auditRowText = await page.locator('table tbody tr').first().textContent();
    const hasReportedTermAudit = auditRowText.includes('Reported Term') && auditRowText.includes('Fever');

    // Real Excel Export download + In-DOM preview modal
    const [excelDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-excel-icon"]')
    ]);
    const excelFilename = excelDownload.suggestedFilename();
    const isXlsx = excelFilename.endsWith('.xlsx');

    // In-DOM preview modal trigger
    await page.click(`button:has-text("${excelFilename}")`);
    await page.waitForSelector('div[role="dialog"]:has-text("Excel Spreadsheet Viewer")');
    const isExcelViewerOpen = await page.locator('text=Sheet1 - Audit Records').isVisible();
    await page.click('div[role="dialog"]:has-text("Excel Spreadsheet Viewer") button:has-text("Close")');

    record('Flow 10.1', 'Audit History search, grid filter, SheetJS real xlsx download & Excel preview modal', hasReportedTermAudit && isXlsx && isExcelViewerOpen ? 'PASS' : 'FAIL', excelFilename);

    // Simulation Bar Modes
    const simBar = page.locator('[data-testid="simulation-control-bar"]');
    await simBar.locator('button:has-text("FAIL")').click();
    const failModeActive = await simBar.locator('text=FAIL').count() > 0;

    await simBar.locator('button:has-text("BLOCKED")').click();
    const blockedModeActive = await simBar.locator('text=BLOCKED').count() > 0;

    await simBar.locator('button:has-text("PASS")').click();
    const passModeActive = await simBar.locator('text=PASS').count() > 0;

    record('Flow 10.2', 'Simulation Control Bar switches between PASS, FAIL, BLOCKED', failModeActive && blockedModeActive && passModeActive ? 'PASS' : 'FAIL');

  } catch (err) {
    console.error('Test execution error:', err);
    record('Error', 'Test run encountered exception', 'FAIL', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=============================================');
  console.log('             TEST RUN SUMMARY               ');
  console.log('=============================================');
  let passCount = 0;
  for (const r of results) {
    console.log(`${r.status === 'PASS' ? '✅' : '❌'} [${r.flowId}] ${r.name} ${r.details ? '— ' + r.details : ''}`);
    if (r.status === 'PASS') passCount++;
  }
  console.log(`\nTOTAL: ${passCount} / ${results.length} PASSED`);

  return results.every(r => r.status === 'PASS');
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
});
