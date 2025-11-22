@echo off
echo ========================================
echo   Bell24h AI Agent - Auto Deploy
echo ========================================
echo.
echo This will push your fixes to GitHub and deploy to Vercel
echo.
pause

cd /d "%~dp0"

echo.
echo [1/4] Checking git status...
git status

echo.
echo [2/4] Adding all files...
git add .

echo.
echo [3/4] Committing changes...
git commit -m "fix: ES module imports with .js extensions for Vercel"

echo.
echo [4/4] Pushing to GitHub...
echo NOTE: You may be asked to sign in to GitHub
git push -u origin main --force

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Vercel will auto-deploy in 1-2 minutes.
echo.
echo Test your site at: https://freelancer-work.vercel.app
echo.
pause
