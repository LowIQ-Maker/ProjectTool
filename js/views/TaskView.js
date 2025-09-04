/**
 * タスクビュークラス
 */
class TaskView {
    constructor() {
        this.taskManager = new TaskManager();
        this.projectManager = new ProjectManager();
        this.progressManager = new ProgressManager();
        this.eventManager = new EventManager();
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.eventManager.on('projectCreated', () => this.render());
        this.eventManager.on('projectUpdated', () => this.render());
        this.eventManager.on('projectDeleted', () => this.render());
        this.eventManager.on('taskCreated', () => this.render());
        this.eventManager.on('taskUpdated', () => this.render());
        this.eventManager.on('taskDeleted', () => this.render());
        this.eventManager.on('taskCompleted', () => this.render());
    }

    render() {
        this.renderTaskTable();
        this.renderTaskStats();
        this.bindTableEvents();
    }

    renderTaskTable() {
        const tasks = this.taskManager.getTasks();
        const projects = this.projectManager.getProjects();
        const tbody = document.getElementById('tasksTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <h3>タスクがありません</h3>
                        <p>新規タスクを作成してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        tasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const isOverdue = task.isOverdue();
            const isDueSoon = task.isDueSoon();
            
            const row = document.createElement('tr');
            row.className = `task-row ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`;
            
            row.innerHTML = `
                <td>
                    <div class="task-checkbox">
                        <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                               data-task-id="${task.id}">
                    </div>
                </td>
                <td>
                    <div class="task-name">
                        <strong>${task.name}</strong>
                    </div>
                </td>
                <td>${project ? project.name : '不明なプロジェクト'}</td>
                <td>
                    <div class="task-description">
                        ${task.description || '説明なし'}
                    </div>
                </td>
                <td><span class="priority-badge priority-${task.priority}">${task.getPriorityText()}</span></td>
                <td>${task.dueDate}</td>
                <td>${task.estimatedHours}h</td>
                <td>
                    <select class="status-select" data-task-id="${task.id}" onchange="changeTaskStatus('${task.id}', this.value)">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>未着手</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>進行中</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>完了</option>
                        <option value="on-hold" ${task.status === 'on-hold' ? 'selected' : ''}>保留</option>
                    </select>
                </td>
                <td>
                    <div class="task-actions">
                        <button class="btn btn-primary btn-sm" onclick="startTaskTimer('${task.id}')" title="タイマー開始">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}')" title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-error btn-sm" onclick="deleteTask('${task.id}')" title="削除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // チェックボックスのイベントをバインド
        this.bindCheckboxEvents();
    }

    renderTaskStats() {
        const stats = this.taskManager.getTaskStats();
        const container = document.querySelector('.task-stats');
        
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <h3>${stats.total}</h3>
                <p>総タスク数</p>
            </div>
            <div class="stat-item">
                <h3>${stats.byStatus.pending}</h3>
                <p>未着手</p>
            </div>
            <div class="stat-item">
                <h3>${stats.byStatus['in-progress']}</h3>
                <p>進行中</p>
            </div>
            <div class="stat-item">
                <h3>${stats.byStatus.completed}</h3>
                <p>完了</p>
            </div>
            <div class="stat-item">
                <h3>${stats.overdue}</h3>
                <p>期限切れ</p>
            </div>
            <div class="stat-item">
                <h3>${stats.dueSoon}</h3>
                <p>期限間近</p>
            </div>
            <div class="stat-item">
                <h3>${stats.byPriority.high}</h3>
                <p>高優先度</p>
            </div>
            <div class="stat-item">
                <h3>${Math.round(stats.totalEstimatedHours)}</h3>
                <p>見積工数（h）</p>
            </div>
        `;
    }

    bindTableEvents() {
        // ソート機能
        const headers = document.querySelectorAll('.tasks-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                this.sortTasks(sortBy);
            });
        });

        // フィルター機能
        const projectFilter = document.getElementById('projectFilter');
        const statusFilter = document.getElementById('taskStatusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (projectFilter) {
            projectFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.applyFilters());
        }
    }
    
    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('#tasksTableBody .task-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.dataset.taskId;
                const completed = e.target.checked;
                this.toggleTaskCompletion(taskId, completed);
            });
        });
    }

    bindTimerEvents() {
        const timerButtons = document.querySelectorAll('.timer-btn');
        timerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.closest('.timer-btn').dataset.taskId;
                const taskName = e.target.closest('.timer-btn').dataset.taskName;
                this.handleTimerAction(taskId, taskName);
            });
        });
    }

    handleTimerAction(taskId, taskName) {
        if (!window.timeTracker) {
            this.showNotification('タイムトラッキング機能が利用できません', 'error');
            return;
        }

        const activeTimers = window.timeTracker.getActiveTimers();
        const isTimerActive = activeTimers.some(timer => timer.taskId === taskId);

        if (isTimerActive) {
            // タイマーが動作中の場合は停止
            const result = window.timeTracker.stopTimer(taskId);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            // ボタンの表示を更新
            this.updateTimerButton(taskId, false);
        } else {
            // タイマーを開始
            const result = window.timeTracker.startTimer(taskId, taskName);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            // ボタンの表示を更新
            this.updateTimerButton(taskId, true);
        }
    }

    updateTimerButton(taskId, isActive) {
        const button = document.querySelector(`[data-task-id="${taskId}"].timer-btn`);
        if (button) {
            if (isActive) {
                button.innerHTML = '<i class="fas fa-stop"></i>';
                button.className = 'btn btn-warning btn-sm timer-btn';
                button.title = 'タイムトラッキングを停止';
            } else {
                button.innerHTML = '<i class="fas fa-clock"></i>';
                button.className = 'btn btn-primary btn-sm timer-btn';
                button.title = 'タイムトラッキングを開始';
            }
        }
    }

    sortTasks(sortBy) {
        const tasks = this.taskManager.getTasks();
        const sortedTasks = this.taskManager.sortTasks(tasks, sortBy);
        this.renderTaskTableWithData(sortedTasks);
    }

    applyFilters() {
        const projectFilter = document.getElementById('projectFilter')?.value;
        const statusFilter = document.getElementById('taskStatusFilter')?.value;
        const priorityFilter = document.getElementById('priorityFilter')?.value;
        
        const filters = {};
        if (projectFilter) filters.projectId = projectFilter;
        if (statusFilter) filters.status = statusFilter;
        if (priorityFilter) filters.priority = priorityFilter;
        
        const filteredTasks = this.taskManager.filterTasks(filters);
        this.renderTaskTableWithData(filteredTasks);
    }

    renderTaskTableWithData(tasks) {
        const projects = this.projectManager.getProjects();
        const tbody = document.getElementById('tasksTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>該当するタスクがありません</h3>
                        <p>フィルター条件を変更してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        tasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const isOverdue = task.isOverdue();
            const isDueSoon = task.isDueSoon();
            
            const row = document.createElement('tr');
            row.className = `task-row ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`;
            
            row.innerHTML = `
                <td>
                    <div class="task-checkbox">
                        <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                               data-task-id="${task.id}">
                    </div>
                </td>
                <td>
                    <div class="task-name">
                        <strong>${task.name}</strong>
                        <small>${task.description || '説明なし'}</small>
                    </div>
                </td>
                <td>${project ? project.name : '不明なプロジェクト'}</td>
                <td><span class="priority-badge priority-${task.priority}">${task.getPriorityText()}</span></td>
                <td><span class="status-badge status-${task.getStatusColor()}">${task.getStatusText()}</span></td>
                <td>${task.dueDate}</td>
                <td>${task.estimatedHours}h</td>
                <td>
                    <div class="task-actions">
                        <button class="btn btn-primary btn-sm timer-btn" data-task-id="${task.id}" data-task-name="${task.name}">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-error btn-sm" onclick="deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // チェックボックスのイベントをバインド
        this.bindCheckboxEvents();
        
        // タイマーボタンのイベントをバインド
        this.bindTimerEvents();
    }

    searchTasks(query) {
        const tasks = this.taskManager.searchTasks(query);
        this.renderTaskTableWithData(tasks);
    }

    toggleTaskCompletion(taskId, completed) {
        if (completed) {
            const result = this.taskManager.completeTask(taskId);
            if (result.success) {
                this.showNotification('タスクが完了しました', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } else {
            // 未完了に戻す処理
            const task = this.taskManager.getTask(taskId);
            if (task) {
                task.status = 'pending';
                const result = this.taskManager.updateTask(taskId, task);
                if (result.success) {
                    this.showNotification('タスクを未完了に戻しました', 'info');
                }
            }
        }
    }

    showNotification(message, type = 'info') {
        // 既存の通知表示機能を使用
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    }

    destroy() {
        this.eventManager.removeAllListeners();
    }
}