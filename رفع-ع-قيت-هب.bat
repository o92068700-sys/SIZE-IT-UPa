@echo off
chcp 65001 >nul
title SizIQ — رفع عالـ GitHub
cd /d "%~dp0"
set GIT=C:\Program Files\Git\bin\git.exe

echo.
echo === حالة التعديلات ===
"%GIT%" status -s
echo.

set "MSG="
set /p MSG=اكتب وصف التعديل واضغط Enter (Enter فاضي = "تحديث"): 
if "%MSG%"=="" set "MSG=Update"

"%GIT%" add -A
"%GIT%" commit -m "%MSG%" 2>nul
if errorlevel 1 (
    echo.
    echo ما في تعديلات جديدة للرفع.
) else (
    echo.
    echo جاري الرفع...
    "%GIT%" push
    if errorlevel 1 (
        echo.
        echo انرفض الرفع - في نسخة أحدث عالـ GitHub. بجرب pull ثم push...
        "%GIT%" pull --rebase
        "%GIT%" push
    )
)

echo.
echo خلصت. بعد دقيقة-دقيقتين بينحدث الموقع عالـ Netlify لحاله.
echo.
pause
