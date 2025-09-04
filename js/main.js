//test！
// プロジェクト管理ツール メインJavaScriptファイル

document.addEventListener('DOMContentLoaded', function() {
    // アプリケーションの初期化
    initApp();
    
    // 少し遅延してボタンのイベントを再設定（確実性のため）
    setTimeout(() => {
        console.log('遅延実行: ボタンイベントを再設定');
        initPageButtons();
    }, 100);
});

/**
 * アプリケーションの初期化
 */
function initApp() {
    // モバイルメニューの初期化
    initMobileMenu();
    
    // ナビゲーションの初期化
    initNavigation();
    
    // チェックボックスの初期化
    initCheckboxes();
    
    // 統計カードのアニメーション
    initStatCards();
    
    // モーダルの初期化
    initModals();
    
    // フォームの初期化
    initForms();
    
    // 初期ダッシュボードの更新
    updateDashboard();
    
    // ヘッダーの新規プロジェクトボタンの初期化
    initHeaderProjectButton();
    
    // プロジェクトページとタスクページのボタンも初期化
    initPageButtons();
    
            // データ管理の初期化
        initDataManager();
        
        // 分析ページの初期化
        initAnalyticsPage();
        
        // タイムトラッキングの初期化
        initTimeTracking();
        
        // レポート機能の初期化
        initReports();
        
        // 通知管理の初期化
        initNotifications();
        
        // グローバルインスタンスの設定
        window.timeTracker = window.timeTrackerView?.timeTracker;
        
        // 初期状態でダッシュボードを表示
        switchPage('dashboard');
    }

/**
 * モバイルメニューの初期化
 */
function initMobileMenu() {
    // モバイルメニューボタンの追加
    const header = document.querySelector('.header-left');
    if (header) {
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        
        header.insertBefore(mobileMenuToggle, header.firstChild);
        
        // モバイルメニューの切り替え
        mobileMenuToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay') || createMobileOverlay();
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // ボタンのアイコンを変更
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
                this.setAttribute('aria-label', 'メニューを閉じる');
            } else {
                icon.className = 'fas fa-bars';
                this.setAttribute('aria-label', 'メニューを開く');
            }
        });
    }
}

/**
 * モバイルオーバーレイの作成
 */
function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    
    overlay.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        
        if (mobileMenuToggle) {
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        }
    });
    
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * ナビゲーションの初期化
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // アクティブなナビゲーション項目の更新
            const currentActive = document.querySelector('.nav-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            
            const navItem = this.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
            
            // 画面の切り替え
            const targetId = this.getAttribute('href').substring(1);
            switchPage(targetId);
            
            // ページタイトルの更新（switchPage内で処理されるため削除）
            
            // モバイルメニューを閉じる
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                
                const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                if (mobileMenuToggle) {
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                    mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
                }
            }
        });
    });
}

/**
 * ページの切り替え
 */
function switchPage(pageId) {
    // すべてのページセクションを非表示
    const allSections = document.querySelectorAll('.dashboard-section, .page-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 対象のページを表示
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // ページタイトルの更新
        updatePageTitle(pageId);
        
        // ページ固有の初期化処理
        switch (pageId) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'projects':
                initProjectsPage();
                break;
            case 'tasks':
                initTasksPage();
                break;
            case 'gantt':
                initGanttPage();
                break;
            case 'expenses':
                initExpensesPage();
                break;
            case 'reports':
                initReportsPage();
                break;
            case 'analytics':
                initAnalyticsPage();
                break;
            case 'time-tracking':
                initTimeTracking();
                break;
            case 'reports':
                initReports();
                break;
            case 'settings':
                initSettingsPage();
                break;
        }
    }
}

/**
 * ページタイトルの更新
 */
function updatePageTitle(pageId) {
    const pageTitle = document.getElementById('pageTitle');
    if (!pageTitle) return;
    
    const titleMap = {
        'dashboard': 'ダッシュボード',
        'projects': 'プロジェクト',
        'tasks': 'タスク',
        'gantt': 'ガントチャート',
        'expenses': '支出管理',
        'time-tracking': 'タイムトラッキング',
        'reports': 'レポート',
        'analytics': '高度な分析',
        'settings': '設定'
    };
    
    pageTitle.textContent = titleMap[pageId] || 'ダッシュボード';
}

/**
 * チェックボックスの初期化
 */
function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.task-checkbox input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (taskItem) {
                if (this.checked) {
                    taskItem.style.opacity = '0.6';
                    taskItem.style.textDecoration = 'line-through';
                } else {
                    taskItem.style.opacity = '1';
                    taskItem.style.textDecoration = 'none';
                }
            }
        });
    });
}

/**
 * 統計カードのアニメーション
 */
function initStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    // Intersection Observerを使用してアニメーション
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    statCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * ページボタンの初期化
 */
