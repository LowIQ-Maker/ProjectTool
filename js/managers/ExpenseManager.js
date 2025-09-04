/**
 * 支出マネージャークラス
 */
class ExpenseManager {
    constructor() {
        this.storage = new Storage();
        this.eventManager = new EventManager();
    }

    /**
     * 支出を作成
     */
    createExpense(expenseData) {
        try {
            const expense = new Expense(expenseData);
            const errors = expense.validate();
            
            if (errors.length > 0) {
                return { success: false, errors: errors };
            }

            const expenses = this.storage.getExpenses();
            expenses.push(expense);
            this.storage.saveExpenses(expenses);

            this.eventManager.emit('expenseCreated', expense);
            return { success: true, data: expense };
        } catch (error) {
            console.error('Expense creation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 支出を更新
     */
    updateExpense(expenseId, updateData) {
        try {
            const expenses = this.storage.getExpenses();
            const index = expenses.findIndex(e => e.id === expenseId);
            
            if (index === -1) {
                return { success: false, error: '支出が見つかりません' };
            }

            const expense = new Expense(expenses[index]);
            expense.update(updateData);
            
            const errors = expense.validate();
            if (errors.length > 0) {
                return { success: false, errors: errors };
            }

            expenses[index] = expense;
            this.storage.saveExpenses(expenses);

            this.eventManager.emit('expenseUpdated', expense);
            return { success: true, data: expense };
        } catch (error) {
            console.error('Expense update error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 支出を削除
     */
    deleteExpense(expenseId) {
        try {
            const expenses = this.storage.getExpenses();
            const index = expenses.findIndex(e => e.id === expenseId);
            
            if (index === -1) {
                return { success: false, error: '支出が見つかりません' };
            }

            const expense = expenses[index];
            expenses.splice(index, 1);
            this.storage.saveExpenses(expenses);

            this.eventManager.emit('expenseDeleted', expense);
            return { success: true };
        } catch (error) {
            console.error('Expense deletion error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 支出を取得
     */
    getExpense(expenseId) {
        const expenses = this.storage.getExpenses();
        const expenseData = expenses.find(e => e.id === expenseId);
        return expenseData ? new Expense(expenseData) : null;
    }

    /**
     * 全支出を取得
     */
    getExpenses() {
        const expenses = this.storage.getExpenses();
        return expenses.map(expenseData => new Expense(expenseData));
    }

    /**
     * プロジェクト別の支出を取得
     */
    getExpensesByProject(projectId) {
        const expenses = this.getExpenses();
        return expenses.filter(e => e.projectId === projectId);
    }

    /**
     * 支出をフィルタリング
     */
    filterExpenses(filters = {}) {
        let expenses = this.getExpenses();

        if (filters.projectId) {
            expenses = expenses.filter(e => e.projectId === filters.projectId);
        }

        if (filters.startDate) {
            expenses = expenses.filter(e => e.date >= filters.startDate);
        }

        if (filters.endDate) {
            expenses = expenses.filter(e => e.date <= filters.endDate);
        }

        if (filters.minAmount) {
            expenses = expenses.filter(e => e.amount >= filters.minAmount);
        }

        if (filters.maxAmount) {
            expenses = expenses.filter(e => e.amount <= filters.maxAmount);
        }

        if (filters.item) {
            expenses = expenses.filter(e => 
                e.item.toLowerCase().includes(filters.item.toLowerCase())
            );
        }

        return expenses;
    }

    /**
     * 支出をソート
     */
    sortExpenses(expenses, sortBy = 'date', order = 'desc') {
        return expenses.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'item':
                    aValue = a.item.toLowerCase();
                    bValue = b.item.toLowerCase();
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
     * 支出統計を取得
     */
    getExpenseStats() {
        const expenses = this.getExpenses();
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const byProject = {};
        expenses.forEach(expense => {
            if (!byProject[expense.projectId]) {
                byProject[expense.projectId] = 0;
            }
            byProject[expense.projectId] += expense.amount;
        });

        const byMonth = {};
        expenses.forEach(expense => {
            if (expense.date) {
                const month = expense.date.substring(0, 7); // YYYY-MM
                if (!byMonth[month]) {
                    byMonth[month] = 0;
                }
                byMonth[month] += expense.amount;
            }
        });

        return {
            total: total,
            count: expenses.length,
            average: expenses.length > 0 ? total / expenses.length : 0,
            byProject: byProject,
            byMonth: byMonth
        };
    }

    /**
     * プロジェクトの予算使用率を計算
     */
    calculateBudgetUsage(projectId) {
        const project = new ProjectManager().getProject(projectId);
        if (!project || !project.budget) return 0;

        const projectExpenses = this.getExpensesByProject(projectId);
        const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        return Math.min(100, (totalExpenses / project.budget) * 100);
    }

    /**
     * 支出を検索
     */
    searchExpenses(query) {
        const expenses = this.getExpenses();
        const lowerQuery = query.toLowerCase();
        
        return expenses.filter(expense => 
            expense.item.toLowerCase().includes(lowerQuery) ||
            expense.memo.toLowerCase().includes(lowerQuery)
        );
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ExpenseManager = ExpenseManager;
}
