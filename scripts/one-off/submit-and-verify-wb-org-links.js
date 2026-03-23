const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nn4DqJvk3Kv7OxZbir4vUw_-b-SoRfp';
const BASE_URL = 'https://nidawellbeing.vercel.app';

const ORG_CODES = [
  'nesdc',
  'tpso',
  'dss',
  'dhss',
  'tmd',
  'dcp',
  'dop',
  'mots',
  'dmh',
  'onep',
  'nrct',
  'acfs',
  'opdc',
  'rid',
  'dcy',
  'test-org'
];

const TARGET_ORG_CODES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ORG_CODES;

const NUMBER_DEFAULTS = {
  age: '35',
  job_duration: '4',
  height: '170',
  weight: '65',
  waist: '80',
  act_work_days: '5',
  act_commute_days: '5',
  act_rec_days: '3'
};

const TIME_DEFAULTS = {
  act_work_dur: '01:00',
  act_commute_dur: '00:45',
  act_rec_dur: '00:30',
  sedentary_dur: '08:00',
  screen_entertain: '01:30',
  screen_work: '07:00'
};

function timestampTag() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function pickCheckboxValues(question) {
  const optionValues = question.options.map((option) => option.value ?? option);
  const negatives = ['ไม่มี', 'ไม่เคย'];
  const negative = optionValues.find((value) => negatives.includes(value));
  if (negative) return [negative];

  const other = optionValues.find((value) => value === 'other' || value === 'อื่นๆ');
  const firstUsable = optionValues.find((value) => value !== other);
  return firstUsable ? [firstUsable] : optionValues.slice(0, 1);
}

function buildAnswer(question, orgCode) {
  switch (question.type) {
    case 'radio': {
      const option = question.options[0];
      return String(option?.value ?? option ?? '');
    }
    case 'checkbox':
      return pickCheckboxValues(question);
    case 'scale': {
      const maxIndex = Array.isArray(question.labels) ? question.labels.length - 1 : 4;
      return String(Math.max(0, Math.floor(maxIndex / 2)));
    }
    case 'number':
      return NUMBER_DEFAULTS[question.id] || '1';
    case 'time':
      return TIME_DEFAULTS[question.id] || '01:00';
    case 'text':
      if (question.id === 'name') return `ผู้ทดสอบ ${orgCode.toUpperCase()}`;
      return `คำตอบทดสอบ ${orgCode} ${question.id}`;
    default:
      return '';
  }
}

async function waitForRow(supabase, email, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return { row: null, error };
    }

    if (data) {
      return { row: data, error: null };
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return { row: null, error: new Error('Timed out waiting for submitted row') };
}

async function getSurveyStructure(page) {
  return page.evaluate(() => {
    return SECTIONS_ORDER.map((sectionKey) => ({
      sectionKey,
      sectionTitle: SURVEY_DATA[sectionKey].title,
      subsections: SURVEY_DATA[sectionKey].subsections.map((subsection) => ({
        title: subsection.title,
        questions: subsection.questions.map((question) => ({
          id: question.id,
          type: question.type,
          options: question.options || null,
          labels: question.labels || null
        }))
      }))
    }));
  });
}

function flattenQuestionIds(structure) {
  return structure.flatMap((section) =>
    section.subsections.flatMap((subsection) => subsection.questions.map((question) => question.id))
  );
}

