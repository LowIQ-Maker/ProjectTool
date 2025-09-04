/**
 * バリデーション用ユーティリティクラス
 */
class Validation {
    constructor() {
        this.errors = [];
    }

    /**
     * エラーをクリア
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * エラーを追加
     */
    addError(field, message) {
        this.errors.push({ field, message });
    }

    /**
     * エラーを取得
     */
    getErrors() {
        return this.errors;
    }

    /**
     * エラーがあるかチェック
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * 特定のフィールドのエラーを取得
     */
    getFieldErrors(field) {
        return this.errors.filter(error => error.field === field);
    }

    /**
     * 必須チェック
     */
    required(value, fieldName) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            this.addError(fieldName, `${fieldName}は必須です`);
            return false;
        }
        return true;
    }

    /**
     * 文字数チェック
     */
    maxLength(value, maxLength, fieldName) {
        if (value && value.length > maxLength) {
            this.addError(fieldName, `${fieldName}は${maxLength}文字以内で入力してください`);
            return false;
        }
        return true;
    }

    /**
     * 最小値チェック
     */
    minValue(value, minValue, fieldName) {
        if (value !== null && value !== undefined && value < minValue) {
            this.addError(fieldName, `${fieldName}は${minValue}以上の値を入力してください`);
            return false;
        }
        return true;
    }

    /**
     * 最大値チェック
     */
    maxValue(value, maxValue, fieldName) {
        if (value !== null && value !== undefined && value > maxValue) {
            this.addError(fieldName, `${fieldName}は${maxValue}以下の値を入力してください`);
            return false;
        }
        return true;
    }

    /**
     * 日付形式チェック
     */
    dateFormat(value, fieldName) {
        if (value && !this.isValidDate(value)) {
            this.addError(fieldName, `${fieldName}は有効な日付形式で入力してください`);
            return false;
        }
        return true;
    }

    /**
     * 日付の妥当性チェック
     */
    isValidDate(value) {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * 開始日が終了日より前かチェック
     */
    startDateBeforeEndDate(startDate, endDate, startFieldName, endFieldName) {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start >= end) {
                this.addError(startFieldName, `${startFieldName}は${endFieldName}より前の日付を設定してください`);
                return false;
            }
        }
        return true;
    }

    /**
     * 数値形式チェック
     */
    isNumber(value, fieldName) {
        if (value !== null && value !== undefined && isNaN(Number(value))) {
            this.addError(fieldName, `${fieldName}は数値で入力してください`);
            return false;
        }
        return true;
    }

    /**
     * 正の数値チェック
     */
    isPositiveNumber(value, fieldName) {
        if (!this.isNumber(value, fieldName)) return false;
        
        const num = Number(value);
        if (num <= 0) {
            this.addError(fieldName, `${fieldName}は正の数値を入力してください`);
            return false;
        }
        return true;
    }

    /**
     * メールアドレス形式チェック
     */
    emailFormat(value, fieldName) {
        if (value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.addError(fieldName, `${fieldName}は有効なメールアドレス形式で入力してください`);
                return false;
            }
        }
        return true;
    }

    /**
     * URL形式チェック
     */
    urlFormat(value, fieldName) {
        if (value) {
            try {
                new URL(value);
            } catch (error) {
                this.addError(fieldName, `${fieldName}は有効なURL形式で入力してください`);
                return false;
            }
        }
        return true;
    }

    /**
     * プロジェクトデータのバリデーション
     */
    validateProject(projectData) {
        this.clearErrors();
        
        this.required(projectData.name, 'プロジェクト名');
        this.maxLength(projectData.name, 100, 'プロジェクト名');
        this.maxLength(projectData.description, 500, '説明');
        this.required(projectData.startDate, '開始日');
        this.required(projectData.endDate, '期限');
        this.dateFormat(projectData.startDate, '開始日');
        this.dateFormat(projectData.endDate, '期限');
        this.startDateBeforeEndDate(projectData.startDate, projectData.endDate, '開始日', '期限');
        this.required(projectData.budget, '予算');
        this.isPositiveNumber(projectData.budget, '予算');
        this.required(projectData.status, 'ステータス');
        
        return !this.hasErrors();
    }

    /**
     * タスクデータのバリデーション
     */
    validateTask(taskData) {
        this.clearErrors();
        
        this.required(taskData.name, 'タスク名');
        this.maxLength(taskData.name, 100, 'タスク名');
        this.maxLength(taskData.description, 500, '説明');
        this.required(taskData.projectId, 'プロジェクト');
        this.required(taskData.priority, '優先度');
        this.required(taskData.dueDate, '期限');
        this.dateFormat(taskData.dueDate, '期限');
        this.required(taskData.estimatedHours, '予想工数');
        this.isPositiveNumber(taskData.estimatedHours, '予想工数');
        
        return !this.hasErrors();
    }

    /**
     * 支出データのバリデーション
     */
    validateExpense(expenseData) {
        this.clearErrors();
        
        this.required(expenseData.projectId, 'プロジェクト');
        this.required(expenseData.date, '支出日');
        this.dateFormat(expenseData.date, '支出日');
        this.required(expenseData.amount, '金額');
        this.isPositiveNumber(expenseData.amount, '金額');
        this.required(expenseData.item, '支出項目');
        this.maxLength(expenseData.item, 100, '支出項目');
        this.maxLength(expenseData.memo, 500, 'メモ');
        
        return !this.hasErrors();
    }

    /**
     * フォームフィールドのエラー表示
     */
    displayFieldErrors(fieldName) {
        const fieldErrors = this.getFieldErrors(fieldName);
        if (fieldErrors.length > 0) {
            return fieldErrors.map(error => error.message).join(', ');
        }
        return '';
    }

    /**
     * フォームフィールドのエラークラスを設定
     */
    setFieldErrorClass(fieldElement, hasError) {
        if (hasError) {
            fieldElement.classList.add('error');
        } else {
            fieldElement.classList.remove('error');
        }
    }

    /**
     * フォーム全体のバリデーション
     */
    validateForm(formElement) {
        this.clearErrors();
        
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // フォームの種類に応じてバリデーション
        if (formElement.id === 'projectForm') {
            return this.validateProject(data);
        } else if (formElement.id === 'taskForm') {
            return this.validateTask(data);
        }
        
        return false;
    }

    /**
     * リアルタイムバリデーション
     */
    setupRealTimeValidation(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * 個別フィールドのバリデーション
     */
    validateField(fieldElement) {
        const fieldName = fieldElement.name || fieldElement.id;
        const value = fieldElement.value;
        
        // フィールドの種類に応じてバリデーション
        if (fieldElement.hasAttribute('required')) {
            this.required(value, fieldName);
        }
        
        if (fieldElement.hasAttribute('maxlength')) {
            const maxLength = parseInt(fieldElement.getAttribute('maxlength'));
            this.maxLength(value, maxLength, fieldName);
        }
        
        if (fieldElement.type === 'number') {
            this.isNumber(value, fieldName);
        }
        
        if (fieldElement.type === 'date') {
            this.dateFormat(value, fieldName);
        }
        
        // エラーの表示
        const hasError = this.getFieldErrors(fieldName).length > 0;
        this.setFieldErrorClass(fieldElement, hasError);
        
        // エラーメッセージの表示
        this.displayFieldErrorMessage(fieldElement, fieldName);
    }

    /**
     * フィールドのエラーメッセージを表示
     */
    displayFieldErrorMessage(fieldElement, fieldName) {
        // 既存のエラーメッセージを削除
        const existingError = fieldElement.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // 新しいエラーメッセージを表示
        const fieldErrors = this.getFieldErrors(fieldName);
        if (fieldErrors.length > 0) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = fieldErrors[0].message;
            fieldElement.parentNode.appendChild(errorElement);
        }
    }

    /**
     * フィールドのエラーをクリア
     */
    clearFieldError(fieldElement) {
        fieldElement.classList.remove('error');
        
        const errorElement = fieldElement.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Validation = Validation;
}



