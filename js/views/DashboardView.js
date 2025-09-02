/**
 * ダッシュボードビュークラス
 */
class DashboardView {
    constructor() {
        this.projectManager = new ProjectManager();
        this.taskManager = new TaskManager();
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
        this.renderStats();
        this.renderProjectList();
        this.renderTaskList();
    }

    renderStats() {
        const projectStats = this.projectManager.getProjectStats();
        const taskStats = this.taskManager.getTaskStats();
        const overallProgress = this.progressManager.calculateOverallProgress();

        // 進行中プロジェクト数
        const inProgressProjects = projectStats.byStatus['in-progress'] || 0;
        this.updateStatCard('project-count', inProgressProjects);

        // 未完了タスク数（総数 - 完了）
        const incompleteTasks = (taskStats.total || 0) - (taskStats.byStatus.completed || 0);
        this.updateStatCard('task-count', incompleteTasks);

        // 全体進捗率
        this.updateStatCard('progress-percentage', `${overallProgress}%`);

        // 予算使用率（支出合計 / 予算合計）
        const storage = new Storage();
        const expenses = storage.getExpenses();
        const projects = this.projectManager.getProjects();
        const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const budgetUsage = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
        this.updateStatCard('budget-usage', `${budgetUsage}%`);

        // 期限切れ数（必要なら別カードで使用）
        this.updateStatCard('overdue-count', taskStats.overdue || 0);
    }

    updateStatCard(cardId, value) {
        const card = document.querySelector(`#${cardId} .stat-number`);
        if (card) {
            card.textContent = value;
        }
    }

    renderProjectList() {
        const projects = this.projectManager.getProjects();
        const container = document.querySelector('.project-list');
        
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成してください</p>
                </div>
            `;
            return;
        }

        const recentProjects = projects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        container.innerHTML = recentProjects.map(project => {
            const progress = this.progressManager.calculateProjectProgress(project.id);
            const tasks = this.taskManager.getTasksByProject(project.id);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            
            return `
                <div class="project-item" data-project-id="${project.id}">
                    <div class="project-info">
                        <h4>${project.name}</h4>
                        <p>${project.description || '説明なし'}</p>
                        <div class="project-meta">
                            <span class="task-count">${completedTasks}/${tasks.length} タスク完了</span>
                            <span class="due-date">期限: ${project.endDate}</span>
                        </div>
                    </div>
                    <div class="project-status">
                        <span class="status-badge status-${project.getStatusColor()}">
                            ${project.getStatusText()}
                        </span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTaskList() {
        const dueSoonTasks = this.taskManager.getDueSoonTasks(7);
        const overdueTasks = this.taskManager.getOverdueTasks();
        const highPriorityTasks = this.taskManager.getHighPriorityTasks();
        
        const displayTasks = new Set();
        [...overdueTasks, ...dueSoonTasks, ...highPriorityTasks].forEach(task => {
            if (task.status !== 'completed') {
                displayTasks.add(task);
            }
        });

        const taskArray = Array.from(displayTasks).slice(0, 5);
        const container = document.querySelector('.task-list');
        
        if (!container) return;

        if (taskArray.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>すべてのタスクが完了しています</h3>
                    <p>素晴らしい仕事です！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = taskArray.map(task => {
            const project = this.projectManager.getProject(task.projectId);
            const isOverdue = task.isOverdue();
            const isDueSoon = task.isDueSoon();
            
            return `
                <div class="task-item priority-${task.priority} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                    <div class="task-checkbox">
                        <input type="checkbox" id="task_${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                        <label for="task_${task.id}"></label>
                    </div>
                    <div class="task-content">
                        <h4>${task.name}</h4>
                        <p>${task.description || '説明なし'}</p>
                        <div class="task-meta">
                            <span class="project-name">${project ? project.name : '不明なプロジェクト'}</span>
                            <span class="due-date ${isOverdue ? 'overdue' : (isDueSoon ? 'due-soon' : '')}">
                                ${task.getDueDateText()}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <span class="priority-badge priority-${task.priority}">
                            ${task.getPriorityText()}
                        </span>
                        <button class="btn btn-sm btn-secondary" onclick="editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    destroy() {
        this.eventManager.removeAllListeners();
    }
}
