/**
 * ダッシュボードビュークラス
 */
class DashboardView {
    constructor() {
        this.projectManager = new ProjectManager();
        this.taskManager = new TaskManager();
        this.progressManager = new ProgressManager();
        this.eventManager = new EventManager();
        this.charts = {}; // チャートインスタンスを管理
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
        this.clearCharts(); // 既存のチャートをクリア
        this.renderCharts();
    }

    clearCharts() {
        // すべてのチャートインスタンスを破棄
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn('DashboardView.clearCharts: チャート破棄エラー:', error);
                }
            }
        });
        this.charts = {};

        // Chart.jsのインスタンスもクリア
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.keys(Chart.instances).forEach(id => {
                try {
                    Chart.instances[id].destroy();
                } catch (error) {
                    console.warn('DashboardView.clearCharts: Chart.instances破棄エラー:', error);
                }
            });
        }
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

    renderCharts() {
        this.renderProgressChart();
        this.renderTaskStatusChart();
        this.renderBudgetChart();
    }

    renderProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        // 既存のチャートを破棄
        if (this.charts.progress) {
            try {
                this.charts.progress.destroy();
                console.log('DashboardView.renderProgressChart: 既存のprogressチャートを破棄');
            } catch (error) {
                console.warn('DashboardView.renderProgressChart: チャート破棄エラー:', error);
            }
            this.charts.progress = null;
        }

        // Chart.jsのインスタンスIDをリセット
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.keys(Chart.instances).forEach(id => {
                if (Chart.instances[id] && Chart.instances[id].canvas && Chart.instances[id].canvas.id === 'progressChart') {
                    try {
                        Chart.instances[id].destroy();
                        console.log('DashboardView.renderProgressChart: Chart.instancesからprogressチャートを破棄:', id);
                    } catch (error) {
                        console.warn('DashboardView.renderProgressChart: Chart.instances破棄エラー:', error);
                    }
                }
            });
        }

        const projects = this.projectManager.getProjects();
        if (projects.length === 0) {
            canvas.parentElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成してグラフを表示してください</p>
                </div>
            `;
            return;
        }

        // Chart.jsが利用可能かチェック
        if (typeof Chart === 'undefined') {
            console.error('DashboardView.renderProgressChart: Chart.jsが読み込まれていません');
            canvas.parentElement.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました</p>';
            return;
        }
        
        const labels = projects.map(p => p.name);
        const data = projects.map(p => {
            const tasks = this.taskManager.getTasksByProject(p.id);
            return this.progressManager.calculateProjectProgress(p.id);
        });

        this.charts.progress = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '進捗率 (%)',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'プロジェクト進捗率'
                    }
                }
            }
        });

        console.log('DashboardView.renderProgressChart: チャート作成完了');
    }

    renderTaskStatusChart() {
        const canvas = document.getElementById('taskStatusChart');
        if (!canvas) return;

        // 既存のチャートを破棄
        if (this.charts.taskStatus) {
            try {
                this.charts.taskStatus.destroy();
                console.log('DashboardView.renderTaskStatusChart: 既存のtaskStatusチャートを破棄');
            } catch (error) {
                console.warn('DashboardView.renderTaskStatusChart: チャート破棄エラー:', error);
            }
            this.charts.taskStatus = null;
        }

        // Chart.jsのインスタンスIDをリセット
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.keys(Chart.instances).forEach(id => {
                if (Chart.instances[id] && Chart.instances[id].canvas && Chart.instances[id].canvas.id === 'taskStatusChart') {
                    try {
                        Chart.instances[id].destroy();
                        console.log('DashboardView.renderTaskStatusChart: Chart.instancesからtaskStatusチャートを破棄:', id);
                    } catch (error) {
                        console.warn('DashboardView.renderTaskStatusChart: Chart.instances破棄エラー:', error);
                    }
                }
            });
        }

        const taskStats = this.taskManager.getTaskStats();
        if (taskStats.total === 0) {
            canvas.parentElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>タスクがありません</h3>
                    <p>新規タスクを作成してグラフを表示してください</p>
                </div>
            `;
            return;
        }

        // Chart.jsが利用可能かチェック
        if (typeof Chart === 'undefined') {
            console.error('DashboardView.renderTaskStatusChart: Chart.jsが読み込まれていません');
            canvas.parentElement.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました</p>';
            return;
        }
        
        const labels = ['完了', '進行中', '保留', '未着手'];
        const data = [
            taskStats.byStatus.completed || 0,
            taskStats.byStatus['in-progress'] || 0,
            taskStats.byStatus['on-hold'] || 0,
            taskStats.byStatus.pending || 0
        ];
        const colors = ['#28a745', '#007bff', '#ffc107', '#6c757d'];

        this.charts.taskStatus = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'タスク状況'
                    }
                }
            }
        });

        console.log('DashboardView.renderTaskStatusChart: チャート作成完了');
    }

    renderBudgetChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;

        // 既存のチャートを破棄
        if (this.charts.budget) {
            try {
                this.charts.budget.destroy();
                console.log('DashboardView.renderBudgetChart: 既存のbudgetチャートを破棄');
            } catch (error) {
                console.warn('DashboardView.renderBudgetChart: チャート破棄エラー:', error);
            }
            this.charts.budget = null;
        }

        // Chart.jsのインスタンスIDをリセット
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Object.keys(Chart.instances).forEach(id => {
                if (Chart.instances[id] && Chart.instances[id].canvas && Chart.instances[id].canvas.id === 'budgetChart') {
                    try {
                        Chart.instances[id].destroy();
                        console.log('DashboardView.renderBudgetChart: Chart.instancesからbudgetチャートを破棄:', id);
                    } catch (error) {
                        console.warn('DashboardView.renderBudgetChart: Chart.instances破棄エラー:', error);
                    }
                }
            });
        }

        const projects = this.projectManager.getProjects();
        if (projects.length === 0) {
            canvas.parentElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成してグラフを表示してください</p>
                </div>
            `;
            return;
        }

        const storage = new Storage();
        const expenses = storage.getExpenses();
        
        // Chart.jsが利用可能かチェック
        if (typeof Chart === 'undefined') {
            console.error('DashboardView.renderBudgetChart: Chart.jsが読み込まれていません');
            canvas.parentElement.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました</p>';
            return;
        }
        
        const labels = projects.map(p => p.name);
        const budgetData = projects.map(p => Number(p.budget) || 0);
        const expenseData = projects.map(p => {
            const projectExpenses = expenses.filter(e => e.projectId === p.id);
            return projectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        });

        this.charts.budget = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '予算',
                    data: budgetData,
                    backgroundColor: 'rgba(40, 162, 235, 0.6)',
                    borderColor: 'rgba(40, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: '支出',
                    data: expenseData,
                    backgroundColor: 'rgba(220, 53, 69, 0.6)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '予算 vs 支出'
                    }
                }
            }
        });

        console.log('DashboardView.renderBudgetChart: チャート作成完了');
    }

    destroy() {
        this.eventManager.removeAllListeners();
        
        // チャートを破棄
        if (this.chartHelper) {
            this.chartHelper.destroyAllCharts();
            this.chartHelper = null;
        }
    }
}
