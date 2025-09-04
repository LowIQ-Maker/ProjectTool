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

        try {
            // 完了率の計算
            const completionRate = completedTasks.length / tasks.length;
            
            // 日付の検証と計算
            const today = new Date();
            const endDate = new Date(project.endDate);
            const startDate = new Date(project.startDate);
            
            // 無効な日付のチェック
            if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
                console.warn('AnalyticsHelper.calculateProgressPrediction: 無効な日付が検出されました', {
                    projectId: project.id,
                    startDate: project.startDate,
                    endDate: project.endDate
                });
                return {
                    currentProgress: Math.round(completionRate * 100),
                    remainingDays: 0,
                    dailyProgress: 0,
                    predictedCompletionDate: null,
                    isOnTrack: false,
                    riskLevel: 'high'
                };
            }
            
            const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            // 1日あたりの進捗率を計算
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const dailyProgress = totalDays > 0 ? completionRate / totalDays : 0;
            
            // 予測完了日を計算
            const predictedCompletionDays = dailyProgress > 0 ? Math.ceil((1 - completionRate) / dailyProgress) : 0;
            const predictedCompletionDate = new Date(today.getTime() + (predictedCompletionDays * 24 * 60 * 60 * 1000));
            
            // 予測完了日の検証
            const predictedDateString = isNaN(predictedCompletionDate.getTime()) ? null : predictedCompletionDate.toISOString().split('T')[0];
            
            return {
                currentProgress: Math.round(completionRate * 100),
                remainingDays: Math.max(0, remainingDays),
                dailyProgress: Math.round(dailyProgress * 100),
                predictedCompletionDate: predictedDateString,
                isOnTrack: remainingDays >= predictedCompletionDays,
                riskLevel: this.calculateRiskLevel(remainingDays, predictedCompletionDays, completionRate)
            };
        } catch (error) {
            console.error('AnalyticsHelper.calculateProgressPrediction: エラーが発生しました:', error);
            return {
                currentProgress: 0,
                remainingDays: 0,
                dailyProgress: 0,
                predictedCompletionDate: null,
                isOnTrack: false,
                riskLevel: 'high'
            };
        }
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
                completionRate: projectTasks.length > 0 ? completedTasks.length / projectTasks.length : 0,
                totalTasks: projectTasks.length,
                completedTasks: completedTasks.length
            };
        });
        
        return productivityData;
    }

    /**
     * 予算トレンドの分析
     */
    analyzeBudgetTrends() {
        const projects = this.storage.getProjects();
        const expenses = this.storage.getExpenses();
        
        // 月別の支出データを集計
        const monthlyExpenses = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyExpenses[monthKey]) {
                monthlyExpenses[monthKey] = 0;
            }
            monthlyExpenses[monthKey] += expense.amount;
        });
        
        // 月別データを配列に変換
        const budgetData = Object.keys(monthlyExpenses).map(month => ({
            month: month,
            totalExpense: monthlyExpenses[month]
        })).sort((a, b) => a.month.localeCompare(b.month));
        
        return budgetData;
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
                // 依存関係のあるタスクを特定
                const dependentTasks = criticalTasks.filter(task => {
                    // 他のタスクがこのタスクに依存しているかチェック
                    return projectTasks.some(otherTask => 
                        otherTask.id !== task.id && 
                        otherTask.dependencies && 
                        otherTask.dependencies.includes(task.id)
                    );
                });
                
                if (dependentTasks.length > 0) {
                    dependencies.push({
                        projectId: project.id,
                        projectName: project.name,
                        riskLevel: this.calculateProjectRiskLevel(project.id),
                        criticalTaskCount: criticalTasks.length,
                        dependencies: dependentTasks.map(task => ({
                            taskId: task.id,
                            taskName: task.name,
                            dueDate: task.dueDate
                        }))
                    });
                }
            }
        });
        
        return dependencies;
    }

    /**
     * プロジェクトのリスクレベルを計算
     */
    calculateProjectRiskLevel(projectId) {
        const project = this.storage.getProject(projectId);
        if (!project) return 'low';

        const tasks = this.storage.getTasks().filter(t => t.projectId === projectId);
        const criticalTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
        const overdueTasks = tasks.filter(t => {
            if (t.status === 'completed') return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            // 無効な日付の場合は期限切れとして扱わない
            return !isNaN(dueDate.getTime()) && dueDate < today;
        });

        let riskScore = 0;
        
        if (criticalTasks.length > 3) riskScore += 30;
        else if (criticalTasks.length > 1) riskScore += 20;
        
        if (overdueTasks.length > 0) riskScore += 25;
        
        const today = new Date();
        const endDate = new Date(project.endDate);
        
        // 無効な日付の場合はリスクを高く設定
        if (isNaN(endDate.getTime())) {
            console.warn('AnalyticsHelper.calculateProjectRiskLevel: 無効な終了日が検出されました', {
                projectId: project.id,
                endDate: project.endDate
            });
            return 'high';
        }
        
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (remainingDays <= 7) riskScore += 30;
        else if (remainingDays <= 14) riskScore += 20;
        
        if (riskScore >= 60) return 'high';
        if (riskScore >= 30) return 'medium';
        return 'low';
    }

    /**
     * タスクの依存関係を特定
     */
    findTaskDependencies(taskId) {
        const tasks = this.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task || !task.dependencies) return [];
        
        return task.dependencies.map(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            return dependentTask ? {
                id: dependentTask.id,
                name: dependentTask.name,
                status: dependentTask.status,
                dueDate: dependentTask.dueDate
            } : null;
        }).filter(Boolean);
    }

    /**
     * 総合的なプロジェクトヘルススコアを計算
     */
    calculateProjectHealthScore(projectId) {
        try {
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
        } catch (error) {
            console.error('AnalyticsHelper.calculateProjectHealthScore: エラーが発生しました:', error);
            return 0;
        }
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