function initPageButtons() {
    console.log('initPageButtons: 開始');
    
    // プロジェクト追加ボタンの初期化
    const addProjectBtn = document.getElementById('addProjectBtn');
    console.log('プロジェクト追加ボタン要素:', addProjectBtn);
    if (addProjectBtn) {
        // 既存のイベントリスナーを削除
        const newAddProjectBtn = addProjectBtn.cloneNode(true);
        addProjectBtn.parentNode.replaceChild(newAddProjectBtn, addProjectBtn);
        
        // 新しいボタンにイベントリスナーを設定
        newAddProjectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('initPageButtons: プロジェクト追加ボタンがクリックされました');
            const projectModal = document.getElementById('projectModal');
            if (projectModal) {
                projectModal.classList.add('active');
                console.log('プロジェクトモーダルを表示しました');
            } else {
                console.log('プロジェクトモーダルが見つかりません');
            }
        });
        console.log('initPageButtons: プロジェクト追加ボタンのイベントリスナーを設定しました');
    } else {
        console.error('initPageButtons: プロジェクト追加ボタンが見つかりません');
    }
    
    // タスク追加ボタンの初期化
    const addTaskBtn = document.getElementById('addTaskBtn');
    console.log('タスク追加ボタン要素:', addTaskBtn);
    if (addTaskBtn) {
        // 既存のイベントリスナーを削除
        const newAddTaskBtn = addTaskBtn.cloneNode(true);
        addTaskBtn.parentNode.replaceChild(newAddTaskBtn, addTaskBtn);
        
        // 新しいボタンにイベントリスナーを設定
        newAddTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('initPageButtons: タスク追加ボタンがクリックされました');
            const taskModal = document.getElementById('taskModal');
            if (taskModal) {
                taskModal.classList.add('active');
                console.log('タスクモーダルを表示しました');
            } else {
                console.log('タスクモーダルが見つかりません');
            }
        });
        console.log('initPageButtons: タスク追加ボタンのイベントリスナーを設定しました');
    } else {
        console.error('initPageButtons: タスク追加ボタンが見つかりません');
    }
    
    console.log('initPageButtons: 完了');
}

/**
 * ヘッダーの新規プロジェクトボタンの初期化
 */
function initHeaderProjectButton() {
    const headerProjectButton = document.querySelector('.header-right .btn-primary');
    if (headerProjectButton) {
        headerProjectButton.addEventListener('click', function() {
            // プロジェクト作成モーダルを表示
            const projectModal = document.getElementById('projectModal');
            if (projectModal) {
                projectModal.classList.add('active');
            }
        });
    }
}



/**
 * プロジェクト作成ボタンのイベント
 */
function initProjectButton() {
    const projectButton = document.querySelector('.btn-primary');
    if (projectButton) {
        projectButton.addEventListener('click', function() {
            // プロジェクト作成モーダルを表示
            const projectModal = document.getElementById('projectModal');
            if (projectModal) {
                projectModal.classList.add('active');
            }
        });
    }
}

/**
 * 通知の表示
 */
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * 通知タイプに応じたアイコンを取得
 */
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * アニメーション用CSSの追加
 */
function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// スタイルの追加
addNotificationStyles();



/**
 * モーダルの初期化
 */
function initModals() {
    // プロジェクトモーダル
    const projectModal = document.getElementById('projectModal');
    const projectModalClose = document.getElementById('projectModalClose');
    const projectModalCancel = document.getElementById('projectModalCancel');
    
    if (projectModalClose) {
        projectModalClose.addEventListener('click', () => {
            projectModal.classList.remove('active');
        });
    }
    
    if (projectModalCancel) {
        projectModalCancel.addEventListener('click', () => {
            projectModal.classList.remove('active');
        });
    }
    
    // タスクモーダル
    const taskModal = document.getElementById('taskModal');
    const taskModalClose = document.getElementById('taskModalClose');
    const taskModalCancel = document.getElementById('taskModalCancel');
    
    if (taskModalClose) {
        taskModalClose.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
    }
    
    if (taskModalCancel) {
        taskModalCancel.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
    }
    
    // 支出モーダル
    const expenseModal = document.getElementById('expenseModal');
    const expenseModalClose = document.getElementById('expenseModalClose');
    const expenseModalCancel = document.getElementById('expenseModalCancel');
    
    if (expenseModalClose) {
        expenseModalClose.addEventListener('click', () => {
            expenseModal.classList.remove('active');
        });
    }
    
    if (expenseModalCancel) {
        expenseModalCancel.addEventListener('click', () => {
            expenseModal.classList.remove('active');
        });
    }
    
    // モーダル外クリックで閉じる
    [projectModal, taskModal, expenseModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });
}

/**
 * フォームの初期化
 */