async function fillCurrentSubsection(page, orgCode) {
  const currentSubsection = await page.evaluate(() => {
    const sectionKey = SECTIONS_ORDER[app.currentSectionIndex];
    const section = SURVEY_DATA[sectionKey];
    const subsection = section.subsections[app.currentSubsectionIndex];
    return {
      sectionKey,
      sectionTitle: section.title,
      subsectionTitle: subsection.title,
      questions: subsection.questions.map((question) => ({
        id: question.id,
        type: question.type,
        options: question.options || null,
        labels: question.labels || null
      }))
    };
  });

  const answers = Object.fromEntries(
    currentSubsection.questions.map((question) => [question.id, buildAnswer(question, orgCode)])
  );

  await page.evaluate(({ answers }) => {
    const dispatchChange = (element) => {
      element.dispatchEvent(new Event('change', { bubbles: true }));
    };

    Object.entries(answers).forEach(([questionId, value]) => {
      const card = document.getElementById(`card_${questionId}`);
      if (!card) return;

      const radios = Array.from(card.querySelectorAll(`input[type="radio"][name="${questionId}"]`));
      if (radios.length > 0) {
        const target = radios.find((radio) => radio.value === String(value));
        if (target) {
          target.checked = true;
          dispatchChange(target);
        }
        return;
      }

      const checkboxes = Array.from(card.querySelectorAll(`input[type="checkbox"][name="${questionId}"]`));
      if (checkboxes.length > 0) {
        const selected = Array.isArray(value) ? value.map(String) : [String(value)];
        checkboxes.forEach((checkbox) => {
          const shouldCheck = selected.includes(checkbox.value);
          checkbox.checked = shouldCheck;
          if (shouldCheck) dispatchChange(checkbox);
        });
        return;
      }

      const hourSelect = document.getElementById(`${questionId}_hour`);
      const minuteSelect = document.getElementById(`${questionId}_minute`);
      if (hourSelect && minuteSelect) {
        const [hour, minute] = String(value).split(':');
        hourSelect.value = hour;
        minuteSelect.value = minute;
        dispatchChange(hourSelect);
        return;
      }

      const input = document.getElementById(questionId);
      if (input) {
        input.value = String(value);
        dispatchChange(input);
      }
    });
  }, { answers });

  return currentSubsection;
}

