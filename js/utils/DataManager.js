/**
 * データ管理クラス
 */
class DataManager {
    constructor() {
        this.storage = new Storage();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // エクスポートボタン
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openExportModal());
        }

        // インポートボタン
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.openFileSelector());
        }

        // データクリアボタン
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.confirmClearData());
        }

        // エクスポートモーダルのイベント
        this.bindExportModalEvents();
        
        // インポートモーダルのイベント
        this.bindImportModalEvents();
    }

    bindExportModalEvents() {
        const exportModal = document.getElementById('exportModal');
        const exportModalClose = document.getElementById('exportModalClose');
        const exportModalCancel = document.getElementById('exportModalCancel');
        const exportForm = document.getElementById('exportForm');
        const enablePassword = document.getElementById('enablePassword');

        if (exportModalClose) {
            exportModalClose.addEventListener('click', () => this.closeExportModal());
        }

        if (exportModalCancel) {
            exportModalCancel.addEventListener('click', () => this.closeExportModal());
        }

        if (exportForm) {
            exportForm.addEventListener('submit', (e) => this.handleExport(e));
        }

        if (enablePassword) {
            enablePassword.addEventListener('change', () => this.togglePasswordFields());
        }

        // パスワード強度チェック
        const exportPassword = document.getElementById('exportPassword');
        if (exportPassword) {
            exportPassword.addEventListener('input', () => this.checkPasswordStrength());
        }
    }

    bindImportModalEvents() {
        const importModal = document.getElementById('importModal');
        const importModalClose = document.getElementById('importModalClose');
        const importModalCancel = document.getElementById('importModalCancel');
        const importForm = document.getElementById('importForm');
        const importFile = document.getElementById('importFile');

        if (importModalClose) {
            importModalClose.addEventListener('click', () => this.closeImportModal());
        }

        if (importModalCancel) {
            importModalCancel.addEventListener('click', () => this.closeImportModal());
        }

        if (importForm) {
            importForm.addEventListener('submit', (e) => this.handleImport(e));
        }

        if (importFile) {
            importFile.addEventListener('change', () => this.handleFileSelection());
        }
    }

    openExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.add('active');
            // フォームをリセット
            const form = document.getElementById('exportForm');
            if (form) form.reset();
            this.togglePasswordFields();
        }
    }

    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    openImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.add('active');
            // フォームをリセット
            const form = document.getElementById('importForm');
            if (form) form.reset();
            
            // ファイル選択後の状態を設定（ファイルが既に選択されている場合）
            const fileInput = document.getElementById('importFile');
            if (fileInput && fileInput.files[0]) {
                const file = fileInput.files[0];
                const fileLabel = document.querySelector('label[for="importFile"]');
                const importSubmitBtn = document.querySelector('#importForm button[type="submit"]');
                
                if (fileLabel) {
                    fileLabel.textContent = `選択されたファイル: ${file.name}`;
                    fileLabel.style.color = '#333';
                }
                
                if (importSubmitBtn) {
                    importSubmitBtn.disabled = false;
                    importSubmitBtn.textContent = 'インポート';
                }
            } else {
                // ファイル選択前のメッセージを表示
                this.showFileSelectionPrompt();
            }
        }
    }

    openFileSelector() {
        // ファイル選択のエクスプローラーを直接開く
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.click();
        }
    }

    closeImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    togglePasswordFields() {
        const enablePassword = document.getElementById('enablePassword');
        const passwordFields = document.getElementById('passwordFields');
        const passwordConfirmFields = document.getElementById('passwordConfirmFields');
        const exportPassword = document.getElementById('exportPassword');
        const exportPasswordConfirm = document.getElementById('exportPasswordConfirm');

        if (enablePassword && enablePassword.checked) {
            if (passwordFields) passwordFields.style.display = 'block';
            if (passwordConfirmFields) passwordConfirmFields.style.display = 'block';
            if (exportPassword) exportPassword.required = true;
            if (exportPasswordConfirm) exportPasswordConfirm.required = true;
        } else {
            if (passwordFields) passwordFields.style.display = 'none';
            if (passwordConfirmFields) passwordConfirmFields.style.display = 'none';
            if (exportPassword) exportPassword.required = false;
            if (exportPasswordConfirm) exportPasswordConfirm.required = false;
        }
    }

    hideImportPasswordFields() {
        const passwordFields = document.getElementById('importPasswordFields');
        const importPassword = document.getElementById('importPassword');
        
        if (passwordFields) passwordFields.style.display = 'none';
        if (importPassword) importPassword.required = false;
    }

    showFileSelectionPrompt() {
        // ファイル選択前のメッセージを表示
        const importFile = document.getElementById('importFile');
        const fileLabel = document.querySelector('label[for="importFile"]');
        
        if (fileLabel) {
            fileLabel.textContent = 'ファイルを選択してください';
            fileLabel.style.color = '#666';
        }
        
        // パスワードフィールドを非表示
        this.hideImportPasswordFields();
        
        // インポートボタンを無効化（ファイル選択前）
        const importSubmitBtn = document.querySelector('#importForm button[type="submit"]');
        if (importSubmitBtn) {
            importSubmitBtn.disabled = true;
            importSubmitBtn.textContent = 'ファイルを選択してください';
        }
    }

    checkPasswordStrength() {
        const password = document.getElementById('exportPassword')?.value;
        if (!password) return;

        const strength = CryptoHelper.checkPasswordStrength(password);
        const passwordConfirm = document.getElementById('exportPasswordConfirm');
        
        // パスワード確認フィールドの検証
        if (passwordConfirm && passwordConfirm.value) {
            this.validatePasswordConfirm();
        }

        // 強度に応じたフィードバック表示
        this.showPasswordStrengthFeedback(strength);
    }

    showPasswordStrengthFeedback(strength) {
        // 既存のフィードバックを削除
        const existingFeedback = document.querySelector('.password-strength-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const passwordField = document.getElementById('exportPassword');
        if (!passwordField) return;

        const feedback = document.createElement('div');
        feedback.className = `password-strength-feedback strength-${strength.strength}`;
        
        let strengthText = '';
        let strengthClass = '';
        
        switch (strength.strength) {
            case 'weak':
                strengthText = '弱い';
                strengthClass = 'weak';
                break;
            case 'medium':
                strengthText = '普通';
                strengthClass = 'medium';
                break;
            case 'strong':
                strengthText = '強い';
                strengthClass = 'strong';
                break;
        }

        feedback.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill strength-${strengthClass}"></div>
            </div>
            <span class="strength-text">強度: ${strengthText}</span>
            ${strength.feedback.length > 0 ? `<ul class="strength-suggestions"><li>${strength.feedback.join('</li><li>')}</li></ul>` : ''}
        `;

        passwordField.parentNode.appendChild(feedback);
    }

    validatePasswordConfirm() {
        const password = document.getElementById('exportPassword')?.value;
        const passwordConfirm = document.getElementById('exportPasswordConfirm')?.value;
        const passwordConfirmField = document.getElementById('exportPasswordConfirm');

        if (password && passwordConfirm && password !== passwordConfirm) {
            passwordConfirmField.setCustomValidity('パスワードが一致しません');
        } else {
            passwordConfirmField.setCustomValidity('');
        }
    }

    handleExport(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const enablePassword = formData.get('enablePassword') === 'on';
        const password = formData.get('exportPassword');
        const passwordConfirm = formData.get('exportPasswordConfirm');
        const filename = formData.get('exportFilename') || 'project-data';

        // パスワード保護が有効な場合の検証
        if (enablePassword) {
            if (!password || password.length < 6) {
                alert('パスワードは6文字以上で入力してください');
                return;
            }
            if (password !== passwordConfirm) {
                alert('パスワードが一致しません');
                return;
            }
        }

        try {
            this.exportData(filename, enablePassword ? password : null);
            this.closeExportModal();
        } catch (error) {
            alert(`エクスポートエラー: ${error.message}`);
        }
    }

    exportData(filename, password = null) {
        // 現在のデータを取得
        const data = {
            projects: this.storage.getProjects(),
            tasks: this.storage.getTasks(),
            expenses: this.storage.getExpenses(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const jsonData = JSON.stringify(data, null, 2);
        let fileContent = jsonData;
        let fileExtension = '.json';
        let mimeType = 'application/json';

        // パスワード保護が有効な場合
        if (password) {
            try {
                fileContent = CryptoHelper.encrypt(jsonData, password);
                fileExtension = '.enc';
                mimeType = 'application/octet-stream';
            } catch (error) {
                throw new Error('データの暗号化に失敗しました');
            }
        }

        // ファイルをダウンロード
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 成功メッセージ
        const message = password 
            ? `データをパスワード保護付きでエクスポートしました: ${filename}${fileExtension}`
            : `データをエクスポートしました: ${filename}${fileExtension}`;
        
        this.showNotification(message, 'success');
    }



    async importData(file, overwrite = false) {
        console.log('importData called with:', { file: file.name, overwrite });
        try {
            const content = await this.readFileContent(file);
            console.log('File content read in importData, length:', content.length);
            
            // JSONファイルを直接処理
            let data;
            try {
                data = JSON.parse(content);
                console.log('JSON parsed successfully:', data);
            } catch (error) {
                throw new Error('JSONファイルの形式が正しくありません');
            }

            // データの検証
            if (!this.validateImportData(data)) {
                throw new Error('インポートするデータの形式が正しくありません');
            }

            console.log('Data validation passed, performing import');
            // データのインポート
            this.performImport(data, overwrite);
            
            this.showNotification('データのインポートが完了しました', 'success');
            
            // ページをリロードして新しいデータを反映
            setTimeout(() => location.reload(), 1000);

        } catch (error) {
            alert(`インポートエラー: ${error.message}`);
        }
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
            reader.readAsText(file);
        });
    }

    validateImportData(data) {
        // 基本的なデータ構造の検証
        return data && 
               (Array.isArray(data.projects) || Array.isArray(data.tasks) || Array.isArray(data.expenses));
    }

    performImport(data, overwrite) {
        if (overwrite) {
            // 既存データを完全に置き換え
            if (data.projects) this.storage.saveProjects(data.projects);
            if (data.tasks) this.storage.saveTasks(data.tasks);
            if (data.expenses) this.storage.saveExpenses(data.expenses);
        } else {
            // 既存データとマージ
            if (data.projects) {
                const existingProjects = this.storage.getProjects();
                const mergedProjects = [...existingProjects, ...data.projects];
                this.storage.saveProjects(mergedProjects);
            }
            if (data.tasks) {
                const existingTasks = this.storage.getTasks();
                const mergedTasks = [...existingTasks, ...data.tasks];
                this.storage.saveTasks(mergedTasks);
            }
            if (data.expenses) {
                const existingExpenses = this.storage.getExpenses();
                const mergedExpenses = [...existingExpenses, ...data.expenses];
                this.storage.saveExpenses(mergedExpenses);
            }
        }
    }

    handleFileSelection() {
        console.log('handleFileSelection called');
        const fileInput = document.getElementById('importFile');

        if (!fileInput || !fileInput.files[0]) {
            console.log('No file selected');
            return;
        }

        const file = fileInput.files[0];
        console.log('File selected:', file.name);
        
        // ファイル選択後、直接インポートを実行
        this.importData(file, false);
    }

    confirmClearData() {
        if (confirm('本当に全てのデータを削除しますか？この操作は取り消せません。')) {
            this.clearAllData();
        }
    }

    clearAllData() {
        try {
            this.storage.clearAll();
            this.showNotification('全てのデータを削除しました', 'info');
            
            // ページをリロード
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            alert(`データ削除エラー: ${error.message}`);
        }
    }

    showNotification(message, type = 'info') {
        // シンプルな通知を表示
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // スタイルを適用
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            maxWidth: '400px',
            wordWrap: 'break-word'
        });

        // タイプに応じた背景色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);

        // 3秒後に自動削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
