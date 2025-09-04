class ReportGenerator {
    constructor() {
        this.reportTemplates = {
            projectProgress: this.getProjectProgressTemplate(),
            timeAnalysis: this.getTimeAnalysisTemplate(),
            budgetReport: this.getBudgetReportTemplate(),
            teamProductivity: this.getTeamProductivityTemplate(),
            riskAssessment: this.getRiskAssessmentTemplate()
        };
    }

    // プロジェクト進捗レポート
    generateProjectProgressReport(projects, tasks) {
        const report = {
            title: 'プロジェクト進捗レポート',
            generatedAt: new Date().toISOString(),
            summary: this.calculateProjectSummary(projects, tasks),
            projects: projects.map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const completedTasks = projectTasks.filter(task => task.status === 'completed');
                const progress = projectTasks.length > 0 ? 
                    Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

                return {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    progress: progress,
                    totalTasks: projectTasks.length,
                    completedTasks: completedTasks.length,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    budget: project.budget,
                    daysRemaining: this.calculateDaysRemaining(project.endDate),
                    overdue: this.isOverdue(project.endDate)
                };
            }),
            recommendations: this.generateProjectRecommendations(projects, tasks)
        };

        return report;
    }

    // 時間分析レポート
    generateTimeAnalysisReport(timeEntries, tasks, projects) {
        const report = {
            title: '時間分析レポート',
            generatedAt: new Date().toISOString(),
            summary: this.calculateTimeSummary(timeEntries, tasks, projects),
            timeBreakdown: this.analyzeTimeBreakdown(timeEntries, tasks),
            productivityMetrics: this.calculateProductivityMetrics(timeEntries, tasks),
            trends: this.analyzeTimeTrends(timeEntries),
            recommendations: this.generateTimeRecommendations(timeEntries, tasks)
        };

        return report;
    }

    // 予算レポート
    generateBudgetReport(projects, expenses) {
        const report = {
            title: '予算管理レポート',
            generatedAt: new Date().toISOString(),
            summary: this.calculateBudgetSummary(projects, expenses),
            projectBudgets: this.analyzeProjectBudgets(projects, expenses),
            expenseCategories: this.categorizeExpenses(expenses),
            budgetAlerts: this.generateBudgetAlerts(projects, expenses),
            recommendations: this.generateBudgetRecommendations(projects, expenses)
        };

        return report;
    }

    // チーム生産性レポート
    generateTeamProductivityReport(tasks, timeEntries, projects) {
        const report = {
            title: 'チーム生産性レポート',
            generatedAt: new Date().toISOString(),
            summary: this.calculateProductivitySummary(tasks, timeEntries),
            individualPerformance: this.analyzeIndividualPerformance(tasks, timeEntries),
            projectEfficiency: this.analyzeProjectEfficiency(tasks, timeEntries, projects),
            bottlenecks: this.identifyBottlenecks(tasks, timeEntries),
            recommendations: this.generateProductivityRecommendations(tasks, timeEntries)
        };

        return report;
    }

    // リスク評価レポート
    generateRiskAssessmentReport(projects, tasks) {
        const report = {
            title: 'リスク評価レポート',
            generatedAt: new Date().toISOString(),
            summary: this.calculateRiskSummary(projects, tasks),
            riskFactors: this.identifyRiskFactors(projects, tasks),
            riskMatrix: this.createRiskMatrix(projects, tasks),
            mitigationStrategies: this.generateMitigationStrategies(projects, tasks),
            recommendations: this.generateRiskRecommendations(projects, tasks)
        };

        return report;
    }

    // プロジェクトサマリー計算
    calculateProjectSummary(projects, tasks) {
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'in-progress').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const overdueProjects = projects.filter(p => this.isOverdue(p.endDate)).length;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const overdueTasks = tasks.filter(t => this.isOverdue(t.dueDate)).length;

        const overallProgress = totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            overdueProjects,
            totalTasks,
            completedTasks,
            overdueTasks,
            overallProgress
        };
    }

    // 時間サマリー計算
    calculateTimeSummary(timeEntries, tasks, projects) {
        const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
        const totalHours = Math.round(totalTime / 60 * 100) / 100;
        const averageTimePerTask = tasks.length > 0 ? 
            Math.round(totalTime / tasks.length) : 0;

        const today = new Date();
        const todayEntries = timeEntries.filter(entry => {
            const entryDate = new Date(entry.startTime);
            return entryDate.toDateString() === today.toDateString();
        });
        const todayTime = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);

        return {
            totalTime,
            totalHours,
            averageTimePerTask,
            todayTime,
            todayEntries: todayEntries.length,
            totalEntries: timeEntries.length
        };
    }

    // 予算サマリー計算
    calculateBudgetSummary(projects, expenses) {
        const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const remainingBudget = totalBudget - totalExpenses;
        const budgetUsageRate = totalBudget > 0 ? 
            Math.round((totalExpenses / totalBudget) * 100) : 0;

        return {
            totalBudget,
            totalExpenses,
            remainingBudget,
            budgetUsageRate,
            isOverBudget: totalExpenses > totalBudget
        };
    }

    // 生産性サマリー計算
    calculateProductivitySummary(tasks, timeEntries) {
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const totalEstimatedTime = completedTasks.reduce((sum, task) => 
            sum + (task.estimatedHours || 0), 0);
        const totalActualTime = completedTasks.reduce((sum, task) => {
            const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
            return sum + taskEntries.reduce((entrySum, entry) => entrySum + entry.duration, 0);
        }, 0) / 60; // 時間単位に変換

        const efficiency = totalEstimatedTime > 0 ? 
            Math.round((totalEstimatedTime / totalActualTime) * 100) : 0;

        return {
            completedTasks: completedTasks.length,
            totalEstimatedTime,
            totalActualTime: Math.round(totalActualTime * 100) / 100,
            efficiency,
            averageTimePerTask: completedTasks.length > 0 ? 
                Math.round(totalActualTime / completedTasks.length * 100) / 100 : 0
        };
    }

    // リスクサマリー計算
    calculateRiskSummary(projects, tasks) {
        const highRiskProjects = projects.filter(p => 
            this.calculateProjectRiskLevel(p, tasks) === 'high'
        ).length;
        const mediumRiskProjects = projects.filter(p => 
            this.calculateProjectRiskLevel(p, tasks) === 'medium'
        ).length;
        const lowRiskProjects = projects.filter(p => 
            this.calculateProjectRiskLevel(p, tasks) === 'low'
        ).length;

        const overdueTasks = tasks.filter(t => this.isOverdue(t.dueDate)).length;
        const criticalTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

        return {
            totalProjects: projects.length,
            highRiskProjects,
            mediumRiskProjects,
            lowRiskProjects,
            overdueTasks,
            criticalTasks,
            overallRiskLevel: this.calculateOverallRiskLevel(projects, tasks)
        };
    }

    // 時間内訳分析
    analyzeTimeBreakdown(timeEntries, tasks) {
        const taskTimeMap = {};
        timeEntries.forEach(entry => {
            if (!taskTimeMap[entry.taskId]) {
                taskTimeMap[entry.taskId] = 0;
            }
            taskTimeMap[entry.taskId] += entry.duration;
        });

        const breakdown = Object.entries(taskTimeMap).map(([taskId, time]) => {
            const task = tasks.find(t => t.id === taskId);
            return {
                taskId,
                taskName: task ? task.name : 'Unknown Task',
                time,
                hours: Math.round(time / 60 * 100) / 100
            };
        }).sort((a, b) => b.time - a.time);

        return breakdown;
    }

    // プロジェクト予算分析
    analyzeProjectBudgets(projects, expenses) {
        return projects.map(project => {
            const projectExpenses = expenses.filter(exp => exp.projectId === project.id);
            const totalExpenses = projectExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const remainingBudget = (project.budget || 0) - totalExpenses;
            const usageRate = (project.budget || 0) > 0 ? 
                Math.round((totalExpenses / project.budget) * 100) : 0;

            return {
                projectId: project.id,
                projectName: project.name,
                budget: project.budget || 0,
                expenses: totalExpenses,
                remainingBudget,
                usageRate,
                isOverBudget: totalExpenses > (project.budget || 0)
            };
        });
    }

    // 経費カテゴリ分類
    categorizeExpenses(expenses) {
        const categories = {};
        expenses.forEach(expense => {
            const category = expense.item || 'その他';
            if (!categories[category]) {
                categories[category] = {
                    name: category,
                    total: 0,
                    count: 0,
                    expenses: []
                };
            }
            categories[category].total += expense.amount || 0;
            categories[category].count += 1;
            categories[category].expenses.push(expense);
        });

        return Object.values(categories).sort((a, b) => b.total - a.total);
    }

    // 予算アラート生成
    generateBudgetAlerts(projects, expenses) {
        const alerts = [];
        
        projects.forEach(project => {
            const projectExpenses = expenses.filter(exp => exp.projectId === project.id);
            const totalExpenses = projectExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const usageRate = (project.budget || 0) > 0 ? 
                (totalExpenses / project.budget) * 100 : 0;

            if (usageRate >= 100) {
                alerts.push({
                    type: 'critical',
                    projectId: project.id,
                    projectName: project.name,
                    message: `予算を超過しています (${Math.round(usageRate)}%)`,
                    usageRate: Math.round(usageRate)
                });
            } else if (usageRate >= 80) {
                alerts.push({
                    type: 'warning',
                    projectId: project.id,
                    projectName: project.name,
                    message: `予算使用率が高いです (${Math.round(usageRate)}%)`,
                    usageRate: Math.round(usageRate)
                });
            }
        });

        return alerts;
    }

    // 時間トレンド分析
    analyzeTimeTrends(timeEntries) {
        const dailyData = {};
        timeEntries.forEach(entry => {
            const date = new Date(entry.startTime).toDateString();
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += entry.duration;
        });

        const sortedDates = Object.keys(dailyData).sort();
        const trend = sortedDates.map(date => ({
            date: new Date(date),
            time: dailyData[date],
            hours: Math.round(dailyData[date] / 60 * 100) / 100
        }));

        return trend;
    }

    // 個人パフォーマンス分析
    analyzeIndividualPerformance(tasks, timeEntries) {
        // 実際の実装では、ユーザー情報が必要
        // ここでは簡易的な実装
        const taskPerformance = {};
        
        tasks.forEach(task => {
            const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
            const actualTime = taskEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
            const estimatedTime = task.estimatedHours || 0;
            
            if (estimatedTime > 0) {
                const efficiency = Math.round((estimatedTime / actualTime) * 100);
                taskPerformance[task.id] = {
                    taskName: task.name,
                    estimatedTime,
                    actualTime: Math.round(actualTime * 100) / 100,
                    efficiency,
                    isOnTime: actualTime <= estimatedTime
                };
            }
        });

        return Object.values(taskPerformance);
    }

    // プロジェクト効率分析
    analyzeProjectEfficiency(tasks, timeEntries, projects) {
        return projects.map(project => {
            const projectTasks = tasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed');
            
            let totalEstimatedTime = 0;
            let totalActualTime = 0;
            
            completedTasks.forEach(task => {
                totalEstimatedTime += task.estimatedHours || 0;
                const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
                totalActualTime += taskEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
            });

            const efficiency = totalEstimatedTime > 0 ? 
                Math.round((totalEstimatedTime / totalActualTime) * 100) : 0;

            return {
                projectId: project.id,
                projectName: project.name,
                completedTasks: completedTasks.length,
                totalEstimatedTime,
                totalActualTime: Math.round(totalActualTime * 100) / 100,
                efficiency
            };
        });
    }

    // ボトルネック特定
    identifyBottlenecks(tasks, timeEntries) {
        const bottlenecks = [];
        
        tasks.forEach(task => {
            if (task.status === 'in-progress') {
                const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
                const actualTime = taskEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
                const estimatedTime = task.estimatedHours || 0;
                
                if (estimatedTime > 0 && actualTime > estimatedTime * 1.5) {
                    bottlenecks.push({
                        taskId: task.id,
                        taskName: task.name,
                        estimatedTime,
                        actualTime: Math.round(actualTime * 100) / 100,
                        delay: Math.round((actualTime - estimatedTime) * 100) / 100
                    });
                }
            }
        });

        return bottlenecks.sort((a, b) => b.delay - a.delay);
    }

    // プロジェクトリスクレベル計算
    calculateProjectRiskLevel(project, tasks) {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const overdueTasks = projectTasks.filter(task => this.isOverdue(task.dueDate)).length;
        const criticalTasks = projectTasks.filter(task => 
            task.priority === 'high' && task.status !== 'completed'
        ).length;
        
        const daysRemaining = this.calculateDaysRemaining(project.endDate);
        const progress = projectTasks.length > 0 ? 
            projectTasks.filter(t => t.status === 'completed').length / projectTasks.length : 0;

        let riskScore = 0;
        if (overdueTasks > 0) riskScore += 3;
        if (criticalTasks > 2) riskScore += 2;
        if (daysRemaining < 7) riskScore += 2;
        if (progress < 0.3 && daysRemaining < 14) riskScore += 1;

        if (riskScore >= 5) return 'high';
        if (riskScore >= 3) return 'medium';
        return 'low';
    }

    // 全体リスクレベル計算
    calculateOverallRiskLevel(projects, tasks) {
        const riskLevels = projects.map(project => this.calculateProjectRiskLevel(project, tasks));
        const highRiskCount = riskLevels.filter(level => level === 'high').length;
        const mediumRiskCount = riskLevels.filter(level => level === 'medium').length;

        if (highRiskCount > 0) return 'high';
        if (mediumRiskCount > 2) return 'medium';
        return 'low';
    }

    // レポートテンプレート
    getProjectProgressTemplate() {
        return {
            title: 'プロジェクト進捗レポート',
            sections: ['summary', 'projects', 'recommendations']
        };
    }

    getTimeAnalysisTemplate() {
        return {
            title: '時間分析レポート',
            sections: ['summary', 'breakdown', 'productivity', 'trends', 'recommendations']
        };
    }

    getBudgetReportTemplate() {
        return {
            title: '予算管理レポート',
            sections: ['summary', 'projectBudgets', 'categories', 'alerts', 'recommendations']
        };
    }

    getTeamProductivityTemplate() {
        return {
            title: 'チーム生産性レポート',
            sections: ['summary', 'individual', 'efficiency', 'bottlenecks', 'recommendations']
        };
    }

    getRiskAssessmentTemplate() {
        return {
            title: 'リスク評価レポート',
            sections: ['summary', 'factors', 'matrix', 'mitigation', 'recommendations']
        };
    }

    // 推奨事項生成
    generateProjectRecommendations(projects, tasks) {
        const recommendations = [];
        
        // 期限切れプロジェクトの推奨事項
        const overdueProjects = projects.filter(p => this.isOverdue(p.endDate));
        if (overdueProjects.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: '期限切れプロジェクトの対応',
                description: `${overdueProjects.length}件のプロジェクトが期限を超過しています。優先度を再評価し、スケジュールの見直しを検討してください。`,
                actions: ['プロジェクト優先度の再評価', 'スケジュールの見直し', 'リソースの再配分']
            });
        }

        // 進捗が遅れているプロジェクトの推奨事項
        const slowProjects = projects.filter(p => {
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const progress = projectTasks.length > 0 ? 
                projectTasks.filter(t => t.status === 'completed').length / projectTasks.length : 0;
            return progress < 0.3 && !this.isOverdue(p.endDate);
        });

        if (slowProjects.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '進捗遅延プロジェクトの対応',
                description: `${slowProjects.length}件のプロジェクトで進捗が遅れています。ボトルネックの特定と対策を実施してください。`,
                actions: ['ボトルネックの特定', 'リソースの追加投入', 'タスクの優先度調整']
            });
        }

        return recommendations;
    }

    generateTimeRecommendations(timeEntries, tasks) {
        const recommendations = [];
        
        // 時間記録の推奨事項
        if (timeEntries.length === 0) {
            recommendations.push({
                type: 'info',
                title: '時間記録の開始',
                description: '時間記録がありません。作業時間の記録を開始して、生産性の分析を行いましょう。',
                actions: ['タイムトラッキングの開始', '時間記録の習慣化']
            });
        }

        // 効率性の推奨事項
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const efficiencyData = completedTasks.map(task => {
            const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
            const actualTime = taskEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
            const estimatedTime = task.estimatedHours || 0;
            return { task, actualTime, estimatedTime };
        }).filter(data => data.estimatedTime > 0);

        if (efficiencyData.length > 0) {
            const avgEfficiency = efficiencyData.reduce((sum, data) => 
                sum + (data.estimatedTime / data.actualTime), 0) / efficiencyData.length;
            
            if (avgEfficiency < 0.8) {
                recommendations.push({
                    type: 'warning',
                    title: '見積もり精度の改善',
                    description: '実際の作業時間が予想時間を大幅に超過しています。見積もり精度の改善が必要です。',
                    actions: ['見積もり方法の見直し', '過去データの分析', 'バッファ時間の追加']
                });
            }
        }

        return recommendations;
    }

    generateBudgetRecommendations(projects, expenses) {
        const recommendations = [];
        
        // 予算超過の推奨事項
        const overBudgetProjects = projects.filter(project => {
            const projectExpenses = expenses.filter(exp => exp.projectId === project.id);
            const totalExpenses = projectExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            return totalExpenses > (project.budget || 0);
        });

        if (overBudgetProjects.length > 0) {
            recommendations.push({
                type: 'critical',
                title: '予算超過プロジェクトの対応',
                description: `${overBudgetProjects.length}件のプロジェクトで予算を超過しています。緊急の対応が必要です。`,
                actions: ['支出の見直し', '追加予算の検討', 'スコープの縮小']
            });
        }

        // 予算使用率の推奨事項
        const highUsageProjects = projects.filter(project => {
            const projectExpenses = expenses.filter(exp => exp.projectId === project.id);
            const totalExpenses = projectExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const usageRate = (project.budget || 0) > 0 ? (totalExpenses / project.budget) * 100 : 0;
            return usageRate >= 80 && usageRate < 100;
        });

        if (highUsageProjects.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '予算使用率の監視',
                description: `${highUsageProjects.length}件のプロジェクトで予算使用率が80%を超えています。支出の監視を強化してください。`,
                actions: ['支出の監視強化', '予算の見直し', 'コスト削減の検討']
            });
        }

        return recommendations;
    }

    generateProductivityRecommendations(tasks, timeEntries) {
        const recommendations = [];
        
        // ボトルネックの推奨事項
        const bottlenecks = this.identifyBottlenecks(tasks, timeEntries);
        if (bottlenecks.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'ボトルネックタスクの対応',
                description: `${bottlenecks.length}件のタスクで予想時間を大幅に超過しています。原因の特定と対策が必要です。`,
                actions: ['原因の特定', 'リソースの追加投入', 'タスクの分割・並行化']
            });
        }

        // 効率性の推奨事項
        const completedTasks = tasks.filter(t => t.status === 'completed');
        if (completedTasks.length > 0) {
            const efficiencyData = completedTasks.map(task => {
                const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
                const actualTime = taskEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
                const estimatedTime = task.estimatedHours || 0;
                return { task, actualTime, estimatedTime };
            }).filter(data => data.estimatedTime > 0);

            if (efficiencyData.length > 0) {
                const avgEfficiency = efficiencyData.reduce((sum, data) => 
                    sum + (data.estimatedTime / data.actualTime), 0) / efficiencyData.length;
                
                if (avgEfficiency < 0.7) {
                    recommendations.push({
                        type: 'warning',
                        title: '生産性の改善',
                        description: '全体的な生産性が低い状況です。プロセス改善とスキル向上が必要です。',
                        actions: ['プロセス改善', 'スキル向上トレーニング', 'ツール・環境の改善']
                    });
                }
            }
        }

        return recommendations;
    }

    generateRiskRecommendations(projects, tasks) {
        const recommendations = [];
        
        // 高リスクプロジェクトの推奨事項
        const highRiskProjects = projects.filter(p => 
            this.calculateProjectRiskLevel(p, tasks) === 'high'
        );

        if (highRiskProjects.length > 0) {
            recommendations.push({
                type: 'critical',
                title: '高リスクプロジェクトの対応',
                description: `${highRiskProjects.length}件のプロジェクトで高リスクが検出されています。緊急の対応が必要です。`,
                actions: ['リスク要因の詳細分析', '対策の優先順位付け', 'ステークホルダーへの報告']
            });
        }

        // 期限切れタスクの推奨事項
        const overdueTasks = tasks.filter(t => this.isOverdue(t.dueDate));
        if (overdueTasks.length > 0) {
            recommendations.push({
                type: 'warning',
                title: '期限切れタスクの対応',
                description: `${overdueTasks.length}件のタスクが期限を超過しています。優先度の再評価が必要です。`,
                actions: ['優先度の再評価', 'スケジュールの見直し', 'リソースの再配分']
            });
        }

        return recommendations;
    }

    // レポートをHTML形式で出力
    exportToHTML(report) {
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${report.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 30px; }
                    .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                    .summary-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
                    .summary-value { font-size: 24px; font-weight: bold; color: #007bff; }
                    .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .recommendation.critical { background: #f8d7da; border-color: #f5c6cb; }
                    .recommendation.warning { background: #fff3cd; border-color: #ffeaa7; }
                    .recommendation.info { background: #d1ecf1; border-color: #bee5eb; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .generated-at { text-align: right; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${report.title}</h1>
                    <p class="generated-at">生成日時: ${new Date(report.generatedAt).toLocaleString('ja-JP')}</p>
                </div>
        `;

        // サマリーセクション
        if (report.summary) {
            html += `
                <div class="section">
                    <h2>サマリー</h2>
                    <div class="summary-grid">
            `;
            
            Object.entries(report.summary).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    html += `
                        <div class="summary-card">
                            <div class="summary-value">${value}</div>
                            <div>${this.formatKey(key)}</div>
                        </div>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // 推奨事項セクション
        if (report.recommendations && report.recommendations.length > 0) {
            html += `
                <div class="section">
                    <h2>推奨事項</h2>
            `;
            
            report.recommendations.forEach(rec => {
                html += `
                    <div class="recommendation ${rec.type}">
                        <h3>${rec.title}</h3>
                        <p>${rec.description}</p>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `;
            });
            
            html += `
                </div>
            `;
        }

        html += `
            </body>
            </html>
        `;

        return html;
    }

    // レポートをPDF形式で出力（簡易版）
    exportToPDF(report) {
        // 実際の実装では、jsPDFなどのライブラリを使用
        // ここでは簡易的な実装
        const html = this.exportToHTML(report);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        
        URL.revokeObjectURL(url);
        return { success: true, message: 'レポートをエクスポートしました' };
    }

    // キーのフォーマット
    formatKey(key) {
        const keyMap = {
            totalProjects: '総プロジェクト数',
            activeProjects: 'アクティブプロジェクト数',
            completedProjects: '完了プロジェクト数',
            overdueProjects: '期限切れプロジェクト数',
            totalTasks: '総タスク数',
            completedTasks: '完了タスク数',
            overdueTasks: '期限切れタスク数',
            overallProgress: '全体進捗率',
            totalTime: '総作業時間（分）',
            totalHours: '総作業時間（時間）',
            averageTimePerTask: 'タスク平均時間（分）',
            todayTime: '今日の作業時間（分）',
            todayEntries: '今日の記録数',
            totalEntries: '総記録数',
            totalBudget: '総予算',
            totalExpenses: '総支出',
            remainingBudget: '残予算',
            budgetUsageRate: '予算使用率',
            isOverBudget: '予算超過',
            completedTasks: '完了タスク数',
            totalEstimatedTime: '総予想時間',
            totalActualTime: '総実際時間',
            efficiency: '効率性',
            averageTimePerTask: 'タスク平均時間',
            totalProjects: '総プロジェクト数',
            highRiskProjects: '高リスクプロジェクト数',
            mediumRiskProjects: '中リスクプロジェクト数',
            lowRiskProjects: '低リスクプロジェクト数',
            overdueTasks: '期限切れタスク数',
            criticalTasks: '重要タスク数',
            overallRiskLevel: '全体リスクレベル'
        };
        
        return keyMap[key] || key;
    }

    // 日数計算
    calculateDaysRemaining(endDate) {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // 期限切れ判定
    isOverdue(date) {
        if (!date) return false;
        const targetDate = new Date(date);
        const now = new Date();
        return targetDate < now;
    }
}
