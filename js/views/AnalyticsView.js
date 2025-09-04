/**
 * 高度な分析ダッシュボードビュー
 * プロジェクトの詳細分析、予測、リスク評価などを表示
 */
class AnalyticsView {
    constructor() {
        this.analyticsHelper = new AnalyticsHelper();
        this.charts = {};
        this.currentProjectId = null;
        this.init();
    }

    init() {
        try {
            console.log('AnalyticsView.init: 開始');
            this.render();
            this.bindEvents();
            this.loadAnalytics();
            console.log('AnalyticsView.init: 完了');
        } catch (error) {
            console.error('AnalyticsView.init: エラーが発生しました:', error);
        }
    }

    render() {
        try {
            console.log('AnalyticsView.render: 開始');
            const analyticsSection = document.getElementById('analytics');
            if (!analyticsSection) {
                console.error('AnalyticsView.render: analyticsセクションが見つかりません');
                return;
            }

            analyticsSection.innerHTML = `
                <div class="analytics-header">
                    <h2><i class="fas fa-chart-line"></i> 高度な分析</h2>
                    <div class="analytics-controls">
                        <select id="projectSelector" class="form-select">
                            <option value="">すべてのプロジェクト</option>
                        </select>
                        <button id="refreshAnalytics" class="btn btn-secondary">
                            <i class="fas fa-sync-alt"></i> 更新
                        </button>
                    </div>
                </div>

                <div class="analytics-grid">
                    <!-- プロジェクトヘルススコア -->
                    <div class="analytics-card health-score">
                        <h3>プロジェクトヘルススコア</h3>
                        <div class="health-score-display">
                            <div class="score-circle">
                                <span id="healthScore">-</span>
                                <small>/100</small>
                            </div>
                            <div class="health-indicator">
                                <span id="healthStatus">-</span>
                            </div>
                        </div>
                    </div>

                    <!-- 進捗予測 -->
                    <div class="analytics-card progress-prediction">
                        <h3>進捗予測</h3>
                        <div id="progressPredictionContent">
                            <p class="no-data">プロジェクトを選択してください</p>
                        </div>
                    </div>

                    <!-- リスク分析 -->
                    <div class="analytics-card risk-analysis">
                        <h3>リスク分析</h3>
                        <div id="riskAnalysisContent">
                            <p class="no-data">プロジェクトを選択してください</p>
                        </div>
                    </div>

                    <!-- 効率性分析 -->
                    <div class="analytics-card efficiency-analysis">
                        <h3>効率性分析</h3>
                        <div id="efficiencyContent">
                            <p class="no-data">プロジェクトを選択してください</p>
                        </div>
                    </div>
                </div>

                <!-- 詳細分析セクション -->
                <div class="detailed-analytics">
                    <div class="analytics-tabs">
                        <button class="tab-btn active" data-tab="productivity">生産性分析</button>
                        <button class="tab-btn" data-tab="budget">予算分析</button>
                        <button class="tab-btn" data-tab="dependencies">依存関係</button>
                        <button class="tab-btn" data-tab="suggestions">改善提案</button>
                    </div>

                    <div class="tab-content">
                        <!-- 生産性分析タブ -->
                        <div id="productivityTab" class="tab-pane active">
                            <div class="chart-container">
                                <canvas id="productivityChart"></canvas>
                            </div>
                        </div>

                        <!-- 予算分析タブ -->
                        <div id="budgetTab" class="tab-pane">
                            <div class="chart-container">
                                <canvas id="budgetChart"></canvas>
                            </div>
                        </div>

                        <!-- 依存関係タブ -->
                        <div id="dependenciesTab" class="tab-pane">
                            <div id="dependenciesContent">
                                <p class="no-data">データを読み込み中...</p>
                            </div>
                        </div>

                        <!-- 改善提案タブ -->
                        <div id="suggestionsTab" class="tab-pane">
                            <div id="suggestionsContent">
                                <p class="no-data">データを読み込み中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.populateProjectSelector();
            console.log('AnalyticsView.render: 完了');
        } catch (error) {
            console.error('AnalyticsView.render: エラーが発生しました:', error);
        }
    }

    populateProjectSelector() {
        try {
            console.log('AnalyticsView.populateProjectSelector: 開始');
            const selector = document.getElementById('projectSelector');
            if (!selector) {
                console.error('AnalyticsView.populateProjectSelector: projectSelectorが見つかりません');
                return;
            }

            const projects = this.analyticsHelper.storage.getProjects();
            console.log('AnalyticsView.populateProjectSelector: プロジェクト数:', projects.length);
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                selector.appendChild(option);
            });
            console.log('AnalyticsView.populateProjectSelector: 完了');
        } catch (error) {
            console.error('AnalyticsView.populateProjectSelector: エラーが発生しました:', error);
        }
    }

    bindEvents() {
        const projectSelector = document.getElementById('projectSelector');
        const refreshBtn = document.getElementById('refreshAnalytics');
        const tabBtns = document.querySelectorAll('.tab-btn');

        if (projectSelector) {
            projectSelector.addEventListener('change', (e) => {
                this.currentProjectId = e.target.value;
                this.loadProjectAnalytics();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAnalytics();
            });
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        try {
            console.log('AnalyticsView.switchTab: 開始', tabName);
            
            // 既存のチャートを破棄
            this.clearCharts();
            
            // タブボタンのアクティブ状態を更新
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

            // タブコンテンツの表示を切り替え
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');

            // タブ固有のデータを読み込み
            this.loadTabData(tabName);
        } catch (error) {
            console.error('AnalyticsView.switchTab: エラーが発生しました:', error);
        }
    }

    loadAnalytics() {
        try {
            console.log('AnalyticsView.loadAnalytics: 開始');
            this.loadOverallAnalytics();
            this.loadTabData('productivity');
            console.log('AnalyticsView.loadAnalytics: 完了');
        } catch (error) {
            console.error('AnalyticsView.loadAnalytics: エラーが発生しました:', error);
        }
    }

    loadOverallAnalytics() {
        try {
            console.log('AnalyticsView.loadOverallAnalytics: 開始');
            // 全体的な分析データを読み込み
            const projects = this.analyticsHelper.storage.getProjects();
            if (projects.length === 0) {
                console.log('AnalyticsView.loadOverallAnalytics: プロジェクトがありません');
                return;
            }

            console.log('AnalyticsView.loadOverallAnalytics: プロジェクト数:', projects.length);

            // 平均ヘルススコアを計算
            const totalScore = projects.reduce((sum, project) => {
                try {
                    const score = this.analyticsHelper.calculateProjectHealthScore(project.id);
                    console.log(`AnalyticsView.loadOverallAnalytics: プロジェクト ${project.id} のスコア:`, score);
                    return sum + score;
                } catch (error) {
                    console.error(`AnalyticsView.loadOverallAnalytics: プロジェクト ${project.id} のスコア計算エラー:`, error);
                    return sum; // エラーの場合は0を加算
                }
            }, 0);
            const averageScore = Math.round(totalScore / projects.length);

            this.updateHealthScore(averageScore, '全プロジェクト平均');
            console.log('AnalyticsView.loadOverallAnalytics: 完了');
        } catch (error) {
            console.error('AnalyticsView.loadOverallAnalytics: エラーが発生しました:', error);
        }
    }

    loadProjectAnalytics() {
        if (!this.currentProjectId) {
            this.clearProjectAnalytics();
            return;
        }

        const project = this.analyticsHelper.storage.getProject(this.currentProjectId);
        if (!project) return;

        // ヘルススコアを更新
        const healthScore = this.analyticsHelper.calculateProjectHealthScore(this.currentProjectId);
        this.updateHealthScore(healthScore, project.name);

        // 進捗予測を更新
        this.updateProgressPrediction();

        // リスク分析を更新
        this.updateRiskAnalysis();

        // 効率性分析を更新
        this.updateEfficiencyAnalysis();
    }

    updateHealthScore(score, projectName) {
        const scoreElement = document.getElementById('healthScore');
        const statusElement = document.getElementById('healthStatus');

        if (scoreElement) scoreElement.textContent = score;
        if (statusElement) {
            let status = '';
            let statusClass = '';

            if (score >= 80) {
                status = '優秀';
                statusClass = 'excellent';
            } else if (score >= 60) {
                status = '良好';
                statusClass = 'good';
            } else if (score >= 40) {
                status = '注意';
                statusClass = 'warning';
            } else {
                status = '危険';
                statusClass = 'danger';
            }

            statusElement.textContent = status;
            statusElement.className = `health-indicator ${statusClass}`;
        }
    }

    updateProgressPrediction() {
        if (!this.currentProjectId) return;

        const prediction = this.analyticsHelper.calculateProgressPrediction(this.currentProjectId);
        const content = document.getElementById('progressPredictionContent');

        if (!prediction || !content) return;

        content.innerHTML = `
            <div class="prediction-item">
                <span class="label">現在の進捗:</span>
                <span class="value">${prediction.currentProgress}%</span>
            </div>
            <div class="prediction-item">
                <span class="label">残り日数:</span>
                <span class="value">${prediction.remainingDays}日</span>
            </div>
            <div class="prediction-item">
                <span class="label">予測完了日:</span>
                <span class="value">${prediction.predictedCompletionDate}</span>
            </div>
            <div class="prediction-item">
                <span class="label">状況:</span>
                <span class="value ${prediction.isOnTrack ? 'on-track' : 'behind'}">
                    ${prediction.isOnTrack ? '順調' : '遅延リスク'}
                </span>
            </div>
            <div class="prediction-item">
                <span class="label">リスクレベル:</span>
                <span class="value risk-${prediction.riskLevel}">
                    ${this.getRiskLevelText(prediction.riskLevel)}
                </span>
            </div>
        `;
    }

    updateRiskAnalysis() {
        if (!this.currentProjectId) return;

        const project = this.analyticsHelper.storage.getProject(this.currentProjectId);
        const tasks = this.analyticsHelper.storage.getTasks().filter(t => t.projectId === this.currentProjectId);
        const criticalTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
        const overdueTasks = tasks.filter(t => {
            if (t.status === 'completed') return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            return dueDate < today;
        });

        const content = document.getElementById('riskAnalysisContent');
        if (!content) return;

        content.innerHTML = `
            <div class="risk-item">
                <span class="label">重要なタスク:</span>
                <span class="value">${criticalTasks.length}件</span>
            </div>
            <div class="risk-item">
                <span class="label">期限超過タスク:</span>
                <span class="value ${overdueTasks.length > 0 ? 'overdue' : ''}">${overdueTasks.length}件</span>
            </div>
            <div class="risk-item">
                <span class="label">プロジェクト期限:</span>
                <span class="value">${project.endDate}</span>
            </div>
            <div class="risk-item">
                <span class="label">総合リスク:</span>
                <span class="value risk-${this.getOverallRiskLevel(criticalTasks, overdueTasks, project)}">
                    ${this.getOverallRiskLevelText(criticalTasks, overdueTasks, project)}
                </span>
            </div>
        `;
    }

    updateEfficiencyAnalysis() {
        if (!this.currentProjectId) return;

        const efficiencyScore = this.analyticsHelper.calculateEfficiencyScore(this.currentProjectId);
        const content = document.getElementById('efficiencyContent');

        if (!content) return;

        content.innerHTML = `
            <div class="efficiency-item">
                <span class="label">効率性スコア:</span>
                <span class="value">${efficiencyScore}/100</span>
            </div>
            <div class="efficiency-item">
                <span class="label">評価:</span>
                <span class="value ${this.getEfficiencyRating(efficiencyScore)}">
                    ${this.getEfficiencyRatingText(efficiencyScore)}
                </span>
            </div>
        `;
    }

    loadTabData(tabName) {
        try {
            console.log('AnalyticsView.loadTabData: 開始', tabName);
            switch (tabName) {
                case 'productivity':
                    this.loadProductivityData();
                    break;
                case 'budget':
                    this.loadBudgetData();
                    break;
                case 'dependencies':
                    this.loadDependenciesData();
                    break;
                case 'suggestions':
                    this.loadSuggestionsData();
                    break;
                default:
                    console.warn('AnalyticsView.loadTabData: 不明なタブ名:', tabName);
            }
            console.log('AnalyticsView.loadTabData: 完了', tabName);
        } catch (error) {
            console.error('AnalyticsView.loadTabData: エラーが発生しました:', tabName, error);
        }
    }

    loadProductivityData() {
        try {
            console.log('AnalyticsView.loadProductivityData: 開始');
            const productivityData = this.analyticsHelper.analyzeTeamProductivity();
            console.log('AnalyticsView.loadProductivityData: データ取得完了', productivityData);
            this.renderProductivityChart(productivityData);
            console.log('AnalyticsView.loadProductivityData: 完了');
        } catch (error) {
            console.error('AnalyticsView.loadProductivityData: エラーが発生しました:', error);
        }
    }

    loadBudgetData() {
        try {
            console.log('AnalyticsView.loadBudgetData: 開始');
            
            // データの詳細をログ出力
            const storage = this.analyticsHelper.storage;
            const projects = storage.getProjects();
            const expenses = storage.getExpenses();
            console.log('AnalyticsView.loadBudgetData: プロジェクト数:', projects.length);
            console.log('AnalyticsView.loadBudgetData: 支出数:', expenses.length);
            console.log('AnalyticsView.loadBudgetData: 支出データ詳細:', expenses);
            
            const budgetData = this.analyticsHelper.analyzeBudgetTrends();
            console.log('AnalyticsView.loadBudgetData: データ取得完了', budgetData);
            
            if (!budgetData || budgetData.length === 0) {
                console.warn('AnalyticsView.loadBudgetData: 予算データが空です');
                const ctx = document.getElementById('budgetChart');
                if (ctx) {
                    ctx.innerHTML = '<p class="no-data">支出データがありません</p>';
                }
                return;
            }
            
            this.renderBudgetChart(budgetData);
            console.log('AnalyticsView.loadBudgetData: 完了');
        } catch (error) {
            console.error('AnalyticsView.loadBudgetData: エラーが発生しました:', error);
            const ctx = document.getElementById('budgetChart');
            if (ctx) {
                ctx.innerHTML = '<p class="error">予算データの読み込みに失敗しました: ' + error.message + '</p>';
            }
        }
    }

    loadDependenciesData() {
        const dependencies = this.analyticsHelper.analyzeProjectDependencies();
        const content = document.getElementById('dependenciesContent');

        if (!content) return;

        if (dependencies.length === 0) {
            content.innerHTML = '<p class="no-data">依存関係のリスクはありません</p>';
            return;
        }

        let html = '<div class="dependencies-list">';
        dependencies.forEach(dep => {
            html += `
                <div class="dependency-item risk-${this.getRiskLevelClass(dep.riskLevel)}">
                    <h4>${dep.projectName}</h4>
                    <div class="dependency-details">
                        <span class="risk-score">リスクスコア: ${dep.riskLevel}</span>
                        <span class="critical-tasks">重要タスク: ${dep.criticalTaskCount}件</span>
                    </div>
                    ${dep.dependencies.length > 0 ? `
                        <div class="task-dependencies">
                            <strong>依存タスク:</strong>
                            <ul>
                                ${dep.dependencies.map(d => `
                                    <li>${d.taskName} → ${d.dependentTaskCount}件のタスクに影響</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    loadSuggestionsData() {
        if (!this.currentProjectId) {
            const content = document.getElementById('suggestionsContent');
            if (content) {
                content.innerHTML = '<p class="no-data">プロジェクトを選択してください</p>';
            }
            return;
        }

        const suggestions = this.analyticsHelper.generateImprovementSuggestions(this.currentProjectId);
        const content = document.getElementById('suggestionsContent');

        if (!content) return;

        if (suggestions.length === 0) {
            content.innerHTML = '<p class="no-data">現在の改善提案はありません</p>';
            return;
        }

        let html = '<div class="suggestions-list">';
        suggestions.forEach(suggestion => {
            html += `
                <div class="suggestion-item ${suggestion.type}">
                    <h4>${suggestion.title}</h4>
                    <p>${suggestion.description}</p>
                    <div class="suggestion-actions">
                        <strong>推奨アクション:</strong>
                        <ul>
                            ${suggestion.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    renderProductivityChart(data) {
        try {
            console.log('AnalyticsView.renderProductivityChart: 開始', data);
            
            // Chart.jsの可用性をチェック
            if (typeof Chart === 'undefined') {
                console.error('AnalyticsView.renderProductivityChart: Chart.jsが読み込まれていません');
                const ctx = document.getElementById('productivityChart');
                if (ctx) {
                    ctx.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました。ページを再読み込みしてください。</p>';
                }
                return;
            }
            
            const ctx = document.getElementById('productivityChart');
            if (!ctx) {
                console.error('AnalyticsView.renderProductivityChart: productivityChartキャンバスが見つかりません');
                return;
            }

            // 既存のチャートインスタンスを確実に破棄
            if (this.charts.productivity) {
                try {
                    this.charts.productivity.destroy();
                    console.log('AnalyticsView.renderProductivityChart: 既存のproductivityチャートを破棄');
                } catch (error) {
                    console.warn('AnalyticsView.renderProductivityChart: チャート破棄エラー:', error);
                }
                this.charts.productivity = null;
            }

            // キャンバスの内容をクリア
            ctx.innerHTML = '';
            
            // Chart.jsのインスタンスIDをリセット
            if (typeof Chart !== 'undefined' && Chart.instances) {
                Object.keys(Chart.instances).forEach(id => {
                    if (Chart.instances[id] && Chart.instances[id].canvas && Chart.instances[id].canvas.id === 'productivityChart') {
                        try {
                            Chart.instances[id].destroy();
                            console.log('AnalyticsView.renderProductivityChart: Chart.instancesからproductivityチャートを破棄:', id);
                        } catch (error) {
                            console.warn('AnalyticsView.renderProductivityChart: Chart.instances破棄エラー:', error);
                        }
                    }
                });
            }

            // データが空の場合の処理
            if (!data || data.length === 0) {
                ctx.innerHTML = '<p class="no-data">プロジェクトデータがありません</p>';
                return;
            }

            this.charts.productivity = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.projectName || '不明なプロジェクト'),
                    datasets: [{
                        label: '完了率 (%)',
                        data: data.map(d => Math.round((d.completionRate || 0) * 100)),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                            text: 'プロジェクト別完了率'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            });
            console.log('AnalyticsView.renderProductivityChart: 完了');
        } catch (error) {
            console.error('AnalyticsView.renderProductivityChart: エラーが発生しました:', error);
            const ctx = document.getElementById('productivityChart');
            if (ctx) {
                ctx.innerHTML = '<p class="error">グラフの表示に失敗しました: ' + error.message + '</p>';
            }
        }
    }

    renderBudgetChart(data) {
        try {
            console.log('AnalyticsView.renderBudgetChart: 開始', data);
            
            // Chart.jsの可用性をチェック
            if (typeof Chart === 'undefined') {
                console.error('AnalyticsView.renderBudgetChart: Chart.jsが読み込まれていません');
                const ctx = document.getElementById('budgetChart');
                if (ctx) {
                    ctx.innerHTML = '<p class="error">Chart.jsの読み込みに失敗しました。ページを再読み込みしてください。</p>';
                }
                return;
            }
            
            const ctx = document.getElementById('budgetChart');
            if (!ctx) {
                console.error('AnalyticsView.renderBudgetChart: budgetChartキャンバスが見つかりません');
                return;
            }

            // 既存のチャートインスタンスを確実に破棄
            if (this.charts.budget) {
                try {
                    this.charts.budget.destroy();
                    console.log('AnalyticsView.renderBudgetChart: 既存のbudgetチャートを破棄');
                } catch (error) {
                    console.warn('AnalyticsView.renderBudgetChart: チャート破棄エラー:', error);
                }
                this.charts.budget = null;
            }

            // キャンバスの内容をクリア
            ctx.innerHTML = '';
            
            // Chart.jsのインスタンスIDをリセット
            if (typeof Chart !== 'undefined' && Chart.instances) {
                Object.keys(Chart.instances).forEach(id => {
                    if (Chart.instances[id] && Chart.instances[id].canvas && Chart.instances[id].canvas.id === 'budgetChart') {
                        try {
                            Chart.instances[id].destroy();
                            console.log('AnalyticsView.renderBudgetChart: Chart.instancesからbudgetチャートを破棄:', id);
                        } catch (error) {
                            console.warn('AnalyticsView.renderBudgetChart: Chart.instances破棄エラー:', error);
                        }
                    }
                });
            }

            // データが空の場合の処理
            if (!data || data.length === 0) {
                ctx.innerHTML = '<p class="no-data">支出データがありません</p>';
                return;
            }

            this.charts.budget = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.month || '不明な月'),
                    datasets: [{
                        label: '月別支出 (円)',
                        data: data.map(d => d.totalExpense || 0),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                            text: '月別支出傾向'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            });
            console.log('AnalyticsView.renderBudgetChart: 完了');
        } catch (error) {
            console.error('AnalyticsView.renderBudgetChart: エラーが発生しました:', error);
            const ctx = document.getElementById('budgetChart');
            if (ctx) {
                ctx.innerHTML = '<p class="error">グラフの表示に失敗しました: ' + error.message + '</p>';
            }
        }
    }

    clearProjectAnalytics() {
        const elements = [
            'progressPredictionContent',
            'riskAnalysisContent',
            'efficiencyContent'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<p class="no-data">プロジェクトを選択してください</p>';
            }
        });

        this.updateHealthScore(0, 'プロジェクト未選択');
    }

    // ヘルパーメソッド
    getRiskLevelText(level) {
        const texts = {
            'low': '低',
            'medium': '中',
            'high': '高'
        };
        return texts[level] || '不明';
    }

    getOverallRiskLevel(criticalTasks, overdueTasks, project) {
        let riskScore = 0;
        
        if (criticalTasks.length > 3) riskScore += 30;
        else if (criticalTasks.length > 1) riskScore += 20;
        
        if (overdueTasks.length > 0) riskScore += 25;
        
        const today = new Date();
        const endDate = new Date(project.endDate);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (remainingDays <= 7) riskScore += 30;
        else if (remainingDays <= 14) riskScore += 20;
        
        if (riskScore >= 60) return 'high';
        if (riskScore >= 30) return 'medium';
        return 'low';
    }

    getOverallRiskLevelText(criticalTasks, overdueTasks, project) {
        const level = this.getOverallRiskLevel(criticalTasks, overdueTasks, project);
        return this.getRiskLevelText(level);
    }

    getRiskLevelClass(level) {
        return level;
    }

    getEfficiencyRating(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'warning';
        return 'poor';
    }

    getEfficiencyRatingText(score) {
        if (score >= 80) return '優秀';
        if (score >= 60) return '良好';
        if (score >= 40) return '注意';
        return '改善必要';
    }

    clearCharts() {
        // 既存のチャートを破棄
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    destroy() {
        // チャートを破棄
        this.clearCharts();
        
        // キャンバス要素の内容をクリア
        const canvasIds = ['productivityChart', 'budgetChart'];
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                canvas.innerHTML = '';
            }
        });
    }
}

// グローバルに利用可能にする
window.AnalyticsView = AnalyticsView;
