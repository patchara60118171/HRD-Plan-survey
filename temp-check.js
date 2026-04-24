const fs = require('fs');

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

`;

let full = HEADER + code;
console.log('Lines in code after clean:', code.split('\n').length);
console.log('Lines after HEADER:', full.split('\n').length);
console.log('Last 5 lines of full:');
console.log(full.split('\n').slice(-5).join('\n'));
