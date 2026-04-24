/* auto-generated from .jsx – do not edit */
(function () {
  'use strict';
  var React = window.React;
  var Recharts = window.Recharts;
  var useState = React.useState, useMemo = React.useMemo, useEffect = React.useEffect, useRef = React.useRef, Fragment = React.Fragment;
  var BarChart = Recharts.BarChart, Bar = Recharts.Bar, XAxis = Recharts.XAxis, YAxis = Recharts.YAxis,
      CartesianGrid = Recharts.CartesianGrid, Tooltip = Recharts.Tooltip, ResponsiveContainer = Recharts.ResponsiveContainer,
      RadarChart = Recharts.RadarChart, Radar = Recharts.Radar, PolarGrid = Recharts.PolarGrid,
      PolarAngleAxis = Recharts.PolarAngleAxis, PolarRadiusAxis = Recharts.PolarRadiusAxis,
      LineChart = Recharts.LineChart, Line = Recharts.Line, AreaChart = Recharts.AreaChart, Area = Recharts.Area,
      PieChart = Recharts.PieChart, Pie = Recharts.Pie, Cell = Recharts.Cell,
      ScatterChart = Recharts.ScatterChart, Scatter = Recharts.Scatter, ZAxis = Recharts.ZAxis,
      ComposedChart = Recharts.ComposedChart, Legend = Recharts.Legend, ReferenceLine = Recharts.ReferenceLine;

// ─── Constants ─────────────────────────────────────────────────────────────
const DEPTS = ["นโยบาย", "ปฏิบัติการ", "สนับสนุน"];
const NAMES = ["นายสมชาย ใจดี", "นางสาวมาลี รักสุข", "นายประสิทธิ์ ทำงาน", "นางวิภา สดใส", "นายกิตติ เก่งมาก", "นางสาวอัญชลี ร่าเริง", "นายวีระ ขยันดี", "นางรัตนา มีสุข", "นายพิทักษ์ ตั้งใจ", "นางสาวสุภา สวยงาม", "นายอนุชา ดีเลิศ", "นางเพ็ญศรี แจ่มใส", "นายชัยวัฒน์ รุ่งเรือง", "นางสาวนิภา ยิ้มแย้ม", "นายสุรศักดิ์ มั่นคง", "นางกัลยา ใสสะอาด", "นายธนพล ฉลาดดี", "นางสาวลัดดา สะอาด", "นายปิยะ เฉลียวฉลาด", "นางวรรณา สุขสบาย"];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[rand(0, arr.length - 1)];

// ─── BMI Helpers ────────────────────────────────────────────────────────────
const getBMILevel = bmi => {
  if (bmi < 18.5) return {
    label: "น้ำหนักน้อย",
    color: "#60A5FA",
    risk: false
  };
  if (bmi < 23) return {
    label: "ปกติ",
    color: "#10B981",
    risk: false
  };
  if (bmi < 25) return {
    label: "น้ำหนักเกิน",
    color: "#F59E0B",
    risk: true
  };
  if (bmi < 30) return {
    label: "อ้วน",
    color: "#F97316",
    risk: true
  };
  return {
    label: "อ้วนมาก",
    color: "#EF4444",
    risk: true
  };
};
const getWaistRisk = (waist, gender) => gender === "ชาย" ? waist > 90 : waist > 80;

// ─── Generate Mock Data ─────────────────────────────────────────────────────
const generateEmployee = (name, idx) => {
  const gender = name.startsWith("นาย") ? "ชาย" : "หญิง";
  const height = gender === "ชาย" ? rand(162, 180) : rand(152, 168);
  const weight = rand(50, 110);
  const bmi = parseFloat((weight / (height / 100) ** 2).toFixed(1));
  const waist = gender === "ชาย" ? rand(72, 102) : rand(66, 92);

  // Diet score: 0-5 (ยิ่งสูง = กินแย่)
  const dietScore = rand(0, 5);
  // Exercise: days/week
  const exerciseDays = rand(0, 6);
  // Sedentary hours/day
  const sedentaryHours = rand(4, 12);

  // Risk factors
  const bmiRisk = getBMILevel(bmi).risk;
  const waistRisk = getWaistRisk(waist, gender);
  const dietRisk = dietScore >= 3;
  const exerciseRisk = exerciseDays < 3;
  const sedentaryRisk = sedentaryHours >= 8;
  const riskCount = [bmiRisk, dietRisk, exerciseRisk].filter(Boolean).length;
  const physicalGroup = riskCount >= 3 ? "high" : riskCount >= 1 ? "medium" : "low";

  // Risky behaviors
  const smokeCig = pick(["none", "none", "none", "daily", "occasional"]);
  const smokeVape = pick(["none", "none", "none", "none", "daily", "occasional"]);
  const alcohol = pick(["none", "none", "daily", "weekly", "occasional"]);
  const substance = pick(["none", "none", "none", "none", "occasional"]);
  const hasRiskyBehavior = smokeCig !== "none" || smokeVape !== "none" || alcohol !== "none" || substance !== "none";

  // NCD
  const ncdList = [];
  if (rand(0, 4) === 0) ncdList.push("เบาหวาน");
  if (rand(0, 3) === 0) ncdList.push("ความดันโลหิตสูง");
  if (rand(0, 6) === 0) ncdList.push("โรคหัวใจ");
  if (rand(0, 8) === 0) ncdList.push("โรคไต");
  if (rand(0, 9) === 0) ncdList.push("โรคตับ");
  if (rand(0, 12) === 0) ncdList.push("มะเร็ง");
  return {
    id: idx + 1,
    name,
    gender,
    dept: DEPTS[idx % 3],
    height,
    weight,
    bmi,
    bmiLevel: getBMILevel(bmi),
    waist,
    waistRisk,
    dietScore,
    exerciseDays,
    sedentaryHours,
    bmiRisk,
    waistRisk,
    dietRisk,
    exerciseRisk,
    sedentaryRisk,
    riskCount,
    physicalGroup,
    smokeCig,
    smokeVape,
    alcohol,
    substance,
    hasRiskyBehavior,
    ncdList,
    hasNCD: ncdList.length > 0
  };
};
// ─── Real data adapter ───────────────────────────────────────────────────────
const _PHYS_REAL = typeof window !== 'undefined' && window.__IDP_EMPLOYEES__ && window.__IDP_EMPLOYEES__.physical || null;
const _hasFlag = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return s !== '' && s !== '0' && s !== 'false' && !/^ไม่/.test(s);
};
// Parse NCD list from a single string/array field (matches admin/js/services/utils.js)
const _parseNcdList = (row) => {
  const v = row.diseases ?? row.chronic_disease ?? row.ncd ?? row.condition_list;
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v.filter(d => d && d !== 'ไม่มี');
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s || s === 'ไม่มี' || s === 'none' || s === 'false') return [];
    return s.split(',').map(x => x.trim()).filter(x => x && x !== 'ไม่มี');
  }
  return [];
};
// Normalize to canonical NCD names used in charts
const _normalizeNcd = (label) => {
  const s = String(label || '').trim();
  if (!s) return null;
  if (/เบาหวาน|diabetes/i.test(s)) return 'เบาหวาน';
  if (/ความดัน|hypertension/i.test(s)) return 'ความดันโลหิตสูง';
  if (/หัวใจ|หลอดเลือด|cardio|heart/i.test(s)) return 'โรคหัวใจ';
  if (/ไต|kidney/i.test(s)) return 'โรคไต';
  if (/ตับ|liver/i.test(s)) return 'โรคตับ';
  if (/มะเร็ง|cancer/i.test(s)) return 'มะเร็ง';
  return s;
};
const _toPhysEmployee = (rec, idx) => {
  const row = rec._raw || {};
  const gender = row.gender || (rec.name && rec.name.startsWith('นาย') ? 'ชาย' : 'หญิง');
  const height = parseFloat(row.height) || 165;
  const weight = parseFloat(row.weight) || 60;
  const bmiVal = rec.bmi != null ? rec.bmi : (weight / Math.pow(height > 3 ? height/100 : height, 2));
  const bmi = parseFloat((bmiVal || 0).toFixed(1));
  const waist = parseFloat(row.waist) || (gender === 'ชาย' ? 85 : 75);

  // Diet risk from scoring helpers
  const S = window.IDPScoring || {};
  const sweetR = S.sweetRisk ? S.sweetRisk(row) : null;
  const fatR   = S.fatRisk   ? S.fatRisk(row)   : null;
  const saltR  = S.saltRisk  ? S.saltRisk(row)  : null;
  const dietRisk = [sweetR, fatR, saltR].some(r => r && (r.key === 'high' || r.key === 'very_high'));
  const dietScore = (sweetR?.key === 'high' ? 2 : sweetR?.key === 'very_high' ? 3 : 1) +
                    (fatR?.key === 'high' ? 2 : fatR?.key === 'very_high' ? 3 : 1) +
                    (saltR?.key === 'high' ? 2 : saltR?.key === 'very_high' ? 3 : 1);

  // Exercise
  const tpax = S.tpaxLevel ? S.tpaxLevel(row) : null;
  const exerciseDays = tpax?.key === 'good' ? 5 : tpax?.key === 'ok' ? 3 : 1;
  const exerciseRisk = tpax?.key === 'low';

  // Sedentary
  const sed = S.sedentaryLevel ? S.sedentaryLevel(row) : null;
  const sedentaryHours = sed?.key === 'risk' ? 11 : 6;
  const sedentaryRisk = sed?.key === 'risk';

  const bmiLvl = getBMILevel(bmi);
  const bmiRisk = bmiLvl.risk;
  const waistRisk = getWaistRisk(waist, gender);
  const riskCount = [bmiRisk, dietRisk, exerciseRisk].filter(Boolean).length;
  const physicalGroup = riskCount >= 3 ? 'high' : riskCount >= 1 ? 'medium' : 'low';

  // Risky behaviors from substance scoring
  const smokeCig = _hasFlag(row.q2001) ? 'daily' : 'none';
  const smokeVape = _hasFlag(row.q2002) ? 'occasional' : 'none';
  const alcohol = _hasFlag(row.q2003) ? 'weekly' : 'none';
  const substance = _hasFlag(row.q2004) || _hasFlag(row.q2005) || _hasFlag(row.q2005_drug) ? 'occasional' : 'none';
  const hasRiskyBehavior = smokeCig !== 'none' || smokeVape !== 'none' || alcohol !== 'none' || substance !== 'none';

  // NCD — real data stored as comma-separated string in row.diseases (or alternates)
  const _rawNcd = _parseNcdList(row).map(_normalizeNcd).filter(Boolean);
  const ncdList = Array.from(new Set(_rawNcd));

  return {
    id: rec.id || idx + 1,
    name: rec.name || '—',
    gender,
    dept: rec.dept || rec.org || '—',
    height, weight, bmi, bmiLevel: bmiLvl,
    waist, waistRisk,
    dietScore, exerciseDays, sedentaryHours,
    bmiRisk, dietRisk, exerciseRisk, sedentaryRisk,
    riskCount, physicalGroup,
    smokeCig, smokeVape, alcohol, substance,
    hasRiskyBehavior, ncdList,
    hasNCD: ncdList.length > 0,
    _raw: row
  };
};
const employees = _PHYS_REAL ? _PHYS_REAL.map(_toPhysEmployee) : NAMES.map((n, i) => generateEmployee(n, i));

