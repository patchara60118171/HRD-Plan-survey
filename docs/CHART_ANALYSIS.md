# 📊 Chart Analysis & Dashboard Improvement Plan

## Current Status (org-portal.html)

### Existing HR Analytics Charts (4 charts)
All pulling data from `hrd_ch1_responses` table - Part 1 data:

1. **Personnel Type Distribution** (Doughnut)
   - Data: `type_official`, `type_employee`, `type_contract`, `type_other`
   - Colors: Purple, Blue, Green, Amber
   - ✅ Good visual design

2. **Age Distribution** (Horizontal Bar)
   - Data: `age_under_30`, `age_31_40`, `age_41_50`, `age_51_60`
   - Colors: Gradient purple to blue to green
   - ✅ Clear categorization

3. **Position Level Distribution** (Vertical Bar)
   - Data: O1-O4, K1-K5, M1-M2, S1-S2 levels
   - Colors: Grouped by level type
   - ✅ Well-organized with legend

4. **Service Years Distribution** (Horizontal Bar)
   - Data: `service_under_1`, `service_1_5`, `service_6_10`, etc.
   - Colors: Purple gradient (light to dark)
   - ✅ Filters empty data ranges
   - ✅ Shows "No data" message gracefully

---

## Available Charts from ch1.html (Part 3 - Well-being Data)

### Candidates for Dashboard Integration:

1. **Mental Health Survey Results** (Section 10)
   - Could aggregate TMHI/mental health scores from Part 3
   - Useful for well-being dashboard

2. **Engagement Survey Results** (Section 11)
   - Employee engagement scores
   - Good KPI metric

3. **Health Clinic Usage Statistics** (Section 9)
   - Visitor numbers, frequency patterns
   - Health trend indicator

4. **Sick Leave Statistics** (Section 8)
   - Average sick leave days, patterns
   - Could show trends by type

5. **Physical Health Summary** (Section 7)
   - BMI distribution, health assessments
   - Complements mental health data

6. **Training Hours** (Section 14)
   - Average training hours per employee
   - Development metric (already shown as KPI)

---

## Data Validation Issues to Check

### Current Potential Issues:
1. ✅ Field naming inconsistency: `type_official` vs `total_personnel` vs `total_staff`
2. ✅ Data type handling: numeric strings vs actual numbers
3. ✅ Empty data handling: Charts gracefully show "No data" (see service-years-chart)
4. ⚠️ Date handling: Verify submitted_at, created_at are ISO format
5. ⚠️ NULL value handling: Some fields default to 0, some to null

### Supabase Fetch Pattern:
```
hrd_ch1_responses.from()
├─ Fields checked: * (all)
├─ Filters: eq('org_code', ...) | ilike('organization', ...)
├─ Order: created_at DESC
└─ Limit: 1 (latest submission)
```

---

## Chart Design Improvements Needed

### Visual Issues:
1. **Canvas Size**: Some charts cramped at 260px height
   - Personnel type chart is especially compact
   - Consider expanding to 300-320px for better clarity

2. **Typography**: Thai font sizing good but:
   - Legend text could be slightly larger
   - Axis labels on position chart are crowded (13 categories)

3. **Color Harmony**:
   - Current palette works well
   - Age chart has good gradient
   - Consider adding subtle shadows/depth

4. **Spacing**:
   - Card padding looks good
   - Legend spacing adequate
   - Could improve tooltip readability

### Recommended Enhancements:
- ✅ Add data value labels directly on bars (for position & service charts)
- ✅ Animate chart initialization
- ✅ Better responsive behavior on mobile
- ✅ Add chart refresh button
- ✅ Show data source attribution (e.g., "From CH1 Form - 2024")
- ✅ Export to PNG capability per chart

---

## Recommendations

### Quick Wins:
1. Increase chart canvas height: 260px → 300px
2. Add chart title with data date
3. Add "Last updated" timestamp
4. Improve tooltip formatting

### Medium-term:
1. Add well-being metrics charts (mental health, engagement)
2. Add sick leave trend chart
3. Add training hours vs. organizational goal
4. Add health clinic usage trend

### Data Quality:
1. Audit: Verify all numeric fields are properly cast to numbers
2. Audit: Check NULL values - should they be 0?
3. Verify: All date fields are ISO 8601 format
4. Document: Field mapping from form → database
