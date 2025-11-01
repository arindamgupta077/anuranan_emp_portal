# Quick Start Script for Anuranan Employee Portal

Write-Host "🚀 Starting Anuranan Employee Portal Setup..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local created from .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your Supabase credentials!" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your Supabase URL and API key" -ForegroundColor White
Write-Host "2. Run database scripts in Supabase SQL Editor (see supabase/README.md)" -ForegroundColor White
Write-Host "3. Create your CEO user in Supabase" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""
