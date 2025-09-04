class NotificationManager {
    constructor() {
        this.notifications = [];
        this.subscribers = new Map();
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.bindEvents();
        this.startPeriodicChecks();
    }

    // 通知コンテナの作成
    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // 通知の表示
    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateId(),
            message,
            type,
            timestamp: new Date(),
            read: false,
            priority: options.priority || this.getDefaultPriority(type),
            ...options
        };

        this.notifications.unshift(notification);
        this.renderNotification(notification);
        this.saveNotifications();
        this.notifySubscribers('notificationAdded', notification);

        // 自動削除の設定
        if (options.autoHide !== false) {
            const duration = options.duration || this.settings.autoHideDuration;
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }

        return notification.id;
    }

    // 通知タイプに応じたデフォルト優先度を取得
    getDefaultPriority(type) {
        const priorities = {
            'error': 'high',
            'warning': 'medium',
            'success': 'low',
            'info': 'low',
            'task': 'medium',
            'project': 'medium',
            'budget': 'high',
            'deadline': 'high'
        };
        return priorities[type] || 'low';
    }

    // 成功通知
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    // 警告通知
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    // エラー通知
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    // 情報通知
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // 通知の削除
    remove(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications[index];
            this.notifications.splice(index, 1);
            this.removeNotificationElement(notificationId);
            this.saveNotifications();
            this.notifySubscribers('notificationRemoved', notification);
        }
    }

    // すべての通知を削除
    clearAll() {
        this.notifications = [];
        this.clearNotificationContainer();
        this.saveNotifications();
        this.notifySubscribers('notificationsCleared');
    }

    // 既読にする
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationElement(notificationId, { read: true });
            this.saveNotifications();
            this.notifySubscribers('notificationRead', notification);
        }
    }

    // すべて既読にする
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateAllNotificationElements();
        this.saveNotifications();
        this.notifySubscribers('allNotificationsRead');
    }

    // 通知の表示
    renderNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification notification-${notification.type} ${notification.read ? 'read' : 'unread'}`;
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
                <div class="notification-meta">
                    <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                    ${notification.actions ? `
                        <div class="notification-actions">
                            ${notification.actions.map(action => `
                                <button class="btn btn-sm ${action.class || 'btn-outline'}" 
                                        data-action="${action.name}" 
                                        data-notification-id="${notification.id}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <button class="notification-close" data-notification-id="${notification.id}">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(element);

        // アニメーション効果
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
    }

    // 通知要素の削除
    removeNotificationElement(notificationId) {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    // 通知要素の更新
    updateNotificationElement(notificationId, updates) {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
            if (updates.read !== undefined) {
                element.classList.toggle('read', updates.read);
                element.classList.toggle('unread', !updates.read);
            }
        }
    }

    // すべての通知要素を更新
    updateAllNotificationElements() {
        this.notifications.forEach(notification => {
            this.updateNotificationElement(notification.id, { read: notification.read });
        });
    }

    // 通知コンテナをクリア
    clearNotificationContainer() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // プロジェクト関連の通知
    notifyProjectDeadline(project, daysUntilDeadline) {
        if (daysUntilDeadline <= 0) {
            this.error(`プロジェクト「${project.name}」の期限が過ぎています`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' },
                    { name: 'extend', label: '延長', class: 'btn-warning' }
                ],
                projectId: project.id,
                autoHide: false
            });
        } else if (daysUntilDeadline <= 3) {
            this.warning(`プロジェクト「${project.name}」の期限まで${daysUntilDeadline}日です`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' }
                ],
                projectId: project.id
            });
        }
    }

    // タスク関連の通知
    notifyTaskDeadline(task, daysUntilDeadline) {
        if (daysUntilDeadline <= 0) {
            this.error(`タスク「${task.name}」の期限が過ぎています`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' },
                    { name: 'complete', label: '完了', class: 'btn-success' }
                ],
                taskId: task.id,
                autoHide: false
            });
        } else if (daysUntilDeadline <= 1) {
            this.warning(`タスク「${task.name}」の期限まで${daysUntilDeadline}日です`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' }
                ],
                taskId: task.id
            });
        }
    }

    // 予算関連の通知
    notifyBudgetAlert(project, usageRate) {
        if (usageRate >= 100) {
            this.error(`プロジェクト「${project.name}」の予算を超過しています (${Math.round(usageRate)}%)`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' },
                    { name: 'review', label: '見直し', class: 'btn-warning' }
                ],
                projectId: project.id,
                autoHide: false
            });
        } else if (usageRate >= 80) {
            this.warning(`プロジェクト「${project.name}」の予算使用率が高いです (${usageRate}%)`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' }
                ],
                projectId: project.id
            });
        }
    }

    // 進捗関連の通知
    notifyProgressUpdate(project, oldProgress, newProgress) {
        if (newProgress === 100 && oldProgress < 100) {
            this.success(`プロジェクト「${project.name}」が完了しました！`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' },
                    { name: 'review', label: '振り返り', class: 'btn-info' }
                ],
                projectId: project.id
            });
        } else if (newProgress - oldProgress >= 20) {
            this.info(`プロジェクト「${project.name}」の進捗が大幅に向上しました (${oldProgress}% → ${newProgress}%)`, {
                actions: [
                    { name: 'view', label: '表示', class: 'btn-primary' }
                ],
                projectId: project.id
            });
        }
    }

    // チーム関連の通知
    notifyTeamActivity(member, action, details) {
        const actionLabels = {
            'task_completed': 'タスクを完了',
            'time_logged': '時間を記録',
            'comment_added': 'コメントを追加',
            'file_uploaded': 'ファイルをアップロード'
        };

        const label = actionLabels[action] || action;
        this.info(`${member.name}が${label}しました`, {
            actions: [
                { name: 'view', label: '詳細', class: 'btn-primary' }
            ],
            memberId: member.id,
            action: action,
            details: details
        });
    }

    // システム関連の通知
    notifySystemEvent(event, details) {
        const eventLabels = {
            'backup_created': 'バックアップが作成されました',
            'data_imported': 'データがインポートされました',
            'data_exported': 'データがエクスポートされました',
            'settings_updated': '設定が更新されました',
            'maintenance_scheduled': 'メンテナンスが予定されています'
        };

        const label = eventLabels[event] || event;
        this.info(label, {
            details: details,
            autoHide: true,
            duration: 5000
        });
    }

    // 定期的なチェック
    startPeriodicChecks() {
        // 1時間ごとにチェック
        setInterval(() => {
            this.checkProjectDeadlines();
            this.checkTaskDeadlines();
            this.checkBudgetAlerts();
        }, 60 * 60 * 1000);

        // 初回チェック
        setTimeout(() => {
            this.checkProjectDeadlines();
            this.checkTaskDeadlines();
            this.checkBudgetAlerts();
        }, 1000);
    }

    // プロジェクト期限チェック
    checkProjectDeadlines() {
        const projects = this.getProjects();
        const now = new Date();

        projects.forEach(project => {
            if (project.endDate && project.status !== 'completed') {
                const endDate = new Date(project.endDate);
                const daysUntilDeadline = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilDeadline <= 3) {
                    this.notifyProjectDeadline(project, daysUntilDeadline);
                }
            }
        });
    }

    // タスク期限チェック
    checkTaskDeadlines() {
        const tasks = this.getTasks();
        const now = new Date();

        tasks.forEach(task => {
            if (task.dueDate && task.status !== 'completed') {
                const dueDate = new Date(task.dueDate);
                const daysUntilDeadline = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilDeadline <= 1) {
                    this.notifyTaskDeadline(task, daysUntilDeadline);
                }
            }
        });
    }

    // 予算アラートチェック
    checkBudgetAlerts() {
        const projects = this.getProjects();
        const expenses = this.getExpenses();

        projects.forEach(project => {
            if (project.budget) {
                const projectExpenses = expenses.filter(exp => exp.projectId === project.id);
                const totalExpenses = projectExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                const usageRate = (totalExpenses / project.budget) * 100;

                if (usageRate >= 80) {
                    this.notifyBudgetAlert(project, usageRate);
                }
            }
        });
    }

    // イベント購読
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    // イベント購読解除
    unsubscribe(event, callback) {
        if (this.subscribers.has(event)) {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 購読者への通知
    notifySubscribers(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('通知コールバックエラー:', error);
                }
            });
        }
    }

    // イベントのバインド
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                const notificationId = e.target.dataset.notificationId;
                this.remove(notificationId);
            } else if (e.target.classList.contains('notification-actions')) {
                const button = e.target.closest('button');
                if (button) {
                    const action = button.dataset.action;
                    const notificationId = button.dataset.notificationId;
                    this.handleNotificationAction(action, notificationId);
                }
            }
        });

        // 通知クリックで既読にする
        document.addEventListener('click', (e) => {
            const notification = e.target.closest('.notification');
            if (notification && !e.target.closest('.notification-actions')) {
                const notificationId = notification.id.replace('notification-', '');
                this.markAsRead(notificationId);
            }
        });
    }

    // 通知アクションの処理
    handleNotificationAction(action, notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        switch (action) {
            case 'view':
                this.handleViewAction(notification);
                break;
            case 'complete':
                this.handleCompleteAction(notification);
                break;
            case 'extend':
                this.handleExtendAction(notification);
                break;
            case 'review':
                this.handleReviewAction(notification);
                break;
            default:
                console.log('未実装のアクション:', action);
        }

        // アクション実行後は通知を削除
        this.remove(notificationId);
    }

    // 表示アクション
    handleViewAction(notification) {
        if (notification.projectId) {
            // プロジェクトページに移動
            this.navigateToProject(notification.projectId);
        } else if (notification.taskId) {
            // タスクページに移動
            this.navigateToTask(notification.taskId);
        }
    }

    // 完了アクション
    handleCompleteAction(notification) {
        if (notification.taskId) {
            // タスクを完了にする
            this.completeTask(notification.taskId);
        }
    }

    // 延長アクション
    handleExtendAction(notification) {
        if (notification.projectId) {
            // プロジェクト期限延長ダイアログを表示
            this.showExtendDialog(notification.projectId);
        }
    }

    // 見直しアクション
    handleReviewAction(notification) {
        if (notification.projectId) {
            // プロジェクト見直しダイアログを表示
            this.showReviewDialog(notification.projectId);
        }
    }

    // プロジェクトページへの移動
    navigateToProject(projectId) {
        // 実際の実装では適切なナビゲーション処理
        console.log('プロジェクトページに移動:', projectId);
    }

    // タスクページへの移動
    navigateToTask(taskId) {
        // 実際の実装では適切なナビゲーション処理
        console.log('タスクページに移動:', taskId);
    }

    // タスク完了
    completeTask(taskId) {
        // 実際の実装ではTaskManagerを使用
        console.log('タスク完了:', taskId);
    }

    // 延長ダイアログ表示
    showExtendDialog(projectId) {
        // 実際の実装では適切なダイアログを表示
        console.log('延長ダイアログ表示:', projectId);
    }

    // 見直しダイアログ表示
    showReviewDialog(projectId) {
        // 実際の実装では適切なダイアログを表示
        console.log('見直しダイアログ表示:', projectId);
    }

    // データ取得メソッド（実際の実装では適切なマネージャーから取得）
    getProjects() {
        return window.projectManager ? window.projectManager.getAll() : [];
    }

    getTasks() {
        return window.taskManager ? window.taskManager.getAll() : [];
    }

    getExpenses() {
        return window.expenseManager ? window.expenseManager.getAll() : [];
    }

    // 設定の読み込み
    loadSettings() {
        const saved = localStorage.getItem('notificationSettings');
        return saved ? JSON.parse(saved) : {
            enabled: true,
            sound: true,
            desktop: false,
            autoHideDuration: 5000,
            maxNotifications: 10
        };
    }

    // 設定の保存
    saveSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }

    // 通知の保存
    saveNotifications() {
        // 最新の100件のみ保存
        const toSave = this.notifications.slice(0, 100);
        localStorage.setItem('notifications', JSON.stringify(toSave));
    }

    // 通知の読み込み
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
            // 古い通知を削除（7日以上前）
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            this.notifications = this.notifications.filter(n => 
                new Date(n.timestamp) > weekAgo
            );
        }
    }

    // 時間のフォーマット
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        if (diff < 60000) { // 1分未満
            return '今';
        } else if (diff < 3600000) { // 1時間未満
            return `${Math.floor(diff / 60000)}分前`;
        } else if (diff < 86400000) { // 1日未満
            return `${Math.floor(diff / 3600000)}時間前`;
        } else {
            return time.toLocaleDateString('ja-JP');
        }
    }

    // ID生成
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 統計情報の取得
    getStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayNotifications = this.notifications.filter(n => 
            new Date(n.timestamp) >= today
        );
        const weekNotifications = this.notifications.filter(n => 
            new Date(n.timestamp) >= weekAgo
        );

        return {
            total: this.notifications.length,
            unread: this.notifications.filter(n => !n.read).length,
            today: todayNotifications.length,
            thisWeek: weekNotifications.length,
            byType: this.getNotificationsByType()
        };
    }

    // タイプ別通知数
    getNotificationsByType() {
        const counts = {};
        this.notifications.forEach(n => {
            counts[n.type] = (counts[n.type] || 0) + 1;
        });
        return counts;
    }

    // 通知の検索
    searchNotifications(query) {
        if (!query) return this.notifications;
        
        const lowerQuery = query.toLowerCase();
        return this.notifications.filter(n => 
            n.message.toLowerCase().includes(lowerQuery) ||
            n.type.toLowerCase().includes(lowerQuery)
        );
    }

    // 通知のフィルタリング
    filterNotifications(filters = {}) {
        let filtered = this.notifications;

        if (filters.type) {
            filtered = filtered.filter(n => n.type === filters.type);
        }

        if (filters.read !== undefined) {
            filtered = filtered.filter(n => n.read === filters.read);
        }

        if (filters.startDate) {
            filtered = filtered.filter(n => new Date(n.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(n => new Date(n.timestamp) <= new Date(filters.endDate));
        }

        return filtered;
    }

    // 通知の一括操作
    bulkAction(action, notificationIds) {
        switch (action) {
            case 'markAsRead':
                notificationIds.forEach(id => this.markAsRead(id));
                break;
            case 'delete':
                notificationIds.forEach(id => this.remove(id));
                break;
            default:
                console.log('未実装の一括アクション:', action);
        }
    }

    // 通知のエクスポート
    exportNotifications(format = 'json') {
        if (format === 'csv') {
            return this.exportToCSV();
        }
        return JSON.stringify(this.notifications, null, 2);
    }

    // CSV形式でエクスポート
    exportToCSV() {
        const headers = ['ID', 'メッセージ', 'タイプ', 'タイムスタンプ', '既読', 'プロジェクトID', 'タスクID'];
        const rows = this.notifications.map(n => [
            n.id,
            n.message,
            n.type,
            n.timestamp,
            n.read ? 'はい' : 'いいえ',
            n.projectId || '',
            n.taskId || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // 通知のインポート
    importNotifications(data) {
        try {
            const notifications = typeof data === 'string' ? JSON.parse(data) : data;
            if (!Array.isArray(notifications)) {
                throw new Error('データが配列形式ではありません');
            }

            // 既存の通知とマージ
            this.notifications = [...this.notifications, ...notifications];
            this.saveNotifications();

            return { success: true, message: `${notifications.length}件の通知をインポートしました` };
        } catch (error) {
            return { success: false, message: `インポートに失敗しました: ${error.message}` };
        }
    }

    // クリーンアップ
    destroy() {
        this.subscribers.clear();
        this.notifications = [];
        this.clearNotificationContainer();
    }
}
