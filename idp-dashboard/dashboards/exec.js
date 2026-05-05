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

// ─── Shared Config ────────────────────────────────────────────────────────────
const DIMS_4 = [{
  key: "physical",
  label: "กาย",
  icon: "🏃",
  color: "#10B981",
  light: "#D1FAE5"
}, {
  key: "mental",
  label: "ใจ",
  icon: "�",
  color: "#F59E0B",
  light: "#FEF3C7"
}, {
  key: "social",
  label: "สังคม",
  icon: "🤝",
  color: "#8B5CF6",
  light: "#EDE9FE"
}, {
  key: "environ",
  label: "แวดล้อม",
  icon: "🌿",
  color: "#0EA5E9",
  light: "#E0F2FE"
}];
const _IDP_REAL = typeof window !== 'undefined' && window.__IDP_EMPLOYEES__ && window.__IDP_EMPLOYEES__.exec || null;
const DEPTS = _IDP_REAL ? [...new Set(_IDP_REAL.map(e => e.dept).filter(Boolean))].sort().slice(0, 8) : ["นโยบาย", "ปฏิบัติการ", "สนับสนุน"];
const NAMES = ["นายสมชาย ใจดี", "นางสาวมาลี รักสุข", "นายประสิทธิ์ ทำงาน", "นางวิภา สดใส", "นายกิตติ เก่งมาก", "นางสาวอัญชลี ร่าเริง", "นายวีระ ขยันดี", "นางรัตนา มีสุข", "นายพิทักษ์ ตั้งใจ", "นางสาวสุภา สวยงาม", "นายอนุชา ดีเลิศ", "นางเพ็ญศรี แจ่มใส", "นายชัยวัฒน์ รุ่งเรือง", "นางสาวนิภา ยิ้มแย้ม", "นายสุรศักดิ์ มั่นคง", "นางกัลยา ใสสะอาด", "นายธนพล ฉลาดดี", "นางสาวลัดดา สะอาด", "นายปิยะ เฉลียวฉลาด", "นางวรรณา สุขสบาย"];
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// ─── Risk levels per dimension ────────────────────────────────────────────────
// Physical: เสี่ยงสูง/เฝ้าระวัง/ปกติ → score 0/1/2
// Mental (TMHI-15): ต่ำกว่า/เท่า/ดีกว่า → 0/1/2
// Social (UCLA): เหงามาก/ปานกลาง/น้อย → 0/1/2
// Environment: เสี่ยงสูง/เฝ้าระวัง/ปกติ → 0/1/2

const RISK_LABEL = [["เสี่ยงสูง", "เฝ้าระวัง", "ปกติ"],
// physical
["ต่ำกว่าคนทั่วไป", "เท่ากับ", "ดีกว่า"],
// mental
["เหงามาก", "ปานกลาง", "เหงาน้อย"],
// social
["เสี่ยงสูง", "เฝ้าระวัง", "ปกติ"] // environ
];
const RISK_COLOR = ["#EF4444", "#F59E0B", "#10B981"];
const genEmployee = (name, idx) => {
  const scores = DIMS_4.map(() => rand(0, 2));
  const highCount = scores.filter(s => s === 0).length;
  // 4 groups: A=3-4มิติ B=2มิติ C=1มิติ D=ไม่มี
  const overallGroup = highCount >= 3 ? "A" : highCount === 2 ? "B" : highCount === 1 ? "C" : "D";
  return {
    id: idx + 1,
    name,
    dept: DEPTS[idx % 3],
    scores,
    highCount,
    overallGroup
  };
};
const employees = _IDP_REAL || NAMES.map((n, i) => genEmployee(n, i));