// ─── Helpers ────────────────────────────────────────────────────────────────
const GROUP_CFG = {
  high: {
    label: "เสี่ยงสูง",
    color: "#EF4444",
    bg: "#FEF2F2",
    dot: "🔴",
    desc: "มี 3 ปัจจัยขึ้นไป"
  },
  medium: {
    label: "เฝ้าระวัง",
    color: "#F59E0B",
    bg: "#FFFBEB",
    dot: "🟠",
    desc: "มี 1-2 ปัจจัย"
  },
  low: {
    label: "ปกติ",
    color: "#10B981",
    bg: "#F0FDF4",
    dot: "🟢",
    desc: "ไม่มีปัจจัยเสี่ยง"
  }
};
const BEHAVIOR_CFG = {
  daily: {
    label: "ประจำทุกวัน",
    color: "#EF4444",
    level: 2
  },
  weekly: {
    label: "2-3ครั้ง/สัปดาห์",
    color: "#F97316",
    level: 2
  },
  occasional: {
    label: "บางโอกาส",
    color: "#F59E0B",
    level: 1
  },
  none: {
    label: "ไม่มี",
    color: "#10B981",
    level: 0
  }
};
const NCD_COLORS = {
  "เบาหวาน": "#F97316",
  "ความดันโลหิตสูง": "#EF4444",
  "โรคหัวใจ": "#DC2626",
  "โรคไต": "#7C3AED",
  "โรคตับ": "#92400E",
  "มะเร็ง": "#1E3A5F"
};
const pct = (n, total) => total > 0 ? Math.round(n / total * 100) : 0;

// ─── Sub-components ─────────────────────────────────────────────────────────
const Tag = ({
  label,
  color,
  small
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    background: color + "22",
    color,
    border: `1px solid ${color}44`,
    padding: small ? "1px 7px" : "3px 10px",
    borderRadius: 999,
    fontSize: small ? 10 : 11,
    fontWeight: 700,
    fontFamily: "'Sarabun',sans-serif",
    display: "inline-flex",
    alignItems: "center",
    gap: 3
  }
}, label);
const MiniBar = ({
  value,
  max,
  color,
  height = 6
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height,
    background: "#1E293B",
    borderRadius: 3,
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: `${Math.min(value / max * 100, 100)}%`,
    height: "100%",
    background: color,
    borderRadius: 3
  }
}));
const RiskDot = ({
  active
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: active ? "#EF4444" : "#1E293B",
    border: `1px solid ${active ? "#EF4444" : "#334155"}`
  }
});

