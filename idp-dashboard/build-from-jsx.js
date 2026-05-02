#!/usr/bin/env node
/**
 * Build: Compile .jsx files in dashboards/ → .js (no JSX, browser-ready)
 *
 * Usage: node "idp-dashboard/build-from-jsx.js"
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DASHBOARDS_DIR = path.join(__dirname, 'dashboards');

// Files to compile (key matches the dashboard key used in index.html)
const FILES = [
  { key: 'env',      file: 'env.jsx',      component: 'EnvDashboard' },
  { key: 'physical', file: 'physical.jsx', component: 'PhysicalDashboard' },
  { key: 'tmhi',     file: 'tmhi.jsx',     component: 'TMHIDashboard' },
  { key: 'ucla',     file: 'ucla.jsx',     component: 'UCLADashboard' },
  { key: 'exec',     file: 'exec.jsx',     component: 'ExecutiveSummary' },
];

// ── Ensure Babel is available ──
function ensureBabel() {
  try {
    require.resolve('@babel/core', { paths: [ROOT_DIR] });
    require.resolve('@babel/preset-react', { paths: [ROOT_DIR] });
  } catch {
    console.log('⟳ installing @babel/core + @babel/preset-react (no-save)…');
    execSync('npm install --no-save --silent @babel/core @babel/preset-react', {
      cwd: ROOT_DIR, stdio: 'inherit'
    });
  }
}
ensureBabel();
const babel = require(require.resolve('@babel/core', { paths: [ROOT_DIR] }));

const HEADER = `/* auto-generated from .jsx – do not edit */
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

`;

const FOOTER = (key, component) => `

  window.__DASHBOARDS__ = window.__DASHBOARDS__ || {};
  window.__DASHBOARDS__[${JSON.stringify(key)}] = ${component};
})();
`;

for (const f of FILES) {
  const inputPath = path.join(DASHBOARDS_DIR, f.file);
  if (!fs.existsSync(inputPath)) {
    console.log('⚠ skip (not found):', f.file);
    continue;
  }
  
  const raw = fs.readFileSync(inputPath, 'utf8');
  
  // Remove the old header/footer patterns if present
  // Also remove duplicate React/Recharts declarations that are in HEADER
  let code = raw
    .replace(/\/\* auto-generated[\s\S]*?\*\//, '')
    .replace(/const\s*\{\s*useState,\s*useMemo,\s*useEffect,\s*useRef,\s*Fragment\s*\}\s*=\s*React;?\s*\n?/g, '')
    .replace(/const\s*\{[\s\S]*?\}\s*=\s*Recharts;?\s*\n?/, '')
    .replace(/window\.__DASHBOARDS__\s*=\s*window\.__DASHBOARDS__\s*\|\|\s*\{\};[\s\S]*$/, '')
    .trim();
  
  // Compile JSX first (before wrapping with IIFE)
  const { code: compiled } = babel.transformSync(code, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    filename: f.key + '.js',
    babelrc: false,
    configFile: false,
  });
  
  // Wrap with IIFE after compilation
  const final = HEADER + compiled.trim() + FOOTER(f.key, f.component);
  
  const outputPath = path.join(DASHBOARDS_DIR, f.key + '.js');
  fs.writeFileSync(outputPath, final, 'utf8');
  console.log('✔', f.file, '→', f.key + '.js (' + Math.round(final.length / 1024) + ' KB)');
}

// Generate manifest
const manifest = JSON.stringify(
  FILES.filter(f => fs.existsSync(path.join(DASHBOARDS_DIR, f.file)))
       .map(f => ({ key: f.key, title: f.key, file: f.key + '.js' })),
  null, 2
);
fs.writeFileSync(path.join(DASHBOARDS_DIR, 'manifest.json'), manifest);
console.log('✔ manifest.json');
