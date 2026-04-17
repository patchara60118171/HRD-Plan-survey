"""
Fix ch1.html and questions-ch1.json to align with SSOT (data/questions-ch1.json)
Changes:
 1. disease_report_type, sick_leave_report_type, mental_health_report_type:
    Replace old 2-option (official_only/all_staff) with 3-option (actual/estimated/none)
 2. Add Q9 clinic section (was collected by ch1-form.js but missing from HTML)
 3. Replace hardcoded rankList items with SSOT-driven inline script
 4. Update Click-to-Rank LABELS to read from PROJECT_SSOT
 5. Add clinic section to data/questions-ch1.json
"""
import json, re, os

BASE = r'c:\Users\Pchr Pyl\Desktop\Well-being Survey'
CH1_HTML = os.path.join(BASE, 'ch1.html')
CH1_JSON = os.path.join(BASE, 'data', 'questions-ch1.json')

# ── helper: indent a block of HTML with a given prefix ──────────────────────
def blk(lines, indent=''):
    """Join lines with blank lines between them (file's native format)."""
    return '\n'.join(indent + ln if ln.strip() else '' for ln in lines)

# ════════════════════════════════════════════════════════════════
# 1. Fix ch1.html
# ════════════════════════════════════════════════════════════════
with open(CH1_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# ─── build the NEW 3-option report-type block for a given name ───────────────
def report_type_block(name):
    """Returns the new HTML block for a report-type radio group."""
    return (
        '                        <div class="mb-4">\n'
        '\n'
        '                            <label class="block text-sm font-medium text-slate-700 mb-2">ประเภทข้อมูลที่รายงาน</label>\n'
        '\n'
        '                            <div class="space-y-2">\n'
        '\n'
        '                                <label class="flex items-center gap-2 cursor-pointer">\n'
        '\n'
        f'                                    <input type="radio" name="{name}" value="actual"\n'
        '\n'
        '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
        '\n'
        '                                    <span class="text-sm text-slate-700">ข้อมูลจริง</span>\n'
        '\n'
        '                                </label>\n'
        '\n'
        '                                <label class="flex items-center gap-2 cursor-pointer">\n'
        '\n'
        f'                                    <input type="radio" name="{name}" value="estimated"\n'
        '\n'
        '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
        '\n'
        '                                    <span class="text-sm text-slate-700">ประมาณการ</span>\n'
        '\n'
        '                                </label>\n'
        '\n'
        '                                <label class="flex items-center gap-2 cursor-pointer">\n'
        '\n'
        f'                                    <input type="radio" name="{name}" value="none"\n'
        '\n'
        '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
        '\n'
        '                                    <span class="text-sm text-slate-700">ไม่มีข้อมูล</span>\n'
        '\n'
        '                                </label>\n'
        '\n'
        '                            </div>\n'
        '\n'
        '                        </div>\n'
    )

# ─── OLD disease_report_type block (lines 1705-1737) ─────────────────────────
OLD_DIS = (
    '                        <div class="mb-4">\n'
    '\n'
    '                            <label\n'
    '\n'
    '                                class="block text-sm font-medium text-slate-700 mb-2">โปรดระบุว่าข้อมูลที่รายงานเป็น</label>\n'
    '\n'
    '                            <div class="space-y-2">\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="disease_report_type" value="official_only"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">เฉพาะข้าราชการ</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="disease_report_type" value="all_staff"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">บุคลากรทั้งหมด\n'
    '\n'
    '                                        (ไม่สามารถแยกตามประเภทบุคลากรได้)</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                        </div>\n'
)
assert OLD_DIS in html, 'ERROR: OLD_DIS not found in ch1.html'
html = html.replace(OLD_DIS, report_type_block('disease_report_type'), 1)
print('✓ disease_report_type fixed')

# ─── OLD sick_leave_report_type block ────────────────────────────────────────
OLD_SICK = (
    '                        <div class="mb-4">\n'
    '\n'
    '                            <label\n'
    '\n'
    '                                class="block text-sm font-medium text-slate-700 mb-2">โปรดระบุว่าข้อมูลที่รายงานเป็น</label>\n'
    '\n'
    '                            <div class="space-y-2">\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="sick_leave_report_type" value="official_only"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">เฉพาะข้าราชการ</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="sick_leave_report_type" value="all_staff"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">บุคลากรทั้งหมด\n'
    '\n'
    '                                        (ไม่สามารถแยกตามประเภทบุคลากรได้)</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                        </div>\n'
)
assert OLD_SICK in html, 'ERROR: OLD_SICK not found in ch1.html'
html = html.replace(OLD_SICK, report_type_block('sick_leave_report_type'), 1)
print('✓ sick_leave_report_type fixed')

# ─── OLD mental_health_report_type block ─────────────────────────────────────
OLD_MH = (
    '                        <div class="mb-4">\n'
    '\n'
    '                            <label\n'
    '\n'
    '                                class="block text-sm font-medium text-slate-700 mb-2">โปรดระบุว่าข้อมูลที่รายงานเป็น</label>\n'
    '\n'
    '                            <div class="space-y-2">\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="mental_health_report_type" value="official_only"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">เฉพาะข้าราชการ</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                                <label class="flex items-center gap-2 cursor-pointer">\n'
    '\n'
    '                                    <input type="radio" name="mental_health_report_type" value="all_staff"\n'
    '\n'
    '                                        class="w-4 h-4 text-primary border-slate-300 focus:ring-primary mt-0.5">\n'
    '\n'
    '                                    <span class="text-sm text-slate-700">บุคลากรทั้งหมด\n'
    '\n'
    '                                        (ไม่สามารถแยกตามประเภทบุคลากรได้)</span>\n'
    '\n'
    '                                </label>\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                        </div>\n'
)
assert OLD_MH in html, 'ERROR: OLD_MH not found in ch1.html'
html = html.replace(OLD_MH, report_type_block('mental_health_report_type'), 1)
print('✓ mental_health_report_type fixed')

# ─── 2. Add Q9 clinic section ────────────────────────────────────────────────
# Insert after the sick_leave section's closing div and before Q10 comment.
# Unique anchor: the sick_leave section ends with grid+2 inputs, then </div></div>
# then blank lines, then "<!-- 10. ผลสำรวจสุขภาพจิต -->"
CLINIC_HTML = (
    '\n'
    '\n'
    '\n'
    '                    <!-- 9. สถิติผู้ใช้บริการห้องพยาบาล -->\n'
    '\n'
    '                    <div class="bg-slate-50 rounded-xl p-4">\n'
    '\n'
    '                        <h3 class="text-sm font-bold text-slate-700 mb-3">9. สถิติผู้ใช้บริการห้องพยาบาล <span\n'
    '\n'
    '                                class="text-slate-400 font-normal">(ถ้ามี)</span></h3>\n'
    '\n'
    '                        <p class="text-xs text-slate-500 mb-3">\n'
    '\n'
    '                            กรุณาระบุข้อมูลการใช้บริการห้องพยาบาลภายในหน่วยงาน\n'
    '\n'
    '                        </p>\n'
    '\n'
    + report_type_block('clinic_report_type').replace('                        ', '                        ') +
    '\n'
    '                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">\n'
    '\n'
    '                            <div>\n'
    '\n'
    '                                <label class="block text-sm font-medium text-slate-700 mb-1">จำนวนผู้ใช้บริการต่อปี (คน)</label>\n'
    '\n'
    '                                <input type="number" id="clinic_users_per_year" min="0" placeholder="0"\n'
    '\n'
    '                                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                        </div>\n'
    '\n'
    '                        <div class="space-y-3">\n'
    '\n'
    '                            <div>\n'
    '\n'
    '                                <label class="block text-sm font-medium text-slate-700 mb-1">อาการที่พบบ่อยที่สุด</label>\n'
    '\n'
    '                                <textarea id="clinic_top_symptoms" rows="2" placeholder="ระบุอาการที่พบบ่อยในห้องพยาบาล..."\n'
    '\n'
    '                                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"></textarea>\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                            <div>\n'
    '\n'
    '                                <label class="block text-sm font-medium text-slate-700 mb-1">ยาที่ใช้บ่อยที่สุด</label>\n'
    '\n'
    '                                <textarea id="clinic_top_medications" rows="2" placeholder="ระบุยาหรือวิธีรักษาที่ใช้บ่อยในห้องพยาบาล..."\n'
    '\n'
    '                                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"></textarea>\n'
    '\n'
    '                            </div>\n'
    '\n'
    '                        </div>\n'
    '\n'
    '                    </div>\n'
)

# Anchor: the Q10 comment line (unique in the file)
Q10_COMMENT = '\n                    <!-- 10. ผลสำรวจสุขภาพจิต -->'
assert Q10_COMMENT in html, 'ERROR: Q10 comment not found'
html = html.replace(Q10_COMMENT, CLINIC_HTML + '\n\n\n                    <!-- 10. ผลสำรวจสุขภาพจิต -->', 1)
print('✓ Q9 clinic section added')

# ─── 3. Replace hardcoded rankList items with SSOT builder script ─────────────
# Find the rankList div and replace hardcoded items with empty + script
OLD_RANKLIST_START = '                        <!-- Rank Items -->\n\n                        <div class="space-y-2" id="rankList">'
assert OLD_RANKLIST_START in html, 'ERROR: rankList start not found'

# Find the end of rankList div (the </div> that closes #rankList)
# The rankList div ends with the "other" item's closing div, then </div>
OLD_RANKLIST_END = (
    '                        </div>\n'
    '\n'
    '\n'
    '\n'
    '                        <!-- Summary'
)
assert OLD_RANKLIST_END in html, 'ERROR: rankList end not found'

# Get the part to replace: from start marker to end marker
# Replace everything inside rankList with SSOT builder
SSOT_RANKLIST = (
    '                        <!-- Rank Items — built from PROJECT_SSOT.ch1.strategicTopics -->\n'
    '\n'
    '                        <div class="space-y-2" id="rankList">\n'
    '\n'
    '                            <!-- Populated by SSOT builder script below -->\n'
    '\n'
    '                        </div>\n'
    '\n'
    '                        <script>\n'
    '                        (function buildRankItems() {\n'
    '                            var topics = (typeof PROJECT_SSOT !== \'undefined\' && PROJECT_SSOT.ch1 && PROJECT_SSOT.ch1.strategicTopics) ? PROJECT_SSOT.ch1.strategicTopics : [\n'
    '                                {id:\'service_efficiency\',label:\'การเพิ่มประสิทธิภาพการให้บริการประชาชน\'},\n'
    '                                {id:\'digital_capability\',label:\'การพัฒนาศักยภาพด้านดิจิทัล\'},\n'
    '                                {id:\'new_leaders\',label:\'การพัฒนาผู้นำรุ่นใหม่\'},\n'
    '                                {id:\'reduce_sick_leave\',label:\'การลดอัตราการลาป่วย\'},\n'
    '                                {id:\'reduce_turnover\',label:\'การลดอัตราการลาออก\'},\n'
    '                                {id:\'other\',label:\'อื่น ๆ\'}\n'
    '                            ];\n'
    '                            var container = document.getElementById(\'rankList\');\n'
    '                            if (!container) return;\n'
    '                            container.innerHTML = topics.map(function(t) {\n'
    '                                if (t.id === \'other\') return \'<div class="rank-item flex items-start gap-3 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 bg-white cursor-pointer select-none" data-value="other">\'\n'
    '                                    + \'<div class="rank-badge w-7 h-7 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 mt-0.5"><span class="rank-icon text-slate-300 text-xs font-bold leading-none">—</span></div>\'\n'
    '                                    + \'<div class="flex-1"><span class="text-sm text-slate-500">อื่น ๆ (โปรดระบุ)</span>\'\n'
    '                                    + \'<input type="text" id="strategic_priority_other" placeholder="ระบุประเด็นอื่นๆ" class="other-rank-input hidden mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white" onclick="event.stopPropagation()"></div></div>\';\n'
    '                                return \'<div class="rank-item flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer select-none" data-value="\'+t.id+\'">\'\n'
    '                                    + \'<div class="rank-badge w-7 h-7 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shrink-0"><span class="rank-icon text-slate-300 text-xs font-bold leading-none">—</span></div>\'\n'
    '                                    + \'<span class="text-sm text-slate-700">\'+t.label+\'</span></div>\';\n'
    '                            }).join(\'\');\n'
    '                        })();\n'
    '                        </script>\n'
    '\n'
    '\n'
    '\n'
    '                        <!-- Summary'
)

# Replace: find index of old start, find end of rankList div, replace the ranklist block
idx_start = html.index(OLD_RANKLIST_START)
idx_end = html.index(OLD_RANKLIST_END, idx_start)
old_block = html[idx_start:idx_end + len('                        <!-- Summary')]
new_block = SSOT_RANKLIST
html = html[:idx_start] + html[idx_start:].replace(old_block, new_block, 1)
print('✓ rankList replaced with SSOT builder')

# ─── 4. Update Click-to-Rank LABELS to use SSOT ──────────────────────────────
OLD_LABELS = (
    '            const LABELS = {\n'
    '\n'
    '                service_efficiency: \'การเพิ่มประสิทธิภาพการให้บริการประชาชน\',\n'
    '\n'
    '                digital_capability: \'การพัฒนาศักยภาพด้านดิจิทัล\',\n'
    '\n'
    '                new_leaders: \'การพัฒนาผู้นำรุ่นใหม่\',\n'
    '\n'
    '                reduce_sick_leave: \'การลดอัตราการลาป่วย\',\n'
    '\n'
    '                reduce_turnover: \'การลดอัตราการลาออก\',\n'
    '\n'
    '                other: \'อื่นๆ\',\n'
    '\n'
    '            };\n'
)
if OLD_LABELS in html:
    NEW_LABELS = (
        '            // LABELS: read from PROJECT_SSOT.ch1.strategicTopics for single source of truth\n'
        '            const LABELS = {};\n'
        '            (PROJECT_SSOT?.ch1?.strategicTopics || [\n'
        '                {id:\'service_efficiency\',label:\'การเพิ่มประสิทธิภาพการให้บริการประชาชน\'},\n'
        '                {id:\'digital_capability\',label:\'การพัฒนาศักยภาพด้านดิจิทัล\'},\n'
        '                {id:\'new_leaders\',label:\'การพัฒนาผู้นำรุ่นใหม่\'},\n'
        '                {id:\'reduce_sick_leave\',label:\'การลดอัตราการลาป่วย\'},\n'
        '                {id:\'reduce_turnover\',label:\'การลดอัตราการลาออก\'},\n'
        '                {id:\'other\',label:\'อื่น ๆ\'}\n'
        '            ]).forEach(function(t) { LABELS[t.id] = t.label; });\n'
    )
    html = html.replace(OLD_LABELS, NEW_LABELS, 1)
    print('✓ Click-to-Rank LABELS updated to use SSOT')
else:
    print('! WARNING: old LABELS block not found, skipping')

# Write ch1.html
with open(CH1_HTML, 'w', encoding='utf-8') as f:
    f.write(html)
print('✓ ch1.html written')

# ════════════════════════════════════════════════════════════════
# 2. Fix data/questions-ch1.json — add clinic section
# ════════════════════════════════════════════════════════════════
with open(CH1_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find step 3 and add clinic section after sick_leave, before mental_health
for step in data['steps']:
    if step.get('step') == 3:
        sections = step['sections']
        # Find sick_leave index
        sick_idx = next((i for i, s in enumerate(sections) if s.get('section_id') == 'sick_leave'), None)
        if sick_idx is None:
            print('! WARNING: sick_leave section not found in step 3')
            break
        # Check if clinic already exists
        if any(s.get('section_id') == 'clinic' for s in sections):
            print('! INFO: clinic section already in questions-ch1.json')
            break
        # Insert clinic section after sick_leave
        clinic_section = {
            "section_id": "clinic",
            "title": "สถิติผู้ใช้บริการห้องพยาบาล",
            "fields": [
                {
                    "id": "clinic_report_type",
                    "label": "ประเภทข้อมูลที่รายงาน",
                    "type": "radio",
                    "required": False,
                    "options": [
                        {"value": "actual",    "label": "ข้อมูลจริง"},
                        {"value": "estimated", "label": "ประมาณการ"},
                        {"value": "none",      "label": "ไม่มีข้อมูล"}
                    ]
                },
                {"id": "clinic_users_per_year", "label": "จำนวนผู้ใช้บริการต่อปี (คน)", "type": "number", "required": False, "min": 0},
                {"id": "clinic_top_symptoms",   "label": "อาการที่พบบ่อยที่สุด",          "type": "textarea", "required": False, "placeholder": "ระบุอาการที่พบบ่อยในห้องพยาบาล"},
                {"id": "clinic_top_medications","label": "ยาที่ใช้บ่อยที่สุด",            "type": "textarea", "required": False, "placeholder": "ระบุยาหรือวิธีรักษาที่ใช้บ่อยในห้องพยาบาล"}
            ]
        }
        sections.insert(sick_idx + 1, clinic_section)
        print('✓ clinic section added to questions-ch1.json step 3')
        break

with open(CH1_JSON, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('✓ questions-ch1.json written')

print('\nAll done!')
