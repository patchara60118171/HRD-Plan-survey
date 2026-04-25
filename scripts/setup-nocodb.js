#!/usr/bin/env node

/**
 * NocoDB Setup Script for Well-being Survey
 * 
 * This script helps you configure NocoDB to work with your Supabase database.
 * 
 * Usage: node scripts/setup-nocodb.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up NocoDB for Well-being Survey...\n');

// 1. Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
    console.error('❌ .env.local not found!');
    console.log('Please copy .env.example to .env.local and fill in your Supabase credentials.');
    process.exit(1);
}

// 2. Read DATABASE_URL from .env.local
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=([^\r\n]+)/);
if (!dbUrlMatch) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
}

const databaseUrl = dbUrlMatch[1];
console.log('✅ Found DATABASE_URL in .env.local');

// 3. Update .env.nocodb with the actual DATABASE_URL
const nocodbEnvPath = path.join(process.cwd(), '.env.nocodb');
let nocodbEnvContent = fs.readFileSync(nocodbEnvPath, 'utf8');
nocodbEnvContent = nocodbEnvContent.replace(
    /DATABASE_URL=postgresql:\/\/postgres:\[YOUR-PASSWORD\]@db\.xxxxxxxxxxxxx\.supabase\.co:5432\/postgres/,
    `DATABASE_URL=${databaseUrl}`
);
fs.writeFileSync(nocodbEnvPath, nocodbEnvContent);
console.log('✅ Updated .env.nocodb with your DATABASE_URL');

// 4. Instructions
console.log('\n📋 Next Steps:');
console.log('1. Make sure Docker Desktop is running');
console.log('2. Start NocoDB with: docker compose up -d');
console.log('3. Open http://localhost:8080 in your browser');
console.log('4. Login with: admin@wellbeing.local / admin123');
console.log('5. Create a new project → "Connect to External DB"');
console.log('6. Use the DATABASE_URL from .env.local');
console.log('\n🎉 NocoDB will connect to your Supabase and show all tables in spreadsheet format!');

// 5. Offer to start Docker
console.log('\n🤖 Want me to start Docker for you? (Docker Desktop must be running first)');
console.log('Run: docker compose up -d');