function initForms() {
    // プロジェクトフォーム
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
        
        // 日付の初期値を設定
        const startDateInput = document.getElementById('projectStartDate');
        const endDateInput = document.getElementById('projectEndDate');
        
        if (startDateInput) {
            startDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        if (endDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            endDateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
        // 新規作成時にeditIdをクリア
        projectForm.addEventListener('reset', () => {
            delete projectForm.dataset.editId;
            const modalTitle = document.getElementById('projectModalTitle');
            if (modalTitle) {
                modalTitle.textContent = '新規プロジェクト作成';
            }
        });
    }
    
    // タスクフォーム
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
        
        // 日付の初期値を設定
        const dueDateInput = document.getElementById('taskDueDate');
        if (dueDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dueDateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
        // 新規作成時にeditIdをクリア
        taskForm.addEventListener('reset', () => {
            delete taskForm.dataset.editId;
            const modalTitle = document.getElementById('taskModalTitle');
            if (modalTitle) {
                modalTitle.textContent = '新規タスク作成';
            }
        });
    }
    
    // 支出フォーム
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        
        // 日付の初期値を設定
        const expenseDateInput = document.getElementById('expenseDate');
        if (expenseDateInput) {
            expenseDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // 新規作成時にeditIdをクリア
        expenseForm.addEventListener('reset', () => {
            delete expenseForm.dataset.editId;
            const modalTitle = document.getElementById('expenseModalTitle');
            if (modalTitle) {
                modalTitle.textContent = '新規支出記録';
            }
        });
    }
    
    // プロジェクト選択肢を更新
    updateProjectOptions();
}

/**
 * プロジェクト作成・編集の処理
 */
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const projectData = {
        name: formData.get('projectName'),
        description: formData.get('projectDescription'),
        startDate: formData.get('projectStartDate'),
        endDate: formData.get('projectEndDate'),
        budget: Number(formData.get('projectBudget')),
        status: formData.get('projectStatus')
    };
    
    console.log('フォームデータ:', projectData);
    
    // バリデーション
    const validation = new Validation();
    if (!validation.validateProject(projectData)) {
        const errors = validation.getErrors();
        console.log('バリデーションエラー:', errors);
        showNotification(errors[0].message, 'error');
        return;
    }
    
    console.log('バリデーション成功');
    
    const editId = e.target.dataset.editId;
    
    if (editId) {
        // 編集モード
        console.log('プロジェクト編集モード:', editId);
        const projectManager = new ProjectManager();
        const result = projectManager.updateProject(editId, projectData);
        
        if (result.success) {
            console.log('プロジェクト更新成功');
            showNotification('プロジェクトが正常に更新されました', 'success');
        } else {
            console.log('プロジェクト更新失敗:', result.error);
            showNotification(result.error || 'プロジェクトの更新に失敗しました', 'error');
            return;
        }
        
        // 編集IDをクリア
        delete e.target.dataset.editId;
        
        // モーダルのタイトルを戻す
        const modalTitle = document.getElementById('projectModalTitle');
        if (modalTitle) {
            modalTitle.textContent = '新規プロジェクト作成';
        }
    } else {
        // 新規作成モード
        console.log('新規プロジェクト作成モード');
        const projectManager = new ProjectManager();
        console.log('ProjectManagerでプロジェクトを作成中...');
        const result = projectManager.createProject(projectData);
        console.log('プロジェクト作成結果:', result);
        
        if (result.success) {
            console.log('プロジェクト保存成功');
            showNotification('プロジェクトが正常に作成されました', 'success');
        } else {
            console.log('プロジェクト保存失敗:', result.error);
            showNotification(result.error || 'プロジェクトの作成に失敗しました', 'error');
            return;
        }
    }
    
    // モーダルを閉じる
    const projectModal = document.getElementById('projectModal');
    projectModal.classList.remove('active');
    
    // フォームをリセット
    e.target.reset();
    
    // プロジェクト選択肢を更新
    updateProjectOptions();
    
    // 現在のページを更新
    console.log('プロジェクト作成後のページ更新処理開始');
    const activeNavItem = document.querySelector('.nav-item.active');
    let currentPageId = 'dashboard'; // デフォルト
    
    if (activeNavItem) {
        const navLink = activeNavItem.querySelector('.nav-link');
        if (navLink) {
            currentPageId = navLink.getAttribute('href').substring(1);
        }
    }
    
    console.log('現在のページID:', currentPageId);
    console.log('アクティブなナビゲーション項目:', activeNavItem);
    
    // ページに応じて更新処理を実行
    if (currentPageId === 'dashboard') {
        console.log('ダッシュボードを更新');
        updateDashboard();
    } else if (currentPageId === 'projects') {
        console.log('プロジェクトページを更新');
        initProjectsPage();
    } else {
        console.log('その他のページを更新:', currentPageId);
        switchPage(currentPageId);
    }
    
    // ダッシュボードも常に更新（サイドバーに表示されるため）
    console.log('ダッシュボードも更新');
    updateDashboard();
}

/**
 * タスク作成・編集の処理
 */
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        projectId: formData.get('taskProject'),
        name: formData.get('taskName'),
        description: formData.get('taskDescription'),
        priority: formData.get('taskPriority'),
        dueDate: formData.get('taskDueDate'),
        estimatedHours: Number(formData.get('taskEstimatedHours'))
    };
    
    // バリデーション
    const validation = new Validation();
    if (!validation.validateTask(taskData)) {
        const errors = validation.getErrors();
        showNotification(errors[0].message, 'error');
        return;
    }
    
    const editId = e.target.dataset.editId;
    
    if (editId) {
        // 編集モード
        console.log('タスク編集モード:', editId);
        const taskManager = new TaskManager();
        const result = taskManager.updateTask(editId, taskData);
        
        if (result.success) {
            showNotification('タスクが正常に更新されました', 'success');
        } else {
            showNotification(result.error || 'タスクの更新に失敗しました', 'error');
            return;
        }
        
        // 編集IDをクリア
        delete e.target.dataset.editId;
        
        // モーダルのタイトルを戻す
        const modalTitle = document.getElementById('taskModalTitle');
        if (modalTitle) {
            modalTitle.textContent = '新規タスク作成';
        }
    } else {
        // 新規作成モード
        console.log('新規タスク作成モード');
        
        // TaskManagerを使用してタスクを作成
        const taskManager = new TaskManager();
        const result = taskManager.createTask(taskData);
        
        if (result.success) {
            console.log('タスク保存成功');
            showNotification('タスクが正常に作成されました', 'success');
        } else {
            console.log('タスク保存失敗:', result.error);
            showNotification(result.error || 'タスクの作成に失敗しました', 'error');
            return;
        }
    }
    
    // モーダルを閉じる
    const taskModal = document.getElementById('taskModal');
    taskModal.classList.remove('active');
    
    // フォームをリセット
    e.target.reset();
    
    // プロジェクト選択肢を更新
    updateProjectOptions();
    
    // 現在のページを更新
    console.log('タスク作成後のページ更新処理開始');
    const activeNavItem = document.querySelector('.nav-item.active');
    let currentPageId = 'dashboard'; // デフォルト
    
    if (activeNavItem) {
        const navLink = activeNavItem.querySelector('.nav-link');
        if (navLink) {
            currentPageId = navLink.getAttribute('href').substring(1);
        }
    }
    
    console.log('現在のページID:', currentPageId);
    
    if (currentPageId === 'dashboard') {
        console.log('ダッシュボードを更新');
        updateDashboard();
    } else if (currentPageId === 'tasks') {
        console.log('タスクページを更新');
        initTasksPage();
    } else {
        console.log('その他のページを更新:', currentPageId);
        switchPage(currentPageId);
    }
    
    // ダッシュボードも常に更新（サイドバーに表示されるため）
    console.log('ダッシュボードも更新');
    updateDashboard();
}

