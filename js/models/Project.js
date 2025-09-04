/**
 * プロジェクトモデルクラス
 */
class Project {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.description = data.description || '';
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.budget = data.budget || 0;
        this.status = data.status || 'planned';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * ユニークIDを生成
     */
    generateId() {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * プロジェクトの進捗率を計算
     */
    calculateProgress(tasks = []) {
        if (tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.status === 'completed');
        return Math.round((completedTasks.length / tasks.length) * 100);
    }

    /**
     * プロジェクトの残り日数を計算
     */
    getRemainingDays() {
        const today = new Date();
        const endDate = new Date(this.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * プロジェクトのステータスを取得（日本語）
     */
    getStatusText() {
        const statusMap = {
            'planned': '計画中',
            'in-progress': '進行中',
            'completed': '完了',
            'on-hold': '保留'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * プロジェクトのステータスカラーを取得
     */
    getStatusColor() {
        const colorMap = {
            'planned': 'warning',
            'in-progress': 'info',
            'completed': 'success',
            'on-hold': 'error'
        };
        return colorMap[this.status] || 'gray';
    }

    /**
     * プロジェクトが期限切れかチェック
     */
    isOverdue() {
        const today = new Date();
        const endDate = new Date(this.endDate);
        return today > endDate && this.status !== 'completed';
    }

    /**
     * プロジェクトが期限が近いかチェック（3日以内）
     */
    isDueSoon() {
        const remainingDays = this.getRemainingDays();
        return remainingDays >= 0 && remainingDays <= 3 && this.status !== 'completed';
    }

    /**
     * データのバリデーション
     */
    validate() {
        const errors = [];

        if (!this.name.trim()) {
            errors.push('プロジェクト名は必須です');
        }

        if (this.name.length > 100) {
            errors.push('プロジェクト名は100文字以内で入力してください');
        }

        if (this.description.length > 500) {
            errors.push('説明は500文字以内で入力してください');
        }

        if (!this.startDate) {
            errors.push('開始日は必須です');
        }

        if (!this.endDate) {
            errors.push('期限は必須です');
        }

        if (this.startDate && this.endDate && new Date(this.startDate) >= new Date(this.endDate)) {
            errors.push('開始日は期限より前の日付を設定してください');
        }

        if (this.budget < 0) {
            errors.push('予算は0以上の値を入力してください');
        }

        if (!['planned', 'in-progress', 'completed', 'on-hold'].includes(this.status)) {
            errors.push('無効なステータスです');
        }

        return errors;
    }

    /**
     * プロジェクトを更新
     */
    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * プロジェクトをJSON形式で出力
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            budget: this.budget,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * プロジェクトをHTML要素として表示
     */
    toHTML() {
        const remainingDays = this.getRemainingDays();
        const isOverdue = this.isOverdue();
        const isDueSoon = this.isDueSoon();
        
        let dueDateClass = '';
        if (isOverdue) dueDateClass = 'text-red-600';
        else if (isDueSoon) dueDateClass = 'text-yellow-600';
        
        return `
            <div class="project-item" data-project-id="${this.id}">
                <div class="project-info">
                    <h4>${this.name}</h4>
                    <p>${this.description || '説明なし'}</p>
                    <small class="${dueDateClass}">
                        期限: ${this.endDate} 
                        ${isOverdue ? '(期限切れ)' : isDueSoon ? '(期限が近い)' : ''}
                    </small>
                </div>
                <div class="project-status">
                    <span class="status-badge status-${this.getStatusColor()}">
                        ${this.getStatusText()}
                    </span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Project = Project;
}



