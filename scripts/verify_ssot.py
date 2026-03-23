content = open('ch1.html', encoding='utf-8').read()
checks = [
    ('old official_only gone', 'official_only' not in content),
    ('old all_staff gone', 'all_staff' not in content),
    ('actual option present', 'value="actual"' in content),
    ('estimated option present', 'value="estimated"' in content),
    ('clinic section added', 'clinic_users_per_year' in content),
    ('rankList SSOT builder', 'buildRankItems' in content),
    ('LABELS from SSOT', 'LABELS: read from PROJECT_SSOT' in content),
    ('clinic_report_type in HTML', 'clinic_report_type' in content),
]
for name, ok in checks:
    print(('PASS' if ok else 'FAIL') + ': ' + name)
for n in ['disease_report_type', 'sick_leave_report_type', 'clinic_report_type', 'mental_health_report_type']:
    print('  ' + n + ' count (name=):', content.count('name="' + n + '"'))