/**
 * 支出作成・編集の処理
 */
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expenseData = {
        projectId: formData.get('expenseProject'),
        date: formData.get('expenseDate'),
        amount: Number(formData.get('expenseAmount')),
        item: formData.get('expenseItem'),
        memo: formData.get('expenseMemo')
    };
    
    console.log('支出フォームデータ:', expenseData);
    
    const expenseManager = new ExpenseManager();
    const editId = e.target.dataset.editId;
    
    let result;
    if (editId) {
        // 編集
        console.log('支出を編集:', editId);
        result = expenseManager.updateExpense(editId, expenseData);
        if (result.success) {
            console.log('支出更新成功');
            showNotification('支出が正常に更新されました', 'success');
        } else {
            console.log('支出更新失敗:', result.error);
            showNotification(result.error || '支出の更新に失敗しました', 'error');
            return;
        }
        // editIdをクリア
        delete e.target.dataset.editId;
    } else {
        // 新規作成
        console.log('新規支出を作成');
        result = expenseManager.createExpense(expenseData);
        if (result.success) {
            console.log('支出保存成功');
            showNotification('支出が正常に記録されました', 'success');
        } else {
            console.log('支出保存失敗:', result.error);
            showNotification(result.error || '支出の記録に失敗しました', 'error');
            return;
        }
    }
    
    // モーダルを閉じる
    const expenseModal = document.getElementById('expenseModal');
    expenseModal.classList.remove('active');
    
    // フォームをリセット
    e.target.reset();
    
    // プロジェクト選択肢を更新
    updateExpenseProjectOptions();
    
    // 現在のページを更新
    console.log('支出作成後のページ更新処理開始');
    const activeNavItem = document.querySelector('.nav-item.active');
    let currentPageId = 'dashboard'; // デフォルト
    
    if (activeNavItem) {
        const navLink = activeNavItem.querySelector('.nav-link');
        if (navLink) {
            currentPageId = navLink.getAttribute('href').substring(1);
        }
    }
    
    console.log('現在のページID:', currentPageId);
    
    if (currentPageId === 'dashboard') {
        console.log('ダッシュボードを更新');
        updateDashboard();
    } else if (currentPageId === 'expenses') {
        console.log('支出ページを更新');
        initExpensesPage();
    } else {
        console.log('その他のページを更新:', currentPageId);
        switchPage(currentPageId);
    }
    
    // ダッシュボードも常に更新（サイドバーに表示されるため）
    console.log('ダッシュボードも更新');
    updateDashboard();
}

/**
 * タスク完了の切り替え（グローバル関数）
 */
function toggleTaskCompletion(taskId, completed) {
    if (window.taskView && typeof window.taskView.toggleTaskCompletion === 'function') {
        window.taskView.toggleTaskCompletion(taskId, completed);
    } else {
        console.warn('TaskViewが初期化されていません');
    }
}

/**
 * 新規プロジェクト作成ボタンのクリック処理
 */
function openNewProjectModal() {
    // フォームのeditIdをクリア
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        delete projectForm.dataset.editId;
        projectForm.reset();
    }
    
    // モーダルのタイトルを新規作成に設定
    const modalTitle = document.getElementById('projectModalTitle');
    if (modalTitle) {
        modalTitle.textContent = '新規プロジェクト作成';
    }
    
    // モーダルを表示
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.classList.add('active');
    }
}

/**
 * 新規タスク作成ボタンのクリック処理
 */
function openNewTaskModal() {
    // フォームのeditIdをクリア
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        delete taskForm.dataset.editId;
        taskForm.reset();
    }
    
    // モーダルのタイトルを新規作成に設定
    const modalTitle = document.getElementById('taskModalTitle');
    if (modalTitle) {
        modalTitle.textContent = '新規タスク作成';
    }
    
    // モーダルを表示
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.classList.add('active');
    }
}

/**
 * 新規支出記録ボタンのクリック処理
 */
function openNewExpenseModal() {
    // フォームのeditIdをクリア
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        delete expenseForm.dataset.editId;
        expenseForm.reset();
    }
    
    // モーダルのタイトルを新規作成に設定
    const modalTitle = document.getElementById('expenseModalTitle');
    if (modalTitle) {
        modalTitle.textContent = '新規支出記録';
    }
    
    // モーダルを表示
    const expenseModal = document.getElementById('expenseModal');
    if (expenseModal) {
        expenseModal.classList.add('active');
    }
}

/**
 * 支出管理ページの初期化
 */
function initExpensesPage() {
    console.log('initExpensesPage が呼び出されました');
    
    // 既存のExpenseViewインスタンスを破棄
    if (window.expenseView) {
        window.expenseView.destroy();
    }
    
    // 新しいExpenseViewインスタンスを作成
    window.expenseView = new ExpenseView();
    
    // プロジェクト選択肢を更新
    updateExpenseProjectOptions();
}

/**
 * プロジェクト選択肢を更新
 */
function updateProjectOptions() {
    const projectManager = new ProjectManager();
    const projects = projectManager.getProjects();
    const projectSelect = document.getElementById('taskProject');
    
    if (projectSelect) {
        // 既存のオプションをクリア（最初の「プロジェクトを選択」は残す）
        while (projectSelect.children.length > 1) {
            projectSelect.removeChild(projectSelect.lastChild);
        }
        
        // プロジェクトのオプションを追加
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }
}

/**
 * 支出フォーム用のプロジェクト選択肢を更新
 */
