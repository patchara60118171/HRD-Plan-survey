# 📈 Dashboard Expansion Recommendations

## ✅ Improvements Completed

### Visual Enhancements
- ✅ Increased chart height from 260px → 300px for better clarity
- ✅ Added "อัปเดต [วันที่]" timestamp to each chart
- ✅ Improved font sizing and consistency (size 11 for axis labels)
- ✅ Added data validation function to check data quality
- ✅ Enhanced tooltip formatting with Thai locale
- ✅ Improved empty data handling in doughnut chart

### Data Quality
- ✅ Added `validateChartData()` function to check:
  - NULL/undefined values (treats as 0)
  - Non-numeric data types
  - Negative values
  - Logs warnings to console

---

## 📊 Charts Available from ch1.html (Not Yet in Dashboard)

### Priority 1: High Value
These charts would significantly enhance HR insights:

#### 1. **Physical Health Summary** (Section 7 - สุขภาวะทางกาย)
- Fields: BMI distribution, health assessment scores
- Recommendation: **Stacked bar chart** showing BMI categories
  - Underweight, Normal, Overweight, Obese
- Data source: Aggregate from ch1Row fields
- Benefits: Complements organizational well-being data

#### 2. **Mental Health Survey Results** (Section 10 - ผลสำรวจสุขภาพจิต)
- Fields: TMHI scores, mental health assessment levels
- Recommendation: **Pie/doughnut chart** showing health categories
  - Good/Excellent, Normal, At-risk
- Data source: From ch1Row or survey_responses table
- Benefits: Key well-being indicator for management

#### 3. **Engagement Score Trend** (Section 11 - Employee Engagement)
- Fields: engagement_score, year-over-year data
- Recommendation: **Gauge chart or KPI card**
- Current data: Already shown as KPI (single value)
- Enhancement: Add trend line if historical data available

### Priority 2: Medium Value
Useful supporting metrics:

#### 4. **Sick Leave Statistics** (Section 8 - ข้อมูลการลาป่วย)
- Fields: sick_leave_avg, total_sick_days, frequency
- Recommendation: **Horizontal bar chart** by department
- Show: Average vs. benchmark trend

#### 5. **Health Clinic Usage** (Section 9 - สถิติผู้ใช้บริการห้องพยาบาล)
- Fields: clinic_visits, frequency, reasons
- Recommendation: **Line chart** showing monthly/quarterly trends
- Insight: Employee health engagement pattern

#### 6. **Training Hours Progress** (Section 14 - ชั่วโมงการอบรม)
- Already shown as KPI card
- Enhancement: **Progress bar** vs. organizational target
- Add: Target vs. actual comparison

---

## 🔧 How to Integrate New Charts

### Step 1: Add HTML Containers
```html
<div class="dash-card">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
    <h4>🏥 สรุปสถิติสุขภาพ</h4>
    <span id="chart-date-5" style="font-size:11px;color:var(--tx3)"></span>
  </div>
  <div style="position:relative;height:300px">
    <canvas id="health-summary-chart"></canvas>
  </div>
</div>
```

### Step 2: Add Chart Functions
```javascript
function createHealthSummaryChart(data) {
  const ctx = document.getElementById('health-summary-chart');
  if (!ctx) return;

  // Extract data from ch1Row
  const underweight = data.bmi_underweight || 0;
  const normal = data.bmi_normal || 0;
  const overweight = data.bmi_overweight || 0;
  const obese = data.bmi_obese || 0;

  _hrCharts['health-summary-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['น้อยเกินไป', 'ปกติ', 'น้อย', 'เกินไป'],
      datasets: [{
        label: 'จำนวนคน',
        data: [underweight, normal, overweight, obese],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { /* ... */ }
    }
  });
}
```

### Step 3: Initialize in initHRAnalyticsCharts()
```javascript
createHealthSummaryChart(data);
// Also add to timestamp section
document.getElementById('chart-date-5').textContent = `อัปเดต ${dateStr}`;
```

---

## ⚠️ Data Field Validation Results

### Currently Validated Fields
```
Personnel Type: type_official, type_employee, type_contract, type_other ✅
Age Distribution: age_under_30, age_31_40, age_41_50, age_51_60 ✅
Position Levels: pos_o1-o4, pos_k1-k5, pos_m1-m2, pos_s1-s2 ✅
Service Years: service_under_1, service_1_5, service_6_10, etc. ✅
```

### Fields to Verify for New Charts
- BMI categories (bmi_underweight, bmi_normal, bmi_overweight, bmi_obese)
- Mental health levels (tmhi_good, tmhi_normal, tmhi_atrisk)
- Health clinic visits (clinic_visits, clinic_frequency)
- Sick leave (sick_leave_avg, sick_leave_total)
- Training hours (training_hours_2568 or training_hours_total)

### Recommendations
1. **Run audit SQL**:
   ```sql
   SELECT * FROM hrd_ch1_responses LIMIT 1;
   -- Check if BMI, TMHI, clinic, sick leave fields exist
   ```

2. **Add to validateChartData()**:
   ```javascript
   // Add BMI fields
   'bmi_underweight', 'bmi_normal', 'bmi_overweight', 'bmi_obese',
   // Add health fields
   'tmhi_good', 'tmhi_normal', 'tmhi_atrisk'
   ```

3. **Monitor console** for data quality warnings

---

## 📋 Implementation Checklist

### Phase 1: Data Validation ✅
- [x] Add validateChartData() function
- [x] Log warnings to console
- [ ] Run SQL audit to verify BMI, TMHI, health fields
- [ ] Document any missing fields

### Phase 2: Enhanced Charts ✅
- [x] Improve styling (colors, fonts, spacing)
- [x] Add timestamps
- [x] Improve tooltips
- [x] Better responsive design

### Phase 3: Additional Charts (Next)
- [ ] Physical Health Summary (BMI distribution)
- [ ] Mental Health Status (TMHI levels)
- [ ] Engagement Score with target
- [ ] Sick Leave Trends
- [ ] Health Clinic Usage

### Phase 4: Dashboard Organization
- [ ] Group charts by category
- [ ] Add section headers ("สุขภาวะ", "ทรัพยากรบุคคล", etc.)
- [ ] Add export functionality per chart
- [ ] Add date range selector

---

## 🎯 Success Metrics

✅ Charts display correctly with real data
✅ Data validation catches issues early
✅ Timestamps show when data was last updated
✅ Tooltips provide clear insights
✅ Charts responsive on all screen sizes
✅ No console errors from data quality issues

---

## 📞 Next Steps

1. **Verify data fields** in Supabase for BMI, TMHI, health clinic data
2. **Design** additional chart layouts
3. **Implement** health summary and mental health charts
4. **Test** with production data
5. **Optimize** chart performance if needed
