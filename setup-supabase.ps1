#!/usr/bin/env pwsh
# =============================================
# Supabase Setup Script for Windows PowerShell
# ตรวจสอบและตั้งค่า Supabase สำหรับระบบ Well-being Survey
# =============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase Setup & Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if npx is available
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npx not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ npx found" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is linked
Write-Host "Checking Supabase connection..." -ForegroundColor Yellow
$linkStatus = npx supabase link --project-ref fgdommhiqhzvsedfzyrr 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connected to Supabase project" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Could not verify connection" -ForegroundColor Yellow
}
Write-Host ""

# Run migrations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Database Migrations..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$migrations = @(
    "supabase/migrations/20250303_update_schema_v3.sql",
    "supabase/migrations/20250305_update_schema_v4.sql",
    "supabase/setup-database.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "Running: $migration" -ForegroundColor Yellow
        # Note: This requires Supabase CLI to be properly configured
        # You may need to run these manually in Supabase SQL Editor
        Write-Host "  → Please run this file manually in Supabase SQL Editor" -ForegroundColor Cyan
    } else {
        Write-Host "⚠ Not found: $migration" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Steps Required:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/fgdommhiqhzvsedfzyrr" -ForegroundColor White
Write-Host ""
Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "3. Run these files in order:" -ForegroundColor White
Write-Host "   a) supabase/migrations/20250303_update_schema_v3.sql" -ForegroundColor Yellow
Write-Host "   b) supabase/migrations/20250305_update_schema_v4.sql" -ForegroundColor Yellow
Write-Host "   c) supabase/setup-database.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Verify Storage:" -ForegroundColor White
Write-Host "   - Go to Storage section" -ForegroundColor White
Write-Host "   - Check 'hrd-documents' bucket exists" -ForegroundColor White
Write-Host "   - Verify it allows PDF files up to 5MB" -ForegroundColor White
Write-Host ""
Write-Host "5. Verify Policies:" -ForegroundColor White
Write-Host "   - Go to Authentication > Policies" -ForegroundColor White
Write-Host "   - Check RLS policies for hrd_ch1_responses table" -ForegroundColor White
Write-Host "   - Check storage.objects policies" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Test Commands:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test file upload:" -ForegroundColor White
Write-Host "  npx serve" -ForegroundColor Yellow
Write-Host "  Open: http://localhost:3000/ch1.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test admin dashboard:" -ForegroundColor White
Write-Host "  Open: http://localhost:3000/admin.html" -ForegroundColor Yellow
Write-Host "  Login with your admin credentials" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup guide completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