// ─── Overview Stats ──────────────────────────────────────────────────────────
const highRisk = employees.filter(e => e.physicalGroup === "high");
const medRisk = employees.filter(e => e.physicalGroup === "medium");
const lowRisk = employees.filter(e => e.physicalGroup === "low");
const riskyBeh = employees.filter(e => e.hasRiskyBehavior);
const ncdGroup = employees.filter(e => e.hasNCD);
const highAndNCD = employees.filter(e => e.physicalGroup === "high" && e.hasNCD);
const highAndBeh = employees.filter(e => e.physicalGroup === "high" && e.hasRiskyBehavior);
const ncdCounts = ["เบาหวาน", "ความดันโลหิตสูง", "โรคหัวใจ", "โรคไต", "โรคตับ", "มะเร็ง"].map(d => ({
  name: d,
  value: employees.filter(e => e.ncdList.includes(d)).length,
  color: NCD_COLORS[d]
})).filter(d => d.value > 0);
const deptData = DEPTS.map(dept => {
  const grp = employees.filter(e => e.dept === dept);
  return {
    name: dept,
    "เสี่ยงสูง": grp.filter(e => e.physicalGroup === "high").length,
    "เฝ้าระวัง": grp.filter(e => e.physicalGroup === "medium").length,
    "ปกติ": grp.filter(e => e.physicalGroup === "low").length
  };
});

// ─── Deep Charts: reusable ChartCard (pie/bar toggle) ────────────────────────
function ChartCard(props) {
  var title = props.title, subtitle = props.subtitle, data = props.data || [];
  var defaultType = props.defaultType || 'pie';
  var accent = props.color || '#0F766E';
  var state = useState(defaultType);
  var type = state[0], setType = state[1];
  var total = data.reduce(function (s, d) { return s + (d.value || 0); }, 0);
  var withPct = data.map(function (d) {
    return Object.assign({}, d, {
      pct: total > 0 ? Math.round(d.value / total * 100) : 0
    });
  });
  var btnStyle = function (active) {
    return {
      padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
      border: '1px solid ' + (active ? accent : '#E5E7EB'),
      borderRadius: 6, background: active ? accent : '#fff',
      color: active ? '#fff' : '#475569',
      fontFamily: "'Sarabun',sans-serif"
    };
  };
  var tooltipFormatter = function (v, n) {
    var pct = total > 0 ? Math.round(v / total * 100) : 0;
    return [v + ' คน (' + pct + '%)', n];
  };
  var pieLabel = function (d) { return d.pct >= 5 ? (d.pct + '%') : ''; };
  var barLabel = { position: 'top', fontSize: 10, fill: '#374151',
    formatter: function (v) { return v + ' คน'; } };
  var pie = React.createElement(ResponsiveContainer, { width: '100%', height: 280 },
    React.createElement(PieChart, null,
      React.createElement(Pie, {
        data: withPct, dataKey: 'value', nameKey: 'name',
        cx: '50%', cy: '45%', outerRadius: 85, innerRadius: 42,
        paddingAngle: 1, label: pieLabel, labelLine: false
      }, withPct.map(function (d, i) {
        return React.createElement(Cell, { key: i, fill: d.color || '#CBD5E1' });
      })),
      React.createElement(Tooltip, { formatter: tooltipFormatter }),
      React.createElement(Legend, {
        verticalAlign: 'bottom', height: 40, iconSize: 10,
        wrapperStyle: { fontSize: 11, paddingTop: 4 }
      })
    )
  );
  var bar = React.createElement(ResponsiveContainer, { width: '100%', height: 280 },
    React.createElement(BarChart, { data: withPct, margin: { top: 24, right: 12, left: 0, bottom: 50 } },
      React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#E5E7EB', vertical: false }),
      React.createElement(XAxis, { dataKey: 'name', tick: { fontSize: 10, fill: '#475569' },
        interval: 0, angle: -20, textAnchor: 'end', height: 60 }),
      React.createElement(YAxis, { tick: { fontSize: 10, fill: '#475569' }, allowDecimals: false }),
      React.createElement(Tooltip, { formatter: tooltipFormatter, cursor: { fill: '#F1F5F9' } }),
      React.createElement(Bar, { dataKey: 'value', radius: [6, 6, 0, 0], label: barLabel },
        withPct.map(function (d, i) {
          return React.createElement(Cell, { key: i, fill: d.color || '#CBD5E1' });
        }))
    )
  );
  return React.createElement('div', {
    style: {
      background: '#fff', borderRadius: 14, padding: '18px 18px 12px',
      border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
    }
  },
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }
    },
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: '#0F172A' } }, title),
        subtitle && React.createElement('div', { style: { fontSize: 11, color: '#64748B', marginTop: 2 } }, subtitle),
        React.createElement('div', { style: { fontSize: 10, color: '#94A3B8', marginTop: 2 } }, 'รวม ' + total + ' คน')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 4 } },
        React.createElement('button', { onClick: function () { setType('pie'); }, style: btnStyle(type === 'pie') }, 'Pie'),
        React.createElement('button', { onClick: function () { setType('bar'); }, style: btnStyle(type === 'bar') }, 'Bar')
      )
    ),
    type === 'pie' ? pie : bar
  );
}

