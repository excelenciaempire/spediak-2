# Setup script for Spediak app (PowerShell version)

Write-Host "Setting up Spediak application..." -ForegroundColor Green

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location -Path ./backend
npm install
Set-Location -Path ..

# Copy environment file if it doesn't exist
if (-not (Test-Path -Path ./backend/.env)) {
    Write-Host "Creating .env file for backend..." -ForegroundColor Cyan
    Copy-Item -Path ./backend/.env.example -Destination ./backend/.env
    Write-Host "Please update the JWT_SECRET in ./backend/.env with a secure random string" -ForegroundColor Yellow
}

Write-Host "Setup complete! You can now run the app with:" -ForegroundColor Green
Write-Host "npm run dev" -ForegroundColor White -BackgroundColor DarkGreen 