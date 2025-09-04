class ReportView {
    constructor() {
        this.reportGenerator = new ReportGenerator();
        this.currentReport = null;
        this.currentReportType = null;
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const container = document.getElementById('reports-container');
        if (!container) return;

        container.innerHTML = `
            <div class="reports-header">
                <h2>レポート生成</h2>
                <p>プロジェクト管理の各種レポートを生成・エクスポートできます</p>
            </div>

            <div class="report-types-grid">
                <div class="report-type-card" data-report-type="projectProgress">
                    <div class="report-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>プロジェクト進捗レポート</h3>
                    <p>プロジェクトの進捗状況、期限、完了率などを分析したレポート</p>
                    <button class="btn btn-primary generate-report-btn" data-report-type="projectProgress">
                        レポート生成
                    </button>
                </div>

                <div class="report-type-card" data-report-type="timeAnalysis">
                    <div class="report-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>時間分析レポート</h3>
                    <p>作業時間の分析、生産性、効率性などを分析したレポート</p>
                    <button class="btn btn-primary generate-report-btn" data-report-type="timeAnalysis">
                        レポート生成
                    </button>
                </div>

                <div class="report-type-card" data-report-type="budgetReport">
                    <div class="report-icon">
                        <i class="fas fa-yen-sign"></i>
                    </div>
                    <h3>予算管理レポート</h3>
                    <p>予算使用状況、支出分析、アラートなどを含むレポート</p>
                    <button class="btn btn-primary generate-report-btn" data-report-type="budgetReport">
                        レポート生成
                    </button>
                </div>

                <div class="report-type-card" data-report-type="teamProductivity">
                    <div class="report-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>チーム生産性レポート</h3>
                    <p>チームの生産性、効率性、ボトルネックなどを分析したレポート</p>
                    <button class="btn btn-primary generate-report-btn" data-report-type="teamProductivity">
                        レポート生成
                    </button>
                </div>

                <div class="report-type-card" data-report-type="riskAssessment">
                    <div class="report-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>リスク評価レポート</h3>
                    <p>プロジェクトのリスク要因、評価、対策などを分析したレポート</p>
                    <button class="btn btn-primary generate-report-btn" data-report-type="riskAssessment">
                        レポート生成
                    </button>
                </div>
            </div>

            <div id="report-preview" class="report-preview" style="display: none;">
                <div class="preview-header">
                    <h3 id="preview-title">レポートプレビュー</h3>
                    <div class="preview-actions">
                        <button id="export-html" class="btn btn-secondary">
                            <i class="fas fa-file-code"></i> HTML出力
                        </button>
                        <button id="export-pdf" class="btn btn-secondary">
                            <i class="fas fa-file-pdf"></i> PDF出力
                        </button>
                        <button id="close-preview" class="btn btn-outline">
                            <i class="fas fa-times"></i> 閉じる
                        </button>
                    </div>
                </div>
                <div id="preview-content" class="preview-content">
                    <!-- レポート内容がここに表示される -->
                </div>
            </div>

            <div id="report-history" class="report-history">
                <h3>生成履歴</h3>
                <div id="history-list" class="history-list">
                    <!-- 生成履歴がここに表示される -->
                </div>
            </div>
        `;

        this.loadReportHistory();
    }

    bindEvents() {
        // レポート生成ボタン
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('generate-report-btn')) {
                const reportType = e.target.dataset.reportType;
                this.generateReport(reportType);
            }
        });

        // プレビューアクション
        document.addEventListener('click', (e) => {
            if (e.target.id === 'export-html') {
                this.exportToHTML();
            } else if (e.target.id === 'export-pdf') {
                this.exportToPDF();
            } else if (e.target.id === 'close-preview') {
                this.closePreview();
            }
        });
    }

    async generateReport(reportType) {
        try {
            console.log('ReportView.generateReport: 開始', reportType);
            this.showLoading('レポートを生成中...');
            
            // データを取得
            const projects = await this.getProjects();
            const tasks = await this.getTasks();
            const expenses = await this.getExpenses();
            const timeEntries = await this.getTimeEntries();
            
            console.log('ReportView.generateReport: データ取得完了', {
                projects: projects.length,
                tasks: tasks.length,
                expenses: expenses.length,
                timeEntries: timeEntries.length
            });

            let report;
            switch (reportType) {
                case 'projectProgress':
                    report = this.reportGenerator.generateProjectProgressReport(projects, tasks);
                    break;
                case 'timeAnalysis':
                    report = this.reportGenerator.generateTimeAnalysisReport(timeEntries, tasks, projects);
                    break;
                case 'budgetReport':
                    report = this.reportGenerator.generateBudgetReport(projects, expenses);
                    break;
                case 'teamProductivity':
                    report = this.reportGenerator.generateTeamProductivityReport(tasks, timeEntries, projects);
                    break;
                case 'riskAssessment':
                    report = this.reportGenerator.generateRiskAssessmentReport(projects, tasks);
                    break;
                default:
                    throw new Error('不明なレポートタイプです');
            }

            this.currentReport = report;
            this.currentReportType = reportType;
            this.showReportPreview(report);
            this.saveReportHistory(report);

        } catch (error) {
            console.error('レポート生成エラー:', error);
            this.showError('レポートの生成に失敗しました: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    showReportPreview(report) {
        const previewContainer = document.getElementById('report-preview');
        const previewTitle = document.getElementById('preview-title');
        const previewContent = document.getElementById('preview-content');

        previewTitle.textContent = report.title;
        previewContent.innerHTML = this.renderReportContent(report);
        previewContainer.style.display = 'block';

        // スクロールしてプレビューを表示
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    renderReportContent(report) {
        let html = '';

        // サマリーセクション
        if (report.summary) {
            html += `
                <div class="report-section">
                    <h4>サマリー</h4>
                    <div class="summary-grid">
            `;
            
            Object.entries(report.summary).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    html += `
                        <div class="summary-item">
                            <div class="summary-label">${this.formatSummaryLabel(key)}</div>
                            <div class="summary-value">${this.formatSummaryValue(key, value)}</div>
                        </div>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // プロジェクト詳細（プロジェクト進捗レポートの場合）
        if (report.projects && report.projects.length > 0) {
            html += `
                <div class="report-section">
                    <h4>プロジェクト詳細</h4>
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>プロジェクト名</th>
                                    <th>ステータス</th>
                                    <th>進捗率</th>
                                    <th>期限</th>
                                    <th>残り日数</th>
                                    <th>予算</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            report.projects.forEach(project => {
                const statusClass = this.getStatusClass(project.status);
                const overdueClass = project.overdue ? 'overdue' : '';
                
                html += `
                    <tr class="${overdueClass}">
                        <td>${project.name}</td>
                        <td><span class="status-badge ${statusClass}">${this.formatStatus(project.status)}</span></td>
                        <td>${project.progress}%</td>
                        <td>${this.formatDate(project.endDate)}</td>
                        <td>${project.daysRemaining}日</td>
                        <td>¥${project.budget?.toLocaleString() || 0}</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 時間内訳（時間分析レポートの場合）
        if (report.timeBreakdown && report.timeBreakdown.length > 0) {
            html += `
                <div class="report-section">
                    <h4>時間内訳</h4>
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>タスク名</th>
                                    <th>作業時間</th>
                                    <th>時間</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            report.timeBreakdown.forEach(item => {
                html += `
                    <tr>
                        <td>${item.taskName}</td>
                        <td>${item.time}分</td>
                        <td>${item.hours}時間</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 予算内訳（予算レポートの場合）
        if (report.projectBudgets && report.projectBudgets.length > 0) {
            html += `
                <div class="report-section">
                    <h4>プロジェクト予算状況</h4>
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>プロジェクト名</th>
                                    <th>予算</th>
                                    <th>支出</th>
                                    <th>残予算</th>
                                    <th>使用率</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            report.projectBudgets.forEach(budget => {
                const usageClass = budget.isOverBudget ? 'over-budget' : 
                    budget.usageRate >= 80 ? 'high-usage' : '';
                
                html += `
                    <tr class="${usageClass}">
                        <td>${budget.projectName}</td>
                        <td>¥${budget.budget.toLocaleString()}</td>
                        <td>¥${budget.expenses.toLocaleString()}</td>
                        <td>¥${budget.remainingBudget.toLocaleString()}</td>
                        <td>${budget.usageRate}%</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 推奨事項
        if (report.recommendations && report.recommendations.length > 0) {
            html += `
                <div class="report-section">
                    <h4>推奨事項</h4>
            `;
            
            report.recommendations.forEach(rec => {
                const typeClass = this.getRecommendationTypeClass(rec.type);
                
                html += `
                    <div class="recommendation ${typeClass}">
                        <h5>${rec.title}</h5>
                        <p>${rec.description}</p>
                        ${rec.actions ? `
                            <ul>
                                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `;
            });
            
            html += `
                </div>
            `;
        }

        return html;
    }

    formatSummaryLabel(key) {
        const labelMap = {
            totalProjects: '総プロジェクト数',
            activeProjects: 'アクティブプロジェクト数',
            completedProjects: '完了プロジェクト数',
            overdueProjects: '期限切れプロジェクト数',
            totalTasks: '総タスク数',
            completedTasks: '完了タスク数',
            overdueTasks: '期限切れタスク数',
            overallProgress: '全体進捗率',
            totalTime: '総作業時間',
            totalHours: '総作業時間',
            averageTimePerTask: 'タスク平均時間',
            todayTime: '今日の作業時間',
            todayEntries: '今日の記録数',
            totalEntries: '総記録数',
            totalBudget: '総予算',
            totalExpenses: '総支出',
            remainingBudget: '残予算',
            budgetUsageRate: '予算使用率',
            isOverBudget: '予算超過',
            highRiskProjects: '高リスクプロジェクト数',
            mediumRiskProjects: '中リスクプロジェクト数',
            lowRiskProjects: '低リスクプロジェクト数',
            criticalTasks: '重要タスク数',
            overallRiskLevel: '全体リスクレベル'
        };
        
        return labelMap[key] || key;
    }

    formatSummaryValue(key, value) {
        if (key === 'overallProgress' || key === 'budgetUsageRate') {
            return `${value}%`;
        } else if (key === 'totalBudget' || key === 'totalExpenses' || key === 'remainingBudget') {
            return `¥${value.toLocaleString()}`;
        } else if (key === 'totalTime' || key === 'averageTimePerTask' || key === 'todayTime') {
            return `${value}分`;
        } else if (key === 'totalHours') {
            return `${value}時間`;
        } else if (key === 'overallRiskLevel') {
            return this.formatRiskLevel(value);
        }
        
        return value;
    }

    formatStatus(status) {
        const statusMap = {
            'planned': '計画中',
            'in-progress': '進行中',
            'completed': '完了',
            'on-hold': '保留'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ja-JP');
    }

    formatRiskLevel(level) {
        const levelMap = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        return levelMap[level] || level;
    }

    getStatusClass(status) {
        const classMap = {
            'planned': 'status-planned',
            'in-progress': 'status-progress',
            'completed': 'status-completed',
            'on-hold': 'status-hold'
        };
        return classMap[status] || '';
    }

    getRecommendationTypeClass(type) {
        const classMap = {
            'critical': 'rec-critical',
            'urgent': 'rec-urgent',
            'warning': 'rec-warning',
            'info': 'rec-info'
        };
        return classMap[type] || '';
    }

    exportToHTML() {
        if (!this.currentReport) return;
        
        const html = this.reportGenerator.exportToHTML(this.currentReport);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('HTMLレポートをエクスポートしました');
    }

    exportToPDF() {
        if (!this.currentReport) return;
        
        const result = this.reportGenerator.exportToPDF(this.currentReport);
        if (result.success) {
            this.showSuccess(result.message);
        } else {
            this.showError('PDFエクスポートに失敗しました');
        }
    }

    closePreview() {
        document.getElementById('report-preview').style.display = 'none';
        this.currentReport = null;
        this.currentReportType = null;
    }

    saveReportHistory(report) {
        const history = this.loadReportHistory();
        const historyItem = {
            id: Date.now(),
            title: report.title,
            type: this.currentReportType,
            generatedAt: report.generatedAt,
            summary: report.summary
        };
        
        history.unshift(historyItem);
        
        // 最新の20件のみ保持
        if (history.length > 20) {
            history.splice(20);
        }
        
        localStorage.setItem('reportHistory', JSON.stringify(history));
        this.loadReportHistory();
    }

    loadReportHistory() {
        const saved = localStorage.getItem('reportHistory');
        const history = saved ? JSON.parse(saved) : [];
        
        const historyList = document.getElementById('history-list');
        if (!historyList) return history;

        if (history.length === 0) {
            historyList.innerHTML = '<p class="no-history">生成履歴がありません</p>';
            return history;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${item.title}</h4>
                    <p class="history-meta">
                        <span class="history-type">${this.getReportTypeLabel(item.type)}</span>
                        <span class="history-date">${new Date(item.generatedAt).toLocaleString('ja-JP')}</span>
                    </p>
                </div>
                <div class="history-actions">
                    <button class="btn btn-sm btn-outline regenerate-btn" data-history-id="${item.id}">
                        再生成
                    </button>
                </div>
            </div>
        `).join('');

        // 再生成ボタンのイベント
        document.querySelectorAll('.regenerate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const historyId = e.target.dataset.historyId;
                const historyItem = history.find(item => item.id == historyId);
                if (historyItem) {
                    this.generateReport(historyItem.type);
                }
            });
        });

        return history;
    }

    getReportTypeLabel(type) {
        const labelMap = {
            'projectProgress': 'プロジェクト進捗',
            'timeAnalysis': '時間分析',
            'budgetReport': '予算管理',
            'teamProductivity': 'チーム生産性',
            'riskAssessment': 'リスク評価'
        };
        return labelMap[type] || type;
    }

    // データ取得メソッド（実際の実装では適切なマネージャーから取得）
    async getProjects() {
        // 実際の実装では ProjectManager から取得
        return window.projectManager ? window.projectManager.getAll() : [];
    }

    async getTasks() {
        // 実際の実装では TaskManager から取得
        return window.taskManager ? window.taskManager.getAll() : [];
    }

    async getExpenses() {
        // 実際の実装では ExpenseManager から取得
        return window.expenseManager ? window.expenseManager.getAll() : [];
    }

    async getTimeEntries() {
        // 実際の実装では TimeTracker から取得
        return window.timeTracker ? window.timeTracker.timeEntries : [];
    }

    showLoading() {
        // ローディング表示の実装
        console.log('レポート生成中...');
    }

    hideLoading() {
        // ローディング非表示の実装
        console.log('レポート生成完了');
    }

    showSuccess(message) {
        // 成功メッセージ表示の実装
        console.log('成功:', message);
    }

    showError(message) {
        // エラーメッセージ表示の実装
        console.error('エラー:', message);
    }

    destroy() {
        // クリーンアップ処理
        this.currentReport = null;
        this.currentReportType = null;
    }
}