// ─── Deep Charts: all 10 chart datasets + layout ─────────────────────────────
function DeepCharts(props) {
  var emps = props.employees || [];
  var S = (typeof window !== 'undefined' && window.IDPScoring) || {};
  var getRaw = function (e) { return e._raw || {}; };

  // 1. NCD
  var ncdTypes = ['เบาหวาน', 'ความดันโลหิตสูง', 'โรคหัวใจ', 'โรคไต', 'โรคตับ', 'มะเร็ง'];
  var ncdData = ncdTypes.map(function (t) {
    return { name: t, value: emps.filter(function (e) { return e.ncdList && e.ncdList.indexOf(t) >= 0; }).length, color: NCD_COLORS[t] };
  }).filter(function (d) { return d.value > 0; });
  var noNcdCount = emps.filter(function (e) { return !e.ncdList || e.ncdList.length === 0; }).length;
  var ncdFull = ncdData.concat([{ name: 'ไม่มี NCD', value: noNcdCount, color: '#10B981' }]);

  // 2. BMI ASEAN
  var bmiCats = [
    { key: 'underweight', name: 'น้ำหนักน้อย (<18.5)', color: '#60A5FA' },
    { key: 'normal', name: 'สมส่วน (18.5–22.9)', color: '#10B981' },
    { key: 'overweight', name: 'น้ำหนักเกิน (23–24.9)', color: '#F59E0B' },
    { key: 'obese1', name: 'อ้วนระดับ 1 (25–29.9)', color: '#F97316' },
    { key: 'obese2', name: 'อ้วนระดับ 2 (≥30)', color: '#EF4444' }
  ];
  var bmiData = bmiCats.map(function (c) {
    return {
      name: c.name, color: c.color,
      value: emps.filter(function (e) {
        var b = S.bmiLevel ? S.bmiLevel(getRaw(e)) : null;
        return b && b.key === c.key;
      }).length
    };
  });

  // 3. WHtR = waist / height
  var whtrBands = [
    { name: 'ปกติ (<0.5)', min: 0, max: 0.5, color: '#10B981' },
    { name: 'เสี่ยง (0.5–0.59)', min: 0.5, max: 0.6, color: '#F59E0B' },
    { name: 'เสี่ยงสูง (≥0.6)', min: 0.6, max: 99, color: '#EF4444' }
  ];
  var whtrValues = emps.map(function (e) {
    var r = getRaw(e);
    var w = parseFloat(r.waist);
    var h = parseFloat(r.height);
    if (!w || !h) return null;
    var hCm = h > 3 ? h : h * 100;
    return w / hCm;
  }).filter(function (v) { return v != null && !isNaN(v) && v > 0 && v < 2; });
  var whtrData = whtrBands.map(function (b) {
    return { name: b.name, color: b.color,
      value: whtrValues.filter(function (v) { return v >= b.min && v < b.max; }).length };
  });

  // 4a. Substance — risk level per person
  var subCats = [
    { key: 'none', name: 'ไม่มีความเสี่ยง', color: '#10B981' },
    { key: 'low', name: 'เสี่ยงต่ำ', color: '#84CC16' },
    { key: 'medium', name: 'เสี่ยงปานกลาง', color: '#F59E0B' },
    { key: 'high', name: 'เสี่ยงสูง', color: '#EF4444' }
  ];
  var subLevelData = subCats.map(function (c) {
    return { name: c.name, color: c.color,
      value: emps.filter(function (e) {
        return (S.substanceRisk ? S.substanceRisk(getRaw(e)) : 'none') === c.key;
      }).length };
  });

  // 4b. Substance — frequency per behavior (count of people using each)
  var subBehaviors = [
    { name: '🚬 ยาสูบ', field: 'smokeCig', color: '#DC2626' },
    { name: '💨 บุหรี่ไฟฟ้า', field: 'smokeVape', color: '#7C3AED' },
    { name: '🍺 แอลกอฮอล์', field: 'alcohol', color: '#F59E0B' },
    { name: '💊 สารเสพติด', field: 'substance', color: '#991B1B' }
  ];
  var subFreqData = subBehaviors.map(function (b) {
    return { name: b.name, color: b.color,
      value: emps.filter(function (e) { return e[b.field] && e[b.field] !== 'none'; }).length };
  });

  // 5-7. Diet bands (same for sweet/fat/salt)
  var dietBands = [
    { name: 'น้อย (5)', min: 5, max: 6, color: '#10B981' },
    { name: 'ปานกลาง (6–9)', min: 6, max: 10, color: '#F59E0B' },
    { name: 'สูง (10–13)', min: 10, max: 14, color: '#F97316' },
    { name: 'สูงมาก (14–15)', min: 14, max: 99, color: '#EF4444' }
  ];
  var mkDiet = function (fn) {
    if (!fn) return dietBands.map(function (b) { return { name: b.name, value: 0, color: b.color }; });
    var scores = emps.map(function (e) { return fn(getRaw(e)); }).filter(function (v) { return v != null; });
    return dietBands.map(function (b) {
      return { name: b.name, color: b.color,
        value: scores.filter(function (v) { return v >= b.min && v < b.max; }).length };
    });
  };
  var sweetData = mkDiet(S.sweetScore);
  var fatData = mkDiet(S.fatScore);
  var saltData = mkDiet(S.saltScore);

  // 8. TPAX (WHO)
  var tpaxCats = [
    { key: 'low', name: 'ไม่เพียงพอ (<150)', color: '#EF4444' },
    { key: 'ok', name: 'เพียงพอ (150–299)', color: '#F59E0B' },
    { key: 'good', name: 'ดี (≥300)', color: '#10B981' }
  ];
  var tpaxData = tpaxCats.map(function (c) {
    return { name: c.name, color: c.color,
      value: emps.filter(function (e) {
        var t = S.tpaxLevel ? S.tpaxLevel(getRaw(e)) : null;
        return t && t.key === c.key;
      }).length };
  });

  // 9. Sedentary — total sitting/screen hours per day
  var sedCats = [
    { name: '<4 ชม./วัน', min: 0, max: 4, color: '#10B981' },
    { name: '4–7.9 ชม./วัน', min: 4, max: 8, color: '#F59E0B' },
    { name: '≥8 ชม./วัน', min: 8, max: 99, color: '#EF4444' }
  ];
  var sedData = sedCats.map(function (c) {
    return { name: c.name, color: c.color,
      value: emps.filter(function (e) {
        var h = S.sedentaryHours ? S.sedentaryHours(getRaw(e)) : null;
        return h != null && h >= c.min && h < c.max;
      }).length };
  });

  // ── Layout helpers ────────────────────────────────────────────────────────
  var chartGrid = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16, marginTop: 8
  };
  var section = function (heading, charts) {
    return React.createElement('div', { style: { marginTop: 24 } },
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }
      },
        React.createElement('div', { style: { width: 4, height: 20, background: '#0F766E', borderRadius: 2 } }),
        React.createElement('h3', { style: { margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' } }, heading)
      ),
      React.createElement.apply(null, [ 'div', { style: chartGrid } ].concat(charts))
    );
  };

  return React.createElement('div', { style: { marginTop: 24 } },
    React.createElement('div', {
      style: {
        padding: '16px 20px', borderRadius: 14,
        background: 'linear-gradient(135deg,#F0FDFA 0%,#ECFEFF 100%)',
        border: '1px solid #A7F3D0'
      }
    },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: '#0F766E' } },
        '📊 กราฟเชิงลึก — สุขภาพกายรายด้าน'),
      React.createElement('div', { style: { fontSize: 11, color: '#115E59', marginTop: 4 } },
        'คลิกปุ่ม Pie/Bar ที่หัวกราฟเพื่อสลับรูปแบบ · ตัวเลขแสดงเป็นจำนวนคน และ % ของผู้ตอบ')
    ),
    section('🏥 โรคเรื้อรัง (NCD) และดัชนีร่างกาย', [
      React.createElement(ChartCard, { key: 'ncd', title: '🏥 โรค NCD', subtitle: 'การกระจายของโรคเรื้อรังในองค์กร', data: ncdFull, defaultType: 'pie', color: '#DC2626' }),
      React.createElement(ChartCard, { key: 'bmi', title: '⚖️ BMI — มาตรฐานอาเซียน', subtitle: 'กรมอนามัย (5 ระดับ)', data: bmiData, defaultType: 'pie', color: '#F59E0B' }),
      React.createElement(ChartCard, { key: 'whtr', title: '📏 WHtR — อัตราส่วนรอบเอว/ส่วนสูง', subtitle: '<0.5 ปกติ · ≥0.6 เสี่ยงสูง', data: whtrData, defaultType: 'pie', color: '#0EA5E9' })
    ]),
    section('🚬 ยาสูบ · แอลกอฮอล์ · สารเสพติด', [
      React.createElement(ChartCard, { key: 'sub-risk', title: '🚨 ระดับความเสี่ยงรายบุคคล', subtitle: 'จัดกลุ่มตาม q2001–q2005', data: subLevelData, defaultType: 'pie', color: '#991B1B' }),
      React.createElement(ChartCard, { key: 'sub-freq', title: '📊 ความถี่รายพฤติกรรม', subtitle: 'จำนวนคนที่มีพฤติกรรมแต่ละประเภท', data: subFreqData, defaultType: 'bar', color: '#DC2626' })
    ]),
    section('🍽️ พฤติกรรมบริโภค — หวาน · ไขมัน · โซเดียม', [
      React.createElement(ChartCard, { key: 'sweet', title: '🍭 หวาน', subtitle: 'เต็ม 15 · ≥10 เริ่มเสี่ยง', data: sweetData, defaultType: 'pie', color: '#EC4899' }),
      React.createElement(ChartCard, { key: 'fat', title: '🍔 ไขมัน', subtitle: 'เต็ม 15 · ≥10 เริ่มเสี่ยง', data: fatData, defaultType: 'pie', color: '#F97316' }),
      React.createElement(ChartCard, { key: 'salt', title: '🧂 เค็ม/โซเดียม', subtitle: 'เต็ม 15 · ≥10 เริ่มเสี่ยง', data: saltData, defaultType: 'pie', color: '#0EA5E9' })
    ]),
    section('🏃 กิจกรรมทางกาย · พฤติกรรมเนือยนิ่ง', [
      React.createElement(ChartCard, { key: 'tpax', title: '🏃 กิจกรรมทางกาย (TPAX)', subtitle: 'เกณฑ์ WHO — ≥150 นาที/สัปดาห์', data: tpaxData, defaultType: 'pie', color: '#10B981' }),
      React.createElement(ChartCard, { key: 'sed', title: '🪑 พฤติกรรมเนือยนิ่ง', subtitle: 'เวลานั่ง + หน้าจอ รวม/วัน', data: sedData, defaultType: 'pie', color: '#7C3AED' })
    ])
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function PhysicalDashboard() {
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const tabs = [{
    key: "overview",
    label: "🏢 ภาพรวมองค์กร"
  }, {
    key: "risklist",
    label: "📋 Risk List"
  }, {
    key: "individual",
    label: "👤 IDP รายบุคคล"
  }];
  const listData = [...employees].sort((a, b) => b.riskCount - a.riskCount).filter(e => filter === "all" || e.physicalGroup === filter);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Sarabun',sans-serif",
      background: "#F0F4F8",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg, #134E4A 0%, #0F766E 50%, #059669 100%)",
      padding: "24px 32px 0",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 3,
      color: "#6EE7B7",
      textTransform: "uppercase",
      marginBottom: 6
    }
  }, "\u0E21\u0E34\u0E15\u0E34\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E01\u0E32\u0E22 \xB7 Physical Well-being"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 800
    }
  }, "\uD83C\uDFC3 \u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E01\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#A7F3D0",
      marginTop: 4
    }
  }, "NIDA \xB7 ", employees.length, " \u0E04\u0E19 \xB7 \u0E41\u0E1A\u0E48\u0E07 3 \u0E0A\u0E31\u0E49\u0E19: \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 \xB7 \u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 \xB7 NCD")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, [{
    label: "เสี่ยงสูง ≥3 ปัจจัย",
    value: highRisk.length,
    color: "#FCA5A5"
  }, {
    label: "มีพฤติกรรมเสี่ยง",
    value: riskyBeh.length,
    color: "#FCD34D"
  }, {
    label: "มีโรค NCD",
    value: ncdGroup.length,
    color: "#6EE7B7"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "10px 16px",
      textAlign: "center",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.15)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: s.color
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#A7F3D0"
    }
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(0,0,0,0.2)",
      borderRadius: "10px 10px 0 0",
      padding: "10px 20px",
      display: "flex",
      gap: 24,
      fontSize: 12,
      color: "#D1FAE5"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCD0 ", /*#__PURE__*/React.createElement("strong", null, "\u0E0A\u0E31\u0E49\u0E19 1 \u2014 \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E22:"), " BMI + \u0E01\u0E32\u0E23\u0E01\u0E34\u0E19 + \u0E2D\u0E2D\u0E01\u0E01\u0E33\u0E25\u0E31\u0E07\u0E01\u0E32\u0E22"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEAC ", /*#__PURE__*/React.createElement("strong", null, "\u0E0A\u0E31\u0E49\u0E19 2 \u2014 \u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07:"), " \u0E2A\u0E39\u0E1A / \u0E14\u0E37\u0E48\u0E21 / \u0E40\u0E2A\u0E1E"), /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFE5 ", /*#__PURE__*/React.createElement("strong", null, "\u0E0A\u0E31\u0E49\u0E19 3 \u2014 NCD:"), " \u0E42\u0E23\u0E04\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 (\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E48\u0E2D\u0E19\u0E44\u0E2B\u0E27)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    onClick: () => setTab(t.key),
    style: {
      padding: "10px 20px",
      borderRadius: "8px 8px 0 0",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "'Sarabun',sans-serif",
      background: tab === t.key ? "#F0F4F8" : "transparent",
      color: tab === t.key ? "#134E4A" : "rgba(255,255,255,0.65)"
    }
  }, t.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: "0 auto",
      padding: "28px 32px"
    }
  }, tab === "overview" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#0F766E",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "#134E4A"
    }
  }, "\u0E0A\u0E31\u0E49\u0E19 1 \u2014 \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E22"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#6B7280"
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 = \u0E21\u0E35 3 \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E02\u0E36\u0E49\u0E19\u0E44\u0E1B")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr) 1.2fr",
      gap: 16,
      marginBottom: 24
    }
  }, Object.entries(GROUP_CFG).map(([key, cfg]) => {
    const grp = employees.filter(e => e.physicalGroup === key);
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        background: cfg.bg,
        borderRadius: 12,
        padding: "16px 20px",
        border: `1px solid ${cfg.color}33`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#6B7280",
        marginBottom: 4
      }
    }, cfg.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 30,
        fontWeight: 800,
        color: cfg.color
      }
    }, grp.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: cfg.color
      }
    }, cfg.dot, " ", cfg.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 4
      }
    }, pct(grp.length, employees.length), "% \u0E02\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F9FAFB",
      borderRadius: 12,
      padding: "16px 20px",
      border: "1px solid #E5E7EB"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 10
    }
  }, "\u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E41\u0E15\u0E48\u0E25\u0E30\u0E15\u0E31\u0E27"), [{
    label: "BMI เกินเกณฑ์",
    count: employees.filter(e => e.bmiRisk).length,
    color: "#F97316"
  }, {
    label: "พฤติกรรมกินไม่ดี",
    count: employees.filter(e => e.dietRisk).length,
    color: "#EAB308"
  }, {
    label: "ออกกำลังกายน้อย",
    count: employees.filter(e => e.exerciseRisk).length,
    color: "#6366F1"
  }].map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#6B7280"
    }
  }, f.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: f.color
    }
  }, f.count, " \u0E04\u0E19")), /*#__PURE__*/React.createElement(MiniBar, {
    value: f.count,
    max: employees.length,
    color: f.color
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 12
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E22\u0E01\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 180
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: deptData,
    barSize: 40,
    margin: {
      top: 0,
      right: 0,
      left: -20,
      bottom: 0
    }
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#F3F4F6",
    vertical: false
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "name",
    tick: {
      fill: "#6B7280",
      fontSize: 13,
      fontFamily: "'Sarabun',sans-serif"
    },
    axisLine: false,
    tickLine: false
  }), /*#__PURE__*/React.createElement(YAxis, {
    tick: {
      fill: "#9CA3AF",
      fontSize: 11
    },
    axisLine: false,
    tickLine: false
  }), /*#__PURE__*/React.createElement(Tooltip, {
    contentStyle: {
      fontFamily: "'Sarabun',sans-serif",
      borderRadius: 10,
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",
    stackId: "a",
    fill: "#EF4444",
    radius: [0, 0, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",
    stackId: "a",
    fill: "#F59E0B",
    radius: [0, 0, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "\u0E1B\u0E01\u0E15\u0E34",
    stackId: "a",
    fill: "#10B981",
    radius: [4, 4, 0, 0]
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontFamily: "'Sarabun',sans-serif",
      fontSize: 12
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#D97706",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "#92400E"
    }
  }, "\u0E0A\u0E31\u0E49\u0E19 2 \u2014 \u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07")), [{
    label: "🚬 สูบบุหรี่ (มวน)",
    key: "smokeCig",
    icon: "🚬"
  }, {
    label: "💨 สูบบุหรี่ไฟฟ้า",
    key: "smokeVape",
    icon: "💨"
  }, {
    label: "🍺 ดื่มแอลกอฮอล์",
    key: "alcohol",
    icon: "🍺"
  }, {
    label: "💊 สารเสพติดอื่นๆ",
    key: "substance",
    icon: "💊"
  }].map(b => {
    const daily = employees.filter(e => e[b.key] === "daily").length;
    const occ = employees.filter(e => e[b.key] === "occasional" || e[b.key] === "weekly").length;
    const none = employees.length - daily - occ;
    return /*#__PURE__*/React.createElement("div", {
      key: b.key,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#374151"
      }
    }, b.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, daily > 0 && /*#__PURE__*/React.createElement(Tag, {
      label: `ประจำ ${daily} คน`,
      color: "#EF4444",
      small: true
    }), occ > 0 && /*#__PURE__*/React.createElement(Tag, {
      label: `บางครั้ง ${occ} คน`,
      color: "#F59E0B",
      small: true
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8,
        background: "#F3F4F6",
        borderRadius: 4,
        display: "flex",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(daily, employees.length)}%`,
        background: "#EF4444"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(occ, employees.length)}%`,
        background: "#FCD34D"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(none, employees.length)}%`,
        background: "#D1FAE5"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        marginTop: 4,
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD34 \u0E1B\u0E23\u0E30\u0E08\u0E33: ", pct(daily, employees.length), "%"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDFE1 \u0E1A\u0E32\u0E07\u0E04\u0E23\u0E31\u0E49\u0E07: ", pct(occ, employees.length), "%"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDFE2 \u0E44\u0E21\u0E48\u0E21\u0E35: ", pct(none, employees.length), "%")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFF7ED",
      borderRadius: 10,
      padding: "12px 14px",
      border: "1px solid #FED7AA",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#92400E"
    }
  }, "\u26A0\uFE0F \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E22 + \u0E21\u0E35\u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "#EA580C",
      marginTop: 4
    }
  }, highAndBeh.length, " \u0E04\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9A3412"
    }
  }, "\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23 IDP \u0E40\u0E02\u0E49\u0E21\u0E02\u0E49\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E1E\u0E34\u0E40\u0E28\u0E29"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#7C3AED",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "#4C1D95"
    }
  }, "\u0E0A\u0E31\u0E49\u0E19 3 \u2014 NCD (\u0E42\u0E23\u0E04\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E2D\u0E22\u0E39\u0E48)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 16
    }
  }, "\uD83D\uDD12 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E48\u0E2D\u0E19\u0E44\u0E2B\u0E27 \xB7 \u0E41\u0E2A\u0E14\u0E07\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E09\u0E1E\u0E32\u0E30 HR \u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E1C\u0E34\u0E14\u0E0A\u0E2D\u0E1A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: 140,
    height: 140
  }, /*#__PURE__*/React.createElement(PieChart, null, /*#__PURE__*/React.createElement(Pie, {
    data: ncdCounts,
    dataKey: "value",
    cx: "50%",
    cy: "50%",
    innerRadius: 38,
    outerRadius: 62,
    paddingAngle: 2
  }, ncdCounts.map((entry, i) => /*#__PURE__*/React.createElement(Cell, {
    key: i,
    fill: entry.color
  }))), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: (v, n) => [`${v} คน`, n],
    contentStyle: {
      fontFamily: "'Sarabun',sans-serif",
      fontSize: 12,
      borderRadius: 8
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, ncdCounts.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: d.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#374151"
    }
  }, d.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: d.color
    }
  }, d.value, " \u0E04\u0E19"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F5F3FF",
      borderRadius: 10,
      padding: "12px 14px",
      border: "1px solid #DDD6FE"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#4C1D95"
    }
  }, "\uD83C\uDFE5 \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E22 + \u0E21\u0E35\u0E42\u0E23\u0E04 NCD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "#7C3AED",
      marginTop: 4
    }
  }, highAndNCD.length, " \u0E04\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#5B21B6"
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E1B\u0E23\u0E32\u0E30\u0E1A\u0E32\u0E07 \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E14\u0E39\u0E41\u0E25\u0E40\u0E23\u0E48\u0E07\u0E14\u0E48\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14"))))), tab === "overview" && /*#__PURE__*/React.createElement(DeepCharts, { key: "deep-charts", employees: employees }), tab === "risklist" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: "14px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#6B7280",
      fontWeight: 600
    }
  }, "\u0E01\u0E23\u0E2D\u0E07\u0E01\u0E25\u0E38\u0E48\u0E21:"), [["all", "ทั้งหมด", "#6366F1"], ["high", "🔴 เสี่ยงสูง", "#EF4444"], ["medium", "🟠 เฝ้าระวัง", "#F59E0B"], ["low", "🟢 ปกติ", "#10B981"]].map(([key, label, color]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => setFilter(key),
    style: {
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'Sarabun',sans-serif",
      cursor: "pointer",
      border: "none",
      background: filter === key ? color : "#F3F4F6",
      color: filter === key ? "#fff" : "#6B7280"
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "#9CA3AF"
    }
  }, "\u0E41\u0E2A\u0E14\u0E07 ", listData.length, " \u0E04\u0E19")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "32px 1fr 100px 80px 80px 80px 120px 120px 100px",
      padding: "10px 20px",
      background: "#F9FAFB",
      borderBottom: "1px solid #F3F4F6",
      gap: 8
    }
  }, ["#", "ชื่อ", "หน่วยงาน", "BMI", "การกิน", "ออกกำลัง", "พฤติกรรมเสี่ยง", "NCD", "กลุ่ม"].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: "#9CA3AF",
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  }, h))), listData.map((emp, idx) => {
    const cfg = GROUP_CFG[emp.physicalGroup];
    const isSelected = selectedEmp?.id === emp.id;
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => {
        setSelectedEmp(emp);
        setTab("individual");
      },
      style: {
        display: "grid",
        gridTemplateColumns: "32px 1fr 100px 80px 80px 80px 120px 120px 100px",
        padding: "12px 20px",
        gap: 8,
        cursor: "pointer",
        borderBottom: "1px solid #F9FAFB",
        background: isSelected ? "#F0FDF4" : idx % 2 === 0 ? "#fff" : "#FAFAFA",
        transition: "background 0.15s",
        borderLeft: `3px solid ${emp.physicalGroup === "high" ? "#EF4444" : emp.physicalGroup === "medium" ? "#F59E0B" : "transparent"}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#9CA3AF",
        alignSelf: "center"
      }
    }, idx + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#111827"
      }
    }, emp.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, emp.gender, " \xB7 ", emp.dept)), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center",
        fontSize: 11,
        color: "#6B7280"
      }
    }, emp.dept), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: emp.bmiLevel.color
      }
    }, emp.bmi), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, emp.bmiLevel.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement(RiskDot, {
      active: emp.dietRisk
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: emp.dietRisk ? "#EF4444" : "#10B981",
        marginLeft: 4
      }
    }, emp.dietRisk ? "เสี่ยง" : "ปกติ")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: emp.exerciseRisk ? "#EF4444" : "#10B981"
      }
    }, emp.exerciseDays, " \u0E27\u0E31\u0E19/\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center",
        display: "flex",
        gap: 3,
        flexWrap: "wrap"
      }
    }, emp.smokeCig !== "none" && /*#__PURE__*/React.createElement("span", {
      title: "\u0E2A\u0E39\u0E1A\u0E1A\u0E38\u0E2B\u0E23\u0E35\u0E48",
      style: {
        fontSize: 14
      }
    }, "\uD83D\uDEAC"), emp.smokeVape !== "none" && /*#__PURE__*/React.createElement("span", {
      title: "\u0E1A\u0E38\u0E2B\u0E23\u0E35\u0E48\u0E44\u0E1F\u0E1F\u0E49\u0E32",
      style: {
        fontSize: 14
      }
    }, "\uD83D\uDCA8"), emp.alcohol !== "none" && /*#__PURE__*/React.createElement("span", {
      title: "\u0E14\u0E37\u0E48\u0E21\u0E41\u0E2D\u0E25\u0E01\u0E2D\u0E2E\u0E2D\u0E25\u0E4C",
      style: {
        fontSize: 14
      }
    }, "\uD83C\uDF7A"), emp.substance !== "none" && /*#__PURE__*/React.createElement("span", {
      title: "\u0E2A\u0E32\u0E23\u0E40\u0E2A\u0E1E\u0E15\u0E34\u0E14",
      style: {
        fontSize: 14
      }
    }, "\uD83D\uDC8A"), !emp.hasRiskyBehavior && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#10B981"
      }
    }, "\u0E44\u0E21\u0E48\u0E21\u0E35")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, emp.hasNCD ? /*#__PURE__*/React.createElement(Tag, {
      label: `${emp.ncdList.length} โรค`,
      color: "#7C3AED",
      small: true
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#10B981"
      }
    }, "\u0E44\u0E21\u0E48\u0E21\u0E35")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      label: cfg.dot + " " + cfg.label,
      color: cfg.color,
      small: true
    })));
  }))), tab === "individual" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#6B7280",
      marginBottom: 10
    }
  }, "\u0E40\u0E23\u0E35\u0E22\u0E07\u0E08\u0E32\u0E01\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      maxHeight: 680,
      overflowY: "auto"
    }
  }, [...employees].sort((a, b) => b.riskCount - a.riskCount).map(emp => {
    const cfg = GROUP_CFG[emp.physicalGroup];
    const isSelected = selectedEmp?.id === emp.id;
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => setSelectedEmp(emp),
      style: {
        background: isSelected ? "#F0FDF4" : "#fff",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        border: `1px solid ${isSelected ? cfg.color : "#E5E7EB"}`,
        transition: "all 0.15s",
        boxShadow: isSelected ? `0 0 0 2px ${cfg.color}33` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: "#111827"
      }
    }, emp.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, emp.dept)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: cfg.color
      }
    }, cfg.dot, " ", cfg.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, emp.riskCount, "/3 \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8,
        alignItems: "center"
      }
    }, [{
      active: emp.bmiRisk,
      label: "BMI"
    }, {
      active: emp.dietRisk,
      label: "กิน"
    }, {
      active: emp.exerciseRisk,
      label: "ออกกำลัง"
    }].map((f, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        fontSize: 9,
        padding: "1px 5px",
        borderRadius: 999,
        background: f.active ? "#FEE2E2" : "#F3F4F6",
        color: f.active ? "#EF4444" : "#9CA3AF",
        fontWeight: 600
      }
    }, f.label)), emp.hasRiskyBehavior && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, "\uD83D\uDEAC"), emp.hasNCD && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, "\uD83C\uDFE5")));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, !selectedEmp ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 60,
      textAlign: "center",
      color: "#9CA3AF",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      marginBottom: 16
    }
  }, "\uD83C\uDFC3"), /*#__PURE__*/React.createElement("div", null, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E14\u0E49\u0E32\u0E19\u0E0B\u0E49\u0E32\u0E22\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14 IDP")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderTop: `4px solid ${GROUP_CFG[selectedEmp.physicalGroup].color}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: "#111827"
    }
  }, selectedEmp.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#6B7280"
    }
  }, selectedEmp.gender, " \xB7 ", selectedEmp.dept)), /*#__PURE__*/React.createElement(Tag, {
    label: `${GROUP_CFG[selectedEmp.physicalGroup].dot} ${GROUP_CFG[selectedEmp.physicalGroup].label}`,
    color: GROUP_CFG[selectedEmp.physicalGroup].color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 12,
      marginTop: 20
    }
  }, [{
    label: "ส่วนสูง",
    value: `${selectedEmp.height} ซม.`,
    color: "#6B7280"
  }, {
    label: "น้ำหนัก",
    value: `${selectedEmp.weight} กก.`,
    color: "#6B7280"
  }, {
    label: "BMI",
    value: selectedEmp.bmi,
    color: selectedEmp.bmiLevel.color,
    sub: selectedEmp.bmiLevel.label
  }, {
    label: "เส้นรอบเอว",
    value: `${selectedEmp.waist} ซม.`,
    color: selectedEmp.waistRisk ? "#EF4444" : "#10B981",
    sub: selectedEmp.waistRisk ? "เกินเกณฑ์" : "ปกติ"
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "#F9FAFB",
      borderRadius: 10,
      padding: "12px 14px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 4
    }
  }, m.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: m.color
    }
  }, m.value), m.sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: m.color,
      fontWeight: 600
    }
  }, m.sub))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      borderTop: "3px solid #0F766E"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#134E4A",
      marginBottom: 14
    }
  }, "\uD83D\uDCD0 \u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E01\u0E32\u0E22"), [{
    label: "BMI",
    value: `${selectedEmp.bmi}`,
    risk: selectedEmp.bmiRisk,
    detail: selectedEmp.bmiLevel.label,
    idp: "ปรับพฤติกรรมการกิน + ควบคุมน้ำหนัก"
  }, {
    label: "การกิน",
    value: `${selectedEmp.dietScore}/5`,
    risk: selectedEmp.dietRisk,
    detail: selectedEmp.dietRisk ? "กินไม่ดี" : "ดี",
    idp: "โปรแกรมโภชนาการ / ลดหวาน มัน เค็ม"
  }, {
    label: "ออกกำลังกาย",
    value: `${selectedEmp.exerciseDays} วัน/สัปดาห์`,
    risk: selectedEmp.exerciseRisk,
    detail: selectedEmp.exerciseRisk ? "ไม่ผ่านเกณฑ์" : "ผ่านเกณฑ์",
    idp: "กิจกรรมออกกำลังกาย 150 นาที/สัปดาห์"
  }, {
    label: "เวลานั่งนิ่ง",
    value: `${selectedEmp.sedentaryHours} ชม./วัน`,
    risk: selectedEmp.sedentaryRisk,
    detail: selectedEmp.sedentaryRisk ? "มากเกินไป" : "ปกติ",
    idp: "ลุกเดินทุก 30-60 นาที"
  }].map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: i < 3 ? "1px solid #F3F4F6" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "#374151"
    }
  }, f.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: f.risk ? "#EF4444" : "#10B981"
    }
  }, f.value)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: f.risk ? "#EF4444" : "#10B981",
      marginBottom: 4
    }
  }, f.risk ? "⚠ " : "✓ ", f.detail), f.risk && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#6B7280",
      background: "#FEF2F2",
      padding: "4px 8px",
      borderRadius: 6
    }
  }, "\uD83D\uDCA1 ", f.idp)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      borderTop: "3px solid #D97706"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#92400E",
      marginBottom: 14
    }
  }, "\uD83D\uDEAC \u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"), [{
    label: "สูบบุหรี่ (มวน)",
    val: selectedEmp.smokeCig,
    idp: "โปรแกรมเลิกสูบบุหรี่ / นิโคตินบำบัด"
  }, {
    label: "บุหรี่ไฟฟ้า",
    val: selectedEmp.smokeVape,
    idp: "ให้ความรู้อันตรายบุหรี่ไฟฟ้า"
  }, {
    label: "แอลกอฮอล์",
    val: selectedEmp.alcohol,
    idp: "โปรแกรมลดการดื่ม / EAP"
  }, {
    label: "สารเสพติดอื่น",
    val: selectedEmp.substance,
    idp: "ส่งต่อผู้เชี่ยวชาญ / การบำบัด"
  }].map((b, i) => {
    const bcfg = BEHAVIOR_CFG[b.val];
    const hasRisk = b.val !== "none";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: i < 3 ? "1px solid #F3F4F6" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#374151"
      }
    }, b.label), /*#__PURE__*/React.createElement(Tag, {
      label: bcfg.label,
      color: bcfg.color,
      small: true
    })), hasRisk && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#6B7280",
        background: "#FFF7ED",
        padding: "4px 8px",
        borderRadius: 6
      }
    }, "\uD83D\uDCA1 ", b.idp));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: 18,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      borderTop: "3px solid #7C3AED"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#4C1D95",
      marginBottom: 6
    }
  }, "\uD83C\uDFE5 NCD (\u0E42\u0E23\u0E04\u0E17\u0E35\u0E48\u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#9CA3AF",
      marginBottom: 14
    }
  }, "\uD83D\uDD12 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E48\u0E2D\u0E19\u0E44\u0E2B\u0E27 \u2014 \u0E40\u0E09\u0E1E\u0E32\u0E30 HR"), selectedEmp.hasNCD ? /*#__PURE__*/React.createElement(React.Fragment, null, selectedEmp.ncdList.map((ncd, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "#F5F3FF",
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 8,
      borderLeft: `3px solid ${NCD_COLORS[ncd] || "#7C3AED"}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: NCD_COLORS[ncd] || "#7C3AED"
    }
  }, "\uD83D\uDD34 ", ncd), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#6B7280",
      marginTop: 4
    }
  }, "\uD83D\uDCA1 ", ncd === "เบาหวาน" ? "ติดตามระดับน้ำตาล / ควบคุมอาหาร / ออกกำลังกายสม่ำเสมอ" : ncd === "ความดันโลหิตสูง" ? "ติดตามความดัน / ลดเค็ม / ลดความเครียด" : ncd === "โรคหัวใจ" ? "ปรึกษาแพทย์ก่อนออกกำลังกาย / หลีกเลี่ยงความเครียด" : ncd === "โรคไต" ? "ควบคุมโปรตีน / ดื่มน้ำพอเพียง / ติดตามค่าไต" : ncd === "โรคตับ" ? "หลีกเลี่ยงแอลกอฮอล์ / อาหารไขมันต่ำ" : "ติดตามการรักษาอย่างต่อเนื่อง / ดูแลสุขภาพจิต"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FEF2F2",
      borderRadius: 8,
      padding: "10px 12px",
      border: "1px solid #FECACA",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#991B1B"
    }
  }, "\u26A0\uFE0F \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E23\u0E23\u0E30\u0E27\u0E31\u0E07 IDP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#B91C1C",
      marginTop: 4
    }
  }, "\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E01\u0E41\u0E1A\u0E1A\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E08\u0E32\u0E01\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E01\u0E48\u0E2D\u0E19 \u0E2B\u0E49\u0E32\u0E21\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E17\u0E32\u0E07\u0E01\u0E32\u0E22\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E31\u0E01\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "24px 0",
      color: "#10B981"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E42\u0E23\u0E04 NCD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginTop: 4
    }
  }, "\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2D\u0E2D\u0E01\u0E41\u0E1A\u0E1A IDP \u0E01\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E15\u0E47\u0E21\u0E17\u0E35\u0E48")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: 20,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#111827",
      marginBottom: 14
    }
  }, "\uD83C\uDFAF \u0E25\u0E33\u0E14\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E33\u0E04\u0E31\u0E0D IDP \u0E21\u0E34\u0E15\u0E34\u0E01\u0E32\u0E22 \u2014 ", selectedEmp.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, [{
    show: selectedEmp.hasNCD,
    priority: "ด่วนที่สุด 🔴",
    label: "จัดการ NCD ก่อน",
    desc: "ปรึกษาแพทย์ วางแผนดูแลโรคที่มีอยู่",
    color: "#EF4444"
  }, {
    show: selectedEmp.hasRiskyBehavior,
    priority: "ด่วน 🟠",
    label: "แก้พฤติกรรมเสี่ยง",
    desc: "โปรแกรมเลิกสูบ/ลดดื่ม ก่อนเพิ่มกิจกรรม",
    color: "#F97316"
  }, {
    show: selectedEmp.physicalGroup !== "low",
    priority: "สำคัญ 🟡",
    label: "ปรับปัจจัยเสี่ยง",
    desc: "BMI + โภชนาการ + ออกกำลังกาย",
    color: "#F59E0B"
  }, {
    show: true,
    priority: "รักษาระดับ 🟢",
    label: "ติดตามต่อเนื่อง",
    desc: "ประเมินซ้ำทุก 3-6 เดือน",
    color: "#10B981"
  }].filter(p => p.show).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: p.color + "11",
      borderRadius: 10,
      padding: "12px 14px",
      borderLeft: `3px solid ${p.color}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: p.color
    }
  }, p.priority), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      marginTop: 4
    }
  }, p.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      marginTop: 4
    }
  }, p.desc))))))))));
}

  window.__DASHBOARDS__ = window.__DASHBOARDS__ || {};
  window.__DASHBOARDS__["physical"] = PhysicalDashboard;
})();
