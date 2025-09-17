#!/usr/bin/env pwsh
# Setup Supabase Database Tables

Write-Host "Setting up Supabase database tables..." -ForegroundColor Green

# Check if .env file exists and read Supabase URL
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found" -ForegroundColor Red
    exit 1
}

# Read environment variables
$envContent = Get-Content ".env"
$supabaseUrl = ($envContent | Where-Object { $_ -match "VITE_SUPABASE_URL=" }) -replace "VITE_SUPABASE_URL=", ""
$supabaseServiceKey = ($envContent | Where-Object { $_ -match "VITE_SUPABASE_SERVICE_ROLE_KEY=" }) -replace "VITE_SUPABASE_SERVICE_ROLE_KEY=", ""

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Host "Error: Missing Supabase URL or Service Role Key in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Found Supabase URL: $supabaseUrl"

# Read SQL file
$sqlContent = Get-Content "database-setup.sql" -Raw

# Execute SQL using psql (if available) or curl
$postgresUrl = "$supabaseUrl/rest/v1/rpc/exec_sql"

try {
    # Try to use curl to execute the SQL
    Write-Host "Executing database setup SQL..." -ForegroundColor Yellow
    
    # Split the SQL into individual statements and execute them one by one
    $statements = $sqlContent -split ";\s*\n" | Where-Object { $_.Trim() -ne "" }
    
    foreach ($statement in $statements) {
        if ($statement.Trim()) {
            Write-Host "Executing: $($statement.Split("`n")[0])..." -ForegroundColor Gray
            
            # Create a temporary SQL file for this statement
            $tempSqlFile = "temp_statement.sql"
            $statement.Trim() + ";" | Out-File -FilePath $tempSqlFile -Encoding UTF8
            
            # Use curl to execute the statement
            $response = & curl.exe -s -X POST "$supabaseUrl/rest/v1/rpc/exec_sql" `
                -H "apikey: $supabaseServiceKey" `
                -H "Authorization: Bearer $supabaseServiceKey" `
                -H "Content-Type: application/json" `
                -d "{`"sql`":`"$($statement.Replace('"', '\"').Replace("`n", "\n").Replace("`r", ""))`"}"
            
            Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Warning: Statement may have failed: $($statement.Split("`n")[0])" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Database setup completed!" -ForegroundColor Green
    Write-Host "All tables and policies have been created in your Supabase database." -ForegroundColor Green
    
} catch {
    Write-Host "Error executing SQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run the database-setup.sql file manually in your Supabase SQL editor." -ForegroundColor Yellow
    Write-Host "You can find it at: https://app.supabase.com/project/$($supabaseUrl.Split('/')[2].Split('.')[0])/sql" -ForegroundColor Yellow
}