/**
 * プロジェクト管理クラス
 */
class ProjectManager {
    constructor() {
        this.storage = new Storage();
        this.eventManager = new EventManager();
    }

    /**
     * プロジェクト一覧を取得
     */
    getProjects() {
        const projects = this.storage.getProjects();
        // プレーンオブジェクトをProjectインスタンスに変換
        return projects.map(projectData => new Project(projectData));
    }

    /**
     * プロジェクトを取得
     */
    getProject(projectId) {
        const projects = this.getProjects();
        return projects.find(p => p.id === projectId);
    }

    /**
     * プロジェクトを作成
     */
    createProject(projectData) {
        try {
            const project = new Project(projectData);
            const success = this.storage.addProject(project);
            
            if (success) {
                this.eventManager.emit('projectCreated', project);
                return { success: true, project };
            } else {
                return { success: false, error: 'プロジェクトの保存に失敗しました' };
            }
        } catch (error) {
            console.error('プロジェクト作成エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * プロジェクトを更新
     */
    updateProject(projectId, projectData) {
        try {
            const success = this.storage.updateProject(projectId, projectData);
            
            if (success) {
                const updatedProject = this.getProject(projectId);
                this.eventManager.emit('projectUpdated', updatedProject);
                return { success: true, project: updatedProject };
            } else {
                return { success: false, error: 'プロジェクトの更新に失敗しました' };
            }
        } catch (error) {
            console.error('プロジェクト更新エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * プロジェクトを削除
     */
    deleteProject(projectId) {
        try {
            // 関連するタスクも削除
            const taskManager = new TaskManager();
            const relatedTasks = taskManager.getTasksByProject(projectId);
            relatedTasks.forEach(task => taskManager.deleteTask(task.id));

            const success = this.storage.deleteProject(projectId);
            
            if (success) {
                this.eventManager.emit('projectDeleted', projectId);
                return { success: true };
            } else {
                return { success: false, error: 'プロジェクトの削除に失敗しました' };
            }
        } catch (error) {
            console.error('プロジェクト削除エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * プロジェクトの進捗を計算
     */
    calculateProjectProgress(projectId) {
        const project = this.getProject(projectId);
        if (!project) return 0;

        const taskManager = new TaskManager();
        const tasks = taskManager.getTasksByProject(projectId);
        
        return project.calculateProgress(tasks);
    }

    /**
     * プロジェクトをフィルタリング
     */
    filterProjects(filters = {}) {
        let projects = this.getProjects();

        // ステータスフィルター
        if (filters.status) {
            projects = projects.filter(p => p.status === filters.status);
        }

        // 期限フィルター
        if (filters.deadline) {
            const today = new Date();
            const deadline = new Date(today.getTime() + (filters.deadline * 24 * 60 * 60 * 1000));
            
            projects = projects.filter(p => {
                const endDate = new Date(p.endDate);
                return endDate <= deadline;
            });
        }

        // 予算フィルター
        if (filters.budgetMin !== undefined) {
            projects = projects.filter(p => p.budget >= filters.budgetMin);
        }
        if (filters.budgetMax !== undefined) {
            projects = projects.filter(p => p.budget <= filters.budgetMax);
        }

        return projects;
    }

    /**
     * プロジェクトをソート
     */
    sortProjects(projects, sortBy = 'createdAt', order = 'desc') {
        return projects.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'startDate':
                    aValue = new Date(a.startDate);
                    bValue = new Date(b.startDate);
                    break;
                case 'endDate':
                    aValue = new Date(a.endDate);
                    bValue = new Date(b.endDate);
                    break;
                case 'budget':
                    aValue = a.budget;
                    bValue = b.budget;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    /**
     * プロジェクト統計を取得
     */
    getProjectStats() {
        const projects = this.getProjects();
        const taskManager = new TaskManager();
        
        const stats = {
            total: projects.length,
            byStatus: {
                'planning': 0,
                'in-progress': 0,
                'completed': 0,
                'on-hold': 0
            },
            overdue: 0,
            dueSoon: 0,
            totalBudget: 0,
            averageProgress: 0
        };

        let totalProgress = 0;

        projects.forEach(project => {
            // ステータス別カウント
            stats.byStatus[project.status]++;

            // 予算合計
            stats.totalBudget += project.budget;

            // 期限チェック
            const endDate = new Date(project.endDate);
            const today = new Date();
            const daysUntilDeadline = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilDeadline < 0) {
                stats.overdue++;
            } else if (daysUntilDeadline <= 7) {
                stats.dueSoon++;
            }

            // 進捗計算
            const progress = this.calculateProjectProgress(project.id);
            totalProgress += progress;
        });

        stats.averageProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

        return stats;
    }

    /**
     * プロジェクトの検索
     */
    searchProjects(query) {
        const projects = this.getProjects();
        const lowerQuery = query.toLowerCase();

        return projects.filter(project => 
            project.name.toLowerCase().includes(lowerQuery) ||
            (project.description && project.description.toLowerCase().includes(lowerQuery))
        );
    }
}