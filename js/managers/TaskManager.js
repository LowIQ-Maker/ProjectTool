/**
 * タスク管理クラス
 */
class TaskManager {
    constructor() {
        this.storage = new Storage();
        this.eventManager = new EventManager();
    }

    /**
     * タスク一覧を取得
     */
    getTasks() {
        const tasks = this.storage.getTasks();
        // プレーンオブジェクトをTaskインスタンスに変換
        return tasks.map(taskData => new Task(taskData));
    }

    /**
     * タスクを取得
     */
    getTask(taskId) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === taskId);
    }

    /**
     * プロジェクト別タスクを取得
     */
    getTasksByProject(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.projectId === projectId);
    }

    /**
     * タスクを作成
     */
    createTask(taskData) {
        try {
            const task = new Task(taskData);
            const success = this.storage.addTask(task);
            
            if (success) {
                this.eventManager.emit('taskCreated', task);
                return { success: true, task };
            } else {
                return { success: false, error: 'タスクの保存に失敗しました' };
            }
        } catch (error) {
            console.error('タスク作成エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * タスクを更新
     */
    updateTask(taskId, taskData) {
        try {
            const success = this.storage.updateTask(taskId, taskData);
            
            if (success) {
                const updatedTask = this.getTask(taskId);
                this.eventManager.emit('taskUpdated', updatedTask);
                return { success: true, task: updatedTask };
            } else {
                return { success: false, error: 'タスクの更新に失敗しました' };
            }
        } catch (error) {
            console.error('タスク更新エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * タスクを削除
     */
    deleteTask(taskId) {
        try {
            const success = this.storage.deleteTask(taskId);
            
            if (success) {
                this.eventManager.emit('taskDeleted', taskId);
                return { success: true };
            } else {
                return { success: false, error: 'タスクの削除に失敗しました' };
            }
        } catch (error) {
            console.error('タスク削除エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * タスクを完了
     */
    completeTask(taskId) {
        try {
            const task = this.getTask(taskId);
            if (!task) {
                return { success: false, error: 'タスクが見つかりません' };
            }

            task.complete();
            const success = this.storage.updateTask(taskId, task);
            
            if (success) {
                this.eventManager.emit('taskCompleted', task);
                return { success: true, task };
            } else {
                return { success: false, error: 'タスクの完了処理に失敗しました' };
            }
        } catch (error) {
            console.error('タスク完了エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * タスクをフィルタリング
     */
    filterTasks(filters = {}) {
        let tasks = this.getTasks();

        // プロジェクトフィルター
        if (filters.projectId) {
            tasks = tasks.filter(t => t.projectId === filters.projectId);
        }

        // ステータスフィルター
        if (filters.status) {
            tasks = tasks.filter(t => t.status === filters.status);
        }

        // 優先度フィルター
        if (filters.priority) {
            tasks = tasks.filter(t => t.priority === filters.priority);
        }

        // 期限フィルター
        if (filters.dueDate) {
            const today = new Date();
            const dueDate = new Date(today.getTime() + (filters.dueDate * 24 * 60 * 60 * 1000));
            
            tasks = tasks.filter(t => {
                const taskDueDate = new Date(t.dueDate);
                return taskDueDate <= dueDate;
            });
        }

        // 完了済みフィルター
        if (filters.completed !== undefined) {
            if (filters.completed) {
                tasks = tasks.filter(t => t.status === 'completed');
            } else {
                tasks = tasks.filter(t => t.status !== 'completed');
            }
        }

        return tasks;
    }

    /**
     * タスクをソート
     */
    sortTasks(tasks, sortBy = 'dueDate', order = 'asc') {
        return tasks.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    aValue = priorityOrder[a.priority];
                    bValue = priorityOrder[b.priority];
                    break;
                case 'dueDate':
                    aValue = new Date(a.dueDate);
                    bValue = new Date(b.dueDate);
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'estimatedHours':
                    aValue = a.estimatedHours;
                    bValue = b.estimatedHours;
                    break;
                default:
                    aValue = new Date(a.dueDate);
                    bValue = new Date(b.dueDate);
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    /**
     * タスク統計を取得
     */
    getTaskStats() {
        const tasks = this.getTasks();
        
        const stats = {
            total: tasks.length,
            byStatus: {
                'pending': 0,
                'in-progress': 0,
                'completed': 0,
                'cancelled': 0
            },
            byPriority: {
                'high': 0,
                'medium': 0,
                'low': 0
            },
            overdue: 0,
            dueSoon: 0,
            totalEstimatedHours: 0,
            totalActualHours: 0
        };

        tasks.forEach(task => {
            // ステータス別カウント
            stats.byStatus[task.status]++;

            // 優先度別カウント
            stats.byPriority[task.priority]++;

            // 工数合計
            stats.totalEstimatedHours += task.estimatedHours;
            stats.totalActualHours += task.actualHours || 0;

            // 期限チェック
            if (task.isOverdue()) {
                stats.overdue++;
            } else if (task.isDueSoon()) {
                stats.dueSoon++;
            }
        });

        return stats;
    }

    /**
     * プロジェクト別タスク統計を取得
     */
    getProjectTaskStats(projectId) {
        const tasks = this.getTasksByProject(projectId);
        return this.getTaskStats(tasks);
    }

    /**
     * タスクの検索
     */
    searchTasks(query) {
        const tasks = this.getTasks();
        const lowerQuery = query.toLowerCase();

        return tasks.filter(task => 
            task.name.toLowerCase().includes(lowerQuery) ||
            (task.description && task.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * 期限が近いタスクを取得
     */
    getDueSoonTasks(days = 7) {
        const tasks = this.getTasks();
        const today = new Date();
        const dueDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));

        return tasks.filter(task => {
            if (task.status === 'completed') return false;
            
            const taskDueDate = new Date(task.dueDate);
            return taskDueDate <= dueDate && taskDueDate >= today;
        });
    }

    /**
     * 期限切れタスクを取得
     */
    getOverdueTasks() {
        const tasks = this.getTasks();
        return tasks.filter(task => {
            if (task.status === 'completed') return false;
            return task.isOverdue();
        });
    }

    /**
     * 高優先度タスクを取得
     */
    getHighPriorityTasks() {
        const tasks = this.getTasks();
        return tasks.filter(task => 
            task.priority === 'high' && task.status !== 'completed'
        );
    }
}