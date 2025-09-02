/**
 * 進捗管理クラス
 */
class ProgressManager {
    constructor() {
        this.storage = new Storage();
        this.eventManager = new EventManager();
        this.projectManager = new ProjectManager();
        this.taskManager = new TaskManager();
    }

    /**
     * プロジェクト全体の進捗を計算
     */
    calculateOverallProgress() {
        const projects = this.projectManager.getProjects();
        if (projects.length === 0) return 0;

        let totalProgress = 0;
        projects.forEach(project => {
            const progress = this.calculateProjectProgress(project.id);
            totalProgress += progress;
        });

        return Math.round(totalProgress / projects.length);
    }

    /**
     * プロジェクトの進捗を計算
     */
    calculateProjectProgress(projectId) {
        const project = this.projectManager.getProject(projectId);
        if (!project) return 0;

        const tasks = this.taskManager.getTasksByProject(projectId);
        
        // projectがProjectインスタンスであることを確認
        if (typeof project.calculateProgress === 'function') {
            return project.calculateProgress(tasks);
        } else {
            console.warn('project.calculateProgress is not a function, project:', project);
            return 0;
        }
    }

    /**
     * 進捗データを取得
     */
    getProgressData() {
        const projects = this.projectManager.getProjects();
        const tasks = this.taskManager.getTasks();
        
        return {
            overall: this.calculateOverallProgress(),
            byProject: this.getProgressByProject(),
            byStatus: this.getProgressByStatus(),
            byPriority: this.getProgressByPriority(),
            timeline: this.getProgressTimeline(),
            milestones: this.getMilestones()
        };
    }

    /**
     * プロジェクト別進捗を取得
     */
    getProgressByProject() {
        const projects = this.projectManager.getProjects();
        const progressData = [];

        projects.forEach(project => {
            const progress = this.calculateProjectProgress(project.id);
            const tasks = this.taskManager.getTasksByProject(project.id);
            
            progressData.push({
                projectId: project.id,
                projectName: project.name,
                progress: progress,
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate
            });
        });

        return progressData;
    }

    /**
     * ステータス別進捗を取得
     */
    getProgressByStatus() {
        const projects = this.projectManager.getProjects();
        const statusData = {
            'planning': { count: 0, progress: 0 },
            'in-progress': { count: 0, progress: 0 },
            'completed': { count: 0, progress: 0 },
            'on-hold': { count: 0, progress: 0 }
        };

        projects.forEach(project => {
            const status = project.status;
            const progress = this.calculateProjectProgress(project.id);
            
            statusData[status].count++;
            statusData[status].progress += progress;
        });

        // 平均進捗を計算
        Object.keys(statusData).forEach(status => {
            if (statusData[status].count > 0) {
                statusData[status].progress = Math.round(
                    statusData[status].progress / statusData[status].count
                );
            }
        });

        return statusData;
    }

    /**
     * 優先度別進捗を取得
     */
    getProgressByPriority() {
        const tasks = this.taskManager.getTasks();
        const priorityData = {
            'high': { total: 0, completed: 0, progress: 0 },
            'medium': { total: 0, completed: 0, progress: 0 },
            'low': { total: 0, completed: 0, progress: 0 }
        };

        tasks.forEach(task => {
            const priority = task.priority;
            priorityData[priority].total++;
            
            if (task.status === 'completed') {
                priorityData[priority].completed++;
            }
        });

        // 進捗率を計算
        Object.keys(priorityData).forEach(priority => {
            const data = priorityData[priority];
            data.progress = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        });

        return priorityData;
    }

    /**
     * 進捗タイムラインを取得
     */
    getProgressTimeline(days = 30) {
        const projects = this.projectManager.getProjects();
        const tasks = this.taskManager.getTasks();
        const timeline = [];
        
        const today = new Date();
        const startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            
            // その日の完了タスク数
            const completedTasks = tasks.filter(task => {
                if (task.status !== 'completed') return false;
                const completedDate = new Date(task.completedAt);
                return completedDate.toISOString().split('T')[0] === dateStr;
            }).length;
            
            // その日の新規タスク数
            const newTasks = tasks.filter(task => {
                const createdDate = new Date(task.createdAt);
                return createdDate.toISOString().split('T')[0] === dateStr;
            }).length;
            
            timeline.push({
                date: dateStr,
                completedTasks: completedTasks,
                newTasks: newTasks,
                netProgress: completedTasks - newTasks
            });
        }
        
