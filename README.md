# プロジェクト管理ツール

個人でのプロジェクト管理を効率化し、進捗と予算を可視化するWebアプリケーションです。

## 機能概要

- **プロジェクト管理**: プロジェクトの作成・編集・削除・一覧表示
- **タスク管理**: タスクの作成・編集・削除・進捗管理
- **進捗管理**: ガントチャート表示・進捗率計算・タイムトラッキング
- **分析・レポート**: ダッシュボード・予算管理・レポート生成

## 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **データ保存**: LocalStorage
- **グラフ表示**: Chart.js
- **レスポンシブ対応**: CSS Grid + Flexbox

## ファイル構成

```
project-management-tool/
├── index.html              # メインHTMLファイル
├── css/                    # スタイルシート
│   ├── main.css           # メインスタイル
│   ├── components.css     # コンポーネントスタイル
│   └── responsive.css     # レスポンシブスタイル
├── js/                    # JavaScriptファイル
│   ├── main.js           # メインロジック
│   ├── models/           # データモデル
│   ├── managers/         # ビジネスロジック
│   ├── views/            # ビュー管理
│   └── utils/            # ユーティリティ
└── assets/               # 静的リソース
    ├── icons/            # アイコンファイル
    └── images/           # 画像ファイル
```

## 開発環境

- **エディタ**: VS Code推奨
- **ライブサーバー**: 開発時のローカルサーバー
- **ブラウザ**: Chrome, Firefox, Safari, Edge

## ライセンス

MIT License
