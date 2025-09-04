@echo off
echo シンプル自動コミットスクリプト
echo ================================
echo.

:loop
echo ファイルの変更をチェック中...
git add .
git status --porcelain > temp_status.txt

if %errorlevel% neq 0 (
    echo Gitコマンドでエラーが発生しました
    pause
    exit /b 1
)

for %%i in (temp_status.txt) do (
    if %%~zi gtr 0 (
        echo 変更を検出しました！
        echo コミット中...
        git commit -m "Auto-commit: %date% %time%"
        echo プッシュ中...
        git push origin master
        echo 完了！
    ) else (
        echo 変更はありません
    )
)

del temp_status.txt
echo.
echo 30秒後に再チェックします...
timeout /t 30 /nobreak > nul
goto loop
