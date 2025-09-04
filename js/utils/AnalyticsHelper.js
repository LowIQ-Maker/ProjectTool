/**
 * プロジェクト管理ツールの高度な分析機能
 * データの可視化、予測分析、リスク評価などを提供
 */
class AnalyticsHelper {
    constructor() {
        this.storage = new Storage();
    }

    /**
     * プロジェクトの進捗予測を計算
     * 過去のデータから将来の進捗を予測
     */
    calculateProgressPrediction(projectId) {
        const project = this.storage.getProject(projectId);
        if (!project) return null;

        const tasks = this.storage.getTasks().filter(t => t.projectId === projectId);
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        const pendingTasks = tasks.filter(t => t.status === 'pending');

        // 完了率の計算
        const completionRate = completedTasks.length / tasks.length;
        
        // 残り日数の計算
        const today = new Date();
        const endDate = new Date(project.endDate);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        // 1日あたりの進捗率を計算
        const totalDays = Math.ceil((endDate - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
        const dailyProgress = completionRate / totalDays;
        
        // 予測完了日を計算
        const predictedCompletionDays = Math.ceil((1 - completionRate) / dailyProgress);
        const predictedCompletionDate = new Date(today.getTime() + (predictedCompletionDays * 24 * 60 * 60 * 1000));
        
        return {
            currentProgress: Math.round(completionRate * 100),
            remainingDays,
            dailyProgress: Math.round(dailyProgress * 100),
            predictedCompletionDate: predictedCompletionDate.toISOString().split('T')[0],
            isOnTrack: remainingDays >= predictedCompletionDays,
            riskLevel: this.calculateRiskLevel(remainingDays, predictedCompletionDays, completionRate)
        };
    }

    /**
     * リスクレベルを計算
     */
    calculateRiskLevel(remainingDays, predictedDays, completionRate) {
        if (remainingDays < predictedDays * 0.5) return 'high';
        if (remainingDays < predictedDays * 0.8) return 'medium';
        if (completionRate < 0.3 && remainingDays < predictedDays) return 'medium';
        return 'low';
    }

    /**
     * プロジェクトの効率性スコアを計算
     */
    calculateEfficiencyScore(projectId) {
        const project = this.storage.getProject(projectId);
        if (!project) return 0;

        const tasks = this.storage.getTasks().filter(t => t.projectId === projectId);
        const expenses = this.storage.getExpenses().filter(e => e.projectId === projectId);
        
        // 予算使用率
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const budgetUsage = project.budget > 0 ? (totalExpense / project.budget) : 0;
        
        // 時間効率（予想工数 vs 実際工数）
        const estimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
        const actualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
        const timeEfficiency = estimatedHours > 0 ? (estimatedHours / actualHours) : 1;
        
        // 品質スコア（完了タスクの割合）
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const qualityScore = tasks.length > 0 ? (completedTasks / tasks.length) : 0;
        
        // 総合スコア（0-100）
        const budgetScore = Math.max(0, 100 - (budgetUsage * 100));
        const timeScore = Math.min(100, timeEfficiency * 100);
        const qualityScoreFinal = qualityScore * 100;
        
        return Math.round((budgetScore + timeScore + qualityScoreFinal) / 3);
    }

    /**
     * チームの生産性分析
     */
    analyzeTeamProductivity() {
        const projects = this.storage.getProjects();
        const tasks = this.storage.getTasks();
        
        const productivityData = projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed');
            
            return {
                projectId: project.id,
                projectName: project.name,
                totalTasks: projectTasks.length,
                completedTasks: completedTasks.length,
                completionRate: projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) : 0,
                averageTaskDuration: this.calculateAverageTaskDuration(projectTasks)
            };
        });
        
