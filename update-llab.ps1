# Update LLAB Content and Deploy
# This script simplifies updating LLAB content and deploying to Render

Write-Host "📚 Updating LLAB Content..." -ForegroundColor Cyan

# Check if there are any changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ No changes detected. Everything is up to date!" -ForegroundColor Green
    exit 0
}

# Show what changed
Write-Host "`n📝 Changes detected:" -ForegroundColor Yellow
git status --short

# Prompt for commit message
Write-Host "`n💬 Enter a commit message (or press Enter for default):" -ForegroundColor Cyan
$commitMessage = Read-Host
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update LLAB content"
}

# Git operations
Write-Host "`n🔄 Committing changes..." -ForegroundColor Cyan
git add .
git commit -m $commitMessage

Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Done! Render will automatically deploy your changes." -ForegroundColor Green
Write-Host "⏱️  Deployment typically takes 2-5 minutes." -ForegroundColor Yellow
Write-Host "🔗 Monitor at: https://dashboard.render.com" -ForegroundColor Blue
