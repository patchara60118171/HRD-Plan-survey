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

// ─── Constants ──────────────────────────────────────────────────────────────
const DEPTS = ["นโยบาย", "ปฏิบัติการ", "สนับสนุน"];
const NAMES = ["นายสมชาย ใจดี", "นางสาวมาลี รักสุข", "นายประสิทธิ์ ทำงาน", "นางวิภา สดใส", "นายกิตติ เก่งมาก", "นางสาวอัญชลี ร่าเริง", "นายวีระ ขยันดี", "นางรัตนา มีสุข", "นายพิทักษ์ ตั้งใจ", "นางสาวสุภา สวยงาม", "นายอนุชา ดีเลิศ", "นางเพ็ญศรี แจ่มใส", "นายชัยวัฒน์ รุ่งเรือง", "นางสาวนิภา ยิ้มแย้ม", "นายสุรศักดิ์ มั่นคง", "นางกัลยา ใสสะอาด", "นายธนพล ฉลาดดี", "นางสาวลัดดา สะอาด", "นายปิยะ เฉลียวฉลาด", "นางวรรณา สุขสบาย"];

// อันตรายในที่ทำงาน 6 ข้อ (ข้อ 85-90)
const HAZARDS = [{
  key: "sunlight",
  label: "แสงแดด/แสงจ้า",
  icon: "☀️",
  q: "ข้อ 85",
  idp: "สวมแว่นกันแดด / หมวก / ครีมกันแดด / จัดตารางหลีกเลี่ยงแดดจัด"
}, {
  key: "noise",
  label: "เสียงดัง/สั่นสะเทือน",
  icon: "🔊",
  q: "ข้อ 86",
  idp: "สวมที่อุดหู (Ear Plug) / จัดเวลาพักในพื้นที่เงียบ"
}, {
  key: "chemical",
  label: "กลิ่นสารเคมี",
  icon: "🧪",
  q: "ข้อ 87",
  idp: "สวมหน้ากาก N95 / ตรวจสอบอุปกรณ์ป้องกัน / แจ้งผู้ดูแลความปลอดภัย"
}, {
  key: "fume",
  label: "ควัน/ไอระเหย",
  icon: "💨",
  q: "ข้อ 88",
  idp: "สวม PPE / ระบายอากาศพื้นที่ทำงาน / พักในที่อากาศถ่ายเท"
}, {
  key: "posture",
  label: "นั่ง/ยืนท่าเดิมนาน",
  icon: "🪑",
  q: "ข้อ 89",
  idp: "ลุกเดินทุก 30 นาที / ปรับโต๊ะ-เก้าอี้ Ergonomic / ยืดเหยียดกล้ามเนื้อ"
}, {
  key: "awkward",
  label: "ท่าทางฝืนธรรมชาติ",
  icon: "🏋️",
  q: "ข้อ 90",
  idp: "ฝึก Body Mechanics / ปรับวิธีทำงาน / พบนักกายภาพบำบัด"
}];

// PM2.5 อาการ (ข้อ 92)
const PM_SYMPTOMS = [{
  key: "cough",
  label: "ไอ คัดจมูก น้ำมูก แสบคอ"
}, {
  key: "breath",
  label: "หายใจไม่เต็มอิ่ม"
}, {
  key: "eye",
  label: "แสบตา"
}, {
  key: "headache",
  label: "ปวดศีรษะ"
}];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[rand(0, arr.length - 1)];

