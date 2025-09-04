/**
 * チャートヘルパークラス
 */
class ChartHelper {
    constructor() {
        this.charts = new Map();
        this.defaultColors = [
            '#007bff', '#28a745', '#ffc107', '#dc3545',
            '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
        ];
    }

    /**
     * 棒グラフを作成
     */
    createBarChart(canvas, data, options = {}) {
        if (!canvas) {
            console.warn('Canvas要素が見つかりません');
            return null;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js が読み込まれていません。CDNリンクを確認してください。');
            return null;
        }

        // 既存のチャートを破棄
        this.destroyChart(canvas);

        const defaultOptions = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                ...options
            }
        };

        const chart = new Chart(canvas, defaultOptions);
        this.charts.set(canvas.id, chart);
        return chart;
    }

    /**
     * 折れ線グラフを作成
     */
    createLineChart(canvas, data, options = {}) {
        if (!canvas) {
            console.warn('Canvas要素が見つかりません');
            return null;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js が読み込まれていません。CDNリンクを確認してください。');
            return null;
        }

        // 既存のチャートを破棄
        this.destroyChart(canvas);

        const defaultOptions = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                },
                ...options
            }
        };

        const chart = new Chart(canvas, defaultOptions);
        this.charts.set(canvas.id, chart);
        return chart;
    }

    /**
     * 円グラフを作成
     */
    createPieChart(canvas, data, options = {}) {
        if (!canvas) {
            console.warn('Canvas要素が見つかりません');
            return null;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js が読み込まれていません。CDNリンクを確認してください。');
            return null;
        }

        // 既存のチャートを破棄
        this.destroyChart(canvas);

        const defaultOptions = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                ...options
            }
        };

        const chart = new Chart(canvas, defaultOptions);
        this.charts.set(canvas.id, chart);
        return chart;
    }

    /**
     * ドーナツグラフを作成
     */
    createDoughnutChart(canvas, data, options = {}) {
        if (!canvas) {
            console.warn('Canvas要素が見つかりません');
            return null;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js が読み込まれていません。CDNリンクを確認してください。');
            return null;
        }

        // 既存のチャートを破棄
        this.destroyChart(canvas);

        const defaultOptions = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                },
                cutout: '60%',
                ...options
            }
        };

        const chart = new Chart(canvas, defaultOptions);
        this.charts.set(canvas.id, chart);
        return chart;
    }

    /**
     * ガントチャートを作成（カスタム実装）
     */
    createGanttChart(canvas, projects, tasks) {
        if (!canvas) return null;

        // Canvas要素のサイズを設定
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ガントチャートの描画パラメータ
        const margin = { top: 40, right: 20, bottom: 20, left: 200 };
        const chartWidth = canvas.width - margin.left - margin.right;
        const chartHeight = canvas.height - margin.top - margin.bottom;

        // 日付範囲を計算
        const today = new Date();
        const startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30日前
        const endDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90日後
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // プロジェクトとタスクを描画
        const allItems = [...projects, ...tasks];
        const rowHeight = chartHeight / allItems.length;

        allItems.forEach((item, index) => {
            const y = margin.top + (index * rowHeight);
            const itemStartDate = new Date(item.startDate || item.createdAt);
            const itemEndDate = new Date(item.endDate || item.dueDate);

            // 項目名を描画
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(item.name, margin.left - 10, y + rowHeight / 2);

            // バーを描画
            const startX = margin.left + ((itemStartDate - startDate) / (1000 * 60 * 60 * 24)) * (chartWidth / totalDays);
            const endX = margin.left + ((itemEndDate - startDate) / (1000 * 60 * 60 * 24)) * (chartWidth / totalDays);
            const barWidth = Math.max(endX - startX, 2);

            // プロジェクトとタスクで色を変える
            ctx.fillStyle = item.projectId ? '#17a2b8' : '#007bff';
            if (item.status === 'completed') {
                ctx.fillStyle = '#28a745';
            } else if (itemEndDate < today) {
                ctx.fillStyle = '#dc3545';
            }

            ctx.fillRect(startX, y + 5, barWidth, rowHeight - 10);

            // 進捗を表示（プロジェクトの場合）
            if (!item.projectId && item.calculateProgress) {
                const progress = item.calculateProgress(tasks.filter(t => t.projectId === item.id));
                const progressWidth = (barWidth * progress) / 100;
                ctx.fillStyle = '#28a745';
                ctx.fillRect(startX, y + 5, progressWidth, rowHeight - 10);
            }
        });

        // 今日の線を描画
        const todayX = margin.left + ((today - startDate) / (1000 * 60 * 60 * 24)) * (chartWidth / totalDays);
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(todayX, margin.top);
        ctx.lineTo(todayX, margin.top + chartHeight);
        ctx.stroke();

        // 月の区切りを描画
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDate() === 1) {
                const x = margin.left + ((currentDate - startDate) / (1000 * 60 * 60 * 24)) * (chartWidth / totalDays);
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, margin.top);
                ctx.lineTo(x, margin.top + chartHeight);
                ctx.stroke();

                // 月名を表示
                ctx.fillStyle = '#666';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`,
                    x,
                    margin.top - 10
                );
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    /**
     * チャートを更新
     */
    updateChart(chartId, newData) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    /**
     * チャートを破棄
     */
    destroyChart(canvas) {
        if (canvas && canvas.id) {
            // 既存のチャートインスタンスを破棄
            if (this.charts.has(canvas.id)) {
                try {
                    this.charts.get(canvas.id).destroy();
                } catch (e) {
                    console.warn('チャートの破棄中にエラーが発生しました:', e);
                }
                this.charts.delete(canvas.id);
            }
            
            // Chart.jsの内部状態もクリア
            if (canvas.chart) {
                try {
                    canvas.chart.destroy();
                } catch (e) {
                    console.warn('Canvasチャートの破棄中にエラーが発生しました:', e);
                }
                delete canvas.chart;
            }
        }
    }

    /**
     * すべてのチャートを破棄
     */
    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * データに色を自動設定
     */
    setDefaultColors(data) {
        if (data.datasets) {
            data.datasets.forEach((dataset, index) => {
                if (!dataset.backgroundColor) {
                    dataset.backgroundColor = this.defaultColors[index % this.defaultColors.length];
                }
                if (!dataset.borderColor) {
                    dataset.borderColor = this.defaultColors[index % this.defaultColors.length];
                }
            });
        }
        return data;
    }

    /**
     * レスポンシブ対応
     */
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    /**
     * チャートからPNG画像を取得
     */
    getChartImage(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            return chart.toBase64Image();
        }
        return null;
    }

    /**
     * チャートの統計情報を取得
     */
    getChartStats(data) {
        const stats = {
            total: 0,
            max: 0,
            min: Infinity,
            average: 0
        };

        if (data.datasets && data.datasets.length > 0) {
            const values = data.datasets[0].data || [];
            stats.total = values.reduce((sum, val) => sum + val, 0);
            stats.max = Math.max(...values);
            stats.min = Math.min(...values);
            stats.average = values.length > 0 ? stats.total / values.length : 0;
        }

        return stats;
    }
}