@echo off
echo ========================================
echo    Skrash Game Setup Script
echo ========================================
echo.

echo Installing server dependencies...
npm install

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To start the game:
echo.
echo Terminal 1 (Backend):
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   npm run client
echo.
echo Or for production:
echo   npm run build
echo   npm start
echo.
echo ========================================
pause
