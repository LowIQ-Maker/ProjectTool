/**
 * タスクモデルクラス
 */
class Task {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.projectId = data.projectId || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.priority = data.priority || 'medium';
        this.dueDate = data.dueDate || '';
        this.estimatedHours = data.estimatedHours || 0;
        this.actualHours = data.actualHours || 0;
        this.status = data.status || 'pending';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * ユニークIDを生成
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * タスクの残り日数を計算
     */
    getRemainingDays() {
        const today = new Date();
        const dueDate = new Date(this.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * タスクが期限切れかチェック
     */
    isOverdue() {
        const today = new Date();
        const dueDate = new Date(this.dueDate);
        return today > dueDate && this.status !== 'completed';
    }

    /**
     * タスクが期限が近いかチェック（3日以内）
     */
    isDueSoon() {
        const remainingDays = this.getRemainingDays();
        return remainingDays >= 0 && remainingDays <= 3 && this.status !== 'completed';
    }

    /**
     * 優先度を取得（日本語）
     */
    getPriorityText() {
        const priorityMap = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        return priorityMap[this.priority] || this.priority;
    }

    /**
     * 優先度カラーを取得
     */
    getPriorityColor() {
        const colorMap = {
            'high': 'error',
            'medium': 'warning',
            'low': 'success'
        };
        return colorMap[this.priority] || 'gray';
    }

    /**
     * ステータスを取得（日本語）
     */
    getStatusText() {
        const statusMap = {
            'pending': '未着手',
            'in-progress': '進行中',
            'completed': '完了'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * ステータスカラーを取得
     */
    getStatusColor() {
        const colorMap = {
            'pending': 'gray',
            'in-progress': 'info',
            'completed': 'success'
        };
        return colorMap[this.status] || 'gray';
    }

    /**
     * 工数の差異を計算
     */
    getHoursDifference() {
        return this.actualHours - this.estimatedHours;
    }

    /**
     * 工数効率を計算（予想工数に対する実際工数の比率）
     */
    getHoursEfficiency() {
        if (this.estimatedHours === 0) return 0;
        return Math.round((this.actualHours / this.estimatedHours) * 100);
    }

    /**
     * 期限の表示テキストを取得
     */
    getDueDateText() {
        if (!this.dueDate) return '期限なし';
        
        const remainingDays = this.getRemainingDays();
        
        if (this.isOverdue()) {
            return `${Math.abs(remainingDays)}日前（期限切れ）`;
        } else if (remainingDays === 0) {
            return '今日';
        } else if (remainingDays === 1) {
            return '明日';
        } else if (remainingDays <= 7) {
            return `${remainingDays}日後`;
        } else {
            return this.dueDate;
        }
    }

    /**
     * データのバリデーション
     */
    validate() {
        const errors = [];

        if (!this.name.trim()) {
            errors.push('タスク名は必須です');
        }

        if (this.name.length > 100) {
            errors.push('タスク名は100文字以内で入力してください');
        }

        if (this.description.length > 500) {
            errors.push('説明は500文字以内で入力してください');
        }

        if (!this.projectId) {
            errors.push('プロジェクトは必須です');
        }

        if (!['high', 'medium', 'low'].includes(this.priority)) {
            errors.push('無効な優先度です');
        }

        if (!this.dueDate) {
            errors.push('期限は必須です');
        }

        if (this.estimatedHours < 0) {
            errors.push('予想工数は0以上の値を入力してください');
        }

        if (this.actualHours < 0) {
            errors.push('実際工数は0以上の値を入力してください');
        }

        if (!['pending', 'in-progress', 'completed'].includes(this.status)) {
            errors.push('無効なステータスです');
        }

        return errors;
    }

    /**
     * タスクを更新
     */
    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * タスクを完了
     */
    complete(actualHours = null) {
        this.status = 'completed';
        if (actualHours !== null) {
            this.actualHours = actualHours;
        }
        this.updatedAt = new Date().toISOString();
    }

    /**
     * タスクをJSON形式で出力
     */
    toJSON() {
        return {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            description: this.description,
            priority: this.priority,
            dueDate: this.dueDate,
            estimatedHours: this.estimatedHours,
            actualHours: this.actualHours,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * タスクをHTML要素として表示
     */
    toHTML() {
        const isOverdue = this.isOverdue();
        const isDueSoon = this.isDueSoon();
        
        let dueDateClass = '';
        if (isOverdue) dueDateClass = 'text-red-600';
        else if (isDueSoon) dueDateClass = 'text-yellow-600';
        
        return `
            <div class="task-item priority-${this.priority}" data-task-id="${this.id}">
                <div class="task-checkbox">
                    <input type="checkbox" id="task_${this.id}" ${this.status === 'completed' ? 'checked' : ''}>
                    <label for="task_${this.id}"></label>
                </div>
                <div class="task-content">
                    <h4>${this.name}</h4>
                    <p>${this.description || '説明なし'}</p>
                    <small class="${dueDateClass}">
                        期限: ${this.getDueDateText()}
                    </small>
                </div>
                <div class="task-meta">
                    <span class="due-date">${this.getDueDateText()}</span>
                    <span class="priority-badge priority-${this.priority}">
                        ${this.getPriorityText()}
                    </span>
                    <small>予想: ${this.estimatedHours}h / 実際: ${this.actualHours}h</small>
                </div>
            </div>
        `;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Task = Task;
}



