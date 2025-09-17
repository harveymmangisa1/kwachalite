# PowerShell script to securely update .env file with Supabase credentials
Write-Host "KwachaLite - Environment Setup" -ForegroundColor Green
Write-Host "This script will help you update your .env file with Supabase credentials." -ForegroundColor Yellow
Write-Host ""

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "Error: .env file not found in current directory!" -ForegroundColor Red
    exit 1
}

Write-Host "Please enter your Supabase credentials:" -ForegroundColor Cyan
Write-Host ""

# Prompt for Supabase URL
do {
    $supabaseUrl = Read-Host "Enter your Supabase Project URL (starts with https://)"
    if ($supabaseUrl -notmatch "^https://.*\.supabase\.co$") {
        Write-Host "Please enter a valid Supabase URL (should start with https:// and end with .supabase.co)" -ForegroundColor Red
    }
} while ($supabaseUrl -notmatch "^https://.*\.supabase\.co$")

# Prompt for Anon Key
do {
    $anonKey = Read-Host "Enter your Supabase Anon/Public Key (starts with eyJ)"
    if ($anonKey -notmatch "^eyJ") {
        Write-Host "Please enter a valid Anon Key (should start with eyJ)" -ForegroundColor Red
    }
} while ($anonKey -notmatch "^eyJ")

# Prompt for Service Role Key
do {
    $serviceKey = Read-Host "Enter your Supabase Service Role Key (starts with eyJ)"
    if ($serviceKey -notmatch "^eyJ") {
        Write-Host "Please enter a valid Service Role Key (should start with eyJ)" -ForegroundColor Red
    }
} while ($serviceKey -notmatch "^eyJ")

Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Yellow

# Read current .env file
$envContent = Get-Content ".env"

# Replace the placeholder values
$updatedContent = $envContent | ForEach-Object {
    if ($_ -match "^VITE_SUPABASE_URL=") {
        "VITE_SUPABASE_URL=$supabaseUrl"
    } elseif ($_ -match "^VITE_SUPABASE_ANON_KEY=") {
        "VITE_SUPABASE_ANON_KEY=$anonKey"
    } elseif ($_ -match "^VITE_SUPABASE_SERVICE_ROLE_KEY=") {
        "VITE_SUPABASE_SERVICE_ROLE_KEY=$serviceKey"
    } else {
        $_
    }
}

# Write updated content back to .env file
$updatedContent | Set-Content ".env"

Write-Host ""
Write-Host "✓ .env file updated successfully!" -ForegroundColor Green
Write-Host "Your Supabase credentials have been configured." -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Security Note: Keep your .env file secure and never commit it to version control!" -ForegroundColor Yellow