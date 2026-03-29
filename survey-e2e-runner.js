const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const TARGET_URL = process.env.SURVEY_URL || 'https://nidawellbeing.vercel.app/?org=test-org';
const HEADLESS = process.env.HEADLESS !== 'false';
const RUN_COUNT = Math.max(parseInt(process.env.RUN_COUNT || '1', 10), 1);
const STEP_DELAY = Math.max(parseInt(process.env.STEP_DELAY || '150', 10), 0);
const MAX_STEPS = Math.max(parseInt(process.env.MAX_STEPS || '30', 10), 1);
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nn4DqJvk3Kv7OxZbir4vUw_-b-SoRfp';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createUser(index) {
  const now = Date.now();
  return {
    email: `e2e.test.${now}.${index}@wellbeing.test`,
    name: `ผู้ทดสอบระบบ ${index}`,
    title: index % 2 === 0 ? 'นางสาว' : 'นาย',
    gender: index % 2 === 0 ? 'หญิง' : 'ชาย',
    age: 25 + index,
    org_type: 'สนับสนุน',
    job: 'นักวิจัย',
    job_duration: 2 + index,
    activity_org: 'เคย',
    activity_thaihealth: 'ไม่เคย',
    diseases: 'ไม่มี',
    height: 165 + index,
    weight: 58 + index,
    waist: 75 + index
  };
}

function buildAnswerSet(user) {
  const answers = {
    title: user.title,
    name: user.name,
    gender: user.gender,
    age: String(user.age),
    org_type: user.org_type,
    job: 'วิชาการ: ระดับชำนาญการ',
    job_duration: String(user.job_duration),
    activity_org: user.activity_org,
    activity_thaihealth: user.activity_thaihealth,
    diseases: ['ไม่มี'],
    height: String(user.height),
    weight: String(user.weight),
    waist: String(user.waist),
    q2001: 'ไม่เคยสูบ',
    q2002: 'ไม่เคยสูบ',
    q2003: 'ไม่เคยดื่ม',
    q2004: 'ไม่เคยดื่ม',
    q2005_drug: 'ไม่เคยเสพ',
    sweet_1: 'ทุกวัน / เกือบทุกวัน',
    sweet_2: '3-4 ครั้งต่อสัปดาห์',
    sweet_3: 'แทบไม่ทำ / ไม่ทำเลย',
    sweet_4: '3-4 ครั้งต่อสัปดาห์',
    sweet_5: 'แทบไม่ทำ / ไม่ทำเลย',
    fat_1: '3-4 ครั้งต่อสัปดาห์',
    fat_2: '3-4 ครั้งต่อสัปดาห์',
    fat_3: 'แทบไม่ทำ / ไม่ทำเลย',
    fat_4: 'แทบไม่ทำ / ไม่ทำเลย',
    fat_5: 'แทบไม่ทำ / ไม่ทำเลย',
    salt_1: 'ทุกวัน / เกือบทุกวัน',
    salt_2: '3-4 ครั้งต่อสัปดาห์',
    salt_3: 'แทบไม่ทำ / ไม่ทำเลย',
    salt_4: 'แทบไม่ทำ / ไม่ทำเลย',
    salt_5: 'แทบไม่ทำ / ไม่ทำเลย',
    act_work_days: '5',
    act_work_dur: '01:30',
    act_commute_days: '3',
    act_commute_dur: '00:30',
    act_rec_days: '4',
    act_rec_dur: '01:00',
    sedentary_dur: '08:00',
    screen_entertain: '01:30',
    screen_work: '07:00',
    helmet_driver: 'ใช้ทุกครั้ง',
    helmet_passenger: 'ใช้ทุกครั้ง',
    seatbelt_driver: 'ใช้ทุกครั้ง',
    seatbelt_passenger: 'ใช้ทุกครั้ง',
    accident_hist: ['ไม่เคย'],
    drunk_drive: 'ไม่เคย',
    env_satisfaction: '3',
    env_glare: 'ไม่ใช่',
    env_noise: 'ไม่ใช่',
    env_smell: 'ไม่ใช่',
    env_smoke: 'ไม่ใช่',
    env_posture: 'ใช่ ไม่มีผลต่อสุขภาพ',
    env_awkward: 'ใช่ ไม่มีผลต่อสุขภาพ',
    pm25_impact: 'น้อย',
    pm25_symptom: ['ไม่มี'],
    life_quality: '3',
    emerging_known: 'เคย',
    emerging_list: ['COVID-19'],
    climate_impact: 'ปานกลาง',
    covid_history: 'ไม่เคยติด'
  };

  for (let i = 1; i <= 15; i += 1) {
    answers[`tmhi_${i}`] = '2';
  }

  for (let i = 1; i <= 20; i += 1) {
    answers[`lonely_${i}`] = '1';
  }

  return answers;
}

async function getVisibleQuestionIds(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.question-card'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .map(el => el.id)
      .filter(Boolean)
      .map(id => id.replace('card_', ''));
  });
}