        return productivityData.sort((a, b) => b.completionRate - a.completionRate);
    }

    /**
     * タスクの平均完了期間を計算
     */
    calculateAverageTaskDuration(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && t.createdAt);
        
        if (completedTasks.length === 0) return 0;
        
        const totalDuration = completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.completedAt);
            return sum + (completed - created);
        }, 0);
        
        return Math.round(totalDuration / (completedTasks.length * 24 * 60 * 60 * 1000)); // 日数
    }

    /**
     * 予算の使用傾向を分析
     */
    analyzeBudgetTrends() {
        const projects = this.storage.getProjects();
        const expenses = this.storage.getExpenses();
        
        const monthlyData = {};
        
        expenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    totalExpense: 0,
                    projectCount: new Set(),
                    expenseCount: 0
                };
            }
            
            monthlyData[month].totalExpense += expense.amount;
            monthlyData[month].projectCount.add(expense.projectId);
            monthlyData[month].expenseCount++;
        });
        
        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            totalExpense: data.totalExpense,
            projectCount: data.projectCount.size,
            expenseCount: data.expenseCount,
            averageExpense: Math.round(data.totalExpense / data.expenseCount)
        })).sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * プロジェクトの依存関係を分析
     */
    analyzeProjectDependencies() {
        const projects = this.storage.getProjects();
        const tasks = this.storage.getTasks();
        
        const dependencies = [];
        
        projects.forEach(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const criticalTasks = projectTasks.filter(t => t.priority === 'high' && t.status !== 'completed');
            
            if (criticalTasks.length > 0) {
                dependencies.push({
                    projectId: project.id,
                    projectName: project.name,
                    criticalTaskCount: criticalTasks.length,
                    riskLevel: this.calculateProjectRiskLevel(project, criticalTasks),
                    dependencies: this.findTaskDependencies(criticalTasks, projectTasks)
                });
            }
        });
        
        return dependencies.sort((a, b) => b.riskLevel - a.riskLevel);
    }

    /**
     * プロジェクトのリスクレベルを計算
     */
    calculateProjectRiskLevel(project, criticalTasks) {
        const today = new Date();
        const endDate = new Date(project.endDate);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        let riskScore = 0;
        
        // 期限が近いほどリスクが高い
        if (remainingDays <= 7) riskScore += 30;
        else if (remainingDays <= 14) riskScore += 20;
        else if (remainingDays <= 30) riskScore += 10;
        
        // 重要なタスクが多いほどリスクが高い
        riskScore += criticalTasks.length * 15;
        
        // 予算使用率が高いほどリスクが高い
        const expenses = this.storage.getExpenses().filter(e => e.projectId === project.id);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const budgetUsage = project.budget > 0 ? (totalExpense / project.budget) : 0;
        
        if (budgetUsage > 0.9) riskScore += 25;
        else if (budgetUsage > 0.7) riskScore += 15;
        
        return Math.min(100, riskScore);
    }

    /**
     * タスクの依存関係を検索
     */
    findTaskDependencies(criticalTasks, allTasks) {
        const dependencies = [];
        
        criticalTasks.forEach(task => {
            // 同じプロジェクト内で、このタスクの完了を待つ必要があるタスクを検索
            const dependentTasks = allTasks.filter(t => 
                t.id !== task.id && 
                t.status !== 'completed' &&
                t.dueDate > task.dueDate
            );
            
            if (dependentTasks.length > 0) {
                dependencies.push({
                    taskId: task.id,
                    taskName: task.name,
                    dependentTaskCount: dependentTasks.length,
                    dependentTasks: dependentTasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        dueDate: t.dueDate
                    }))
                });
            }
        });
        
        return dependencies;
    }

    /**
     * 総合的なプロジェクトヘルススコアを計算
     */
    calculateProjectHealthScore(projectId) {
        const project = this.storage.getProject(projectId);
        if (!project) return 0;

        const progressPrediction = this.calculateProgressPrediction(projectId);
        const efficiencyScore = this.calculateEfficiencyScore(projectId);
        
        if (!progressPrediction) return efficiencyScore;
        
        // 進捗予測の重み: 40%, 効率性スコアの重み: 60%
        const progressWeight = 0.4;
        const efficiencyWeight = 0.6;
        
        const progressScore = progressPrediction.isOnTrack ? 100 : 
            Math.max(0, 100 - (progressPrediction.riskLevel === 'high' ? 50 : 25));
        
        return Math.round((progressScore * progressWeight) + (efficiencyScore * efficiencyWeight));
    }

    /**
     * 改善提案を生成
     */
    generateImprovementSuggestions(projectId) {
        const project = this.storage.getProject(projectId);
        if (!project) return [];

        const suggestions = [];
        const progressPrediction = this.calculateProgressPrediction(projectId);
        const efficiencyScore = this.calculateEfficiencyScore(projectId);
        
        if (progressPrediction) {
            if (progressPrediction.riskLevel === 'high') {
                suggestions.push({
                    type: 'urgent',
                    title: 'プロジェクトの遅延リスクが高い',
                    description: `現在の進捗率${progressPrediction.currentProgress}%では、期限${project.endDate}までに完了できません。`,
                    actions: [
                        '重要なタスクの優先度を上げる',
                        '追加リソースの投入を検討する',
                        'スコープの見直しを検討する'
                    ]
                });
            }
            
            if (progressPrediction.remainingDays < 7) {
                suggestions.push({
                    type: 'warning',
                    title: 'プロジェクト期限が近い',
                    description: `残り${progressPrediction.remainingDays}日でプロジェクトが完了します。`,
                    actions: [
                        '最終チェックリストの確認',
                        '成果物の品質確認',
                        '関係者への進捗報告'
                    ]
                });
            }
        }
        
        if (efficiencyScore < 50) {
            suggestions.push({
                type: 'improvement',
                title: 'プロジェクト効率の改善が必要',
                description: `現在の効率性スコアは${efficiencyScore}点です。`,
                actions: [
                    'タスクの見積もり精度を向上させる',
                    '無駄な作業プロセスの見直し',
                    'チームメンバーのスキル向上'
                ]
            });
        }
        
        return suggestions;
    }
}

// グローバルに利用可能にする
window.AnalyticsHelper = AnalyticsHelper;
