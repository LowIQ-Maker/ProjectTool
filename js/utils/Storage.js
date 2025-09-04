/**
 * ストレージ管理ユーティリティクラス
 */
class Storage {
    constructor() {
        this.storageKey = 'projectManagementTool';
        this.defaultData = {
            projects: [],
            tasks: [],
            expenses: [],
            settings: {
                theme: 'light',
                language: 'ja',
                currency: 'JPY'
            }
        };
    }

    /**
     * データを保存
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('データの保存に失敗しました:', error);
            return false;
        }
    }

    /**
     * データを取得
     */
    load(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return null;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            return null;
        }
    }

    /**
     * データを削除
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('データの削除に失敗しました:', error);
            return false;
        }
    }

    /**
     * 全データを取得
     */
    getAllData() {
        const data = this.load(this.storageKey);
        return data || this.defaultData;
    }

    /**
     * 全データを保存
     */
    saveAllData(data) {
        return this.save(this.storageKey, data);
    }

    /**
     * プロジェクトを保存
     */
    saveProjects(projects) {
        const data = this.getAllData();
        data.projects = projects;
        return this.saveAllData(data);
    }

    /**
     * プロジェクトを取得
     */
    getProjects() {
        const data = this.getAllData();
        const projects = data.projects || [];
        console.log('Storage.getProjects: 取得したプロジェクト数:', projects.length);
        console.log('Storage.getProjects: プロジェクト一覧:', projects);
        return projects;
    }

    /**
     * プロジェクトを追加
     */
    addProject(project) {
        const projects = this.getProjects();
        projects.push(project);
        return this.saveProjects(projects);
    }

    /**
     * プロジェクトを更新
     */
    updateProject(projectId, updatedData) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === projectId);
        
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updatedData };
            return this.saveProjects(projects);
        }
        
        return false;
    }

    /**
     * プロジェクトを削除
     */
    deleteProject(projectId) {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);
        return this.saveProjects(filteredProjects);
    }

    /**
     * タスクを保存
     */
    saveTasks(tasks) {
        const data = this.getAllData();
        data.tasks = tasks;
        return this.saveAllData(data);
    }

    /**
     * タスクを取得
     */
    getTasks() {
        const data = this.getAllData();
        return data.tasks || [];
    }

    /**
     * プロジェクト別のタスクを取得
     */
    getTasksByProject(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.projectId === projectId);
    }

    /**
     * タスクを追加
     */
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        return this.saveTasks(tasks);
    }

    /**
     * タスクを更新
     */
    updateTask(taskId, updatedData) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedData };
            return this.saveTasks(tasks);
        }
        
        return false;
    }

    /**
     * タスクを削除
     */
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        return this.saveTasks(filteredTasks);
    }

    /**
     * 支出を保存
     */
    saveExpenses(expenses) {
        const data = this.getAllData();
        data.expenses = expenses;
        return this.saveAllData(data);
    }

    /**
     * 支出を取得
     */
    getExpenses() {
        const data = this.getAllData();
        return data.expenses || [];
    }

    /**
     * プロジェクト別の支出を取得
     */
    getExpensesByProject(projectId) {
        const expenses = this.getExpenses();
        return expenses.filter(expense => expense.projectId === projectId);
    }

    /**
     * 支出を追加
     */
    addExpense(expense) {
        const expenses = this.getExpenses();
        expenses.push(expense);
        return this.saveExpenses(expenses);
    }

    /**
     * 支出を更新
     */
    updateExpense(expenseId, updatedData) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === expenseId);
        
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedData };
            return this.saveExpenses(expenses);
        }
        
        return false;
    }

    /**
     * 支出を削除
     */
    deleteExpense(expenseId) {
        const expenses = this.getExpenses();
        const filteredExpenses = expenses.filter(e => e.id !== expenseId);
        return this.saveExpenses(filteredExpenses);
    }

    /**
     * 設定を保存
     */
    saveSettings(settings) {
        const data = this.getAllData();
        data.settings = { ...data.settings, ...settings };
        return this.saveAllData(data);
    }

    /**
     * 設定を取得
     */
    getSettings() {
        const data = this.getAllData();
        return data.settings || this.defaultData.settings;
    }

    /**
     * データをエクスポート（非推奨）
     * 注意: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。
     */
    exportData() {
        console.warn('Storage.exportData: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
        throw new Error('このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
    }

    /**
     * データをインポート（非推奨）
     * 注意: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。
     */
    importData(file) {
        console.warn('Storage.importData: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
        throw new Error('このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
    }

    /**
     * インポートデータの検証（非推奨）
     * 注意: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。
     */
    validateImportedData(data) {
        console.warn('Storage.validateImportedData: このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
        throw new Error('このメソッドは非推奨です。DataManagerクラスが代わりに処理します。');
    }

    /**
     * ストレージの容量をチェック
     */
    checkStorageCapacity() {
        try {
            const testKey = 'storage_test';
            const testData = 'x'.repeat(1024 * 1024); // 1MBのテストデータ
            
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * ストレージの使用量を取得
     */
    getStorageUsage() {
        try {
            let totalSize = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            return totalSize;
        } catch (error) {
            return 0;
        }
    }

    /**
     * データをクリア
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('データのクリアに失敗しました:', error);
            return false;
        }
    }

    /**
     * 全てのデータをクリア（clearAllDataのエイリアス）
     */
    clearAll() {
        return this.clearAllData();
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.Storage = Storage;
}



