/**
 * 支出ビュークラス
 */
class ExpenseView {
    constructor() {
        this.expenseManager = new ExpenseManager();
        this.projectManager = new ProjectManager();
        this.eventManager = new EventManager();
        this.expenseChart = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.eventManager.on('expenseCreated', () => this.render());
        this.eventManager.on('expenseUpdated', () => this.render());
        this.eventManager.on('expenseDeleted', () => this.render());
        this.eventManager.on('projectCreated', () => this.render());
        this.eventManager.on('projectUpdated', () => this.render());
        this.eventManager.on('projectDeleted', () => this.render());
    }

    render() {
        this.renderExpenseTable();
        this.renderExpenseStats();
        this.renderExpenseChart();
        this.bindTableEvents();
    }

    renderExpenseTable() {
        const expenses = this.expenseManager.getExpenses();
        const projects = this.projectManager.getProjects();
        const tbody = document.getElementById('expensesTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>支出記録がありません</h3>
                        <p>新規支出を記録してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        expenses.forEach(expense => {
            const project = projects.find(p => p.id === expense.projectId);
            
            const row = document.createElement('tr');
            row.className = 'expense-row';
            
            row.innerHTML = `
                <td>
                    <div class="expense-item">
                        <strong>${expense.item}</strong>
                        <small>${expense.memo || 'メモなし'}</small>
                    </div>
                </td>
                <td>${project ? project.name : '不明なプロジェクト'}</td>
                <td>${expense.date}</td>
                <td class="amount-cell">${expense.getAmountText()}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editExpense('${expense.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderExpenseStats() {
        const stats = this.expenseManager.getExpenseStats();
        const container = document.querySelector('.expense-stats');
        
        if (!container) return;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">総支出</span>
                <span class="stat-value">${new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                }).format(stats.total)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">記録数</span>
                <span class="stat-value">${stats.count}件</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">平均支出</span>
                <span class="stat-value">${new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY'
                }).format(stats.average)}</span>
            </div>
        `;
    }

    renderExpenseChart() {
        const canvas = document.getElementById('expenseTrendChart');
        if (!canvas) return;

        const period = parseInt(document.getElementById('expenseChartPeriod')?.value || 30);
        const chartData = this.getExpenseChartData(period);
        
        // 既存のチャートを破棄
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '日別支出',
                    data: chartData.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `支出: ${new Intl.NumberFormat('ja-JP', {
                                    style: 'currency',
                                    currency: 'JPY'
                                }).format(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日付'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '金額 (円)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('ja-JP', {
                                    style: 'currency',
                                    currency: 'JPY',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    getExpenseChartData(days) {
        const expenses = this.expenseManager.getExpenses();
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days + 1);
        
        // 日付ごとの支出を集計
        const dailyExpenses = {};
        
        // 指定期間の日付を初期化
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyExpenses[dateStr] = 0;
        }
        
        // 支出データを集計
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate >= startDate && expenseDate <= today) {
                const dateStr = expense.date;
                if (dailyExpenses[dateStr] !== undefined) {
                    dailyExpenses[dateStr] += expense.amount;
                }
            }
        });
        
        // ラベルとデータを配列に変換
        const labels = Object.keys(dailyExpenses).map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        
        const data = Object.values(dailyExpenses);
        
        return { labels, data };
    }

    bindTableEvents() {
        // フィルター機能
        const projectFilter = document.getElementById('expenseProjectFilter');
        const dateFilter = document.getElementById('expenseDateFilter');
        
        if (projectFilter) {
            projectFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }

        // グラフ期間選択
        const chartPeriodSelect = document.getElementById('expenseChartPeriod');
        if (chartPeriodSelect) {
            chartPeriodSelect.addEventListener('change', () => this.renderExpenseChart());
        }
    }

    applyFilters() {
        const projectFilter = document.getElementById('expenseProjectFilter')?.value;
        const dateFilter = document.getElementById('expenseDateFilter')?.value;
        
        const filters = {};
        if (projectFilter) filters.projectId = projectFilter;
        if (dateFilter) {
            const today = new Date();
            switch (dateFilter) {
                case 'today':
                    filters.startDate = today.toISOString().split('T')[0];
                    filters.endDate = today.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    filters.startDate = weekAgo.toISOString().split('T')[0];
                    filters.endDate = today.toISOString().split('T')[0];
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    filters.startDate = monthAgo.toISOString().split('T')[0];
                    filters.endDate = today.toISOString().split('T')[0];
                    break;
            }
        }
        
        const filteredExpenses = this.expenseManager.filterExpenses(filters);
        this.renderExpenseTableWithData(filteredExpenses);
    }

    renderExpenseTableWithData(expenses) {
        const projects = this.projectManager.getProjects();
        const tbody = document.getElementById('expensesTableBody');
        
        if (!tbody) return;

        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>該当する支出がありません</h3>
                        <p>フィルター条件を変更してください</p>
                    </td>
                </tr>
            `;
            return;
        }

        expenses.forEach(expense => {
            const project = projects.find(p => p.id === expense.projectId);
            
            const row = document.createElement('tr');
            row.className = 'expense-row';
            
            row.innerHTML = `
                <td>
                    <div class="expense-item">
                        <strong>${expense.item}</strong>
                        <small>${expense.memo || 'メモなし'}</small>
                    </div>
                </td>
                <td>${project ? project.name : '不明なプロジェクト'}</td>
                <td>${expense.date}</td>
                <td class="amount-cell">${expense.getAmountText()}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editExpense('${expense.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    sortExpenses(sortBy) {
        const expenses = this.expenseManager.getExpenses();
        const sortedExpenses = this.expenseManager.sortExpenses(expenses, sortBy);
        this.renderExpenseTableWithData(sortedExpenses);
    }

    searchExpenses(query) {
        const expenses = this.expenseManager.searchExpenses(query);
        this.renderExpenseTableWithData(expenses);
    }

    destroy() {
        this.eventManager.removeAllListeners();
        if (this.expenseChart) {
            this.expenseChart.destroy();
            this.expenseChart = null;
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ExpenseView = ExpenseView;
}