// ─── Generate Mock Data ──────────────────────────────────────────────────────
const genEmployee = (name, idx) => {
  // ข้อ 84: ความพึงพอใจสิ่งแวดล้อม 0-4
  const envSatisfaction = rand(0, 4);

  // ข้อ 85-90: อันตราย (0=ไม่ใช่, 1=ใช่ไม่มีผล, 2=ใช่มีผลต่อสุขภาพ)
  const hazards = {
    sunlight: pick([0, 0, 0, 1, 2]),
    noise: pick([0, 0, 1, 1, 2]),
    chemical: pick([0, 0, 0, 0, 2]),
    fume: pick([0, 0, 0, 1, 2]),
    posture: pick([0, 1, 1, 2, 2]),
    awkward: pick([0, 0, 1, 2, 2])
  };

  // นับข้อที่ "มีผลต่อสุขภาพ" (=2)
  const hazardCount = Object.values(hazards).filter(v => v === 2).length;

  // ข้อ 91: PM2.5 (0=ไม่มี, 1=น้อย, 2=ปานกลาง, 3=มาก, 4=รุนแรงมาก)
  const pm25Level = pick([0, 0, 1, 1, 2, 2, 3, 4]);

  // ข้อ 92: อาการจาก PM2.5
  const symptoms = {
    none: pm25Level === 0,
    cough: pm25Level >= 2 && rand(0, 1) === 1,
    breath: pm25Level >= 3 && rand(0, 1) === 1,
    eye: pm25Level >= 2 && rand(0, 1) === 1,
    headache: pm25Level >= 2 && rand(0, 1) === 1
  };
  const symptomCount = Object.entries(symptoms).filter(([k, v]) => k !== "none" && v).length;

  // ข้อ 93: คุณภาพชีวิตโดยรวม 0-4
  const qualityOfLife = rand(0, 4);

  // กลุ่มเสี่ยง
  // เสี่ยงสูง = มีอันตรายงาน ≥2 ข้อ (มีผลต่อสุขภาพ)
  // เฝ้าระวัง = มีอันตราย 1 ข้อ หรือ PM2.5 มาก+มีอาการ
  // ปกติ = ไม่มีเลย
  const pmRisk = pm25Level >= 3 && symptomCount > 0;
  const envRiskScore = hazardCount + (pmRisk ? 1 : 0);
  const envGroup = envRiskScore >= 2 ? "high" : envRiskScore >= 1 ? "medium" : "low";
  return {
    id: idx + 1,
    name,
    dept: DEPTS[idx % 3],
    envSatisfaction,
    hazards,
    hazardCount,
    pm25Level,
    symptoms,
    symptomCount,
    pmRisk,
    qualityOfLife,
    envRiskScore,
    envGroup
  };
};
// ─── Real data adapter ───────────────────────────────────────────────────────
const _ENV_REAL = typeof window !== 'undefined' && window.__IDP_EMPLOYEES__ && window.__IDP_EMPLOYEES__.env || null;
const _envHazard = (v) => {
  if (v == null) return 0;
  const s = String(v).trim();
  if (!s || s.startsWith('ไม่ใช่') || s === 'false' || s === '0') return 0;
  const hasImpact = s.includes('มีผล') && !s.includes('ไม่มีผล');
  if (hasImpact) return 2;
  if (s.includes('ใช่') || s.includes('มี') || s === 'true' || s === '1') return 1;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : Math.min(Math.max(n, 0), 2);
};
const _num04 = (v) => {
  if (v == null) return 2;
  const n = parseInt(String(v).trim(), 10);
  return isNaN(n) ? 2 : Math.min(Math.max(n, 0), 4);
};
const _flag = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return s !== '' && s !== '0' && s !== 'false' && !/^ไม่/.test(s);
};
const _toEnvEmployee = (rec, idx) => {
  const row = rec._raw || {};
  const envSatisfaction = _num04(row.env_satisfaction ?? row.q84);
  const hazards = {
    sunlight: _envHazard(row.env_glare ?? row.q85),
    noise:    _envHazard(row.env_noise ?? row.q86),
    chemical: _envHazard(row.env_smell ?? row.q87),
    fume:     _envHazard(row.env_smoke ?? row.q88),
    posture:  _envHazard(row.env_posture ?? row.q89),
    awkward:  _envHazard(row.env_awkward ?? row.q90),
  };
  const hazardCount = Object.values(hazards).filter(v => v === 2).length;
  const pm25Level = _num04(row.env_pm25 ?? row.q91);
  const symptoms = {
    none: pm25Level === 0,
    cough:    _flag(row.env_pm_cough ?? row.q92_cough),
    breath:   _flag(row.env_pm_breath ?? row.q92_breath),
    eye:      _flag(row.env_pm_eye ?? row.q92_eye),
    headache: _flag(row.env_pm_headache ?? row.q92_headache),
  };
  const symptomCount = Object.entries(symptoms).filter(([k, v]) => k !== 'none' && v).length;
  const qualityOfLife = _num04(row.env_qol ?? row.q93);
  const pmRisk = pm25Level >= 3 && symptomCount > 0;
  const envRiskScore = hazardCount + (pmRisk ? 1 : 0);
  const envGroup = envRiskScore >= 2 ? 'high' : envRiskScore >= 1 ? 'medium' : 'low';
  return {
    id: rec.id || idx + 1,
    name: rec.name || '—',
    dept: rec.dept || rec.org || '—',
    envSatisfaction, hazards, hazardCount,
    pm25Level, symptoms, symptomCount, pmRisk,
    qualityOfLife, envRiskScore, envGroup,
  };
};
const employees = _ENV_REAL ? _ENV_REAL.map(_toEnvEmployee) : NAMES.map((n, i) => genEmployee(n, i));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const GROUP_CFG = {
  high: {
    label: "เสี่ยงสูง",
    color: "#EF4444",
    bg: "#FEF2F2",
    dot: "🔴"
  },
  medium: {
    label: "เฝ้าระวัง",
    color: "#F59E0B",
    bg: "#FFFBEB",
    dot: "🟠"
  },
  low: {
    label: "ปกติ",
    color: "#10B981",
    bg: "#F0FDF4",
    dot: "🟢"
  }
};
const SAT_LABELS = ["แย่มาก", "แย่", "ปานกลาง", "ดี", "ดีมาก"];
const SAT_COLORS = ["#EF4444", "#F97316", "#F59E0B", "#22C55E", "#10B981"];
const PM_LABELS = ["ไม่มี", "น้อย", "ปานกลาง", "มาก", "รุนแรงมาก"];
const PM_COLORS = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];
const HAZARD_LABELS = ["ไม่มี", "มี ไม่กระทบ", "มี กระทบสุขภาพ"];
const pct = (n, total) => total > 0 ? Math.round(n / total * 100) : 0;
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
    fontFamily: "'Sarabun',sans-serif"
  }
}, label);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label
}) => {
  if (!active || !payload?.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1E293B",
      borderRadius: 10,
      padding: "12px 16px",
      fontFamily: "'Sarabun',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#94A3B8",
      fontSize: 11,
      marginBottom: 8
    }
  }, label), payload.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: p.fill || p.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#E2E8F0"
    }
  }, p.name, ":"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#fff"
    }
  }, p.value, " \u0E04\u0E19"))));
};

