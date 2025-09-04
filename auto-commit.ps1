# ファイルの変更を自動的に監視してGitにコミットするスクリプト
# 使用方法: .\auto-commit.ps1

Write-Host "ファイルの自動監視を開始します..." -ForegroundColor Green
Write-Host "Ctrl+C で停止できます" -ForegroundColor Yellow

# 監視対象のディレクトリ
$watchPath = Get-Location

# ファイル変更イベントを監視
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchPath
$watcher.Filter = "*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# 変更イベントのハンドラー
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] $changeType: $path" -ForegroundColor Cyan
    
    # 少し待ってからGit操作を実行（ファイルの書き込み完了を待つ）
    Start-Sleep -Seconds 2
    
    try {
        # Gitの状態を確認
        $status = git status --porcelain
        
        if ($status) {
            Write-Host "変更を検出しました。Gitに反映します..." -ForegroundColor Yellow
            
            # 変更されたファイルをステージング
            git add .
            
            # コミット
            $commitMessage = "Auto-commit: $changeType - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage
            
            Write-Host "コミット完了: $commitMessage" -ForegroundColor Green
            
            # リモートリポジトリにプッシュ（オプション）
            # git push origin master
        }
    }
    catch {
        Write-Host "エラーが発生しました: $_" -ForegroundColor Red
    }
}

# イベントを登録
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

Write-Host "監視中... ファイルの変更を検出すると自動的にコミットされます" -ForegroundColor Green

try {
    # スクリプトを実行し続ける
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # クリーンアップ
    Write-Host "`n監視を停止しています..." -ForegroundColor Yellow
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
    Write-Host "監視を停止しました" -ForegroundColor Green
}
