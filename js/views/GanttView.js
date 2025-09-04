/**
 * ガントチャートビュークラス
 */
class GanttView {
    constructor() {
        this.taskManager = new TaskManager();
        this.projectManager = new ProjectManager();
        this.eventManager = new EventManager();
        this.currentDate = new Date();
        this.zoomLevel = 1; // 1 = 日単位, 7 = 週単位, 30 = 月単位
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

        // ガントチャートコントロールのイベント
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const todayBtn = document.getElementById('todayBtn');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => this.goToToday());
        }
    }

    render() {
        console.log('[Gantt] render called');
        this.renderTimeline();
        this.renderGanttChart();
    }

    renderTimeline() {
        const timelineContainer = document.getElementById('ganttTimeline');
        if (!timelineContainer) return;

        const dates = this.generateDateRange();
        
        timelineContainer.innerHTML = `
            <div class="gantt-timeline-header">
                ${dates.map(date => `
                    <div class="date-column">
                        ${this.formatDate(date)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGanttChart() {
        const chartContainer = document.getElementById('ganttChart');
        if (!chartContainer) {
            console.error('[Gantt] ganttChart element not found');
            return;
        }

        const tasks = this.taskManager.getTasks();
        const projects = this.projectManager.getProjects();
        const dates = this.generateDateRange();
        console.log('[Gantt] tasks:', tasks.length, 'projects:', projects.length, 'dates:', dates.length);
        console.log('[Gantt] tasks data:', tasks);
        console.log('[Gantt] projects data:', projects);

        if (tasks.length === 0) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>タスクがありません</h3>
                    <p>新規タスクを作成してガントチャートを表示してください</p>
                </div>
            `;
            return;
        }

        chartContainer.innerHTML = '';

        // プロジェクトごとにタスクをグループ化
        const projectTasks = this.groupTasksByProject(tasks, projects);
        console.log('[Gantt] project groups:', projectTasks.length);

        projectTasks.forEach(projectGroup => {
            const projectRow = document.createElement('div');
            projectRow.className = 'gantt-row';

            // プロジェクトヘッダー
            const projectHeader = document.createElement('div');
            projectHeader.className = 'gantt-row-header';
            projectHeader.innerHTML = `
                <div class="project-name">${projectGroup.project.name}</div>
                <div class="task-name">${projectGroup.tasks.length}個のタスク</div>
            `;

            // タイムライングリッド
            const timelineGrid = document.createElement('div');
            timelineGrid.className = 'gantt-timeline-grid';

            dates.forEach(date => {
                const dateColumn = document.createElement('div');
                dateColumn.className = 'date-column';
                timelineGrid.appendChild(dateColumn);
            });

            // タスクバーを描画
            projectGroup.tasks.forEach(task => {
                this.renderTaskBar(timelineGrid, task, dates);
            });

            projectRow.appendChild(projectHeader);
            projectRow.appendChild(timelineGrid);
            chartContainer.appendChild(projectRow);
        });
    }

    renderTaskBar(timelineGrid, task, dates) {
        const parseLocalDate = (s) => {
            const [y, m, d] = s.split('-').map(Number);
            return new Date(y, m - 1, d, 0, 0, 0, 0);
        };

        const startDate = parseLocalDate(task.dueDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.max(1, Math.ceil((Number(task.estimatedHours) || 0) / 8)));

        const startIndex = this.findDateIndex(dates, startDate);
        const endIndex = this.findDateIndex(dates, endDate);
        console.log('[Gantt] task', task.name, 'startIndex', startIndex, 'endIndex', endIndex);

        if (startIndex === -1 || endIndex === -1) return;

        const totalColumns = dates.length;
        const columnPercent = 100 / totalColumns;

        const bar = document.createElement('div');
        bar.className = `gantt-bar ${this.getTaskBarClass(task)}`;
        bar.style.left = `${startIndex * columnPercent}%`;
        bar.style.width = `${Math.max(1, (endIndex - startIndex + 1)) * columnPercent}%`;
        bar.title = `${task.name} (${task.estimatedHours}h)`;

        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = task.name;
        bar.appendChild(label);

        timelineGrid.appendChild(bar);
    }

    getTaskBarClass(task) {
        if (task.status === 'completed') return 'completed';
        if (task.isOverdue()) return 'overdue';
        if (task.isDueSoon()) return 'due-soon';
        return '';
    }

    generateDateRange() {
        const dates = [];
        const startDate = new Date(this.currentDate);
        startDate.setDate(startDate.getDate() - 7); // 1週間前から開始

        const endDate = new Date(this.currentDate);
        endDate.setDate(endDate.getDate() + 30); // 1ヶ月後まで

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + this.zoomLevel)) {
            dates.push(new Date(d));
        }

        return dates;
    }

    findDateIndex(dates, targetDate) {
        const toLocalYmd = (d) => {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        };
        const targetYmd = toLocalYmd(targetDate);
        return dates.findIndex(date => toLocalYmd(date) === targetYmd);
    }

    formatDate(date) {
        if (this.zoomLevel === 1) {
            return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        } else if (this.zoomLevel === 7) {
            return `第${Math.ceil(date.getDate() / 7)}週`;
        } else {
            return date.toLocaleDateString('ja-JP', { month: 'short' });
        }
    }

    groupTasksByProject(tasks, projects) {
        const projectMap = new Map();

        tasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            if (!project) return;

            if (!projectMap.has(project.id)) {
                projectMap.set(project.id, {
                    project: project,
                    tasks: []
                });
            }
            projectMap.get(project.id).tasks.push(task);
        });

        return Array.from(projectMap.values());
    }

    zoomIn() {
        if (this.zoomLevel < 30) {
            this.zoomLevel = Math.min(this.zoomLevel * 2, 30);
            this.render();
        }
    }

    zoomOut() {
        if (this.zoomLevel > 1) {
            this.zoomLevel = Math.max(this.zoomLevel / 2, 1);
            this.render();
        }
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    destroy() {
        this.eventManager.removeAllListeners();
    }
}
