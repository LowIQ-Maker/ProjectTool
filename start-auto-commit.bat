@echo off
echo ファイルの自動監視を開始します...
echo ファイルを変更すると自動的にGitにコミットされます
echo.
echo 停止するには、このウィンドウを閉じてください
echo.
powershell -ExecutionPolicy Bypass -File "auto-commit.ps1"
pause