function updateExpenseProjectOptions() {
    const projectManager = new ProjectManager();
    const projects = projectManager.getProjects();
    const projectSelect = document.getElementById('expenseProject');
    
    if (projectSelect) {
        // 既存のオプションをクリア（最初の「プロジェクトを選択」は残す）
        while (projectSelect.children.length > 1) {
            projectSelect.removeChild(projectSelect.lastChild);
        }
        
        // プロジェクトのオプションを追加
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }
}

/**
 * ダッシュボードを更新
 */
function updateDashboard() {
    console.log('updateDashboard が呼び出されました');
    
    // 既存のDashboardViewインスタンスを破棄
    if (window.dashboardView) {
        window.dashboardView.destroy();
    }
    
    // 新しいDashboardViewインスタンスを作成
    window.dashboardView = new DashboardView();
    
    console.log('ダッシュボードの更新完了');
}

/**
 * 統計を更新
 */
function updateStats(projects, tasks) {
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const totalProgress = projects.length > 0 ? 
        Math.round(projects.reduce((sum, p) => sum + p.calculateProgress(tasks.filter(t => t.projectId === p.id)), 0) / projects.length) : 0;
    
    // 統計カードを更新（IDで直接アクセス）
    const projectCountCard = document.getElementById('project-count');
    const taskCountCard = document.getElementById('task-count');
    const progressCard = document.getElementById('progress-percentage');
    const budgetCard = document.getElementById('budget-usage');
    
    if (projectCountCard) projectCountCard.textContent = inProgressProjects;
    if (taskCountCard) taskCountCard.textContent = pendingTasks;
    if (progressCard) progressCard.textContent = totalProgress + '%';
    
    // 予算使用率の計算
    if (budgetCard) {
        const storage = new Storage();
        const expenses = storage.getExpenses();
        const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const budgetUsage = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;
        budgetCard.textContent = budgetUsage + '%';
    }
}

/**
 * プロジェクトリストを更新
 */
function updateProjectList(projects, tasks) {
    const projectList = document.querySelector('.project-list');
    if (projectList) {
        projectList.innerHTML = '';
        
        projects.slice(0, 3).forEach(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const progress = project.calculateProgress(projectTasks);
            
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item';
            projectElement.innerHTML = `
                <div class="project-info">
                    <h4>${project.name}</h4>
                    <p>${project.description || '説明なし'}</p>
                </div>
                <div class="project-status">
                    <span class="status-badge status-${project.getStatusColor()}">
                        ${project.getStatusText()}
                    </span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
            
            projectList.appendChild(projectElement);
        });
    }
}

/**
 * タスクリストを更新
 */
function updateTaskList(tasks) {
    const taskList = document.querySelector('.task-list');
    if (taskList) {
        taskList.innerHTML = '';
        
        const sortedTasks = tasks
            .filter(t => t.status !== 'completed')
            .sort((a, b) => {
                // 優先度順、期限順でソート
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                
                if (priorityDiff !== 0) return priorityDiff;
                
                return new Date(a.dueDate) - new Date(b.dueDate);
            })
            .slice(0, 3);
        
        sortedTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item priority-${task.priority}`;
            taskElement.innerHTML = `
                <div class="task-checkbox">
                    <input type="checkbox" id="task_${task.id}">
                    <label for="task_${task.id}"></label>
                </div>
                <div class="task-content">
                    <h4>${task.name}</h4>
                    <p>${task.description || '説明なし'}</p>
                </div>
                <div class="task-meta">
                    <span class="due-date">${task.getDueDateText()}</span>
                    <span class="priority-badge priority-${task.priority}">
                        ${task.getPriorityText()}
                    </span>
                </div>
            `;
            
            taskList.appendChild(taskElement);
        });
        
        // チェックボックスのイベントを再設定
        initCheckboxes();
    }
}

/**
 * プロジェクトページの初期化
 */
function initProjectsPage() {
    console.log('initProjectsPage が呼び出されました');
    
    // 既存のProjectViewインスタンスを破棄
    if (window.projectView) {
        console.log('既存のProjectViewを破棄');
        window.projectView.destroy();
    }
    
    // 新しいProjectViewインスタンスを作成
    console.log('新しいProjectViewを作成');
    window.projectView = new ProjectView();
    
    console.log('プロジェクトページの初期化完了');
}

/**
 * タスクページの初期化
 */
function initTasksPage() {
    console.log('initTasksPage が呼び出されました');
    
    // 既存のTaskViewインスタンスを破棄
    if (window.taskView) {
        window.taskView.destroy();
    }
    
    // 新しいTaskViewインスタンスを作成
    window.taskView = new TaskView();
    
    console.log('タスクページの初期化完了');
}

/**
 * ガントチャートページの初期化
 */
function initGanttPage() {
    console.log('initGanttPage が呼び出されました');
    if (window.ganttView) {
        console.log('既存のGanttViewを破棄');
        window.ganttView.destroy();
    }
    console.log('新しいGanttViewを作成');
    window.ganttView = new GanttView();
    console.log('ガントチャートページの初期化完了');
}

/**
 * レポートページの初期化
 */
function initReportsPage() {
    console.log('initReportsPage が呼び出されました');
    
    const storage = new Storage();
    const projects = storage.getProjects();
    const tasks = storage.getTasks();
    const expenses = storage.getExpenses();
    
    console.log('レポート画面用のデータ取得完了:', { 
        projects: projects.length, 
        tasks: tasks.length, 
        expenses: expenses.length 
    });
    
    // レポートの描画
    renderReports(projects, tasks);
    
    // コントロールボタンのイベント
    initReportControls();
    
    console.log('レポートページの初期化完了');
}

/**
 * 設定ページの初期化
 */
