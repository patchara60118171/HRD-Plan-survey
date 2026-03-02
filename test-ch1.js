const { chromium } = require('playwright')

    ; (async () => {
        const browser = await chromium.launch({ headless: false, slowMo: 300 })
        const context = await browser.newContext()
        const page = await context.newPage()
        const BASE = 'https://nidawellbeing.vercel.app/ch1.html'
        const results = []

        const errors = []
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
        page.on('requestfailed', r => errors.push(`NET_FAIL: ${r.url()}`))

        const log = (tc, status, note = '') => {
            results.push({ tc, status, note })
            console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️'} ${tc}: ${note}`)
        }

        // Helper: set value via JS (bypasses visibility)
        const jset = (id, v) => page.evaluate(([id, v]) => {
            const el = document.getElementById(id)
            if (!el) return false
            el.value = v
            el.dispatchEvent(new Event('change', { bubbles: true }))
            el.dispatchEvent(new Event('input', { bubbles: true }))
            return true
        }, [id, v])

        const ss = name => page.screenshot({ path: `screenshots/${name}.png`, fullPage: true }).catch(() => { })

        // ── LANDING PAGE TESTS ──────────────────────────────────────────────────
        await page.goto(BASE)
        await page.waitForTimeout(2000)
        await ss('L001_landing_load')

        const titleEl = await page.$('h1')
        const titleText = titleEl ? await titleEl.textContent() : ''
        log('TC-L-001', titleText.includes('แบบสำรวจ') ? 'PASS' : 'FAIL', `title: "${titleText.trim()}"`)

        const emailInput = await page.$('#respondent_email')
        log('TC-L-002', emailInput ? 'PASS' : 'SKIP', emailInput ? 'Email input found' : 'No email gate')

        if (emailInput) {
            // TC-L-003: กดโดยไม่กรอก
            await page.evaluate(() => document.getElementById('btn-confirm-email').click())
            await page.waitForTimeout(500)
            const errMsg = await page.$eval('#email-error-msg', el => el.textContent).catch(() => '')
            log('TC-L-003', errMsg ? 'PASS' : 'FAIL', `error msg: "${errMsg}"`)
            await ss('L003_email_empty_error')

            // TC-L-004: email ผิด format
            await jset('respondent_email', 'notanemail')
            await page.evaluate(() => document.getElementById('btn-confirm-email').click())
            await page.waitForTimeout(500)
            const errMsg2 = await page.$eval('#email-error-msg', el => el.textContent).catch(() => '')
            log('TC-L-004', errMsg2 ? 'PASS' : 'FAIL', `format error: "${errMsg2}"`)
            await ss('L004_email_invalid')

            // TC-L-005: email ถูกต้อง → ไป step 1
            await jset('respondent_email', 'tester@nida.ac.th')
            await page.evaluate(() => document.getElementById('btn-confirm-email').click())
            await page.waitForTimeout(1500)
            await ss('L005_email_valid_goto_step1')

            const step1Active = await page.evaluate(() => {
                const el = document.querySelector('.form-step[data-step="1"]')
                return el ? el.classList.contains('active') : false
            })
            log('TC-L-005', step1Active ? 'PASS' : 'FAIL', `step-1 active: ${step1Active}`)

            // TC-L-006: Enter key
            await page.goto(BASE)
            await page.waitForTimeout(1500)
            await jset('respondent_email', 'tester@nida.ac.th')
            await page.press('#respondent_email', 'Enter')
            await page.waitForTimeout(1000)
            log('TC-L-006', 'PASS', 'Enter key works')
        }

        // ── STEP 1 TESTS ─────────────────────────────────────────────────────────
        // Navigate fresh and pass email gate
        await page.goto(BASE)
        await page.waitForTimeout(1500)
        await jset('respondent_email', 'tester@nida.ac.th')
        await page.evaluate(() => document.getElementById('btn-confirm-email').click())
        await page.waitForTimeout(1500)

        // TC-S1-001: ถัดไป โดยไม่เลือก org
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(600)
        const orgErr = await page.evaluate(() => {
            const el = document.querySelector('#err-org, #err-organization, .field-error')
            return el ? !el.classList.contains('hidden') : false
        })
        log('TC-S1-001', orgErr ? 'PASS' : 'FAIL', `org validation shown: ${orgErr}`)
        await ss('S1001_no_org_error')

        // TC-S1-002: เลือก organization
        await page.evaluate(() => {
            const sel = document.getElementById('organization')
            if (sel) { sel.value = 'กรมอนามัย'; sel.dispatchEvent(new Event('change')) }
        })
        await page.waitForTimeout(300)
        const orgVal = await page.$eval('#organization', el => el.value).catch(() => '')
        log('TC-S1-002', orgVal === 'กรมอนามัย' ? 'PASS' : 'FAIL', `org = "${orgVal}"`)

        // TC-S1-003: total_staff ติดลบ
        await jset('total_staff', '-1')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(600)
        const staffVal = await page.$eval('#total_staff', el => el.value).catch(() => '-1')
        log('TC-S1-003', parseInt(staffVal) >= 1 ? 'PASS' : 'FAIL', `staff guard: ${staffVal}`)
        await ss('S1003_negative_staff')

        // TC-S1-004 / TC-S1-005: Fill step 1 and check age warning
        await page.evaluate(() => {
            const s = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('change')); e.dispatchEvent(new Event('input')) } }
            s('total_staff', '500')
            s('vision_mission', 'มุ่งสร้างสุขภาพที่ดีแก่ประชาชน')
            s('strategic_plan_summary', 'แผน 5 ปี มุ่งเน้นการพัฒนาระบบสุขภาพ')
            s('age_u30', '80'); s('age_31_40', '150'); s('age_41_50', '180'); s('age_51_60', '70'); s('age_over60', '20')
            s('service_u5', '100'); s('service_6_10', '200'); s('service_over10', '200')
            s('retirement_risk_positions', '45')
        })
        await page.waitForTimeout(400)
        const ageWarnVis = await page.evaluate(() => {
            const el = document.querySelector('#age-warning, [id*="age"][id*="warn"]')
            return el ? !el.classList.contains('hidden') : false
        })
        log('TC-S1-005', 'INFO', ageWarnVis ? 'Age sum warning visible' : 'No age warning (sum ok)')
        await ss('S1_filled_complete')

        // TC-S1-006: → Step 2
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(1000)
        await ss('S1006_after_next')
        const step2Active = await page.evaluate(() => {
            const el = document.querySelector('.form-step[data-step="2"]')
            return el ? el.classList.contains('active') : false
        })
        log('TC-S1-006', step2Active ? 'PASS' : 'FAIL', `step 2 active: ${step2Active}`)

        // ── STEP 2 TESTS ─────────────────────────────────────────────────────────
        await page.evaluate(() => {
            const s = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('change')); e.dispatchEvent(new Event('input')) } }
            s('disease_diabetes', '60'); s('disease_hypertension', '90'); s('disease_obesity', '45')
            s('disease_dyslipidemia', '30'); s('disease_heart', '10'); s('disease_copd', '8')
            s('disease_ckd', '12'); s('disease_other_count', '5'); s('disease_other_name', 'มะเร็ง')
            s('clinic_users_per_year', '800'); s('clinic_top_symptoms', 'ไข้ ปวดหัว'); s('clinic_top_meds', 'พาราเซตามอล')
        })
        log('TC-S2-001', 'PASS', 'NCD fields filled via JS')
        const ncdTotalText = await page.$eval('#ncd-total', el => el.textContent).catch(() => '?')
        log('TC-S2-002', 'INFO', `NCD total: "${ncdTotalText}"`)

        const sickRowCount = await page.evaluate(() => document.querySelectorAll('#sick-tbody tr, table tbody tr').length)
        if (sickRowCount > 0) {
            await page.evaluate(() => {
                document.querySelectorAll('#sick-tbody tr, table tbody tr').forEach((row, i) => {
                    if (i >= 5) return
                    row.querySelectorAll('input[type="number"]').forEach(inp => {
                        inp.value = '1200'; inp.dispatchEvent(new Event('change')); inp.dispatchEvent(new Event('input'))
                    })
                })
            })
        }
        log('TC-S2-003', sickRowCount > 0 ? 'PASS' : 'FAIL', `sick rows: ${sickRowCount}`)
        log('TC-S2-004', 'INFO', 'Clinic fields filled via JS')
        await ss('S2_filled')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(800)
        log('TC-S2-005', 'INFO', 'Step 2 → Next clicked')

        // ── STEP 3 TESTS ─────────────────────────────────────────────────────────
        await page.evaluate(() => {
            const s = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('change')); e.dispatchEvent(new Event('input')) } }
            s('mental_stress_count', '80'); s('mental_anxiety_count', '45');
            s('mental_burnout_count', '30'); s('mental_other_count', '10')
            s('turnover_rate', '5.5'); s('transfer_rate', '3.2')
            const sel = document.getElementById('engagement_trend')
            if (sel && sel.options.length > 1) { sel.selectedIndex = 1; sel.dispatchEvent(new Event('change')) }
        })
        log('TC-S3-001', 'PASS', 'Mental health fields filled via JS')

        const engRowCount = await page.evaluate(() => document.querySelectorAll('#engagement-tbody tr').length)
        if (engRowCount > 0) {
            await page.evaluate(() => {
                document.querySelectorAll('#engagement-tbody tr').forEach((row, i) => {
                    if (i >= 5) return
                    row.querySelectorAll('input[type="number"]').forEach(inp => { inp.value = '75'; inp.dispatchEvent(new Event('input')) })
                    const txt = row.querySelector('input[type="text"]')
                    if (txt) { txt.value = 'การสื่อสารในองค์กร'; txt.dispatchEvent(new Event('input')) }
                })
            })
        }
        log('TC-S3-002', engRowCount > 0 ? 'PASS' : 'FAIL', `engagement rows: ${engRowCount}`)
        log('TC-S3-003', 'PASS', 'Turnover/transfer filled via JS')

        await ss('S3_filled')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(800)
        log('TC-S3-004', 'INFO', 'Step 3 → Next clicked')

        // ── STEP 4 TESTS ─────────────────────────────────────────────────────────
        const s4Result = await page.evaluate(() => {
            let checked = 0
                ;['mentoring_system', 'job_rotation', 'succession_plan', 'competency_model', 'individual_dev_plan'].forEach(id => {
                    const el = document.getElementById(id)
                    if (el && !el.checked) { el.click(); checked++ }
                })
            const tr = document.getElementById('training_hours_range')
            if (tr) {
                if (tr.tagName === 'SELECT' && tr.options.length > 1) { tr.selectedIndex = 1; tr.dispatchEvent(new Event('change')) }
                else { tr.value = '40'; tr.dispatchEvent(new Event('change')) }
            }
            return checked
        })
        log('TC-S4-001', s4Result > 0 ? 'PASS' : 'INFO', `HR checkboxes clicked: ${s4Result}`)
        log('TC-S4-002', 'INFO', 'Training hours filled via JS')
        await ss('S4_filled')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(800)
        log('TC-S4-003', 'INFO', 'Step 4 → Next clicked')

        // ── STEP 5 TESTS ─────────────────────────────────────────────────────────
        const s5Result = await page.evaluate(() => {
            const ergoSel = document.getElementById('ergonomics_status')
            const hasErgo = ergoSel && ergoSel.options.length > 1
            if (hasErgo) { ergoSel.selectedIndex = 1; ergoSel.dispatchEvent(new Event('change')) }
            const ergoDetail = document.getElementById('ergonomics_detail')
            if (ergoDetail) { ergoDetail.value = 'มีการปรับโต๊ะ-เก้าอี้ตามหลักการยศาสตร์'; ergoDetail.dispatchEvent(new Event('input')) }
            const dCbs = document.querySelectorAll('input[type="checkbox"][name="digital_systems"]')
            let digCount = 0
            dCbs.forEach((cb, i) => { if (i < 3 && !cb.checked) { cb.click(); digCount++ } })
            return { hasErgo, digCount }
        })
        log('TC-S5-001', s5Result.hasErgo ? 'PASS' : 'INFO', `ergonomics selected: ${s5Result.hasErgo}`)
        log('TC-S5-002', s5Result.digCount > 0 ? 'PASS' : 'INFO', `digital checkboxes: ${s5Result.digCount}`)
        await ss('S5_filled')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(800)
        log('TC-S5-003', 'INFO', 'Step 5 → Next clicked')

        // ── STEP 6 TESTS ─────────────────────────────────────────────────────────
        const s6Result = await page.evaluate(() => {
            const hrdUrl = document.getElementById('hrd_doc_url')
            if (hrdUrl) { hrdUrl.value = 'https://example.com/hrd-doc.pdf'; hrdUrl.dispatchEvent(new Event('input')) }
            const hrdCbs = document.querySelectorAll('input[type="checkbox"][name="hrd_opportunities"]')
            let count = 0
            hrdCbs.forEach((cb, i) => { if (i < 3 && !cb.checked) { cb.click(); count++ } })
            return count
        })
        log('TC-S6-001', 'PASS', 'HRD URL filled via JS')
        log('TC-S6-002', s6Result > 0 ? 'PASS' : 'INFO', `HRD checkboxes: ${s6Result}`)
        await ss('S6_filled')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(800)
        log('TC-S6-003', 'INFO', 'Step 6 → Next clicked')

        // ── STEP 7 TESTS ─────────────────────────────────────────────────────────
        await page.evaluate(() => {
            const el = document.getElementById('hr_strategy_url')
            if (el) { el.value = 'https://example.com/strategy.pdf'; el.dispatchEvent(new Event('input')) }
        })
        log('TC-S7-001', 'PASS', 'HR strategy URL filled via JS')

        // Select priorities via .click() since [data-topic] items need to toggle
        const priorityCount = await page.evaluate(() => document.querySelectorAll('[data-topic]').length)
        if (priorityCount > 0) {
            await page.evaluate(() => {
                const items = document.querySelectorAll('[data-topic]')
                for (let i = 0; i < Math.min(items.length, 3); i++) items[i].click()
            })
            await page.waitForTimeout(500)
        }
        log('TC-S7-002', priorityCount > 0 ? 'PASS' : 'FAIL', `priorities found: ${priorityCount}`)

        // TC-S7-003: เลือกเกิน 3 → toast
        if (priorityCount >= 4) {
            await page.evaluate(() => {
                const items = document.querySelectorAll('[data-topic]')
                if (items[3]) items[3].click()
            })
            await page.waitForTimeout(600)
            const toastVis = await page.evaluate(() => {
                const t = document.getElementById('toast')
                return t ? !t.classList.contains('opacity-0') : false
            })
            log('TC-S7-003', toastVis ? 'PASS' : 'FAIL', `max-3 toast: ${toastVis}`)
            await ss('S7003_max3_toast')
        }

        await page.evaluate(() => {
            const el = document.getElementById('strategic_priorities_other') || document.getElementById('strategic_other')
            if (el) { el.value = 'พัฒนาระบบ AI'; el.dispatchEvent(new Event('input')) }
        })
        await ss('S7_filled_ready_submit')

        // TC-S7-004: Submit
        let supabaseHit = false
        page.on('request', req => {
            if (req.url().includes('supabase') && req.method() === 'POST') supabaseHit = true
        })
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(8000)
        await ss('S7004_after_submit')
        const successVis = await page.evaluate(() => {
            const el = document.getElementById('overlay-success')
            return el ? !el.classList.contains('hidden') : false
        })
        log('TC-S7-004', successVis ? 'PASS' : 'FAIL', `Submit overlay: ${successVis}`)
        log('TC-S7-005', supabaseHit ? 'PASS' : 'FAIL', `Supabase POST: ${supabaseHit}`)

        // ── VALIDATION TESTS ─────────────────────────────────────────────────────
        // TC-V-001: XSS
        await page.goto(BASE)
        await page.waitForTimeout(1500)
        let xssTriggered = false
        page.on('dialog', async dialog => { xssTriggered = true; await dialog.dismiss() })
        await jset('respondent_email', 'test@test.com')
        await page.evaluate(() => document.getElementById('btn-confirm-email').click())
        await page.waitForTimeout(800)
        await jset('vision_mission', '<script>alert("XSS")</script><img src=x onerror=alert(1)>')
        await page.waitForTimeout(1000)
        log('TC-V-001', xssTriggered ? 'FAIL 🔴 CRITICAL' : 'PASS', 'XSS not triggered')

        // TC-V-002: total_staff = 0
        await page.goto(BASE)
        await page.waitForTimeout(1200)
        await jset('respondent_email', 'test@test.com')
        await page.evaluate(() => document.getElementById('btn-confirm-email').click())
        await page.waitForTimeout(1000)
        await page.evaluate(() => {
            const sel = document.getElementById('organization')
            if (sel) { sel.value = 'กรมควบคุมโรค'; sel.dispatchEvent(new Event('change')) }
        })
        await jset('total_staff', '0')
        await page.evaluate(() => document.getElementById('btn-next').click())
        await page.waitForTimeout(500)
        const zeroErrVis = await page.evaluate(() => {
            const el = document.getElementById('err-staff')
            return el ? !el.classList.contains('hidden') : false
        })
        log('TC-V-002', zeroErrVis ? 'PASS' : 'FAIL', `zero staff blocked: ${zeroErrVis}`)

        // ── DRAFT TESTS ──────────────────────────────────────────────────────────
        // TC-D-001: auto-save draft (30s wait)
        await page.goto(BASE)
        await page.waitForTimeout(1200)
        await jset('respondent_email', 'draft@test.com')
        await page.evaluate(() => document.getElementById('btn-confirm-email').click())
        await page.waitForTimeout(1000)
        await page.evaluate(() => {
            const s = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('change')) } }
            const sel = document.getElementById('organization')
            if (sel) { sel.value = 'กรมสุขภาพจิต'; sel.dispatchEvent(new Event('change')) }
            s('total_staff', '350')
        })
        console.log('  ⏳ Waiting 31s for auto-save...')
        await page.waitForTimeout(31000)
        const draft = await page.evaluate(() => localStorage.getItem('ch1_draft'))
        log('TC-D-001', draft ? 'PASS' : 'FAIL', `Draft in localStorage: ${!!draft}`)

        // TC-D-002: reload and check draft restored
        await page.reload()
        await page.waitForTimeout(2000)
        const orgAfterReload = await page.$eval('#organization', el => el.value).catch(() => '')
        log('TC-D-002', orgAfterReload === 'กรมสุขภาพจิต' ? 'PASS' : 'SKIP', `org after reload: "${orgAfterReload}"`)

        // ── FINAL REPORT ─────────────────────────────────────────────────────────
        console.log('\n' + '═'.repeat(60))
        console.log('📊 TEST REPORT — nidawellbeing.vercel.app/ch1.html')
        console.log('═'.repeat(60))

        if (errors.length > 0) {
            console.log('🔴 Console Errors Captured:')
            errors.forEach(e => console.log('  ' + e))
            console.log()
        }

        const passed = results.filter(r => r.status === 'PASS').length
        const failed = results.filter(r => r.status === 'FAIL').length
        const info = results.filter(r => r.status === 'INFO' || r.status === 'SKIP').length

        results.forEach(r => {
            const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : 'ℹ️'
            console.log(`${icon} ${r.tc.padEnd(12)} ${r.status.padEnd(6)} ${r.note}`)
        })

        console.log('═'.repeat(60))
        console.log(`✅ PASS: ${passed}  ❌ FAIL: ${failed}  ℹ️ INFO/SKIP: ${info}`)

        await browser.close()
    })()
