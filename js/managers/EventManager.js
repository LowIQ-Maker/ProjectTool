/**
 * イベント管理クラス
 */
class EventManager {
    constructor() {
        this.events = new Map();
    }

    /**
     * イベントリスナーを登録
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }

    /**
     * イベントリスナーを削除
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * イベントを発火
     */
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`イベント ${eventName} のコールバック実行中にエラーが発生しました:`, error);
            }
        });
    }

    /**
     * 一度だけ実行されるイベントリスナーを登録
     */
    once(eventName, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }

    /**
     * すべてのイベントリスナーを削除
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }

    /**
     * イベントリスナーの数を取得
     */
    listenerCount(eventName) {
        if (!this.events.has(eventName)) return 0;
        return this.events.get(eventName).length;
    }

    /**
     * 登録されているイベント名の一覧を取得
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
}