function initSettingsPage() {
    const storage = new Storage();
    const settings = storage.getSettings();
    
    // 設定値の復元
    restoreSettings(settings);
    
    // 設定変更のイベント
    initSettingsEvents();
    
    // データ管理ボタンのイベントはDataManagerクラスが処理します
}

/**
 * プロジェクトテーブルの更新
 */
function updateProjectsTable(projects) {
    console.log('updateProjectsTable 開始, プロジェクト数:', projects.length);
    
    const storage = new Storage();
    const tasks = storage.getTasks();
    const tbody = document.getElementById('projectsTableBody');
    
    console.log('tbody要素:', tbody);
    
    if (!tbody) {
        console.error('projectsTableBody が見つかりません');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (projects.length === 0) {
        console.log('プロジェクトが0件のため空状態を表示');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成してください</p>
                </td>
            </tr>
        `;
        return;
    }
    
    projects.forEach(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const progress = project.calculateProgress(projectTasks);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${project.name}</strong></td>
            <td>${project.description || '説明なし'}</td>
            <td>${project.startDate}</td>
            <td>${project.endDate}</td>
            <td>¥${project.budget.toLocaleString()}</td>
            <td><span class="status-badge status-${project.getStatusColor()}">${project.getStatusText()}</span></td>
            <td>
                <div class="progress-bar" style="width: 100px;">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-error btn-sm" onclick="deleteProject('${project.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('updateProjectsTable 完了, 表示されたプロジェクト数:', projects.length);
}

/**
 * タスクテーブルの更新
 */
function updateTasksTable(tasks, projects) {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>タスクがありません</h3>
                    <p>新規タスクを作成してください</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tasks.forEach(task => {
        const project = projects.find(p => p.id === task.projectId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" onchange="toggleTaskCompletion('${task.id}', this.checked)">
            </td>
            <td><strong>${task.name}</strong></td>
            <td>${project ? project.name : '不明'}</td>
            <td>${task.description || '説明なし'}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.getPriorityText()}</span></td>
            <td>${task.dueDate}</td>
            <td>${task.estimatedHours}h</td>
            <td><span class="status-badge status-${task.getStatusColor()}">${task.getStatusText()}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-error btn-sm" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * プロジェクトフィルターの初期化
 */
function initProjectFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProjects);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', filterProjects);
    }
}

/**
 * タスクフィルターの初期化
 */
function initTaskFilters(projects) {
    const projectFilter = document.getElementById('projectFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('taskStatusFilter');
    
    // プロジェクト選択肢の更新
    if (projectFilter) {
        projectFilter.innerHTML = '<option value="">すべて</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectFilter.appendChild(option);
        });
    }
    
    // フィルターイベントの設定
    [projectFilter, priorityFilter, statusFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterTasks);
        }
    });
}

/**
 * プロジェクトのフィルタリング
 */
function filterProjects() {
    const storage = new Storage();
    const projects = storage.getProjects();
    
    // フィルター条件の取得
    const statusFilter = document.getElementById('statusFilter')?.value;
    const sortBy = document.getElementById('sortBy')?.value;
    
    let filteredProjects = [...projects];
    
    // ステータスフィルター
    if (statusFilter) {
        filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
    }
    
    // ソート
    switch (sortBy) {
        case 'deadline':
            filteredProjects.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
        case 'name':
            filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    updateProjectsTable(filteredProjects);
}

/**
 * タスクのフィルタリング
 */
function filterTasks() {
    const storage = new Storage();
    const tasks = storage.getTasks();
    const projects = storage.getProjects();
    
    // フィルター条件の取得
    const projectFilter = document.getElementById('projectFilter')?.value;
    const priorityFilter = document.getElementById('priorityFilter')?.value;
    const statusFilter = document.getElementById('taskStatusFilter')?.value;
    
    let filteredTasks = [...tasks];
    
    // プロジェクトフィルター
    if (projectFilter) {
        filteredTasks = filteredTasks.filter(t => t.projectId === projectFilter);
    }
    
    // 優先度フィルター
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
    }
    
    // ステータスフィルター
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
    }
    
    updateTasksTable(filteredTasks, projects);
}

// ガントチャートの描画はGanttViewクラスで処理

/**
 * ガントチャートコントロールの初期化
 */
function initGanttControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const todayBtn = document.getElementById('todayBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => console.log('拡大'));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => console.log('縮小'));
    if (todayBtn) todayBtn.addEventListener('click', () => console.log('今日'));
}

/**
 * レポートの描画
 */
function renderReports(projects, tasks) {
    console.log('renderReports 開始:', { projects: projects.length, tasks: tasks.length });
    
    // 支出データも取得
    const storage = new Storage();
    const expenses = storage.getExpenses();
    console.log('支出データ取得:', expenses.length);
    
    // 期限管理の統計を更新
    updateDeadlineStats(tasks);
    
    // レポート画面のチャート要素を取得（ダッシュボードとは異なるID）
    const reportProgressChart = document.getElementById('reportProgressChart');
    const reportHoursChart = document.getElementById('reportHoursChart');
    const reportBudgetChart = document.getElementById('reportBudgetChart');
    
    console.log('レポートチャート要素:', { 
        progress: reportProgressChart, 
        hours: reportHoursChart, 
        budget: reportBudgetChart 
    });
    
    // 進捗チャート
    if (reportProgressChart) {
        if (projects.length === 0) {
            reportProgressChart.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成してレポートを表示してください</p>
                </div>
            `;
        } else {
            // プロジェクト進捗のサマリーテキストを表示
            const completedProjects = projects.filter(p => p.status === 'completed').length;
            const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
            const plannedProjects = projects.filter(p => p.status === 'planned').length;
            
            reportProgressChart.innerHTML = `
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="summary-number">${completedProjects}</span>
                        <span class="summary-label">完了</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${inProgressProjects}</span>
                        <span class="summary-label">進行中</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${plannedProjects}</span>
                        <span class="summary-label">計画中</span>
                    </div>
                </div>
            `;
        }
    }
    
    // 工数分析チャート
    if (reportHoursChart) {
        if (tasks.length === 0) {
            reportHoursChart.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>タスクがありません</h3>
                    <p>新規タスクを作成して工数分析を表示してください</p>
                </div>
            `;
        } else {
            const totalEstimatedHours = tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const totalTasks = tasks.length;
            
            reportHoursChart.innerHTML = `
                <div class="hours-summary">
                    <div class="hours-item">
                        <span class="hours-number">${totalEstimatedHours}h</span>
                        <span class="hours-label">総予想工数</span>
                    </div>
                    <div class="hours-item">
                        <span class="hours-number">${completedTasks}/${totalTasks}</span>
                        <span class="hours-label">完了タスク</span>
                    </div>
                </div>
            `;
        }
    }
    
    // 予算管理チャート
    if (reportBudgetChart) {
        if (projects.length === 0) {
            reportBudgetChart.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-yen-sign"></i>
                    <h3>プロジェクトがありません</h3>
                    <p>新規プロジェクトを作成して予算分析を表示してください</p>
                </div>
            `;
        } else {
            const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
            const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const budgetUsage = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;
            
            reportBudgetChart.innerHTML = `
                <div class="budget-summary">
                    <div class="budget-item">
                        <span class="budget-number">¥${totalBudget.toLocaleString()}</span>
                        <span class="budget-label">総予算</span>
                    </div>
                    <div class="budget-item">
                        <span class="budget-number">¥${totalExpense.toLocaleString()}</span>
                        <span class="budget-label">総支出</span>
                    </div>
                    <div class="budget-item">
                        <span class="budget-number">${budgetUsage}%</span>
                        <span class="budget-label">使用率</span>
                    </div>
                </div>
            `;
        }
    }
    
    console.log('renderReports 完了');
}

