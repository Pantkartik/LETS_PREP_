# Competition System Setup Script

Write-Host "🏆 Setting up Classroom-Based Competition System..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCLI) {
    Write-Host "⚠️  Supabase CLI not found. Please install it first:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📋 Setup Steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣  Run SQL Migrations in Supabase Dashboard" -ForegroundColor White
Write-Host "   - Go to: https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   - Navigate to: SQL Editor" -ForegroundColor Gray
Write-Host ""
Write-Host "   Execute these files in order:" -ForegroundColor Yellow
Write-Host "   a) Frontend/supabase/classrooms.sql" -ForegroundColor Cyan
Write-Host "   b) Frontend/supabase/competitions_schema.sql" -ForegroundColor Cyan
Write-Host ""

Write-Host "2️⃣  Set Your Account as Teacher" -ForegroundColor White
Write-Host "   Run this SQL command (replace with your email):" -ForegroundColor Gray
Write-Host ""
Write-Host "   UPDATE profiles SET role = 'TEACHER' WHERE email = 'your-email@example.com';" -ForegroundColor Yellow
Write-Host ""

Write-Host "3️⃣  Backend Dependencies (Already Installed ✅)" -ForegroundColor White
Write-Host "   - express" -ForegroundColor Gray
Write-Host "   - @supabase/supabase-js" -ForegroundColor Gray
Write-Host "   - uuid" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Environment Variables" -ForegroundColor White
Write-Host "   Ensure Backend/.env has:" -ForegroundColor Gray
Write-Host "   - SUPABASE_URL" -ForegroundColor Cyan
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
Write-Host ""

Write-Host "5️⃣  Test the System" -ForegroundColor White
Write-Host "   a) Login as teacher" -ForegroundColor Gray
Write-Host "   b) Navigate to /classes" -ForegroundColor Gray
Write-Host "   c) Click on a classroom" -ForegroundColor Gray
Write-Host "   d) Click 'Create Competition'" -ForegroundColor Gray
Write-Host "   e) Select 4 problems" -ForegroundColor Gray
Write-Host "   f) Create and start!" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Note about Code Execution:" -ForegroundColor Yellow
Write-Host "   - Docker is NOT installed on this system" -ForegroundColor Gray
Write-Host "   - Using local execution (requires Python, Node.js, g++, Java)" -ForegroundColor Gray
Write-Host "   - For production, install Docker Desktop for better security" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 Quick Links:" -ForegroundColor Green
Write-Host "   - Implementation Guide: COMPETITION_IMPLEMENTATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "   - Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Backend server is already running!" -ForegroundColor Green
Write-Host "✅ Frontend is already running!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Next: Run the SQL migrations in Supabase Dashboard" -ForegroundColor Magenta
Write-Host ""

# Offer to open files
$openFiles = Read-Host "Would you like to open the SQL files? (y/n)"
if ($openFiles -eq 'y') {
    $classroomsSql = "Frontend\supabase\classrooms.sql"
    $competitionsSql = "Frontend\supabase\competitions_schema.sql"
    
    if (Test-Path $classroomsSql) {
        Start-Process notepad $classroomsSql
    }
    if (Test-Path $competitionsSql) {
        Start-Process notepad $competitionsSql
    }
    
    Write-Host "📂 SQL files opened in Notepad" -ForegroundColor Green
    Write-Host "   Copy and paste into Supabase SQL Editor" -ForegroundColor Gray
}

Write-Host ""
Write-Host "💡 Tip: Check COMPETITION_IMPLEMENTATION_GUIDE.md for detailed instructions" -ForegroundColor Cyan
