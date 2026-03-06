const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TARGET_URL = 'https://nidawellbeing.vercel.app/ch1';
const ORGS = Array.from({ length: 10 }, (_, i) => `ORG_${String(i + 1).padStart(2, '0')}`);

const pdfPaths = {
  strategy: path.resolve(__dirname, 'test-pdfs/test-strategy.pdf'),
  org: path.resolve(__dirname, 'test-pdfs/test-org-structure.pdf'),
  hrd: path.resolve(__dirname, 'test-pdfs/test-hrd-plan.pdf')
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureAsciiOrgOption(page, orgValue) {
  await page.evaluate((org) => {
    const sel = document.getElementById('organization');
    if (!sel) return;
    const exists = Array.from(sel.options).some((o) => o.value === org || o.text === org);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = org;
      opt.text = org;
      sel.appendChild(opt);
    }
    sel.value = org;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, orgValue);
}

async function uploadAndAssert(page, inputSelector, hiddenPathSelector, hiddenUrlSelector, fieldType, filePath) {
  await page.setInputFiles(inputSelector, filePath);

  const resultHandle = await page.waitForFunction(
    ({ pathSel, urlSel, type }) => {
      const p = document.querySelector(pathSel);
      const u = document.querySelector(urlSel);
      const err = document.getElementById(`upload-error-${type}`);
      const preview = document.getElementById(`file-preview-${type}`);

      const hasPath = !!(p && p.value && p.value.trim());
      const hasUrl = !!(u && u.value && u.value.trim());
      const hasPreview = !!(preview && !preview.classList.contains('hidden'));
      const hasError = !!(err && !err.classList.contains('hidden'));

      if (hasError) {
        return { ok: false, error: (err.textContent || '').trim() || `upload ${type} error` };
      }

      if (hasPath && hasUrl && hasPreview) {
        return { ok: true, path: p.value, url: u.value };
      }

      return null;
    },
    { pathSel: hiddenPathSelector, urlSel: hiddenUrlSelector, type: fieldType },
    { timeout: 45000 }
  );

  const result = await resultHandle.jsonValue();
  if (!result?.ok) {
    throw new Error(`Upload ${fieldType} failed: ${result?.error || 'unknown state'}`);
  }
  return result;
}

async function fillAndSubmitOne(roundIndex) {
  const org = ORGS[roundIndex];
  const email = `auto.full.${Date.now()}.${roundIndex + 1}@example.go.th`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.fill('#respondent_email', email);
    await page.click('button[onclick="confirmEmailAndStart()"]');
    await page.waitForSelector('#organization', { timeout: 20000 });

    await ensureAsciiOrgOption(page, org);

    await page.fill('#strategic_overview', `Strategic overview round ${roundIndex + 1}`);
    await page.fill('#org_structure', `Organization structure round ${roundIndex + 1}`);

    const upStrategy = await uploadAndAssert(page, '#file-strategy', '#strategy_file_path', '#strategy_file_url', 'strategy', pdfPaths.strategy);

    await page.fill('#total_staff', '320');
    await page.fill('#type_official', '200');
    await page.fill('#type_employee', '70');
    await page.fill('#type_contract', '30');
    await page.fill('#type_other', '20');

    await page.fill('#age_u30', '60');
    await page.fill('#age_31_40', '90');
    await page.fill('#age_41_50', '100');
    await page.fill('#age_51_60', '70');

    await page.fill('#service_u1', '20');
    await page.fill('#service_1_5', '40');
    await page.fill('#service_6_10', '60');
    await page.fill('#service_11_15', '70');
    await page.fill('#service_16_20', '55');
    await page.fill('#service_21_25', '40');
    await page.fill('#service_26_30', '25');
    await page.fill('#service_over30', '10');

    const upOrg = await uploadAndAssert(page, '#file-org', '#org_structure_file_path', '#org_structure_file_url', 'org', pdfPaths.org);

    await page.click('#btn-next');
    await sleep(400);

    await page.fill('#related_policies', `Related policy round ${roundIndex + 1}`);
    await page.fill('#context_challenges', `Context challenge round ${roundIndex + 1}`);

    await page.click('#btn-next');
    await sleep(400);

    await page.fill('#disease_diabetes', '12');
    await page.fill('#disease_hypertension', '18');
    await page.fill('#disease_cardiovascular', '5');
    await page.fill('#disease_kidney', '2');
    await page.fill('#disease_liver', '3');
    await page.fill('#disease_cancer', '1');
    await page.fill('#disease_obesity', '21');
    await page.fill('#sick_leave_days', '430');
    await page.fill('#clinic_users_per_year', '300');
    await page.fill('#clinic_top_symptoms', 'Headache, muscle pain');
    await page.fill('#clinic_top_medications', 'Paracetamol');
    await page.fill('#mental_stress', 'Moderate stress');
    await page.fill('#mental_anxiety', 'Mild anxiety');
    await page.fill('#mental_sleep', 'Some sleep issues');
    await page.fill('#mental_burnout', 'Periodic burnout');
    await page.fill('#mental_depression', 'Low risk');
    await page.fill('#engagement_score', '2025: 78/100');
    await page.fill('#engagement_low_areas', 'Internal communication');
    await page.fill('#other_wellbeing_surveys', 'Annual wellbeing survey');

    await page.click('#btn-next');
    await sleep(400);

    await page.check('input[name="mentoring_system"][value="full"]');
    await page.check('input[name="job_rotation"][value="partial"]');
    await page.check('input[name="idp_system"][value="full"]');
    await page.check('input[name="career_path_system"][value="partial"]');

    await page.check('input[name="digital_systems"][value="e_doc"]');
    await page.check('input[name="digital_systems"][value="e_sign"]');
    await page.check('input[name="digital_systems"][value="cloud"]');
    await page.check('input[name="ergonomics_status"][value="done"]');
    await page.fill('#ergonomics_done_detail', 'Done');
    await page.fill('#training_hours', '40');

    await page.click('#btn-next');
    await sleep(400);

    await page.click('.rank-item[data-value="service_efficiency"]');
    await page.click('.rank-item[data-value="digital_capability"]');
    await page.click('.rank-item[data-value="new_leaders"]');

    await page.fill('#intervention_packages_feedback', `Feedback round ${roundIndex + 1}`);
    await page.fill('#hrd_plan_url', `https://example.com/hrd-${roundIndex + 1}`);
    await page.fill('#hrd_plan_results', 'Done as planned');

    const upHrd = await uploadAndAssert(page, '#file-hrd', '#hrd_plan_file_path', '#hrd_plan_file_url', 'hrd', pdfPaths.hrd);

    await page.click('#btn-next');

    await page.waitForSelector('#overlay-success:not(.hidden)', { timeout: 60000 });
    const ref = (await page.textContent('#success-ref'))?.trim() || 'Ref: N/A';

    console.log(`SUCCESS round=${roundIndex + 1} org=${org} email=${email} ref='${ref}'`);
    console.log(`UPLOADS strategy=${!!upStrategy.url} org=${!!upOrg.url} hrd=${!!upHrd.url}`);

    return { ok: true, round: roundIndex + 1, org, email, ref, uploads: { strategy: upStrategy.url, org: upOrg.url, hrd: upHrd.url } };
  } catch (e) {
    const shot = `playwright-ch1-fail-round-${roundIndex + 1}.png`;
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    console.log(`FAIL round=${roundIndex + 1} org=${org} error=${e.message} screenshot=${shot}`);
    return { ok: false, round: roundIndex + 1, org, error: e.message, screenshot: shot };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function main() {
  console.log('Running CH1 full automation 10 rounds (with verified PDF uploads)...');
  const results = [];
  const startIndex = Math.max(1, parseInt(process.env.START_INDEX || '1', 10));
  const endIndex = Math.min(10, parseInt(process.env.END_INDEX || '10', 10));

  console.log(`Range: ${startIndex}..${endIndex}`);

  for (let i = startIndex - 1; i < endIndex; i++) {
    const r = await fillAndSubmitOne(i);
    results.push(r);
  }

  const success = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  fs.writeFileSync('playwright-ch1-results.json', JSON.stringify({ success, failed }, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Success: ${success.length}`);
  console.log(`Failed : ${failed.length}`);
  if (failed.length) {
    console.log('Failed rounds:', failed.map((f) => f.round).join(', '));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
