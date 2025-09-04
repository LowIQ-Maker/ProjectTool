/**
 * プロジェクトビュークラス
 */
class ProjectView {
    constructor() {
        this.projectManager = new ProjectManager();
        this.taskManager = new TaskManager();
        this.progressManager = new ProgressManager();
        this.eventManager = new EventManager();
        this.init();
    }

    init() {
        console.log('ProjectView.init 開始');
        this.bindEvents();
        this.render();
        console.log('ProjectView.init 完了');
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
        this.renderProjectTable();
        this.renderProjectStats();
        this.bindTableEvents();
    }

    renderProjectTable() {
        console.log('ProjectView.renderProjectTable 開始');
        const projects = this.projectManager.getProjects();
        console.log('取得したプロジェクト数:', projects.length);
        console.log('プロジェクト一覧:', projects);
        
        const tbody = document.getElementById('projectsTableBody');
        console.log('tbody要素:', tbody);
        
        if (!tbody) {
            console.error('projectsTableBody が見つかりません');
            return;
        }

        tbody.innerHTML = '';

        if (projects.length === 0) {
            console.log('プロジェクトが0件のため空状態を表示');
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <h3>プロジェクトがありません</h3>
                        <p>新規プロジェクトを作成してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        projects.forEach(project => {
            const tasks = this.taskManager.getTasksByProject(project.id);
            const progress = this.progressManager.calculateProjectProgress(project.id);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="project-name">
                        <strong>${project.name}</strong>
                        <small>${project.description || '説明なし'}</small>
                    </div>
                </td>
                <td>${project.startDate}</td>
                <td>${project.endDate}</td>
                <td>${project.budget.toLocaleString()}円</td>
                <td><span class="status-badge status-${project.getStatusColor()}">${project.getStatusText()}</span></td>
                <td>
                    <div class="progress-bar" style="width: 100px;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </td>
                <td>${completedTasks}/${tasks.length}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteProject('${project.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderProjectStats() {
        const stats = this.projectManager.getProjectStats();
        const container = document.querySelector('.project-stats');
        
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <h3>${stats.total}</h3>
                <p>総プロジェクト数</p>
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
                <h3>${stats.averageProgress}%</h3>
                <p>平均進捗</p>
            </div>
            <div class="stat-item">
                <h3>${stats.totalBudget.toLocaleString()}</h3>
                <p>総予算（円）</p>
            </div>
        `;
    }

    bindTableEvents() {
        // ソート機能
        const headers = document.querySelectorAll('.projects-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                this.sortProjects(sortBy);
            });
        });

        // フィルター機能
        const statusFilter = document.getElementById('statusFilter');
        const deadlineFilter = document.getElementById('deadlineFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (deadlineFilter) {
            deadlineFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    sortProjects(sortBy) {
        const projects = this.projectManager.getProjects();
        const sortedProjects = this.projectManager.sortProjects(projects, sortBy);
        this.renderProjectTableWithData(sortedProjects);
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value;
        const deadlineFilter = document.getElementById('deadlineFilter')?.value;
        
        const filters = {};
        if (statusFilter) filters.status = statusFilter;
        if (deadlineFilter) filters.deadline = parseInt(deadlineFilter);
        
        const filteredProjects = this.projectManager.filterProjects(filters);
        this.renderProjectTableWithData(filteredProjects);
    }

    renderProjectTableWithData(projects) {
        const tbody = document.getElementById('projectsTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (projects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>該当するプロジェクトがありません</h3>
                        <p>フィルター条件を変更してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        projects.forEach(project => {
            const tasks = this.taskManager.getTasksByProject(project.id);
            const progress = this.progressManager.calculateProjectProgress(project.id);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="project-name">
                        <strong>${project.name}</strong>
                        <small>${project.description || '説明なし'}</small>
                    </div>
                </td>
                <td>${project.startDate}</td>
                <td>${project.endDate}</td>
                <td>${project.budget.toLocaleString()}円</td>
                <td><span class="status-badge status-${project.getStatusColor()}">${project.getStatusText()}</span></td>
                <td>
                    <div class="progress-bar" style="width: 100px;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </td>
                <td>${completedTasks}/${tasks.length}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteProject('${project.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    searchProjects(query) {
        const projects = this.projectManager.searchProjects(query);
        this.renderProjectTableWithData(projects);
    }

    destroy() {
        this.eventManager.removeAllListeners();
    }
}