async function submitForOrg(browser, supabase, orgCode, questionIds) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();
  const email = `autofill.${orgCode}.${Date.now()}@wellbeing.test`;
  const url = `${BASE_URL}/?org=${orgCode}`;
  const consoleMessages = [];

  page.on('console', (message) => {
    if (consoleMessages.length >= 30) return;
    consoleMessages.push({ type: message.type(), text: message.text() });
  });

  page.on('pageerror', (error) => {
    if (consoleMessages.length >= 30) return;
    consoleMessages.push({ type: 'pageerror', text: error.message || String(error) });
  });

  const result = {
    orgCode,
    url,
    email,
    expectedOrganization: null,
    pageSaveResult: null,
    pageReadBackAvailable: false,
    pageReadBackError: null,
    responseCount: 0,
    submitted: false,
    rowFound: false,
    rawResponsesComplete: false,
    columnsComplete: false,
    missingRawResponseKeys: [],
    missingColumnKeys: [],
    rowOrganization: null,
    rowOrgCode: null,
    consoleMessages: [],
    error: null
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('#user-email-input', { timeout: 15000 });

    result.expectedOrganization = await page.evaluate(() => app.organization || null);

    await page.fill('#user-email-input', email);
    await page.click('button:has-text("ยืนยันอีเมล")');
    await page.waitForSelector('.btn-start', { timeout: 10000 });
    await page.click('.btn-start');
    await page.waitForSelector('.question-card', { timeout: 10000 });

    const totalSubsections = await page.evaluate(() =>
      SECTIONS_ORDER.reduce((count, sectionKey) => count + SURVEY_DATA[sectionKey].subsections.length, 0)
    );

    const filledSubsections = [];
    for (let index = 0; index < totalSubsections; index += 1) {
      const filled = await fillCurrentSubsection(page, orgCode);
      filledSubsections.push(`${filled.sectionKey} :: ${filled.subsectionTitle}`);
      await page.evaluate(() => app.nextSection());
      await page.waitForTimeout(150);
    }

    await page.waitForTimeout(300);

    const pageSave = await page.evaluate(async () => {
      const saveResult = await saveToSupabase(app.userInfo.email, app.responses, false);
      let readBack = null;
      let readBackError = null;

      try {
        const response = await supabaseClient
          .from('survey_responses')
          .select('*')
          .eq('email', app.userInfo.email)
          .maybeSingle();

        readBack = response.data || null;
        readBackError = response.error ? response.error.message || String(response.error) : null;
      } catch (error) {
        readBackError = error.message || String(error);
      }

      return {
        saveResult,
        responseCount: Object.keys(app.responses).length,
        readBackAvailable: Boolean(readBack),
        readBackError,
        readBack
      };
    });

    result.pageSaveResult = pageSave.saveResult;
    result.pageReadBackAvailable = pageSave.readBackAvailable;
    result.pageReadBackError = pageSave.readBackError;
    result.responseCount = pageSave.responseCount;
    result.consoleMessages = consoleMessages;

    if (pageSave.readBack) {
      const row = pageSave.readBack;
      result.submitted = Boolean(pageSave.saveResult);
      result.rowFound = true;
      result.rowOrganization = row.organization || null;
      result.rowOrgCode = row.org_code || null;

      const rawResponses = row.raw_responses || {};
      const rowKeys = Object.keys(row);
      result.missingRawResponseKeys = questionIds.filter((questionId) => !(questionId in rawResponses));
      result.missingColumnKeys = questionIds.filter((questionId) => !rowKeys.includes(questionId));
      result.rawResponsesComplete = result.missingRawResponseKeys.length === 0;
      result.columnsComplete = result.missingColumnKeys.length === 0;
      result.filledSubsections = filledSubsections;

      return result;
    }

    const { row, error } = await waitForRow(supabase, email);
    if (error) {
      result.error = error.message || String(error);
      return result;
    }

    result.submitted = true;
    result.rowFound = Boolean(row);
    result.rowOrganization = row.organization || null;
    result.rowOrgCode = row.org_code || null;

    const rawResponses = row.raw_responses || {};
    const rowKeys = Object.keys(row);
    result.missingRawResponseKeys = questionIds.filter((questionId) => !(questionId in rawResponses));
    result.missingColumnKeys = questionIds.filter((questionId) => !rowKeys.includes(questionId));
    result.rawResponsesComplete = result.missingRawResponseKeys.length === 0;
    result.columnsComplete = result.missingColumnKeys.length === 0;
    result.filledSubsections = filledSubsections;

    return result;
  } catch (error) {
    result.error = error.message || String(error);
    result.consoleMessages = consoleMessages;
    return result;
  } finally {
    await context.close();
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const browser = await chromium.launch({ headless: true });
  const bootstrapContext = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const bootstrapPage = await bootstrapContext.newPage();

  await bootstrapPage.goto(`${BASE_URL}/?org=${ORG_CODES[0]}`, { waitUntil: 'networkidle' });
  const structure = await getSurveyStructure(bootstrapPage);
  const questionIds = flattenQuestionIds(structure);
  await bootstrapContext.close();

  const results = [];
  for (const orgCode of TARGET_ORG_CODES) {
    console.log(`Submitting ${orgCode}...`);
    const result = await submitForOrg(browser, supabase, orgCode, questionIds);
    results.push(result);
    console.log(
      `${orgCode}: pageSave=${result.pageSaveResult} pageRead=${result.pageReadBackAvailable} submitted=${result.submitted} rowFound=${result.rowFound} raw=${result.rawResponsesComplete} columns=${result.columnsComplete}${result.error ? ` error=${result.error}` : ''}`
    );
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    totalOrganizations: TARGET_ORG_CODES.length,
    successfulSubmissions: results.filter((result) => result.submitted).length,
    rowsFound: results.filter((result) => result.rowFound).length,
    rawResponsesComplete: results.filter((result) => result.rawResponsesComplete).length,
    columnsComplete: results.filter((result) => result.columnsComplete).length,
    questionCount: questionIds.length,
    questionIds,
    results
  };

  const outputDir = path.join(process.cwd(), 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `wb-org-link-verification-${timestampTag()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`Saved report to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});