async function collectCoverage(page) {
  return page.evaluate(() => {
    const sections = window.PROJECT_SSOT?.wellbeing?.surveyData || window.SURVEY_DATA || {};
    const expectedQuestionIds = Object.values(sections).flatMap(section =>
      (section.subsections || []).flatMap(sub => (sub.questions || []).map(q => q.id))
    );
    const responseKeys = Object.keys(window.app?.responses || {}).filter(key => expectedQuestionIds.includes(key));
    return {
      expectedCount: expectedQuestionIds.length,
      answeredCount: responseKeys.length,
      missingQuestionIds: expectedQuestionIds.filter(id => !responseKeys.includes(id)),
      answeredQuestionIds: responseKeys
    };
  });
}

async function answerVisibleQuestions(page, user) {
  const answerSet = buildAnswerSet(user);
  const questionIds = await getVisibleQuestionIds(page);

  for (const questionId of questionIds) {
    const card = page.locator(`#card_${questionId}`);
    if (!questionId) continue;
    const expectedAnswer = answerSet[questionId];

    const textInput = card.locator(`input[type="text"]#${questionId}`);
    if (await textInput.count()) {
      await textInput.fill(String(expectedAnswer || 'ทดสอบระบบ'));
      await textInput.blur();
    }

    const numberInput = card.locator(`input[type="number"]#${questionId}`);
    if (await numberInput.count()) {
      const numberValue = expectedAnswer ?? '3';
      await numberInput.fill(String(numberValue));
      await numberInput.blur();
    }

    const hourSelect = card.locator(`select#${questionId}_hour`);
    const minuteSelect = card.locator(`select#${questionId}_minute`);
    if (await hourSelect.count()) {
      const [hour] = String(expectedAnswer || '01:00').split(':');
      await hourSelect.selectOption(hour || '01');
      await wait(50);
    }
    if (await minuteSelect.count()) {
      const [, minute] = String(expectedAnswer || '01:00').split(':');
      await minuteSelect.selectOption(minute || '00');
      await wait(50);
    }

    const radios = card.locator(`input[type="radio"][name="${questionId}"]`);
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const preferredValue = expectedAnswer;
      if (preferredValue) {
        const target = card.locator(`input[type="radio"][name="${questionId}"][value="${preferredValue.replace(/"/g, '\\"')}"]`);
        if (await target.count()) {
          await target.check();
        } else {
          throw new Error(`ไม่พบ radio value ที่ต้องการสำหรับ ${questionId}: ${preferredValue}`);
        }
      } else {
        throw new Error(`ไม่มีคำตอบที่กำหนดไว้สำหรับ radio ${questionId}`);
      }
    }

    const checkboxes = card.locator(`input[type="checkbox"][name="${questionId}"]`);
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const values = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer].filter(Boolean);
      if (values.length === 0) {
        throw new Error(`ไม่มีคำตอบที่กำหนดไว้สำหรับ checkbox ${questionId}`);
      }

      for (const value of values) {
        const target = card.locator(`input[type="checkbox"][name="${questionId}"][value="${String(value).replace(/"/g, '\\"')}"]`);
        if (await target.count()) {
          await target.check();
        } else {
          throw new Error(`ไม่พบ checkbox value ที่ต้องการสำหรับ ${questionId}: ${value}`);
        }
      }
    }

    const extraTextInputs = card.locator('.detail-input');
    const extraCount = await extraTextInputs.count();
    for (let i = 0; i < extraCount; i += 1) {
      const input = extraTextInputs.nth(i);
      if (await input.isVisible()) {
        await input.fill('รายละเอียดทดสอบ Playwright');
        await input.blur();
      }
    }

    await wait(STEP_DELAY);
  }
}

async function clickNext(page) {
  const nextButton = page.locator('#btn-next');
  await nextButton.waitFor({ state: 'visible', timeout: 10000 });
  await nextButton.click();
  await wait(500);
}

async function isResultsScreenVisible(page) {
  const resultTitle = page.locator('.results-title:has-text("ขอบคุณที่ทำแบบสำรวจ!")');
  return resultTitle.isVisible().catch(() => false);
}

async function verifySubmission(email) {
  let lastError = null;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('email,name,organization,submitted_at,is_draft')
      .eq('email', email)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        ok: true,
        record: data[0],
        attempt
      };
    }

    lastError = error ? (error.message || String(error)) : 'not-found';
    await wait(1500);
  }

  return {
    ok: false,
    error: lastError || 'not-found'
  };
}

async function advanceToReview(page, user) {
  for (let step = 1; step <= MAX_STEPS; step += 1) {
    const reviewHeading = page.locator('.section-title:has-text("ตรวจสอบคำตอบของท่าน")');
    if (await reviewHeading.isVisible().catch(() => false)) {
      return 'review';
    }

    if (await isResultsScreenVisible(page)) {
      return 'results';
    }

    await page.waitForSelector('.question-card', { timeout: 15000 });
    await answerVisibleQuestions(page, user);

    if (await reviewHeading.isVisible().catch(() => false)) {
      return 'review';
    }

    if (await isResultsScreenVisible(page)) {
      return 'results';
    }

    await clickNext(page);
    await wait(800);

    if (await isResultsScreenVisible(page)) {
      return 'results';
    }
  }

  return null;
}

