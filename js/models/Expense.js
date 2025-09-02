/**
 * 支出モデルクラス
 */
class Expense {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.projectId = data.projectId || '';
        this.date = data.date || '';
        this.amount = data.amount || 0;
        this.item = data.item || '';
        this.memo = data.memo || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    /**
     * ユニークIDを生成
     */
    generateId() {
        return 'expense_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 支出日を取得（日本語形式）
     */
    getDateText() {
        if (!this.date) return '日付なし';
        
        const date = new Date(this.date);
        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return '今日';
        if (diffDays === 1) return '昨日';
        if (diffDays <= 7) return `${diffDays}日前`;
        
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * 金額を取得（通貨形式）
     */
    getAmountText() {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(this.amount);
    }

    /**
     * 支出が今日かチェック
     */
    isToday() {
        if (!this.date) return false;
        
        const today = new Date();
        const expenseDate = new Date(this.date);
        
        return today.toDateString() === expenseDate.toDateString();
    }

    /**
     * 支出が今月かチェック
     */
    isThisMonth() {
        if (!this.date) return false;
        
        const today = new Date();
        const expenseDate = new Date(this.date);
        
        return today.getFullYear() === expenseDate.getFullYear() &&
               today.getMonth() === expenseDate.getMonth();
    }

    /**
     * データのバリデーション
     */
    validate() {
        const errors = [];

        if (!this.projectId) {
            errors.push('プロジェクトは必須です');
        }

        if (!this.date) {
            errors.push('支出日は必須です');
        }

        if (this.amount <= 0) {
            errors.push('金額は0より大きい値を入力してください');
        }

        if (!this.item.trim()) {
            errors.push('支出項目は必須です');
        }

        if (this.item.length > 100) {
            errors.push('支出項目は100文字以内で入力してください');
        }

        if (this.memo.length > 500) {
            errors.push('メモは500文字以内で入力してください');
        }

        return errors;
    }

    /**
     * 支出を更新
     */
    update(data) {
        Object.assign(this, data);
    }

    /**
     * 支出をJSON形式で出力
     */
    toJSON() {
        return {
            id: this.id,
            projectId: this.projectId,
            date: this.date,
            amount: this.amount,
            item: this.item,
            memo: this.memo,
            createdAt: this.createdAt
        };
    }

    /**
     * 支出をHTML要素として表示
     */
    toHTML() {
        return `
            <div class="expense-item" data-expense-id="${this.id}">
                <div class="expense-info">
                    <h4>${this.item}</h4>
                    <p>${this.memo || 'メモなし'}</p>
                    <small>${this.getDateText()}</small>
                </div>
                <div class="expense-amount">
                    <span class="amount-text">${this.getAmountText()}</span>
                </div>
            </div>
        `;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Expense = Expense;
}



