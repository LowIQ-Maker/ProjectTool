class TimeTracker {
    constructor() {
        this.activeTimers = new Map(); // taskId -> timer data
        this.timeEntries = this.loadTimeEntries();
    }

    // タイマー開始
    startTimer(taskId, taskName) {
        if (this.activeTimers.has(taskId)) {
            return { success: false, message: '既にタイマーが動作中です' };
        }

        const timerData = {
            taskId,
            taskName,
            startTime: new Date(),
            isRunning: true
        };

        this.activeTimers.set(taskId, timerData);
        this.saveTimeEntries();
        
        return { success: true, message: 'タイマーを開始しました' };
    }

    // タイマー停止
    stopTimer(taskId) {
        const timerData = this.activeTimers.get(taskId);
        if (!timerData) {
            return { success: false, message: 'タイマーが見つかりません' };
        }

        const endTime = new Date();
        const duration = Math.round((endTime - timerData.startTime) / 1000 / 60); // 分単位

        // タイムエントリを保存
        const timeEntry = {
            id: this.generateId(),
            taskId,
            taskName: timerData.taskName,
            startTime: timerData.startTime,
            endTime,
            duration,
            createdAt: new Date()
        };

        this.timeEntries.push(timeEntry);
        this.activeTimers.delete(taskId);
        this.saveTimeEntries();

        return { 
            success: true, 
            message: `タイマーを停止しました (${duration}分)`,
            duration,
            timeEntry
        };
    }

    // タイマー一時停止
    pauseTimer(taskId) {
        const timerData = this.activeTimers.get(taskId);
        if (!timerData) {
            return { success: false, message: 'タイマーが見つかりません' };
        }

        timerData.isRunning = false;
        timerData.pauseTime = new Date();
        this.saveTimeEntries();

        return { success: true, message: 'タイマーを一時停止しました' };
    }

    // タイマー再開
    resumeTimer(taskId) {
        const timerData = this.activeTimers.get(taskId);
        if (!timerData || timerData.isRunning) {
            return { success: false, message: 'タイマーが見つからないか、既に動作中です' };
        }

        const pauseDuration = new Date() - timerData.pauseTime;
        timerData.startTime = new Date(timerData.startTime.getTime() + pauseDuration);
        timerData.isRunning = true;
        delete timerData.pauseTime;
        this.saveTimeEntries();

        return { success: true, message: 'タイマーを再開しました' };
    }

    // 現在の経過時間を取得
    getElapsedTime(taskId) {
        const timerData = this.activeTimers.get(taskId);
        if (!timerData || !timerData.isRunning) {
            return 0;
        }

        const now = new Date();
        const elapsed = now - timerData.startTime;
        return Math.round(elapsed / 1000 / 60); // 分単位
    }

    // アクティブなタイマー一覧を取得
    getActiveTimers() {
        return Array.from(this.activeTimers.values());
    }

    // タスクの累計時間を取得
    getTotalTimeForTask(taskId) {
        return this.timeEntries
            .filter(entry => entry.taskId === taskId)
            .reduce((total, entry) => total + entry.duration, 0);
    }

    // プロジェクトの累計時間を取得
    getTotalTimeForProject(projectId, tasks) {
        const projectTaskIds = tasks
            .filter(task => task.projectId === projectId)
            .map(task => task.id);
        
        return this.timeEntries
            .filter(entry => projectTaskIds.includes(entry.taskId))
            .reduce((total, entry) => total + entry.duration, 0);
    }

    // 日別の時間集計
    getDailyTimeSummary(date = new Date()) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);

        return this.timeEntries
            .filter(entry => {
                const entryDate = new Date(entry.startTime);
                return entryDate >= targetDate && entryDate < nextDate;
            })
            .reduce((summary, entry) => {
                const taskId = entry.taskId;
                if (!summary[taskId]) {
                    summary[taskId] = {
                        taskName: entry.taskName,
                        totalTime: 0,
                        entries: []
                    };
                }
                summary[taskId].totalTime += entry.duration;
                summary[taskId].entries.push(entry);
                return summary;
            }, {});
    }

    // 週別の時間集計
    getWeeklyTimeSummary(date = new Date()) {
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();
        const startOfWeek = new Date(targetDate);
        startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        return this.timeEntries
            .filter(entry => {
                const entryDate = new Date(entry.startTime);
                return entryDate >= startOfWeek && entryDate < endOfWeek;
            })
            .reduce((summary, entry) => {
                const date = entry.startTime.toDateString();
                if (!summary[date]) {
                    summary[date] = {
                        date: new Date(entry.startTime),
                        totalTime: 0,
                        tasks: {}
                    };
                }
                
                if (!summary[date].tasks[entry.taskId]) {
                    summary[date].tasks[entry.taskId] = {
                        taskName: entry.taskName,
                        time: 0
                    };
                }
                
                summary[date].totalTime += entry.duration;
                summary[date].tasks[entry.taskId].time += entry.duration;
                
                return summary;
            }, {});
    }

    // 時間エントリを削除
    deleteTimeEntry(entryId) {
        const index = this.timeEntries.findIndex(entry => entry.id === entryId);
        if (index !== -1) {
            this.timeEntries.splice(index, 1);
            this.saveTimeEntries();
            return { success: true, message: '時間エントリを削除しました' };
        }
        return { success: false, message: '時間エントリが見つかりません' };
    }

    // 時間エントリを編集
    editTimeEntry(entryId, updates) {
        const entry = this.timeEntries.find(e => e.id === entryId);
        if (!entry) {
            return { success: false, message: '時間エントリが見つかりません' };
        }

        // 更新可能なフィールドのみ
        if (updates.startTime) entry.startTime = new Date(updates.startTime);
        if (updates.endTime) entry.endTime = new Date(updates.endTime);
        if (updates.taskName) entry.taskName = updates.taskName;

        // 時間を再計算
        if (updates.startTime || updates.endTime) {
            entry.duration = Math.round((entry.endTime - entry.startTime) / 1000 / 60);
        }

        entry.updatedAt = new Date();
        this.saveTimeEntries();

        return { success: true, message: '時間エントリを更新しました' };
    }

    // 時間エントリをエクスポート
    exportTimeEntries(format = 'json') {
        if (format === 'csv') {
            return this.exportToCSV();
        }
        return JSON.stringify(this.timeEntries, null, 2);
    }

    // CSV形式でエクスポート
    exportToCSV() {
        const headers = ['ID', 'タスクID', 'タスク名', '開始時刻', '終了時刻', '時間(分)', '作成日'];
        const rows = this.timeEntries.map(entry => [
            entry.id,
            entry.taskId,
            entry.taskName,
            entry.startTime.toISOString(),
            entry.endTime.toISOString(),
            entry.duration,
            entry.createdAt.toISOString()
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // 時間エントリをインポート
    importTimeEntries(data) {
        try {
            const entries = typeof data === 'string' ? JSON.parse(data) : data;
            if (!Array.isArray(entries)) {
                throw new Error('データが配列形式ではありません');
            }

            // 既存のエントリとマージ
            this.timeEntries = [...this.timeEntries, ...entries];
            this.saveTimeEntries();

            return { success: true, message: `${entries.length}件の時間エントリをインポートしました` };
        } catch (error) {
            return { success: false, message: `インポートに失敗しました: ${error.message}` };
        }
    }

    // データをクリア
    clearAllData() {
        this.timeEntries = [];
        this.activeTimers.clear();
        this.saveTimeEntries();
        return { success: true, message: 'すべての時間データをクリアしました' };
    }

    // 時間エントリを保存
    saveTimeEntries() {
        localStorage.setItem('timeEntries', JSON.stringify(this.timeEntries));
    }

    // 時間エントリを読み込み
    loadTimeEntries() {
        const saved = localStorage.getItem('timeEntries');
        return saved ? JSON.parse(saved) : [];
    }

    // ID生成
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 時間をフォーマット
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}時間${mins}分`;
        }
        return `${mins}分`;
    }

    // 時間を分単位で取得
    parseTime(timeString) {
        const match = timeString.match(/(\d+)時間?(\d+)?分?/);
        if (match) {
            const hours = parseInt(match[1]) || 0;
            const minutes = parseInt(match[2]) || 0;
            return hours * 60 + minutes;
        }
        return 0;
    }
}