/**
 * 期限管理統計の更新
 */
function updateDeadlineStats(tasks) {
    const overdueCount = document.getElementById('overdueCount');
    const dueSoonCount = document.getElementById('dueSoonCount');
    const onTrackCount = document.getElementById('onTrackCount');
    
    if (!overdueCount || !dueSoonCount || !onTrackCount) return;
    
    // タスクオブジェクトをTaskクラスのインスタンスに変換
    const taskInstances = tasks.map(taskData => new Task(taskData));
    
    const overdue = taskInstances.filter(t => t.isOverdue()).length;
    const dueSoon = taskInstances.filter(t => t.isDueSoon()).length;
    const onTrack = taskInstances.filter(t => !t.isOverdue() && !t.isDueSoon() && t.status !== 'completed').length;
    
    overdueCount.textContent = overdue;
    dueSoonCount.textContent = dueSoon;
    onTrackCount.textContent = onTrack;
}

/**
 * レポートコントロールの初期化
 */
function initReportControls() {
    const exportBtn = document.getElementById('exportReportBtn');
    const printBtn = document.getElementById('printReportBtn');
    
    if (exportBtn) exportBtn.addEventListener('click', () => console.log('レポートエクスポート'));
    if (printBtn) printBtn.addEventListener('click', () => window.print());
}

/**
 * 設定の復元
 */
function restoreSettings(settings) {
    const language = document.getElementById('language');
    const currency = document.getElementById('currency');
    const timezone = document.getElementById('timezone');
    
    if (language && settings.language) language.value = settings.language;
    if (currency && settings.currency) currency.value = settings.currency;
    if (timezone && settings.timezone) timezone.value = settings.timezone;
}

/**
 * 設定イベントの初期化
 */
function initSettingsEvents() {
    const language = document.getElementById('language');
    const currency = document.getElementById('currency');
    const timezone = document.getElementById('timezone');
    
    [language, currency, timezone].forEach(select => {
        if (select) {
            select.addEventListener('change', saveSettings);
        }
    });
}

/**
 * 設定の保存
 */
function saveSettings() {
    const storage = new Storage();
    const settings = {
        language: document.getElementById('language')?.value,
        currency: document.getElementById('currency')?.value,
        timezone: document.getElementById('timezone')?.value
    };
    
    storage.saveSettings(settings);
    showNotification('設定が保存されました', 'success');
}

/**
 * 支出の編集
 */
function editExpense(expenseId) {
    const expenseManager = new ExpenseManager();
    const expense = expenseManager.getExpense(expenseId);
    
    if (!expense) {
        showNotification('支出が見つかりません', 'error');
        return;
    }
    
    // フォームにデータを設定
    document.getElementById('expenseItem').value = expense.item;
    document.getElementById('expenseProject').value = expense.projectId;
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseMemo').value = expense.memo || '';
    
    // 編集IDを設定
    const expenseForm = document.getElementById('expenseForm');
    expenseForm.dataset.editId = expenseId;
    
    // モーダルのタイトルを編集に設定
    const modalTitle = document.getElementById('expenseModalTitle');
    modalTitle.textContent = '支出編集';
    
    // モーダルを表示
    const expenseModal = document.getElementById('expenseModal');
    expenseModal.classList.add('active');
}

/**
 * 支出の削除
 */
function deleteExpense(expenseId) {
    if (!confirm('この支出を削除しますか？')) {
        return;
    }
    
    const expenseManager = new ExpenseManager();
    const result = expenseManager.deleteExpense(expenseId);
    
    if (result.success) {
        showNotification('支出が削除されました', 'success');
        
        // 現在のページを更新
        const currentSection = document.querySelector('.page-section.active, .dashboard-section.active');
        if (currentSection) {
            const pageId = currentSection.id;
            switchPage(pageId);
        }
    } else {
        showNotification(result.error || '支出の削除に失敗しました', 'error');
    }
}