// ─── Aggregates ───────────────────────────────────────────────────────────────
const GROUP_A = employees.filter(e => e.overallGroup === "A");
const GROUP_B = employees.filter(e => e.overallGroup === "B");
const GROUP_C = employees.filter(e => e.overallGroup === "C");
const GROUP_D = employees.filter(e => e.overallGroup === "D");
const ORG_TYPES = ["นโยบาย", "ปฏิบัติการ", "สนับสนุน"];
const ORG_TYPE_COLORS = {
  "นโยบาย": "#6366F1",
  "ปฏิบัติการ": "#F59E0B",
  "สนับสนุน": "#10B981"
};
const _getOT = e => e.orgType || e.dept || '—';
const orgTypeData = ORG_TYPES.map(ot => {
  const g = employees.filter(e => _getOT(e) === ot);
  return {
    name: ot,
    color: ORG_TYPE_COLORS[ot] || "#9CA3AF",
    count: g.length,
    a: g.filter(e => e.overallGroup === "A").length,
    b: g.filter(e => e.overallGroup === "B").length,
    c: g.filter(e => e.overallGroup === "C").length,
    d: g.filter(e => e.overallGroup === "D").length
  };
});
const GROUP_ROWS = [{
  key: "A",
  label: "กลุ่ม A — เร่งด่วน",
  color: "#EF4444",
  emps: employees.filter(e => e.overallGroup === "A")
}, {
  key: "B",
  label: "กลุ่ม B — ดูแลใกล้ชิด",
  color: "#F97316",
  emps: employees.filter(e => e.overallGroup === "B")
}, {
  key: "C",
  label: "กลุ่ม C — ติดตาม",
  color: "#F59E0B",
  emps: employees.filter(e => e.overallGroup === "C")
}, {
  key: "D",
  label: "กลุ่ม D — ส่งเสริม",
  color: "#10B981",
  emps: employees.filter(e => e.overallGroup === "D")
}];
const AGE_GROUPS = ["≤30 ปี", "31–40 ปี", "41–50 ปี", "51+ ปี"];
const AGE_COLORS = ["#0EA5E9", "#6366F1", "#F59E0B", "#EF4444"];
const ageData = AGE_GROUPS.map((ag, i) => ({
  name: ag,
  color: AGE_COLORS[i],
  count: employees.filter(e => e.ageGroup === ag).length,
  highRisk: employees.filter(e => e.ageGroup === ag && e.overallGroup === "A").length
}));
const genderData = [{
  name: "ชาย",
  icon: "♂",
  color: "#3B82F6",
  count: employees.filter(e => e.gender === "ชาย").length
}, {
  name: "หญิง",
  icon: "♀",
  color: "#EC4899",
  count: employees.filter(e => e.gender === "หญิง").length
}, {
  name: "ไม่ระบุ",
  icon: "—",
  color: "#9CA3AF",
  count: employees.filter(e => !e.gender || e.gender === "").length
}].filter(g => g.count > 0);
const dimStats = DIMS_4.map((d, di) => ({
  ...d,
  high: employees.filter(e => e.scores[di] === 0).length,
  medium: employees.filter(e => e.scores[di] === 1).length,
  low: employees.filter(e => e.scores[di] === 2).length,
  highPct: Math.round(employees.filter(e => e.scores[di] === 0).length / employees.length * 100)
}));
const deptData = DEPTS.map(dept => {
  const g = employees.filter(e => e.dept === dept);
  return {
    name: dept,
    "กลุ่ม A": g.filter(e => e.overallGroup === "A").length,
    "กลุ่ม B": g.filter(e => e.overallGroup === "B").length,
    "กลุ่ม C": g.filter(e => e.overallGroup === "C").length,
    "กลุ่ม D": g.filter(e => e.overallGroup === "D").length
  };
});
const radarData = DIMS_4.map((d, di) => ({
  dim: d.icon + " " + d.label,
  "กลุ่ม A (%)": Math.round(GROUP_A.filter(e => e.scores[di] === 0).length / Math.max(GROUP_A.length, 1) * 100),
  "ทั้งองค์กร (%)": Math.round(employees.filter(e => e.scores[di] === 0).length / employees.length * 100)
}));

// cross-dim: คนที่เสี่ยงทั้ง กาย+ใจ
const crossRisk = [{
  label: "กาย + ใจ",
  count: employees.filter(e => e.scores[0] === 0 && e.scores[1] === 0).length,
  color: "#EF4444"
}, {
  label: "ใจ + สังคม",
  count: employees.filter(e => e.scores[1] === 0 && e.scores[2] === 0).length,
  color: "#F97316"
}, {
  label: "กาย + แวดล้อม",
  count: employees.filter(e => e.scores[0] === 0 && e.scores[3] === 0).length,
  color: "#F59E0B"
}, {
  label: "ใจ + สังคม + กาย",
  count: employees.filter(e => e.scores[0] === 0 && e.scores[1] === 0 && e.scores[2] === 0).length,
  color: "#DC2626"
}];

// ─── Components ───────────────────────────────────────────────────────────────
const Tag = ({
  label,
  color,
  small
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    background: color + "22",
    color,
    border: `1px solid ${color}44`,
    padding: small ? "1px 8px" : "3px 12px",
    borderRadius: 999,
    fontSize: small ? 10 : 12,
    fontWeight: 700,
    fontFamily: "'IBM Plex Sans Thai Looped',sans-serif"
  }
}, label);
const ScoreBar = ({
  value,
  max,
  color,
  height = 8
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height,
    background: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: `${value / max * 100}%`,
    height: "100%",
    background: color,
    borderRadius: 4
  }
}));
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
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif"
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
      marginBottom: 4,
      alignItems: "center"
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
  }, p.value))));
};

