const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve('.');

// Must use resolved babel
const babel = require(require.resolve('@babel/core', { paths: [ROOT_DIR] }));

const raw = fs.readFileSync('idp-dashboard/dashboards/exec.jsx', 'utf8');
let code = raw
  .replace(/\/\* auto-generated[\s\S]*?\*\//, '')
  .replace(/const\s*\{\s*useState[^}]+\}\s*=\s*React;?\s*\n?/g, '')
  .replace(/const\s*\{[\s\S]*?\}\s*=\s*Recharts;?\s*\n?/, '')
  .replace(/window\.__DASHBOARDS__[^;]+;\s*window\.__DASHBOARDS__\[[^\]]+\]\s*=\s*[^;]+;/, '')
  .trim();

const HEADER = `(function () {
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

`;

const compileInput = HEADER + code;

try {
  const result = babel.transformSync(compileInput, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    filename: 'exec.js',
    babelrc: false,
    configFile: false,
  });
  console.log('Success! Lines:', result.code.split('\n').length);
  console.log('Last 10 lines:');
  console.log(result.code.split('\n').slice(-10).join('\n'));
} catch (e) {
  console.error('Error:', e.message);
  console.error('At line:', e.loc?.line, 'col:', e.loc?.column);
  // Show context
  const lines = compileInput.split('\n');
  if (e.loc?.line) {
    console.error('Context around error:');
    console.error(lines.slice(Math.max(0, e.loc.line-3), e.loc.line+2).join('\n'));
  }
}