async function submitSurvey(page) {
  const submitButton = page.locator('button:has-text("ยืนยันและส่งข้อมูล")');
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  await submitButton.click();

  const resultTitle = page.locator('.results-title:has-text("ขอบคุณที่ทำแบบสำรวจ!")');
  const errorToast = page.locator('#toast');

  try {
    await resultTitle.waitFor({ state: 'visible', timeout: 20000 });
    return { ok: true, message: 'แสดงหน้าผลลัพธ์สำเร็จ' };
  } catch (error) {
    const toastText = await errorToast.textContent().catch(() => '');
    return {
      ok: false,
      message: toastText || error.message || 'ไม่พบหน้าผลลัพธ์หลัง submit'
    };
  }
}

async function collectDiagnostics(page) {
  return page.evaluate(() => {
    const main = document.querySelector('#main-content');
    const toast = document.querySelector('#toast');
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(btn => {
        const style = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .map(btn => btn.innerText.trim())
      .filter(Boolean);

    return {
      currentView: window.app?.currentView || null,
      currentSectionIndex: window.app?.currentSectionIndex ?? null,
      currentSubsectionIndex: window.app?.currentSubsectionIndex ?? null,
      questionCardCount: document.querySelectorAll('.question-card').length,
      visibleButtons: buttons,
      toastText: toast ? toast.innerText.trim() : '',
      mainText: main ? main.innerText.trim().slice(0, 1500) : '',
      mainHtml: main ? main.innerHTML.slice(0, 1500) : ''
    };
  });
}

async function runSingle(index, browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const user = createUser(index);
  const startTime = Date.now();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#user-email-input', { timeout: 15000 });

    await page.fill('#user-email-input', user.email);
    await page.click('button:has-text("ยืนยันอีเมล")');
    await page.waitForSelector('button:has-text("เริ่มทำแบบสำรวจ")', { timeout: 15000 });
    await page.click('button:has-text("เริ่มทำแบบสำรวจ")');
    await page.waitForSelector('.question-card', { timeout: 15000 });

    const flowState = await advanceToReview(page, user);
    if (!flowState) {
      throw new Error(`ไม่ถึงหน้าสิ้นสุดของฟอร์มภายใน ${MAX_STEPS} ขั้น`);
    }

    let submitResult = { ok: true, message: 'ขึ้นหน้าผลลัพธ์สำเร็จหลังส่งอัตโนมัติ' };
    if (flowState === 'review') {
      submitResult = await submitSurvey(page);
    } else if (!(await isResultsScreenVisible(page))) {
      submitResult = { ok: false, message: 'ไม่พบหน้าผลลัพธ์หลังจบแบบสำรวจ' };
    }

    const coverage = await collectCoverage(page);
    const verification = await verifySubmission(user.email);

    return {
      run: index,
      email: user.email,
      status: submitResult.ok && verification.ok && coverage.missingQuestionIds.length === 0 ? 'success' : 'failed',
      detail: submitResult.ok
        ? (verification.ok && coverage.missingQuestionIds.length === 0
            ? `กรอกครบ ${coverage.answeredCount}/${coverage.expectedCount} ข้อ และตรวจพบ record ใน DB (attempt ${verification.attempt})`
            : coverage.missingQuestionIds.length > 0
              ? `ยังตอบไม่ครบ: ขาด ${coverage.missingQuestionIds.length} ข้อ`
            : `ขึ้นหน้าผลลัพธ์แล้ว แต่ไม่พบ record ใน DB: ${verification.error}`)
        : submitResult.message,
      coverage,
      verification,
      durationMs: Date.now() - startTime
    };
  } catch (error) {
    const diagnostics = await collectDiagnostics(page).catch(() => null);
    return {
      run: index,
      email: user.email,
      status: 'failed',
      detail: error.message,
      diagnostics,
      durationMs: Date.now() - startTime
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const results = [];

  try {
    for (let i = 1; i <= RUN_COUNT; i += 1) {
      console.log(`\n[RUN ${i}] Opening ${TARGET_URL}`);
      const result = await runSingle(i, browser);
      results.push(result);
      console.log(`[RUN ${i}] ${result.status.toUpperCase()} - ${result.detail}`);
    }
  } finally {
    await browser.close();
  }

  const successCount = results.filter(item => item.status === 'success').length;
  const failedCount = results.length - successCount;
  const summary = {
    url: TARGET_URL,
    totalRuns: results.length,
    successCount,
    failedCount,
    results
  };

  console.log('\n=== PUBLIC SURVEY E2E REPORT ===');
  console.log(JSON.stringify(summary, null, 2));

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error('Runner crashed:', error);
  process.exit(1);
});