/**
 * データ管理イベントの初期化
 * 注意: この関数は非推奨です。DataManagerクラスが代わりに処理します。
 * 重複を避けるため、この関数は何もしません。
 */
function initDataManagementEvents() {
    // この関数は非推奨です。DataManagerクラスが代わりに処理します。
    // 重複を避けるため、何もしません。
    console.log('initDataManagementEvents: この関数は非推奨です。DataManagerクラスが代わりに処理します。');
}

/**
 * プロジェクトの編集
 */
function editProject(projectId) {
    const projectManager = new ProjectManager();
    const project = projectManager.getProject(projectId);
    
    if (!project) {
        showNotification('プロジェクトが見つかりません', 'error');
        return;
    }
    
    // モーダルのタイトルを変更
    const modalTitle = document.getElementById('projectModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'プロジェクト編集';
    }
    
    // フォームに値を設定
    const form = document.getElementById('projectForm');
    if (form) {
        form.querySelector('#projectName').value = project.name;
        form.querySelector('#projectDescription').value = project.description || '';
        form.querySelector('#projectStartDate').value = project.startDate;
        form.querySelector('#projectEndDate').value = project.endDate;
        form.querySelector('#projectBudget').value = project.budget;
        form.querySelector('#projectStatus').value = project.status;
        
        // フォームにプロジェクトIDを追加
        form.dataset.editId = projectId;
    }
    
    // モーダルを表示
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.classList.add('active');
    }
}

/**
 * プロジェクトの削除
 */
function deleteProject(projectId) {
    if (!confirm('このプロジェクトを削除しますか？関連するタスクも削除されます。')) {
        return;
    }
    
    const projectManager = new ProjectManager();
    const result = projectManager.deleteProject(projectId);
    
    if (result.success) {
        showNotification('プロジェクトが削除されました', 'success');
        
        // 現在のページを更新
        const currentSection = document.querySelector('.page-section.active, .dashboard-section.active');
        if (currentSection) {
            const pageId = currentSection.id;
            switchPage(pageId);
        }
    } else {
        showNotification(result.error || 'プロジェクトの削除に失敗しました', 'error');
    }
}

/**
 * タスクの編集
 */
function editTask(taskId) {
    const taskManager = new TaskManager();
    const task = taskManager.getTask(taskId);
    
    if (!task) {
        showNotification('タスクが見つかりません', 'error');
        return;
    }
    
    // モーダルのタイトルを変更
    const modalTitle = document.getElementById('taskModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'タスク編集';
    }
    
    // フォームに値を設定
    const form = document.getElementById('taskForm');
    if (form) {
        form.querySelector('#taskName').value = task.name;
        form.querySelector('#taskDescription').value = task.description || '';
        form.querySelector('#taskProject').value = task.projectId;
        form.querySelector('#taskPriority').value = task.priority;
        form.querySelector('#taskDueDate').value = task.dueDate;
        form.querySelector('#taskEstimatedHours').value = task.estimatedHours;
        
        // フォームにタスクIDを追加
        form.dataset.editId = taskId;
    }
    
    // モーダルを表示
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.classList.add('active');
    }
}

/**
 * タスクの削除
 */
function deleteTask(taskId) {
    if (!confirm('このタスクを削除しますか？')) {
        return;
    }
    
    const taskManager = new TaskManager();
    const result = taskManager.deleteTask(taskId);
    
    if (result.success) {
        showNotification('タスクが削除されました', 'success');
        
        // 現在のページを更新
        const currentSection = document.querySelector('.page-section.active, .dashboard-section.active');
        if (currentSection) {
            const pageId = currentSection.id;
            switchPage(pageId);
        }
    } else {
        showNotification(result.error || 'タスクの削除に失敗しました', 'error');
    }
}

/**
 * データ管理の初期化
 */
function initDataManager() {
    try {
        window.dataManager = new DataManager();
        console.log('データ管理が初期化されました');
    } catch (error) {
        console.error('データ管理の初期化エラー:', error);
    }
}

/**
 * 分析ページの初期化
 */
function initAnalyticsPage() {
    try {
        if (window.analyticsView) {
            window.analyticsView.destroy();
        }
        window.analyticsView = new AnalyticsView();
        console.log('分析ページが初期化されました');
    } catch (error) {
        console.error('分析ページの初期化エラー:', error);
    }
}

/**
 * タイムトラッキングの初期化
 */
function initTimeTracking() {
    try {
        if (window.timeTrackerView) {
            window.timeTrackerView.destroy();
        }
        window.timeTrackerView = new TimeTrackerView();
        window.timeTrackerView.init();
        console.log('タイムトラッキングが初期化されました');
    } catch (error) {
        console.error('タイムトラッキングの初期化エラー:', error);
    }
}

/**
 * レポート機能の初期化
 */
function initReports() {
    try {
        if (window.reportView) {
            window.reportView.destroy();
        }
        window.reportView = new ReportView();
        console.log('レポート機能が初期化されました');
    } catch (error) {
        console.error('レポート機能の初期化エラー:', error);
    }
}

/**
 * 通知管理の初期化
 */
function initNotifications() {
    try {
        if (window.notificationManager) {
            window.notificationManager.destroy();
        }
        window.notificationManager = new NotificationManager();
        console.log('通知管理が初期化されました');
    } catch (error) {
        console.error('通知管理の初期化エラー:', error);
    }
}

// テスト用のコメント - 自動コミットテスト