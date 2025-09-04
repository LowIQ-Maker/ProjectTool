class TimeTrackerView {
    constructor() {
        this.timeTracker = new TimeTracker();
        this.activeTimers = new Map();
        this.updateInterval = null;
        this.currentView = 'active'; // 'active', 'history', 'summary'
        this.weeklyChart = null;
        // init()は外部から呼び出されるため、コンストラクタでは呼ばない
    }

    init() {
        try {
            console.log('TimeTrackerView.init: 開始');
            console.log('TimeTrackerView.init: TimeTrackerインスタンス:', this.timeTracker);
            console.log('TimeTrackerView.init: アクティブタイマー数:', this.timeTracker.getActiveTimers().length);
            console.log('TimeTrackerView.init: 時間エントリ数:', this.timeTracker.timeEntries.length);
            this.render();
            this.bindEvents();
            this.startUpdateTimer();
            console.log('TimeTrackerView.init: 完了');
        } catch (error) {
            console.error('TimeTrackerView.init: エラーが発生しました:', error);
        }
    }

    render() {
        const container = document.getElementById('time-tracking');
        if (!container) {
            console.error('TimeTrackerView: time-trackingコンテナが見つかりません');
            return;
        }

        try {
            console.log('TimeTrackerView.render: 開始');
            console.log('TimeTrackerView.render: TimeTrackerインスタンス:', this.timeTracker);
            console.log('TimeTrackerView.render: アクティブタイマー数:', this.timeTracker.getActiveTimers().length);
            console.log('TimeTrackerView.render: 時間エントリ数:', this.timeTracker.timeEntries.length);
            
            container.innerHTML = `
                <div class="time-tracking-header">
                    <h2><i class="fas fa-clock"></i> タイムトラッキング</h2>
                    <div class="view-tabs">
                        <button class="tab-btn ${this.currentView === 'active' ? 'active' : ''}" data-view="active">
                            <i class="fas fa-play"></i> アクティブタイマー
                        </button>
                        <button class="tab-btn ${this.currentView === 'history' ? 'active' : ''}" data-view="history">
                            <i class="fas fa-history"></i> 履歴
                        </button>
                        <button class="tab-btn ${this.currentView === 'summary' ? 'active' : ''}" data-view="summary">
                            <i class="fas fa-chart-bar"></i> サマリー
                        </button>
                    </div>
                </div>

                <div class="time-tracking-content">
                    ${this.renderActiveTimers()}
                    ${this.renderHistory()}
                    ${this.renderSummary()}
                </div>

                <div class="time-tracking-actions">
                    <button id="export-time-data" class="btn btn-secondary">
                        <i class="fas fa-download"></i> エクスポート
                    </button>
                    <button id="import-time-data" class="btn btn-secondary">
                        <i class="fas fa-upload"></i> インポート
                    </button>
                    <button id="clear-time-data" class="btn btn-danger">
                        <i class="fas fa-trash"></i> データクリア
                    </button>
                </div>

                <input type="file" id="time-data-file-input" accept=".json,.csv" style="display: none;">
            `;

            this.showCurrentView();
            console.log('TimeTrackerView.render: 完了');
        } catch (error) {
            console.error('TimeTrackerView.render: エラーが発生しました:', error);
            container.innerHTML = '<p class="error">タイムトラッキングの表示に失敗しました</p>';
        }
    }

    renderActiveTimers() {
        try {
            console.log('TimeTrackerView.renderActiveTimers: 開始');
            console.log('TimeTrackerView.renderActiveTimers: TimeTrackerインスタンス:', this.timeTracker);
            const activeTimers = this.timeTracker.getActiveTimers();
            console.log('TimeTrackerView.renderActiveTimers: アクティブタイマー数:', activeTimers.length);
            console.log('TimeTrackerView.renderActiveTimers: アクティブタイマー詳細:', activeTimers);
            
            if (activeTimers.length === 0) {
                return `
                    <div id="active-timers-view" class="view-pane">
                        <div class="no-active-timers">
                            <i class="fas fa-clock"></i>
                            <p>現在アクティブなタイマーはありません</p>
                            <p>タスク一覧からタイマーを開始してください</p>
                        </div>
                    </div>
                `;
            }

            return `
                <div id="active-timers-view" class="view-pane">
                    <div class="active-timers-list">
                        ${activeTimers.map(timer => `
                            <div class="timer-card" data-task-id="${timer.taskId}">
                                <div class="timer-header">
                                    <h3>${timer.taskName || '不明なタスク'}</h3>
                                    <div class="timer-status running">
                                        <i class="fas fa-play"></i> 実行中
                                    </div>
                                </div>
                                <div class="timer-display">
                                    <div class="elapsed-time" data-task-id="${timer.taskId}">
                                        ${this.timeTracker.formatTime(this.timeTracker.getElapsedTime(timer.taskId))}
                                    </div>
                                    <div class="timer-controls">
                                        <button class="btn btn-sm btn-warning pause-timer" data-task-id="${timer.taskId}">
                                            <i class="fas fa-pause"></i> 一時停止
                                        </button>
                                        <button class="btn btn-sm btn-danger stop-timer" data-task-id="${timer.taskId}">
                                            <i class="fas fa-stop"></i> 停止
                                        </button>
                                    </div>
                                </div>
                                <div class="timer-info">
                                    <small>開始時刻: ${timer.startTime ? timer.startTime.toLocaleTimeString() : '不明'}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('TimeTrackerView.renderActiveTimers: エラーが発生しました:', error);
            return `
                <div id="active-timers-view" class="view-pane">
                    <div class="error">
                        <p>アクティブタイマーの表示に失敗しました</p>
                    </div>
                </div>
            `;
        }
    }

    renderHistory() {
        try {
            console.log('TimeTrackerView.renderHistory: 開始');
            console.log('TimeTrackerView.renderHistory: TimeTrackerインスタンス:', this.timeTracker);
            const timeEntries = this.timeTracker.timeEntries || [];
            console.log('TimeTrackerView.renderHistory: 時間エントリ数:', timeEntries.length);
            console.log('TimeTrackerView.renderHistory: 時間エントリ詳細:', timeEntries);
            const recentEntries = timeEntries
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .slice(0, 50);

            console.log('TimeTrackerView.renderHistory: 履歴エントリ数:', recentEntries.length);

            return `
                <div id="history-view" class="view-pane">
                    <div class="history-filters">
                        <input type="date" id="history-date-filter" class="form-control">
                        <select id="history-task-filter" class="form-control">
                            <option value="">すべてのタスク</option>
                            ${this.getUniqueTaskOptions()}
                        </select>
                    </div>
                    
                    <div class="time-entries-list">
                        ${recentEntries.length === 0 ? `
                            <div class="no-entries">
                                <i class="fas fa-history"></i>
                                <p>時間記録がありません</p>
                            </div>
                        ` : recentEntries.map(entry => `
                            <div class="time-entry-card" data-entry-id="${entry.id}">
                                <div class="entry-header">
                                    <h4>${entry.taskName || '不明なタスク'}</h4>
                                    <div class="entry-actions">
                                        <button class="btn btn-sm btn-outline edit-entry" data-entry-id="${entry.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-entry" data-entry-id="${entry.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="entry-details">
                                    <div class="entry-time">
                                        <span class="label">時間:</span>
                                        <span class="value">${this.timeTracker.formatTime(entry.duration || 0)}</span>
                                    </div>
                                    <div class="entry-period">
                                        <span class="label">期間:</span>
                                        <span class="value">
                                            ${entry.startTime ? new Date(entry.startTime).toLocaleString() : '不明'} - 
                                            ${entry.endTime ? new Date(entry.endTime).toLocaleString() : '不明'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('TimeTrackerView.renderHistory: エラーが発生しました:', error);
            return `
                <div id="history-view" class="view-pane">
                    <div class="error">
                        <p>履歴の表示に失敗しました</p>
                    </div>
                </div>
            `;
        }
    }

    renderSummary() {
        try {
            console.log('TimeTrackerView.renderSummary: 開始');
            console.log('TimeTrackerView.renderSummary: TimeTrackerインスタンス:', this.timeTracker);
            const today = new Date();
            const dailySummary = this.timeTracker.getDailyTimeSummary(today);
            const weeklySummary = this.timeTracker.getWeeklyTimeSummary(today);
            
            console.log('TimeTrackerView.renderSummary: 日別サマリー:', dailySummary);
            console.log('TimeTrackerView.renderSummary: 週別サマリー:', weeklySummary);
            
            const totalToday = Object.values(dailySummary || {}).reduce((sum, task) => sum + (task.totalTime || 0), 0);
            const totalWeek = Object.values(weeklySummary || {}).reduce((sum, day) => sum + (day.totalTime || 0), 0);

            console.log('TimeTrackerView.renderSummary: 今日の合計:', totalToday, '今週の合計:', totalWeek);

            return `
                <div id="summary-view" class="view-pane">
                    <div class="summary-overview">
                        <div class="summary-card">
                            <h3>今日の合計</h3>
                            <div class="summary-value">${this.timeTracker.formatTime(totalToday)}</div>
                        </div>
                        <div class="summary-card">
                            <h3>今週の合計</h3>
                            <div class="summary-value">${this.timeTracker.formatTime(totalWeek)}</div>
                        </div>
                    </div>

                    <div class="summary-details">
                        <div class="daily-breakdown">
                            <h4>今日の内訳</h4>
                            ${Object.keys(dailySummary || {}).length === 0 ? `
                                <p class="no-data">今日の記録がありません</p>
                            ` : Object.entries(dailySummary || {}).map(([taskId, task]) => `
                                <div class="task-summary">
                                    <span class="task-name">${task.taskName || '不明なタスク'}</span>
                                    <span class="task-time">${this.timeTracker.formatTime(task.totalTime || 0)}</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="weekly-chart">
                            <h4>今週の推移</h4>
                            <canvas id="weekly-time-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('TimeTrackerView.renderSummary: エラーが発生しました:', error);
            return `
                <div id="summary-view" class="view-pane">
                    <div class="error">
                        <p>サマリーの表示に失敗しました</p>
                    </div>
                </div>
            `;
        }
    }

    showCurrentView() {
        try {
            console.log('TimeTrackerView.showCurrentView: 開始');
            console.log('TimeTrackerView.showCurrentView: 現在のビュー:', this.currentView);
            
            // すべてのビューを非表示
            document.querySelectorAll('.view-pane').forEach(pane => {
                pane.classList.remove('active');
            });

            // 現在のビューを表示
            const currentPane = document.getElementById(`${this.currentView}-view`);
            if (currentPane) {
                currentPane.classList.add('active');
                console.log('TimeTrackerView.showCurrentView: ビューペインを表示:', currentPane.id);
            } else {
                console.error('TimeTrackerView.showCurrentView: ビューペインが見つかりません:', `${this.currentView}-view`);
            }

            // タブのアクティブ状態を更新
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeTab = document.querySelector(`[data-view="${this.currentView}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
                console.log('TimeTrackerView.showCurrentView: タブをアクティブに:', activeTab);
            } else {
                console.error('TimeTrackerView.showCurrentView: タブが見つかりません:', `[data-view="${this.currentView}"]`);
            }

            // サマリービューの場合、チャートを描画
            if (this.currentView === 'summary') {
                setTimeout(() => {
                    this.renderWeeklyChart();
                }, 100);
            }
            
            console.log('TimeTrackerView.showCurrentView: 完了');
        } catch (error) {
            console.error('TimeTrackerView.showCurrentView: エラーが発生しました:', error);
        }
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weekly-time-chart');
        if (!canvas) {
            console.error('TimeTrackerView: weekly-time-chartキャンバスが見つかりません');
            return;
        }

        // Chart.jsの可用性をチェック
        if (typeof Chart === 'undefined') {
            console.error('TimeTrackerView: Chart.jsが読み込まれていません');
            canvas.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました</p>';
            return;
        }

        try {
            const weeklySummary = this.timeTracker.getWeeklyTimeSummary();
            const labels = Object.keys(weeklySummary).map(date => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            });
            const data = Object.values(weeklySummary).map(day => day.totalTime);

            if (this.weeklyChart) {
                this.weeklyChart.destroy();
            }

            this.weeklyChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '作業時間（分）',
                        data: data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '時間（分）'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: '今週の作業時間推移'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('TimeTrackerView: 週次チャートの描画エラー:', error);
            canvas.innerHTML = '<p class="error">チャートの表示に失敗しました: ' + error.message + '</p>';
        }
    }

    getUniqueTaskOptions() {
        try {
            const timeEntries = this.timeTracker.timeEntries || [];
            const uniqueTasks = [...new Set(timeEntries.map(entry => entry.taskName).filter(name => name))];
            return uniqueTasks.map(taskName => 
                `<option value="${taskName}">${taskName}</option>`
            ).join('');
        } catch (error) {
            console.error('TimeTrackerView.getUniqueTaskOptions: エラーが発生しました:', error);
            return '';
        }
    }

    bindEvents() {
        try {
            console.log('TimeTrackerView.bindEvents: 開始');
            
            // タブ切り替え
            document.addEventListener('click', (e) => {
                if (e.target.closest('.tab-btn')) {
                    const btn = e.target.closest('.tab-btn');
                    this.currentView = btn.dataset.view;
                    console.log('TimeTrackerView.bindEvents: タブ切り替え:', this.currentView);
                    this.showCurrentView();
                }
            });

            // タイマー制御
            document.addEventListener('click', (e) => {
                const taskId = e.target.closest('[data-task-id]')?.dataset.taskId;
                if (!taskId) return;

                if (e.target.closest('.pause-timer')) {
                    console.log('TimeTrackerView.bindEvents: タイマー一時停止:', taskId);
                    this.pauseTimer(taskId);
                } else if (e.target.closest('.stop-timer')) {
                    console.log('TimeTrackerView.bindEvents: タイマー停止:', taskId);
                    this.stopTimer(taskId);
                } else if (e.target.closest('.resume-timer')) {
                    console.log('TimeTrackerView.bindEvents: タイマー再開:', taskId);
                    this.resumeTimer(taskId);
                }
            });

            // 履歴エントリの編集・削除
            document.addEventListener('click', (e) => {
                const entryId = e.target.closest('[data-entry-id]')?.dataset.entryId;
                if (!entryId) return;

                if (e.target.closest('.edit-entry')) {
                    console.log('TimeTrackerView.bindEvents: エントリ編集:', entryId);
                    this.editEntry(entryId);
                } else if (e.target.closest('.delete-entry')) {
                    console.log('TimeTrackerView.bindEvents: エントリ削除:', entryId);
                    this.deleteEntry(entryId);
                }
            });

            // エクスポート・インポート・クリア
            document.addEventListener('click', (e) => {
                if (e.target.id === 'export-time-data') {
                    console.log('TimeTrackerView.bindEvents: データエクスポート');
                    this.exportData();
                } else if (e.target.id === 'import-time-data') {
                    console.log('TimeTrackerView.bindEvents: データインポート');
                    this.importData();
                } else if (e.target.id === 'clear-time-data') {
                    console.log('TimeTrackerView.bindEvents: データクリア');
                    this.clearData();
                }
            });

            // ファイル選択
            const fileInput = document.getElementById('time-data-file-input');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    console.log('TimeTrackerView.bindEvents: ファイル選択');
                    this.handleFileSelection(e.target.files[0]);
                });
            }

            // フィルター
            const dateFilter = document.getElementById('history-date-filter');
            if (dateFilter) {
                dateFilter.addEventListener('change', (e) => {
                    console.log('TimeTrackerView.bindEvents: 日付フィルター');
                    this.filterHistory();
                });
            }

            const taskFilter = document.getElementById('history-task-filter');
            if (taskFilter) {
                taskFilter.addEventListener('change', (e) => {
                    console.log('TimeTrackerView.bindEvents: タスクフィルター');
                    this.filterHistory();
                });
            }
            
            console.log('TimeTrackerView.bindEvents: 完了');
        } catch (error) {
            console.error('TimeTrackerView.bindEvents: エラーが発生しました:', error);
        }
    }

    pauseTimer(taskId) {
        try {
            console.log('TimeTrackerView.pauseTimer: 開始:', taskId);
            const result = this.timeTracker.pauseTimer(taskId);
            console.log('TimeTrackerView.pauseTimer: 結果:', result);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            this.render();
        } catch (error) {
            console.error('TimeTrackerView.pauseTimer: エラーが発生しました:', error);
            this.showNotification('タイマーの一時停止に失敗しました', 'error');
        }
    }

    stopTimer(taskId) {
        try {
            console.log('TimeTrackerView.stopTimer: 開始:', taskId);
            const result = this.timeTracker.stopTimer(taskId);
            console.log('TimeTrackerView.stopTimer: 結果:', result);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            this.render();
        } catch (error) {
            console.error('TimeTrackerView.stopTimer: エラーが発生しました:', error);
            this.showNotification('タイマーの停止に失敗しました', 'error');
        }
    }

    resumeTimer(taskId) {
        try {
            console.log('TimeTrackerView.resumeTimer: 開始:', taskId);
            const result = this.timeTracker.resumeTimer(taskId);
            console.log('TimeTrackerView.resumeTimer: 結果:', result);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            this.render();
        } catch (error) {
            console.error('TimeTrackerView.resumeTimer: エラーが発生しました:', error);
            this.showNotification('タイマーの再開に失敗しました', 'error');
        }
    }

    editEntry(entryId) {
        const entry = this.timeTracker.timeEntries.find(e => e.id === entryId);
        if (!entry) return;

        const newStartTime = prompt('開始時刻を入力してください (YYYY-MM-DD HH:MM)', 
            new Date(entry.startTime).toISOString().slice(0, 16));
        if (!newStartTime) return;

        const newEndTime = prompt('終了時刻を入力してください (YYYY-MM-DD HH:MM)', 
            new Date(entry.endTime).toISOString().slice(0, 16));
        if (!newEndTime) return;

        const result = this.timeTracker.editTimeEntry(entryId, {
            startTime: newStartTime,
            endTime: newEndTime
        });

        this.showNotification(result.message, result.success ? 'success' : 'error');
        this.render();
    }

    deleteEntry(entryId) {
        if (!confirm('この時間エントリを削除しますか？')) return;

        const result = this.timeTracker.deleteTimeEntry(entryId);
        this.showNotification(result.message, result.success ? 'success' : 'error');
        this.render();
    }

    exportData() {
        const format = confirm('CSV形式でエクスポートしますか？\nOK: CSV, キャンセル: JSON') ? 'csv' : 'json';
        const data = this.timeTracker.exportTimeEntries(format);
        const filename = `time-entries-${new Date().toISOString().slice(0, 10)}.${format}`;

        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('データをエクスポートしました', 'success');
    }

    importData() {
        document.getElementById('time-data-file-input').click();
    }

    handleFileSelection(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = this.timeTracker.importTimeEntries(e.target.result);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                this.render();
            } catch (error) {
                this.showNotification('ファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearData() {
        if (!confirm('すべての時間データを削除しますか？\nこの操作は取り消せません。')) return;

        const result = this.timeTracker.clearAllData();
        this.showNotification(result.message, result.success ? 'success' : 'error');
        this.render();
    }

    filterHistory() {
        // フィルタリング機能の実装
        this.render();
    }

    startUpdateTimer() {
        try {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            this.updateInterval = setInterval(() => {
                this.updateActiveTimers();
            }, 1000); // 1秒ごとに更新
            console.log('TimeTrackerView.startUpdateTimer: 開始');
        } catch (error) {
            console.error('TimeTrackerView.startUpdateTimer: エラーが発生しました:', error);
        }
    }

    updateActiveTimers() {
        try {
            const activeTimers = this.timeTracker.getActiveTimers();
            activeTimers.forEach(timer => {
                const elapsedElement = document.querySelector(`[data-task-id="${timer.taskId}"] .elapsed-time`);
                if (elapsedElement) {
                    elapsedElement.textContent = this.timeTracker.formatTime(
                        this.timeTracker.getElapsedTime(timer.taskId)
                    );
                }
            });
        } catch (error) {
            console.error('TimeTrackerView.updateActiveTimers: エラーが発生しました:', error);
        }
    }

    showNotification(message, type = 'info') {
        // 通知表示の実装
        console.log(`${type}: ${message}`);
    }

    destroy() {
        try {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
            if (this.weeklyChart) {
                this.weeklyChart.destroy();
                this.weeklyChart = null;
            }
            
            console.log('TimeTrackerView: 破棄完了');
        } catch (error) {
            console.error('TimeTrackerView.destroy: エラーが発生しました:', error);
        }
    }
}