// ─── Main ────────────────────────────────────────────────────────────────────
function EnvDashboard() {
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const listData = [...employees].sort((a, b) => b.envRiskScore - a.envRiskScore).filter(e => filter === "all" || e.envGroup === filter);
  const highRisk = employees.filter(e => e.envGroup === "high");
  const medRisk = employees.filter(e => e.envGroup === "medium");
  const lowRisk = employees.filter(e => e.envGroup === "low");

  // Hazard summary
  const hazardSummary = HAZARDS.map(h => ({
    ...h,
    affected: employees.filter(e => e.hazards[h.key] === 2).length,
    watch: employees.filter(e => e.hazards[h.key] === 1).length,
    none: employees.filter(e => e.hazards[h.key] === 0).length
  })).sort((a, b) => b.affected - a.affected);

  // PM2.5 summary
  const pmSummary = [0, 1, 2, 3, 4].map(l => ({
    label: PM_LABELS[l],
    value: employees.filter(e => e.pm25Level === l).length,
    color: PM_COLORS[l]
  }));

  // Satisfaction dist
  const satDist = [0, 1, 2, 3, 4].map(s => ({
    label: SAT_LABELS[s],
    value: employees.filter(e => e.envSatisfaction === s).length,
    color: SAT_COLORS[s]
  }));

  // Dept bar data
  const deptData = DEPTS.map(d => {
    const grp = employees.filter(e => e.dept === d);
    return {
      name: d,
      "เสี่ยงสูง": grp.filter(e => e.envGroup === "high").length,
      "เฝ้าระวัง": grp.filter(e => e.envGroup === "medium").length,
      "ปกติ": grp.filter(e => e.envGroup === "low").length
    };
  });

  // Radar: hazard profile org
  const radarData = HAZARDS.map(h => ({
    dim: h.icon + " " + h.label.substring(0, 6),
    fullLabel: h.label,
    "กระทบสุขภาพ": Math.round(employees.filter(e => e.hazards[h.key] === 2).length / employees.length * 100),
    "มีแต่ไม่กระทบ": Math.round(employees.filter(e => e.hazards[h.key] === 1).length / employees.length * 100)
  }));
  const avgSat = (employees.reduce((s, e) => s + e.envSatisfaction, 0) / employees.length).toFixed(1);
  const avgQol = (employees.reduce((s, e) => s + e.qualityOfLife, 0) / employees.length).toFixed(1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Sarabun',sans-serif",
      background: "#F1F5F9",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#1E3A5F 0%,#1D4ED8 60%,#2563EB 100%)",
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
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: 3,
      color: "#93C5FD",
      textTransform: "uppercase",
      marginBottom: 6
    }
  }, "\u0E21\u0E34\u0E15\u0E34\u0E2A\u0E20\u0E32\u0E1E\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21 \xB7 Environment Well-being"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 800
    }
  }, "\uD83C\uDF3F \u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E2A\u0E20\u0E32\u0E1E\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21\u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#BFDBFE",
      marginTop: 4
    }
  }, "NIDA \xB7 ", employees.length, " \u0E04\u0E19 \xB7 \u0E02\u0E49\u0E2D 84\u201393 \u0E40\u0E09\u0E1E\u0E32\u0E30\u0E17\u0E35\u0E48\u0E19\u0E33\u0E44\u0E1B\u0E43\u0E0A\u0E49 IDP \u0E44\u0E14\u0E49")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, [{
    label: "เสี่ยงสูง",
    value: highRisk.length,
    color: "#FCA5A5"
  }, {
    label: "เฝ้าระวัง",
    value: medRisk.length,
    color: "#FCD34D"
  }, {
    label: "คุณภาพชีวิต",
    value: `${avgQol}/4`,
    color: "#6EE7B7"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "10px 16px",
      textAlign: "center",
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
      color: "#BFDBFE"
    }
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(0,0,0,0.2)",
      borderRadius: "10px 10px 0 0",
      padding: "10px 20px",
      fontSize: 12,
      color: "#BFDBFE",
      marginBottom: 0
    }
  }, "\uD83D\uDCCC ", /*#__PURE__*/React.createElement("strong", null, "\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38:"), " \u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E19\u0E35\u0E49\u0E41\u0E2A\u0E14\u0E07\u0E1C\u0E25\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E02\u0E49\u0E2D 84\u201393 \u0E17\u0E35\u0E48\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E01\u0E41\u0E1A\u0E1A IDP \xB7 \u0E02\u0E49\u0E2D 94\u201397 (\u0E42\u0E23\u0E04\u0E2D\u0E38\u0E1A\u0E31\u0E15\u0E34\u0E43\u0E2B\u0E21\u0E48 / \u0E20\u0E39\u0E21\u0E34\u0E2D\u0E32\u0E01\u0E32\u0E28) \u0E40\u0E01\u0E47\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E04\u0E23\u0E1A\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E19\u0E33\u0E21\u0E32\u0E41\u0E2A\u0E14\u0E07\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E08\u0E32\u0E01\u0E44\u0E21\u0E48\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E15\u0E48\u0E2D IDP \u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 4
    }
  }, [{
    key: "overview",
    label: "🏢 ภาพรวมองค์กร"
  }, {
    key: "risklist",
    label: "📋 Risk List"
  }, {
    key: "individual",
    label: "👤 IDP รายบุคคล"
  }].map(t => /*#__PURE__*/React.createElement("button", {
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
      background: tab === t.key ? "#F1F5F9" : "transparent",
      color: tab === t.key ? "#1E3A5F" : "rgba(255,255,255,0.65)"
    }
  }, t.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: "0 auto",
      padding: "24px 32px"
    }
  }, tab === "overview" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#1E3A5F",
      marginBottom: 16
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E20\u0E32\u0E1E\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21"), Object.entries(GROUP_CFG).map(([key, cfg]) => {
    const count = employees.filter(e => e.envGroup === key).length;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 12,
        background: cfg.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        flexShrink: 0
      }
    }, cfg.dot), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: cfg.color
      }
    }, cfg.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: cfg.color
      }
    }, count)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: "#F3F4F6",
        borderRadius: 3,
        marginTop: 4,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(count, employees.length)}%`,
        height: "100%",
        background: cfg.color,
        borderRadius: 3
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        marginTop: 2
      }
    }, pct(count, employees.length), "%")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#1E3A5F",
      marginBottom: 4
    }
  }, "\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E36\u0E07\u0E1E\u0E2D\u0E43\u0E08\u0E2A\u0E34\u0E48\u0E07\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21\u0E07\u0E32\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 14
    }
  }, "\u0E02\u0E49\u0E2D 84 \xB7 \u0E04\u0E30\u0E41\u0E19\u0E19 0-4"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: Number(avgSat) >= 3 ? "#10B981" : Number(avgSat) >= 2 ? "#F59E0B" : "#EF4444"
    }
  }, avgSat), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#9CA3AF"
    }
  }, "/ 4 \u0E04\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22")), satDist.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: s.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#6B7280",
      flex: 1
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 6,
      background: "#F3F4F6",
      borderRadius: 3,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct(s.value, employees.length)}%`,
      height: "100%",
      background: s.color
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: s.color,
      minWidth: 20
    }
  }, s.value)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#1E3A5F",
      marginBottom: 4
    }
  }, "\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E42\u0E14\u0E22\u0E23\u0E27\u0E21"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 14
    }
  }, "\u0E02\u0E49\u0E2D 93 \xB7 \u0E04\u0E30\u0E41\u0E19\u0E19 0-4"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: Number(avgQol) >= 3 ? "#10B981" : Number(avgQol) >= 2 ? "#F59E0B" : "#EF4444"
    }
  }, avgQol), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#9CA3AF"
    }
  }, "/ 4 \u0E04\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22")), [0, 1, 2, 3, 4].map(v => {
    const count = employees.filter(e => e.qualityOfLife === v).length;
    return /*#__PURE__*/React.createElement("div", {
      key: v,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: SAT_COLORS[v],
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#6B7280",
        flex: 1
      }
    }, SAT_LABELS[v]), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 80,
        height: 6,
        background: "#F3F4F6",
        borderRadius: 3,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(count, employees.length)}%`,
        height: "100%",
        background: SAT_COLORS[v]
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: SAT_COLORS[v],
        minWidth: 20
      }
    }, count));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#EFF6FF",
      borderRadius: 8,
      padding: "8px 10px",
      marginTop: 8,
      fontSize: 11,
      color: "#1D4ED8"
    }
  }, "\uD83D\uDCA1 \u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E15\u0E48\u0E33 (0-1) = ", employees.filter(e => e.qualityOfLife <= 1).length, " \u0E04\u0E19 \u2192 \u0E04\u0E27\u0E23\u0E23\u0E27\u0E21\u0E43\u0E19 IDP \u0E14\u0E49\u0E32\u0E19\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
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
      background: "#1D4ED8",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "#1E3A5F"
    }
  }, "\u0E2D\u0E31\u0E19\u0E15\u0E23\u0E32\u0E22\u0E43\u0E19\u0E2A\u0E20\u0E32\u0E1E\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21\u0E17\u0E33\u0E07\u0E32\u0E19 (\u0E02\u0E49\u0E2D 85\u201390)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF"
    }
  }, "\u0E40\u0E23\u0E35\u0E22\u0E07\u0E08\u0E32\u0E01\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E21\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14 \xB7 \u0E41\u0E14\u0E07 = \u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E \xB7 \u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07 = \u0E21\u0E35\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 240
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: hazardSummary,
    layout: "vertical",
    margin: {
      top: 0,
      right: 20,
      left: 10,
      bottom: 0
    },
    barSize: 14
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#F3F4F6",
    horizontal: false
  }), /*#__PURE__*/React.createElement(XAxis, {
    type: "number",
    tick: {
      fill: "#9CA3AF",
      fontSize: 11
    },
    axisLine: false,
    tickLine: false
  }), /*#__PURE__*/React.createElement(YAxis, {
    type: "category",
    dataKey: "icon",
    tick: {
      fill: "#374151",
      fontSize: 16
    },
    axisLine: false,
    tickLine: false,
    width: 30
  }), /*#__PURE__*/React.createElement(Tooltip, {
    content: /*#__PURE__*/React.createElement(CustomTooltip, null),
    cursor: {
      fill: "rgba(0,0,0,0.03)"
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "affected",
    name: "\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E",
    stackId: "a",
    fill: "#EF4444",
    radius: [0, 0, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "watch",
    name: "\u0E21\u0E35\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A",
    stackId: "a",
    fill: "#FCD34D",
    radius: [0, 0, 0, 0]
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "none",
    name: "\u0E44\u0E21\u0E48\u0E21\u0E35",
    stackId: "a",
    fill: "#D1FAE5",
    radius: [0, 4, 4, 0]
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontFamily: "'Sarabun',sans-serif",
      fontSize: 12
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      flexShrink: 0
    }
  }, hazardSummary.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: h.key,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
      padding: "10px 12px",
      borderRadius: 10,
      background: h.affected > 0 ? "#FEF2F2" : h.watch > 0 ? "#FFFBEB" : "#F9FAFB",
      border: `1px solid ${h.affected > 0 ? "#FECACA" : h.watch > 0 ? "#FDE68A" : "#F3F4F6"}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, h.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151"
    }
  }, h.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#9CA3AF"
    }
  }, h.q)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, h.affected > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#EF4444"
    }
  }, h.affected, " \u0E04\u0E19"), h.watch > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#F59E0B"
    }
  }, "\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07 ", h.watch))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#F97316",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#1E3A5F"
    }
  }, "\u0E21\u0E25\u0E1E\u0E34\u0E29 PM2.5 (\u0E02\u0E49\u0E2D 91\u201392)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF"
    }
  }, "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E32\u0E28\u0E31\u0E22 + \u0E2D\u0E32\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E40\u0E01\u0E34\u0E14\u0E02\u0E36\u0E49\u0E19"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, pmSummary.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: p.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#6B7280",
      width: 90
    }
  }, p.label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 8,
      background: "#F3F4F6",
      borderRadius: 4,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct(p.value, employees.length)}%`,
      height: "100%",
      background: p.color,
      borderRadius: 4
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: p.color,
      minWidth: 30
    }
  }, p.value, " \u0E04\u0E19")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFF7ED",
      borderRadius: 10,
      padding: "12px 14px",
      border: "1px solid #FED7AA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#92400E",
      marginBottom: 10
    }
  }, "\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E40\u0E01\u0E34\u0E14\u0E08\u0E32\u0E01 PM2.5 (\u0E02\u0E49\u0E2D 92)"), PM_SYMPTOMS.map(s => {
    const count = employees.filter(e => e.symptoms[s.key]).length;
    return /*#__PURE__*/React.createElement("div", {
      key: s.key,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#6B7280"
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 60,
        height: 5,
        background: "#F3F4F6",
        borderRadius: 3,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct(count, employees.length)}%`,
        height: "100%",
        background: "#F97316"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: "#EA580C",
        minWidth: 30
      }
    }, count, " \u0E04\u0E19")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#9A3412",
      marginTop: 8,
      borderTop: "1px solid #FED7AA",
      paddingTop: 8
    }
  }, "\uD83D\uDCA1 IDP: \u0E41\u0E08\u0E01 N95 / \u0E41\u0E19\u0E30\u0E19\u0E33\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21 AQI / \u0E1E\u0E31\u0E01\u0E43\u0E19\u0E2D\u0E32\u0E04\u0E32\u0E23\u0E0A\u0E48\u0E27\u0E07 PM \u0E2A\u0E39\u0E07"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#1E3A5F",
      marginBottom: 4
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E22\u0E01\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 16
    }
  }, "\u0E41\u0E14\u0E07=\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07 \u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07=\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07 \u0E40\u0E02\u0E35\u0E22\u0E27=\u0E1B\u0E01\u0E15\u0E34"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: deptData,
    barSize: 44,
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
    content: /*#__PURE__*/React.createElement(CustomTooltip, null),
    cursor: {
      fill: "rgba(0,0,0,0.03)"
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07",
    stackId: "a",
    fill: "#EF4444"
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "\u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07",
    stackId: "a",
    fill: "#F59E0B"
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
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      marginTop: 16,
      marginBottom: 4
    }
  }, "Radar: \u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C\u0E2D\u0E31\u0E19\u0E15\u0E23\u0E32\u0E22\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 180
  }, /*#__PURE__*/React.createElement(RadarChart, {
    data: radarData
  }, /*#__PURE__*/React.createElement(PolarGrid, {
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(PolarAngleAxis, {
    dataKey: "dim",
    tick: {
      fill: "#6B7280",
      fontSize: 10,
      fontFamily: "'Sarabun',sans-serif"
    }
  }), /*#__PURE__*/React.createElement(PolarRadiusAxis, {
    domain: [0, 100],
    tick: false,
    axisLine: false
  }), /*#__PURE__*/React.createElement(Radar, {
    name: "\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E (%)",
    dataKey: "\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E",
    stroke: "#EF4444",
    fill: "#EF4444",
    fillOpacity: 0.2,
    strokeWidth: 2
  }), /*#__PURE__*/React.createElement(Radar, {
    name: "\u0E21\u0E35\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A (%)",
    dataKey: "\u0E21\u0E35\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A",
    stroke: "#F59E0B",
    fill: "#F59E0B",
    fillOpacity: 0.1,
    strokeWidth: 1.5,
    strokeDasharray: "4 3"
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontFamily: "'Sarabun',sans-serif",
      fontSize: 11
    }
  })))))), tab === "risklist" && /*#__PURE__*/React.createElement("div", {
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
      gridTemplateColumns: "32px 1fr 100px 80px 160px 140px 80px 90px",
      padding: "10px 20px",
      background: "#F9FAFB",
      borderBottom: "1px solid #F3F4F6",
      gap: 8
    }
  }, ["#", "ชื่อ", "หน่วยงาน", "ความพอใจ", "อันตรายงาน", "PM2.5", "คุณภาพชีวิต", "กลุ่ม"].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: "#9CA3AF",
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  }, h))), listData.map((emp, idx) => {
    const cfg = GROUP_CFG[emp.envGroup];
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => {
        setSelectedEmp(emp);
        setTab("individual");
      },
      style: {
        display: "grid",
        gridTemplateColumns: "32px 1fr 100px 80px 160px 140px 80px 90px",
        padding: "12px 20px",
        gap: 8,
        cursor: "pointer",
        borderBottom: "1px solid #F9FAFB",
        background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
        borderLeft: `3px solid ${emp.envGroup === "high" ? "#EF4444" : emp.envGroup === "medium" ? "#F59E0B" : "transparent"}`,
        transition: "background 0.15s"
      },
      onMouseEnter: e => e.currentTarget.style.background = "#F0F9FF",
      onMouseLeave: e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#FAFAFA"
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
    }, emp.dept)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#6B7280",
        alignSelf: "center"
      }
    }, emp.dept), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: SAT_COLORS[emp.envSatisfaction]
      }
    }, emp.envSatisfaction, "/4"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, SAT_LABELS[emp.envSatisfaction])), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        flexWrap: "wrap"
      }
    }, HAZARDS.map(h => emp.hazards[h.key] === 2 && /*#__PURE__*/React.createElement("span", {
      key: h.key,
      title: h.label,
      style: {
        fontSize: 14
      }
    }, h.icon)), emp.hazardCount === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#10B981"
      }
    }, "\u0E44\u0E21\u0E48\u0E21\u0E35")), emp.hazardCount > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#EF4444"
      }
    }, emp.hazardCount, " \u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: PM_COLORS[emp.pm25Level]
      }
    }, PM_LABELS[emp.pm25Level]), emp.symptomCount > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#F97316"
      }
    }, "\u0E21\u0E35\u0E2D\u0E32\u0E01\u0E32\u0E23 ", emp.symptomCount, " \u0E2D\u0E22\u0E48\u0E32\u0E07")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: SAT_COLORS[emp.qualityOfLife]
      }
    }, emp.qualityOfLife, "/4")), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      label: `${cfg.dot} ${cfg.label}`,
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
  }, [...employees].sort((a, b) => b.envRiskScore - a.envRiskScore).map(emp => {
    const cfg = GROUP_CFG[emp.envGroup];
    const isSelected = selectedEmp?.id === emp.id;
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => setSelectedEmp(emp),
      style: {
        background: isSelected ? "#EFF6FF" : "#fff",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        border: `1px solid ${isSelected ? "#1D4ED8" : "#E5E7EB"}`,
        transition: "all 0.15s"
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
    }, emp.dept)), /*#__PURE__*/React.createElement(Tag, {
      label: `${cfg.dot} ${cfg.label}`,
      color: cfg.color,
      small: true
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        marginTop: 8
      }
    }, HAZARDS.map(h => emp.hazards[h.key] === 2 && /*#__PURE__*/React.createElement("span", {
      key: h.key,
      style: {
        fontSize: 12
      }
    }, h.icon)), emp.pmRisk && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, "\uD83C\uDF2B\uFE0F"), emp.qualityOfLife <= 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, "\uD83D\uDE1F")));
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
  }, "\uD83C\uDF3F"), /*#__PURE__*/React.createElement("div", null, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E14\u0E49\u0E32\u0E19\u0E0B\u0E49\u0E32\u0E22\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14 IDP")) : /*#__PURE__*/React.createElement("div", {
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
      borderTop: `4px solid ${GROUP_CFG[selectedEmp.envGroup].color}`
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
  }, selectedEmp.dept)), /*#__PURE__*/React.createElement(Tag, {
    label: `${GROUP_CFG[selectedEmp.envGroup].dot} ${GROUP_CFG[selectedEmp.envGroup].label}`,
    color: GROUP_CFG[selectedEmp.envGroup].color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 12,
      marginTop: 20
    }
  }, [{
    label: "ความพึงพอใจสิ่งแวดล้อม",
    value: `${selectedEmp.envSatisfaction}/4`,
    sub: SAT_LABELS[selectedEmp.envSatisfaction],
    color: SAT_COLORS[selectedEmp.envSatisfaction]
  }, {
    label: "อันตรายที่กระทบสุขภาพ",
    value: `${selectedEmp.hazardCount} ข้อ`,
    sub: selectedEmp.hazardCount >= 2 ? "เสี่ยงสูง" : selectedEmp.hazardCount === 1 ? "เฝ้าระวัง" : "ปลอดภัย",
    color: selectedEmp.hazardCount >= 2 ? "#EF4444" : selectedEmp.hazardCount === 1 ? "#F59E0B" : "#10B981"
  }, {
    label: "คุณภาพชีวิตโดยรวม",
    value: `${selectedEmp.qualityOfLife}/4`,
    sub: SAT_LABELS[selectedEmp.qualityOfLife],
    color: SAT_COLORS[selectedEmp.qualityOfLife]
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: "#F9FAFB",
      borderRadius: 10,
      padding: "14px 16px",
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
      fontSize: 22,
      fontWeight: 800,
      color: m.color
    }
  }, m.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: m.color,
      fontWeight: 600
    }
  }, m.sub))))), /*#__PURE__*/React.createElement("div", {
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
      color: "#1E3A5F",
      marginBottom: 4
    }
  }, "\u26A0\uFE0F \u0E2D\u0E31\u0E19\u0E15\u0E23\u0E32\u0E22\u0E43\u0E19\u0E2A\u0E20\u0E32\u0E1E\u0E41\u0E27\u0E14\u0E25\u0E49\u0E2D\u0E21\u0E07\u0E32\u0E19 \u2014 \u0E41\u0E19\u0E27\u0E17\u0E32\u0E07 IDP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 14
    }
  }, "\u0E02\u0E49\u0E2D\u0E17\u0E35\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E = \u0E1A\u0E38\u0E04\u0E04\u0E25\u0E1B\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E19\u0E15\u0E19\u0E40\u0E2D\u0E07\u0E44\u0E14\u0E49 \xB7 \u0E02\u0E49\u0E2D\u0E2A\u0E35\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07 = \u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49\u0E44\u0E02\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, HAZARDS.map(h => {
    const level = selectedEmp.hazards[h.key];
    if (level === 0) return null;
    const bgColor = level === 2 ? "#FEF2F2" : "#FFFBEB";
    const borderColor = level === 2 ? "#FECACA" : "#FDE68A";
    const textColor = level === 2 ? "#991B1B" : "#92400E";
    return /*#__PURE__*/React.createElement("div", {
      key: h.key,
      style: {
        background: bgColor,
        borderRadius: 10,
        padding: "12px 14px",
        border: `1px solid ${borderColor}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, h.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: textColor
      }
    }, h.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: textColor === "#991B1B" ? "#EF4444" : "#F59E0B"
      }
    }, level === 2 ? "มีผลต่อสุขภาพ" : "มีแต่ไม่มีผล"))), /*#__PURE__*/React.createElement("span", {
      style: {
        background: level === 2 ? "#EF4444" : "#F59E0B",
        color: "#fff",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700
      }
    }, level === 2 ? "🔴 กระทบ" : "🟡 เฝ้าระวัง")), level === 2 && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11,
        color: "#374151"
      }
    }, "\uD83D\uDCA1 ", /*#__PURE__*/React.createElement("strong", null, "IDP \u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25:"), " ", h.idp));
  }), selectedEmp.hazardCount === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 20,
      color: "#10B981"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2D\u0E31\u0E19\u0E15\u0E23\u0E32\u0E22\u0E43\u0E19\u0E17\u0E35\u0E48\u0E17\u0E33\u0E07\u0E32\u0E19")))), (selectedEmp.pm25Level >= 2 || selectedEmp.symptomCount > 0) && /*#__PURE__*/React.createElement("div", {
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
      color: "#1E3A5F",
      marginBottom: 14
    }
  }, "\uD83C\uDF2B\uFE0F PM2.5 \u2014 \u0E41\u0E19\u0E27\u0E17\u0E32\u0E07 IDP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFF7ED",
      borderRadius: 10,
      padding: "12px 14px",
      border: "1px solid #FED7AA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#92400E",
      marginBottom: 6
    }
  }, "\u0E23\u0E30\u0E14\u0E31\u0E1A PM2.5 \u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: PM_COLORS[selectedEmp.pm25Level]
    }
  }, PM_LABELS[selectedEmp.pm25Level]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginTop: 4
    }
  }, "\u0E02\u0E49\u0E2D 91")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FFF7ED",
      borderRadius: 10,
      padding: "12px 14px",
      border: "1px solid #FED7AA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#92400E",
      marginBottom: 6
    }
  }, "\u0E2D\u0E32\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E21\u0E35"), PM_SYMPTOMS.map(s => selectedEmp.symptoms[s.key] && /*#__PURE__*/React.createElement("div", {
    key: s.key,
    style: {
      fontSize: 11,
      color: "#EA580C"
    }
  }, "\u2022 ", s.label)), selectedEmp.symptomCount === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#10B981"
    }
  }, "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2D\u0E32\u0E01\u0E32\u0E23"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#FEF3C7",
      borderRadius: 10,
      padding: "10px 14px",
      marginTop: 12,
      border: "1px solid #FDE68A"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#92400E",
      marginBottom: 6
    }
  }, "\uD83D\uDCA1 \u0E41\u0E19\u0E27\u0E17\u0E32\u0E07 IDP \u0E14\u0E49\u0E32\u0E19 PM2.5"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#78350F",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E04\u0E48\u0E32 AQI \u0E23\u0E32\u0E22\u0E27\u0E31\u0E19 \u0E1C\u0E48\u0E32\u0E19\u0E41\u0E2D\u0E1B AirVisual / IQAir"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E2A\u0E27\u0E21\u0E2B\u0E19\u0E49\u0E32\u0E01\u0E32\u0E01 N95 \u0E40\u0E21\u0E37\u0E48\u0E2D PM2.5 > 37.5 \u03BCg/m\xB3"), selectedEmp.symptoms.breath && /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E2B\u0E32\u0E01\u0E2B\u0E32\u0E22\u0E43\u0E08\u0E44\u0E21\u0E48\u0E2A\u0E30\u0E14\u0E27\u0E01 \u0E04\u0E27\u0E23\u0E1E\u0E1A\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E21\u0E23\u0E23\u0E16\u0E20\u0E32\u0E1E\u0E1B\u0E2D\u0E14"), selectedEmp.symptoms.eye && /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E43\u0E0A\u0E49\u0E19\u0E49\u0E33\u0E15\u0E32\u0E40\u0E17\u0E35\u0E22\u0E21 / \u0E41\u0E27\u0E48\u0E19\u0E15\u0E32\u0E01\u0E31\u0E19\u0E25\u0E21 \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E2D\u0E22\u0E39\u0E48\u0E01\u0E25\u0E32\u0E07\u0E41\u0E08\u0E49\u0E07"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E2D\u0E2D\u0E01\u0E01\u0E33\u0E25\u0E31\u0E07\u0E01\u0E32\u0E22\u0E01\u0E25\u0E32\u0E07\u0E41\u0E08\u0E49\u0E07\u0E0A\u0E48\u0E27\u0E07 PM \u0E2A\u0E39\u0E07")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#EFF6FF",
      borderRadius: 12,
      padding: "14px 18px",
      border: "1px solid #BFDBFE"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#1D4ED8",
      marginBottom: 8
    }
  }, "\uD83D\uDCCB \u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A HR \u2014 \u0E41\u0E22\u0E01 IDP \u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25 vs \u0E01\u0E32\u0E23\u0E41\u0E01\u0E49\u0E44\u0E02\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      fontSize: 11,
      color: "#374151"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "#1D4ED8",
      marginBottom: 4
    }
  }, "\uD83D\uDC64 \u0E1A\u0E38\u0E04\u0E04\u0E25\u0E17\u0E33\u0E44\u0E14\u0E49\u0E40\u0E2D\u0E07"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E43\u0E2A\u0E48 PPE / \u0E2B\u0E19\u0E49\u0E32\u0E01\u0E32\u0E01 / \u0E2B\u0E21\u0E27\u0E01"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E22\u0E37\u0E14\u0E40\u0E2B\u0E22\u0E35\u0E22\u0E14 / \u0E25\u0E38\u0E01\u0E40\u0E14\u0E34\u0E19\u0E17\u0E38\u0E01 30 \u0E19\u0E32\u0E17\u0E35"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E15\u0E34\u0E14\u0E15\u0E32\u0E21 AQI / \u0E2B\u0E25\u0E35\u0E01\u0E40\u0E25\u0E35\u0E48\u0E22\u0E07\u0E41\u0E14\u0E14\u0E08\u0E31\u0E14")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "#DC2626",
      marginBottom: 4
    }
  }, "\uD83C\uDFE2 \u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49\u0E44\u0E02"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E30\u0E1A\u0E32\u0E22\u0E2D\u0E32\u0E01\u0E32\u0E28"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E08\u0E31\u0E14\u0E42\u0E15\u0E4A\u0E30-\u0E40\u0E01\u0E49\u0E32\u0E2D\u0E35\u0E49 Ergonomic"), /*#__PURE__*/React.createElement("div", null, "\u2022 \u0E25\u0E14\u0E01\u0E32\u0E23\u0E2A\u0E31\u0E21\u0E1C\u0E31\u0E2A\u0E2A\u0E32\u0E23\u0E40\u0E04\u0E21\u0E35/\u0E40\u0E2A\u0E35\u0E22\u0E07\u0E14\u0E31\u0E07")))))))));
}

  window.__DASHBOARDS__ = window.__DASHBOARDS__ || {};
  window.__DASHBOARDS__["env"] = EnvDashboard;
})();