        return timeline;
    }

    /**
     * マイルストーンを取得
     */
    getMilestones() {
        const projects = this.projectManager.getProjects();
        const milestones = [];
        
        projects.forEach(project => {
            const tasks = this.taskManager.getTasksByProject(project.id);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const totalTasks = tasks.length;
            
            if (totalTasks > 0) {
                const progress = Math.round((completedTasks / totalTasks) * 100);
                
                // 25%, 50%, 75%, 100%のマイルストーン
                const milestonePoints = [25, 50, 75, 100];
                
                milestonePoints.forEach(point => {
                    if (progress >= point) {
                        milestones.push({
                            projectId: project.id,
                            projectName: project.name,
                            milestone: `${point}%`,
                            progress: progress,
                            achievedAt: new Date().toISOString(),
                            description: `${project.name}が${point}%完了しました`
                        });
                    }
                });
            }
        });
        
        return milestones;
    }

    /**
     * 進捗レポートを生成
     */
    generateProgressReport() {
        const progressData = this.getProgressData();
        const projectStats = this.projectManager.getProjectStats();
        const taskStats = this.taskManager.getTaskStats();
        
        return {
            generatedAt: new Date().toISOString(),
            summary: {
                overallProgress: progressData.overall,
                totalProjects: projectStats.total,
                totalTasks: taskStats.total,
                completedTasks: taskStats.byStatus.completed,
                overdueTasks: taskStats.overdue
            },
            details: progressData,
            recommendations: this.generateRecommendations(progressData, projectStats, taskStats)
        };
    }

    /**
     * 推奨事項を生成
     */
    generateRecommendations(progressData, projectStats, taskStats) {
        const recommendations = [];
        
        // 期限切れタスクの推奨
        if (taskStats.overdue > 0) {
            recommendations.push({
                type: 'warning',
                title: '期限切れタスクがあります',
                message: `${taskStats.overdue}件のタスクが期限を過ぎています。優先的に処理してください。`,
                action: 'overdue-tasks'
            });
        }
        
        // 期限が近いタスクの推奨
        if (taskStats.dueSoon > 0) {
            recommendations.push({
                type: 'info',
                title: '期限が近いタスクがあります',
                message: `${taskStats.dueSoon}件のタスクが7日以内に期限を迎えます。`,
                action: 'due-soon-tasks'
            });
        }
        
        // 低進捗プロジェクトの推奨
        const lowProgressProjects = progressData.byProject.filter(p => p.progress < 25);
        if (lowProgressProjects.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '進捗が遅れているプロジェクトがあります',
                message: `${lowProgressProjects.length}件のプロジェクトで進捗が25%未満です。`,
                action: 'low-progress-projects'
            });
        }
        
        // 高優先度タスクの推奨
        if (taskStats.byPriority.high > 0) {
            recommendations.push({
                type: 'info',
                title: '高優先度タスクがあります',
                message: `${taskStats.byPriority.high}件の高優先度タスクが残っています。`,
                action: 'high-priority-tasks'
            });
        }
        
        return recommendations;
    }

    /**
     * 進捗目標を設定
     */
    setProgressGoal(projectId, targetProgress, targetDate) {
        const goal = {
            id: this.generateId(),
            projectId: projectId,
            targetProgress: targetProgress,
            targetDate: targetDate,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        // ローカルストレージに保存（簡易実装）
        const goals = JSON.parse(localStorage.getItem('progressGoals') || '[]');
        goals.push(goal);
        localStorage.setItem('progressGoals', JSON.stringify(goals));
        
        this.eventManager.emit('progressGoalSet', goal);
        return goal;
    }

    /**
     * 進捗目標を取得
     */
    getProgressGoals() {
        return JSON.parse(localStorage.getItem('progressGoals') || '[]');
    }

    /**
     * 進捗目標の達成状況をチェック
     */
    checkProgressGoals() {
        const goals = this.getProgressGoals();
        const results = [];
        
        goals.forEach(goal => {
            if (goal.status === 'active') {
                const currentProgress = this.calculateProjectProgress(goal.projectId);
                const isAchieved = currentProgress >= goal.targetProgress;
                const isOverdue = new Date() > new Date(goal.targetDate);
                
                results.push({
                    goal: goal,
                    currentProgress: currentProgress,
                    isAchieved: isAchieved,
                    isOverdue: isOverdue,
                    status: isAchieved ? 'achieved' : (isOverdue ? 'overdue' : 'in-progress')
                });
            }
        });
        
        return results;
    }

    /**
     * ID生成
     */
    generateId() {
        return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
