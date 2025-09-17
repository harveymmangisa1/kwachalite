# PowerShell script to check database setup
Write-Host "KwachaLite - Database Check" -ForegroundColor Green
Write-Host "This script will help you verify your database setup." -ForegroundColor Yellow
Write-Host ""

# Check if .env file exists and has Supabase credentials
if (!(Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please make sure you have configured your environment variables." -ForegroundColor Yellow
    exit 1
}

# Read Supabase URL from env file
$envContent = Get-Content ".env.local"
$supabaseUrl = ""
$supabaseKey = ""

foreach ($line in $envContent) {
    if ($line -match "^VITE_SUPABASE_URL=(.+)$") {
        $supabaseUrl = $matches[1]
    }
    if ($line -match "^VITE_SUPABASE_ANON_KEY=(.+)$") {
        $supabaseKey = $matches[1]
    }
}

if ($supabaseUrl -eq "" -or $supabaseKey -eq "") {
    Write-Host "❌ Supabase credentials not found in .env.local!" -ForegroundColor Red
    Write-Host "Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found with Supabase credentials" -ForegroundColor Green
Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host ""

# Check if migration files exist
Write-Host "Checking migration files..." -ForegroundColor Yellow

if (!(Test-Path "supabase\migrations\001_initial_schema.sql")) {
    Write-Host "❌ Initial schema migration not found!" -ForegroundColor Red
} else {
    Write-Host "✅ Initial schema migration found" -ForegroundColor Green
}

if (!(Test-Path "supabase\migrations\002_add_user_metadata.sql")) {
    Write-Host "❌ User metadata migration not found!" -ForegroundColor Red
} else {
    Write-Host "✅ User metadata migration found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have run the migration files in your Supabase dashboard" -ForegroundColor White
Write-Host "   - Go to: https://app.supabase.com/project/_/sql" -ForegroundColor White
Write-Host "   - Run the contents of supabase\migrations\001_initial_schema.sql" -ForegroundColor White
Write-Host "   - Run the contents of supabase\migrations\002_add_user_metadata.sql" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "3. Go to Settings > Business workspace and test the database connection" -ForegroundColor White
Write-Host ""

# Test basic connectivity (if curl is available)
try {
    $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Headers @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
    } -Method GET -TimeoutSec 10

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Basic connectivity to Supabase confirmed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not test basic connectivity (this is normal)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Database check complete!" -ForegroundColor Green