// Overall risk badge — 4 groups
const GROUP_CFG = {
  A: {
    label: "กลุ่ม A — เร่งด่วน",
    color: "#EF4444",
    bg: "#FEF2F2",
    emoji: "🔴",
    desc: "เสี่ยงสูง 3-4 มิติ"
  },
  B: {
    label: "กลุ่ม B — ดูแลใกล้ชิด",
    color: "#F97316",
    bg: "#FFF7ED",
    emoji: "🟠",
    desc: "เสี่ยงสูง 2 มิติ"
  },
  C: {
    label: "กลุ่ม C — ติดตาม",
    color: "#F59E0B",
    bg: "#FFFBEB",
    emoji: "🟡",
    desc: "เสี่ยงสูง 1 มิติ"
  },
  D: {
    label: "กลุ่ม D — ส่งเสริม",
    color: "#10B981",
    bg: "#F0FDF4",
    emoji: "🟢",
    desc: "ไม่มีความเสี่ยง"
  }
};

// ─── Main ────────────────────────────────────────────────────────────────────
function ExecutiveSummary() {
  const [tab, setTab] = useState("summary");
  const [filter, setFilter] = useState("all");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const listData = [...employees].sort((a, b) => b.highCount - a.highCount).filter(e => filter === "all" || e.overallGroup === filter);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif",
      background: "#F8FAFC",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#0F172A 0%,#1E3A5F 50%,#1E40AF 100%)",
      padding: "28px 32px 0",
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
      fontSize: 10,
      letterSpacing: 4,
      color: "#93C5FD",
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, "Executive Summary \xB7 \u0E2A\u0E38\u0E02\u0E20\u0E32\u0E27\u0E30\u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23 4 \u0E21\u0E34\u0E15\u0E34"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 24,
      fontWeight: 800,
      lineHeight: 1.2
    }
  }, "\uD83C\uDF3F \u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E27\u0E30\u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#93C5FD",
      marginTop: 6
    }
  }, "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E1A\u0E31\u0E13\u0E11\u0E34\u0E15\u0E1E\u0E31\u0E12\u0E19\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C (NIDA) \xB7 ", employees.length, " \u0E04\u0E19 \xB7 \u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E25\u0E38\u0E21 4 \u0E21\u0E34\u0E15\u0E34")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, dimStats.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    style: {
      background: "rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "10px 14px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.15)",
      backdropFilter: "blur(8px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20
    }
  }, d.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: d.highPct >= 40 ? "#FCA5A5" : d.highPct >= 20 ? "#FCD34D" : "#6EE7B7"
    }
  }, d.highPct, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#93C5FD"
    }
  }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, [{
    key: "summary",
    label: "📊 Executive Summary"
  }, {
    key: "risklist",
    label: "📋 Risk List รวม 4 มิติ"
  }, {
    key: "profile",
    label: "👤 Risk Profile รายบุคคล"
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
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif",
      background: tab === t.key ? "#F8FAFC" : "transparent",
      color: tab === t.key ? "#0F172A" : "rgba(255,255,255,0.65)"
    }
  }, t.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: "0 auto",
      padding: "24px 32px"
    }
  }, tab === "summary" && /*#__PURE__*/React.createElement("div", {
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
      background: "#1E40AF",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: "#0F172A"
    }
  }, "\u0E01\u0E25\u0E38\u0E48\u0E21\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E23\u0E27\u0E21 4 \u0E21\u0E34\u0E15\u0E34"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF"
    }
  }, "A = \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07 3-4 \u0E21\u0E34\u0E15\u0E34 \xB7 B = 1-2 \u0E21\u0E34\u0E15\u0E34 \xB7 C = \u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)",
      borderRadius: 12,
      padding: "14px 20px",
      marginBottom: 16,
      border: "1px solid #BFDBFE",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: "#1D4ED8"
    }
  }, "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23 ", employees.length.toLocaleString(), " \u0E04\u0E19")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr 1.2fr",
      gap: 14
    }
  }, ["A", "B", "C", "D"].map(g => {
    const cfg = GROUP_CFG[g];
    const grp = employees.filter(e => e.overallGroup === g);
    const p = Math.round(grp.length / employees.length * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: g,
      style: {
        background: cfg.bg,
        borderRadius: 14,
        padding: "18px 20px",
        border: `1px solid ${cfg.color}33`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26
      }
    }, cfg.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 30,
        fontWeight: 800,
        color: cfg.color,
        marginTop: 4
      }
    }, grp.length, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 700
      }
    }, "\u0E04\u0E19")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: cfg.color
      }
    }, cfg.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, cfg.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        background: cfg.color + "22",
        borderRadius: 3,
        marginTop: 8,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${p}%`,
        height: "100%",
        background: cfg.color
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        marginTop: 4
      }
    }, p, "% \u0E02\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F9FAFB",
      borderRadius: 14,
      padding: "16px 18px",
      border: "1px solid #E5E7EB"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 4
    }
  }, "\u0E41\u0E22\u0E01\u0E15\u0E32\u0E21 \u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 12
    }
  }, ORG_TYPES.map(ot => /*#__PURE__*/React.createElement("div", {
    key: ot,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: ORG_TYPE_COLORS[ot]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#6B7280"
    }
  }, ot)))), GROUP_ROWS.map(gr => {
    const total = gr.emps.length;
    const segs = ORG_TYPES.map(ot => ({
      ot,
      color: ORG_TYPE_COLORS[ot],
      count: gr.emps.filter(e => _getOT(e) === ot).length
    }));
    return /*#__PURE__*/React.createElement("div", {
      key: gr.key,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: gr.color
      }
    }, gr.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, total, " \u0E04\u0E19")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        height: 14,
        borderRadius: 4,
        overflow: "hidden",
        gap: 1
      }
    }, segs.map(s => s.count > 0 && /*#__PURE__*/React.createElement("div", {
      key: s.ot,
      title: `${s.ot}: ${s.count}`,
      style: {
        flex: s.count,
        background: s.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#fff",
        fontWeight: 700
      }
    }, s.count)))));
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
      gap: 8,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#6366F1",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A"
    }
  }, "\uD83D\uDC65 \u0E01\u0E25\u0E38\u0E48\u0E21\u0E2D\u0E32\u0E22\u0E38")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, ageData.map(ag => /*#__PURE__*/React.createElement("div", {
    key: ag.name
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
  }, ag.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: ag.color
    }
  }, ag.count.toLocaleString(), " \u0E04\u0E19 \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#EF4444"
    }
  }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 A: ", ag.highRisk))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: "#F3F4F6",
      borderRadius: 5,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.round(ag.count / employees.length * 100)}%`,
      height: "100%",
      background: ag.color,
      borderRadius: 5
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#9CA3AF",
      marginTop: 2
    }
  }, Math.round(ag.count / employees.length * 100), "% \u0E02\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"))), ageData.every(a => a.count === 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#9CA3AF"
    }
  }, "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E32\u0E22\u0E38"))), /*#__PURE__*/React.createElement("div", {
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
      gap: 8,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      height: 20,
      background: "#EC4899",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A"
    }
  }, "\u26A7 \u0E40\u0E1E\u0E28")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 20
    }
  }, genderData.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.name,
    style: {
      flex: 1,
      background: g.color + "11",
      borderRadius: 12,
      padding: "16px 20px",
      border: `1px solid ${g.color}33`,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      color: g.color
    }
  }, g.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: g.color,
      marginTop: 4
    }
  }, g.count.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: g.color
    }
  }, g.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginTop: 2
    }
  }, Math.round(g.count / employees.length * 100), "%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      display: "flex",
      borderRadius: 8,
      overflow: "hidden",
      gap: 2
    }
  }, genderData.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.name,
    style: {
      flex: g.count,
      background: g.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#fff",
      fontWeight: 700
    }
  }, Math.round(g.count / employees.length * 100), "%")))))), /*#__PURE__*/React.createElement("div", {
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
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A",
      marginBottom: 20
    }
  }, "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E22\u0E01\u0E23\u0E32\u0E22\u0E21\u0E34\u0E15\u0E34"), dimStats.map(d => {
    const alarm = d.highPct >= 40 ? "สูง" : d.highPct >= 20 ? "ปานกลาง" : "ต่ำ";
    const alarmColor = d.highPct >= 40 ? "#EF4444" : d.highPct >= 20 ? "#F59E0B" : "#10B981";
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      style: {
        background: d.light,
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 12,
        borderLeft: `4px solid ${d.color}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, d.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: "#1F2937"
      }
    }, "\u0E21\u0E34\u0E15\u0E34", d.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#6B7280"
      }
    }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07: ", d.high, " \u0E04\u0E19 \xB7 \u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07: ", d.medium, " \u0E04\u0E19 \xB7 \u0E1B\u0E01\u0E15\u0E34: ", d.low, " \u0E04\u0E19"))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26,
        fontWeight: 800,
        color: d.color
      }
    }, d.highPct, "%"), /*#__PURE__*/React.createElement(Tag, {
      label: `ระดับ${alarm}`,
      color: alarmColor,
      small: true
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        height: 10,
        borderRadius: 5,
        overflow: "hidden",
        gap: 1
      }
    }, [{
      v: d.high,
      c: RISK_COLOR[0]
    }, {
      v: d.medium,
      c: RISK_COLOR[1]
    }, {
      v: d.low,
      c: RISK_COLOR[2]
    }].map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: s.v,
        background: s.c,
        minWidth: s.v > 0 ? 4 : 0
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        marginTop: 6,
        fontSize: 10,
        color: "#9CA3AF"
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD34 \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07 ", d.highPct, "%"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDFE1 \u0E40\u0E1D\u0E49\u0E32\u0E23\u0E30\u0E27\u0E31\u0E07 ", Math.round(d.medium / employees.length * 100), "%"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDFE2 \u0E1B\u0E01\u0E15\u0E34 ", Math.round(d.low / employees.length * 100), "%")));
  })), /*#__PURE__*/React.createElement("div", {
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
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#0F172A",
      marginBottom: 4
    }
  }, "Radar: % \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07\u0E23\u0E32\u0E22\u0E21\u0E34\u0E15\u0E34 \u2014 \u0E01\u0E25\u0E38\u0E48\u0E21 A vs \u0E17\u0E31\u0E49\u0E07\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 8
    }
  }, "\u0E21\u0E34\u0E15\u0E34\u0E17\u0E35\u0E48\u0E01\u0E25\u0E38\u0E48\u0E21 A \u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E21\u0E32\u0E01 = \u0E08\u0E38\u0E14\u0E40\u0E19\u0E49\u0E19 IDP"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 220
  }, /*#__PURE__*/React.createElement(RadarChart, {
    data: radarData
  }, /*#__PURE__*/React.createElement(PolarGrid, {
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(PolarAngleAxis, {
    dataKey: "dim",
    tick: {
      fill: "#6B7280",
      fontSize: 12,
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif"
    }
  }), /*#__PURE__*/React.createElement(PolarRadiusAxis, {
    domain: [0, 100],
    tick: false,
    axisLine: false
  }), /*#__PURE__*/React.createElement(Radar, {
    name: "\u0E01\u0E25\u0E38\u0E48\u0E21 A",
    dataKey: "\u0E01\u0E25\u0E38\u0E48\u0E21 A (%)",
    stroke: "#EF4444",
    fill: "#EF4444",
    fillOpacity: 0.2,
    strokeWidth: 2,
    dot: {
      fill: "#EF4444",
      r: 4
    }
  }), /*#__PURE__*/React.createElement(Radar, {
    name: "\u0E17\u0E31\u0E49\u0E07\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23",
    dataKey: "\u0E17\u0E31\u0E49\u0E07\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23 (%)",
    stroke: "#1E40AF",
    fill: "#1E40AF",
    fillOpacity: 0.08,
    strokeWidth: 1.5,
    strokeDasharray: "4 3",
    dot: {
      fill: "#1E40AF",
      r: 3
    }
  }), /*#__PURE__*/React.createElement(Legend, {
    wrapperStyle: {
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif",
      fontSize: 12
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "#0F172A",
      marginBottom: 4
    }
  }, "\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E02\u0E49\u0E32\u0E21\u0E21\u0E34\u0E15\u0E34"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 14
    }
  }, "\u0E04\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07\u0E43\u0E19\u0E2B\u0E25\u0E32\u0E22\u0E21\u0E34\u0E15\u0E34\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E01\u0E31\u0E19"), crossRisk.map((cr, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: cr.color + "22",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 900,
      color: cr.color,
      flexShrink: 0
    }
  }, cr.count), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "#374151"
    }
  }, cr.label), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: "#F3F4F6",
      borderRadius: 3,
      marginTop: 4,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${cr.count / employees.length * 100}%`,
      height: "100%",
      background: cr.color
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: cr.color,
      fontWeight: 700
    }
  }, Math.round(cr.count / employees.length * 100), "%")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#FEF2F2,#FFF5F5)",
      borderRadius: 16,
      padding: 24,
      border: "1px solid #FECACA"
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
      fontSize: 15,
      fontWeight: 800,
      color: "#991B1B"
    }
  }, "\uD83D\uDEA8 \u0E01\u0E25\u0E38\u0E48\u0E21 A \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E14\u0E39\u0E41\u0E25\u0E40\u0E23\u0E48\u0E07\u0E14\u0E48\u0E27\u0E19 (", GROUP_A.length, " \u0E04\u0E19)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#B91C1C",
      marginTop: 4
    }
  }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07\u0E15\u0E31\u0E49\u0E07\u0E41\u0E15\u0E48 3 \u0E21\u0E34\u0E15\u0E34\u0E02\u0E36\u0E49\u0E19\u0E44\u0E1B \xB7 \u0E04\u0E27\u0E23\u0E08\u0E31\u0E14\u0E17\u0E33 IDP \u0E20\u0E32\u0E22\u0E43\u0E19 2 \u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C")), /*#__PURE__*/React.createElement(Tag, {
    label: `${GROUP_A.length} คน`,
    color: "#EF4444"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10
    }
  }, GROUP_A.map(emp => /*#__PURE__*/React.createElement("div", {
    key: emp.id,
    onClick: () => {
      setSelectedEmp(emp);
      setTab("profile");
    },
    style: {
      background: "#fff",
      borderRadius: 12,
      padding: "12px 16px",
      border: "1px solid #FECACA",
      cursor: "pointer",
      transition: "all 0.15s",
      minWidth: 180
    },
    onMouseEnter: e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.2)",
    onMouseLeave: e => e.currentTarget.style.boxShadow = "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#991B1B"
    }
  }, emp.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 8
    }
  }, emp.dept), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, DIMS_4.map((d, di) => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    title: d.label,
    style: {
      width: 20,
      height: 20,
      borderRadius: 5,
      background: emp.scores[di] === 0 ? d.color : emp.scores[di] === 1 ? d.color + "66" : "#E5E7EB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10
    }
  }, d.icon))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#EF4444",
      marginTop: 6,
      fontWeight: 600
    }
  }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07 ", emp.highCount, " \u0E21\u0E34\u0E15\u0E34 \xB7 \u0E04\u0E25\u0E34\u0E01\u0E14\u0E39 Profile"))), GROUP_A.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#10B981",
      fontWeight: 600
    }
  }, "\u2713 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23\u0E43\u0E19\u0E01\u0E25\u0E38\u0E48\u0E21 A"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A",
      marginBottom: 20
    }
  }, "\uD83D\uDCA1 \u0E41\u0E19\u0E27\u0E17\u0E32\u0E07 IDP \u0E41\u0E19\u0E30\u0E19\u0E33 \u0E41\u0E22\u0E01\u0E15\u0E32\u0E21 4 \u0E01\u0E25\u0E38\u0E48\u0E21"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14
    }
  }, ["A", "B", "C", "D"].map(g => {
    const cfg = GROUP_CFG[g];
    const count = employees.filter(e => e.overallGroup === g).length;
    const idpItems = {
      A: ["พบนักจิตวิทยา / EAP ภายใน 2 สัปดาห์", "ออกแบบ IDP เฉพาะบุคคลทุกมิติที่เสี่ยง", "ติดตามรายเดือน", "Buddy System / Peer Support"],
      B: ["IDP ใน 2 มิติที่เสี่ยงสูง", "กิจกรรมกลุ่มเฉพาะมิติที่เสี่ยง", "ติดตามทุก 6 สัปดาห์", "Workshop เฉพาะด้าน"],
      C: ["IDP ใน 1 มิติที่เสี่ยง", "กิจกรรม Wellness ตามมิติ", "ติดตามทุก 3 เดือน", "กิจกรรมเสริมสุขภาวะ"],
      D: ["กิจกรรม Wellness ทั่วไป", "รักษาระดับสุขภาวะที่ดี", "ประเมินซ้ำทุก 6 เดือน", "Wellness Champion / Mentor"]
    };
    return /*#__PURE__*/React.createElement("div", {
      key: g,
      style: {
        background: cfg.bg,
        borderRadius: 14,
        padding: "18px 18px",
        border: `1px solid ${cfg.color}33`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24
      }
    }, cfg.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: cfg.color,
        fontWeight: 700
      }
    }, count, " \u0E04\u0E19")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 800,
        color: cfg.color,
        marginBottom: 4
      }
    }, cfg.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "#9CA3AF",
        marginBottom: 12
      }
    }, cfg.desc), idpItems[g].map((item, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: cfg.color + "22",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 800,
        color: cfg.color
      }
    }, i + 1)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#374151",
        lineHeight: 1.5
      }
    }, item))));
  })))), tab === "risklist" && /*#__PURE__*/React.createElement("div", {
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
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#6B7280",
      fontWeight: 600
    }
  }, "\u0E01\u0E23\u0E2D\u0E07\u0E01\u0E25\u0E38\u0E48\u0E21:"), [["all", "ทั้งหมด", "#1E40AF"], ["A", "🔴 กลุ่ม A", "#EF4444"], ["B", "🟠 กลุ่ม B", "#F97316"], ["C", "🟡 กลุ่ม C", "#F59E0B"], ["D", "🟢 กลุ่ม D", "#10B981"]].map(([key, label, color]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => setFilter(key),
    style: {
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'IBM Plex Sans Thai Looped',sans-serif",
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
      gridTemplateColumns: "28px 1fr 100px 100px 100px 100px 100px 80px",
      padding: "10px 20px",
      background: "#F9FAFB",
      borderBottom: "1px solid #F3F4F6",
      gap: 8
    }
  }, ["#", "ชื่อ", "หน่วยงาน", "🏃 กาย", "🤍 ใจ", "🤝 สังคม", "🌿 แวดล้อม", "กลุ่ม"].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: "#9CA3AF",
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  }, h))), listData.map((emp, idx) => {
    const cfg = GROUP_CFG[emp.overallGroup];
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => {
        setSelectedEmp(emp);
        setTab("profile");
      },
      style: {
        display: "grid",
        gridTemplateColumns: "28px 1fr 100px 100px 100px 100px 100px 80px",
        padding: "12px 20px",
        gap: 8,
        cursor: "pointer",
        borderBottom: "1px solid #F9FAFB",
        background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
        borderLeft: `3px solid ${cfg.color}`,
        transition: "background 0.15s"
      },
      onMouseEnter: e => e.currentTarget.style.background = "#EFF6FF",
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
    }, emp.dept), DIMS_4.map((d, di) => {
      const score = emp.scores[di];
      const rColor = RISK_COLOR[score];
      return /*#__PURE__*/React.createElement("div", {
        key: d.key,
        style: {
          alignSelf: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          background: rColor + "22",
          color: rColor,
          border: `1px solid ${rColor}44`,
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700
        }
      }, RISK_LABEL[di][score]));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: cfg.color,
        color: "#fff",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800
      }
    }, emp.overallGroup)));
  }))), tab === "profile" && /*#__PURE__*/React.createElement("div", {
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
  }, [...employees].sort((a, b) => b.highCount - a.highCount).map(emp => {
    const cfg = GROUP_CFG[emp.overallGroup];
    const isSelected = selectedEmp?.id === emp.id;
    return /*#__PURE__*/React.createElement("div", {
      key: emp.id,
      onClick: () => setSelectedEmp(emp),
      style: {
        background: isSelected ? cfg.bg : "#fff",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        border: `1px solid ${isSelected ? cfg.color : "#E5E7EB"}`,
        transition: "all 0.15s"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
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
    }, emp.dept)), /*#__PURE__*/React.createElement("span", {
      style: {
        background: cfg.color,
        color: "#fff",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800
      }
    }, emp.overallGroup)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        marginTop: 8
      }
    }, DIMS_4.map((d, di) => /*#__PURE__*/React.createElement("div", {
      key: d.key,
      style: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        background: emp.scores[di] === 0 ? d.color : emp.scores[di] === 1 ? d.color + "66" : "#E5E7EB"
      },
      title: d.label
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: cfg.color,
        marginTop: 4,
        fontWeight: 600
      }
    }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07 ", emp.highCount, " \u0E21\u0E34\u0E15\u0E34"));
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
  }, "\uD83C\uDF3F"), /*#__PURE__*/React.createElement("div", null, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E14\u0E49\u0E32\u0E19\u0E0B\u0E49\u0E32\u0E22\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39 Risk Profile \u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25")) : /*#__PURE__*/React.createElement("div", {
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
      borderTop: `4px solid ${GROUP_CFG[selectedEmp.overallGroup].color}`
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
      fontSize: 20,
      fontWeight: 800,
      color: "#111827"
    }
  }, selectedEmp.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#6B7280"
    }
  }, selectedEmp.dept)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 42,
      fontWeight: 900,
      color: GROUP_CFG[selectedEmp.overallGroup].color
    }
  }, GROUP_CFG[selectedEmp.overallGroup].emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: GROUP_CFG[selectedEmp.overallGroup].color
    }
  }, GROUP_CFG[selectedEmp.overallGroup].label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#9CA3AF"
    }
  }, "\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07 ", selectedEmp.highCount, "/4 \u0E21\u0E34\u0E15\u0E34"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 12
    }
  }, DIMS_4.map((d, di) => {
    const score = selectedEmp.scores[di];
    const rColor = RISK_COLOR[score];
    const idpMap = {
      physical: {
        0: "ตรวจสุขภาพเชิงลึก · โปรแกรมโภชนาการ · ออกกำลังกาย 150 นาที/สัปดาห์",
        1: "ติดตามน้ำหนัก BMI · กระตุ้นกิจกรรมทางกาย",
        2: "รักษาพฤติกรรมสุขภาพที่ดี"
      },
      mental: {
        0: "พบนักจิตวิทยา / EAP · ประเมินซ้ำรายเดือน · Resilience Training",
        1: "Mindfulness · จัดการความเครียด · ติดตามรายไตรมาส",
        2: "กิจกรรม Wellness ทั่วไป"
      },
      social: {
        0: "Buddy System · Peer Support · กลุ่มแบ่งปัน",
        1: "กิจกรรมทีม · Workshop ทักษะสังคม",
        2: "รักษาเครือข่ายสังคมที่มีอยู่"
      },
      environ: {
        0: "ประเมินสภาพแวดล้อม · PPE · ปรับสภาพงาน",
        1: "ติดตามอาการ · ปรับปรุงสภาพแวดล้อม",
        2: "ดูแลสภาพแวดล้อมต่อเนื่อง"
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      style: {
        background: score === 0 ? d.light : score === 1 ? d.light + "88" : "#F9FAFB",
        borderRadius: 12,
        padding: "14px 16px",
        border: `1px solid ${score === 0 ? d.color + "55" : "#E5E7EB"}`,
        borderLeft: `4px solid ${rColor}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20
      }
    }, d.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        background: rColor + "22",
        color: rColor,
        border: `1px solid ${rColor}44`,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700
      }
    }, RISK_LABEL[di][score])), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#1F2937",
        marginBottom: 6
      }
    }, "\u0E21\u0E34\u0E15\u0E34", d.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#6B7280",
        lineHeight: 1.5
      }
    }, "\uD83D\uDCA1 ", idpMap[d.key][score]));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      padding: 22,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 800,
      color: "#0F172A",
      marginBottom: 16
    }
  }, "\uD83D\uDCCB \u0E41\u0E1C\u0E19 IDP \u0E23\u0E27\u0E21 \u2014 ", selectedEmp.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#EFF6FF",
      borderRadius: 10,
      padding: "14px 16px",
      border: "1px solid #BFDBFE"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#1D4ED8",
      marginBottom: 10
    }
  }, "\uD83C\uDFAF \u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E17\u0E35\u0E48\u0E04\u0E27\u0E23\u0E17\u0E33\u0E01\u0E48\u0E2D\u0E19"), selectedEmp.scores.map((s, di) => s === 0 && /*#__PURE__*/React.createElement("div", {
    key: di,
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 8,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      flexShrink: 0
    }
  }, DIMS_4[di].icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#1D4ED8"
    }
  }, "\u0E21\u0E34\u0E15\u0E34", DIMS_4[di].label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#374151"
    }
  }, di === 0 ? "ปรับพฤติกรรมสุขภาพ + ตรวจร่างกาย" : di === 1 ? "พบนักจิตวิทยา + EAP" : di === 2 ? "Buddy System + กลุ่ม Peer Support" : "ประเมินสภาพแวดล้อม + PPE")))), selectedEmp.highCount === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#10B981"
    }
  }, "\u2713 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E21\u0E34\u0E15\u0E34\u0E17\u0E35\u0E48\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E2A\u0E39\u0E07")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F0FDF4",
      borderRadius: 10,
      padding: "14px 16px",
      border: "1px solid #BBF7D0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#15803D",
      marginBottom: 10
    }
  }, "\uD83D\uDCC5 \u0E15\u0E32\u0E23\u0E32\u0E07\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21"), [{
    period: "2 สัปดาห์แรก",
    action: selectedEmp.overallGroup === "A" ? "นัดพบ HR + ผู้เชี่ยวชาญ / EAP ทันที" : selectedEmp.overallGroup === "B" ? "นัดพบ HR + ส่ง IDP แผนเบื้องต้น" : selectedEmp.overallGroup === "C" ? "รับทราบ IDP + เลือกกิจกรรม" : "รับข้อมูล Wellness ทั่วไป",
    color: "#EF4444"
  }, {
    period: "เดือนที่ 1",
    action: selectedEmp.overallGroup === "D" ? "ไม่จำเป็นต้องติดตาม" : "ประเมินความคืบหน้าครั้งแรก",
    color: "#F59E0B"
  }, {
    period: "ไตรมาสที่ 1",
    action: selectedEmp.overallGroup === "D" ? "ไม่จำเป็นต้องติดตาม" : "ทบทวน IDP + ปรับแผน",
    color: "#6366F1"
  }, {
    period: "6 เดือน",
    action: "ประเมินซ้ำด้วยแบบสำรวจ (ทุกกลุ่ม)",
    color: "#10B981"
  }].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: t.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: t.color
    }
  }, t.period, ": "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#374151"
    }
  }, t.action))))))))))));
}

  window.__DASHBOARDS__ = window.__DASHBOARDS__ || {};
  window.__DASHBOARDS__["exec"] = ExecutiveSummary;
})();
