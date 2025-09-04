/**
 * 暗号化・復号化ヘルパークラス
 */
class CryptoHelper {
    /**
     * データを暗号化する
     * @param {string} data - 暗号化するデータ
     * @param {string} password - パスワード
     * @returns {string} - 暗号化されたデータ（Base64形式）
     */
    static encrypt(data, password) {
        try {
            // パスワードからキーを生成
            const key = CryptoJS.PBKDF2(password, 'project-tool-salt', {
                keySize: 256 / 32,
                iterations: 1000
            });

            // ランダムなIVを生成
            const iv = CryptoJS.lib.WordArray.random(128 / 8);

            // データを暗号化
            const encrypted = CryptoJS.AES.encrypt(data, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // IVと暗号化データを結合してBase64エンコード
            const result = iv.concat(encrypted.ciphertext);
            return result.toString(CryptoJS.enc.Base64);
        } catch (error) {
            console.error('暗号化エラー:', error);
            throw new Error('データの暗号化に失敗しました');
        }
    }

    /**
     * データを復号化する
     * @param {string} encryptedData - 暗号化されたデータ（Base64形式）
     * @param {string} password - パスワード
     * @returns {string} - 復号化されたデータ
     */
    static decrypt(encryptedData, password) {
        try {
            // パスワードからキーを生成
            const key = CryptoJS.PBKDF2(password, 'project-tool-salt', {
                keySize: 256 / 32,
                iterations: 1000
            });

            // Base64デコード
            const rawData = CryptoJS.enc.Base64.parse(encryptedData);

            // IV（16バイト）と暗号化データを分離
            const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
            const ciphertext = CryptoJS.lib.WordArray.create(rawData.words.slice(4));

            // 復号化
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: ciphertext },
                key,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('復号化エラー:', error);
            throw new Error('パスワードが正しくないか、ファイルが破損しています');
        }
    }

    /**
     * ファイルが暗号化されているかチェック
     * @param {string} content - ファイルの内容
     * @returns {boolean} - 暗号化されているかどうか
     */
    static isEncrypted(content) {
        try {
            // Base64デコードを試行
            const decoded = CryptoJS.enc.Base64.parse(content);
            // 最小サイズチェック（IV + 最小暗号化データ）
            return decoded.words.length >= 5;
        } catch {
            return false;
        }
    }

    /**
     * パスワードの強度をチェック
     * @param {string} password - チェックするパスワード
     * @returns {object} - 強度情報
     */
    static checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('8文字以上にしてください');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('小文字を含めてください');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('大文字を含めてください');
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('数字を含めてください');
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('記号を含めることを推奨します');
        }

        let strength = 'weak';
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';

        return {
            score: score,
            strength: strength,
            feedback: feedback
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.CryptoHelper = CryptoHelper;
}
