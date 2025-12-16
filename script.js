// ===========================================
        // ゲーム設定と定数
        // ===========================================
        
        // ゲームの制限時間（ミリ秒）
        let GAME_DURATION = 30000;

        // 難易度ごとの設定
        // - defaultSize: ターゲットのサイズ
        // - targetLifetime: ターゲットが消えるまでの時間
        // - scoreMultiplier: スコアの倍率
        // - comboBonus: コンボボーナスの倍率
        // - missPenalty: ミスした時のペナルティ
        const difficultySettings = {
            easy: { defaultSize: 'large', targetLifetime: 4000, scoreMultiplier: 0.5, comboBonus: 0.5, missPenalty: 5 },
            normal: { defaultSize: 'medium', targetLifetime: 3000, scoreMultiplier: 1.0, comboBonus: 1.0, missPenalty: 10 },
            hard: { defaultSize: 'small', targetLifetime: 2000, scoreMultiplier: 1.5, comboBonus: 1.5, missPenalty: 15 }
        };

        // ゲームの状態を管理するオブジェクト
        const gameState = {
            score: 0,              // 現在のスコア
            miss: 0,               // ミスの回数
            combo: 0,              // 現在のコンボ数
            currentDifficulty: 'normal',  // 現在の難易度
            currentTarget: null,   // 現在表示されているターゲット
            isGameActive: false,   // ゲームが進行中かどうか
            targetTimer: null,     // ターゲットのタイマー
            gameTimer: null,       // ゲーム全体のタイマー
            gameStartTime: null    // ゲーム開始時刻
        };

        // ターゲットの色のバリエーション
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

        // ===========================================
        // DOM要素の取得
        // ===========================================
        const gameContainer = document.getElementById('gameContainer');
        const scoreDisplay = document.getElementById('scoreValue');
        const missDisplay = document.getElementById('missValue');
        const comboDisplay = document.getElementById('comboValue');
        const gameTimeDisplay = document.getElementById('gameTimeValue');
        const startButton = document.getElementById('startButton');
        const overlayGame = document.getElementById('overlayGame');
        const finalScoreDisplay = document.getElementById('finalScore');
        const difficultySelection = document.getElementById('difficultySelection');
        const timeSelection = document.getElementById('timeSelection');

        // サイズごとの基本スコア
        // 小さいターゲットほど高得点
        const sizeScoreMap = { 'target-small': 3, 'target-medium': 2, 'target-large': 1 };

        // ===========================================
        // ゲームの初期化とリセット
        // ===========================================
        function resetGame() {
            // ゲーム状態をリセット
            gameState.isGameActive = false;
            gameState.score = 0;
            gameState.combo = 0;
            gameState.miss = 0;

            // 表示をリセット
            scoreDisplay.textContent = 0;
            comboDisplay.textContent = 0;
            missDisplay.textContent = 0;
            gameTimeDisplay.textContent = (GAME_DURATION / 1000).toFixed(2);

            // タイマーをクリア
            clearInterval(gameState.gameTimer);
            
            // 現在のターゲットを削除
            if (gameState.currentTarget) { 
                gameState.currentTarget.remove(); 
                gameState.currentTarget = null; 
            }

            // オーバーレイの表示を初期状態に戻す
            overlayTitle.textContent = "Ready to start?";
            overlayMessage.textContent = "Tap targets as fast as you can!";
            startButton.textContent = "Start Game";
            startButton.classList.add("start-button");
            startButton.classList.remove("end-button");

            // 設定選択を表示
            difficultySelection.style.display = "block";
            timeSelection.style.display = "block";
            finalScoreDisplay.style.display = "none";

            // ホームボタンを削除
            let homeBtn = document.getElementById("homeButton");
            if (homeBtn) homeBtn.remove();

            // オーバーレイを表示
            overlayGame.style.display = "flex";
        }

        // ===========================================
        // ゲーム開始
        // ===========================================
        function startGame() {
            gameState.isGameActive = true;
            overlayGame.style.display = 'none';
            gameState.gameStartTime = Date.now();
            startGlobalTimer();  // 全体タイマーを開始
            createTarget();      // 最初のターゲットを作成
        }

        // ===========================================
        // ゲーム全体のタイマー管理
        // ===========================================
        function startGlobalTimer() {
            clearInterval(gameState.gameTimer);
            
            // 10ミリ秒ごとに時間を更新
            gameState.gameTimer = setInterval(() => {
                const elapsed = Date.now() - gameState.gameStartTime;  // 経過時間
                const remaining = GAME_DURATION - elapsed;              // 残り時間
                
                // 時間切れの場合
                if (remaining <= 0) { 
                    clearInterval(gameState.gameTimer); 
                    gameTimeDisplay.textContent = '0.00'; 
                    endGame(); 
                    return; 
                }
                
                // 残り時間を表示（小数点2桁）
                gameTimeDisplay.textContent = (remaining / 1000).toFixed(2);
            }, 10);
        }

        // ===========================================
        // ゲーム終了
        // ===========================================
        function endGame() {
            gameState.isGameActive = false;
            stopTargetTimer();  // ターゲットタイマーを停止
            
            // 残っているターゲットを削除
            if (gameState.currentTarget) { 
                gameState.currentTarget.remove(); 
                gameState.currentTarget = null; 
            }

            // ゲームオーバー画面を表示
            overlayTitle.textContent = 'Game Over!';
            overlayMessage.textContent = `Time is up! You hit ${gameState.score} targets. Missed: ${gameState.miss}.`;
            finalScoreDisplay.textContent = `Final Score: ${gameState.score}`;
            finalScoreDisplay.style.display = 'block';
            startButton.textContent = 'Play Again';
            startButton.classList.remove('start-button'); 
            startButton.classList.add('end-button');

            // 設定選択を非表示
            difficultySelection.style.display = 'none';
            timeSelection.style.display = 'none';

            showHomeButton();  // ホームボタンを表示
            overlayGame.style.display = 'flex';
        }

        // ===========================================
        // ホームボタンの表示
        // ===========================================
        function showHomeButton() {
            let homeBtn = document.getElementById("homeButton");
            if (!homeBtn) {
                homeBtn = document.createElement("button");
                homeBtn.id = "homeButton";
                homeBtn.textContent = "🏠 Home";
                homeBtn.className = "end-button";
                document.querySelector('.overlay-content').appendChild(homeBtn);
            }
            homeBtn.onclick = () => { resetGame(); };
        }

        // ===========================================
        // ターゲットのサイズ取得
        // ===========================================
        function getRandomSize() {
            // 現在の難易度に応じたサイズを返す
            return difficultySettings[gameState.currentDifficulty].defaultSize;
        }

        // サイズクラスからピクセル値を取得
        function getSizeInPixels(sizeClass) {
            // スマホ用のサイズマップ
            const sizeMap = { 'target-small': 55, 'target-medium': 75, 'target-large': 95 };
            
            // PC画面の場合は小さいサイズを使用
            if (window.innerWidth > 768) {
                return { 'target-small': 40, 'target-medium': 60, 'target-large': 80 }[sizeClass];
            }
            return sizeMap[sizeClass];
        }

        // ===========================================
        // ターゲットの作成
        // ===========================================
        function createTarget() {
            if (!gameState.isGameActive) return;
            
            // 既存のターゲットを削除
            if (gameState.currentTarget) gameState.currentTarget.remove();

            // 新しいターゲット要素を作成
            const target = document.createElement('div');
            target.className = 'target';
            
            // ランダムな色を選択
            const color = colors[Math.floor(Math.random() * colors.length)];
            target.classList.add(`target-${color}`);

            // サイズを設定
            const sizeClass = getRandomSize();
            const sizePixels = getSizeInPixels(`target-${sizeClass}`);
            target.classList.add(`target-${sizeClass}`);
            target.dataset.sizeClass = `target-${sizeClass}`;

            // ランダムな位置に配置（画面外に出ないように調整）
            const containerRect = gameContainer.getBoundingClientRect();
            const margin = 20;
            target.style.left = Math.random() * (containerRect.width - sizePixels - margin * 2) + margin + 'px';
            target.style.top = Math.random() * (containerRect.height - sizePixels - margin * 2) + margin + 'px';

            // タッチイベントを設定（スマホ用）
            target.addEventListener('touchend', (e) => { 
                e.preventDefault();
                e.stopPropagation();
                handleTargetClick(e); 
            }, { passive: false });
            
            // クリックイベントを設定（PC用）
            target.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTargetClick(e);
            });

            // ターゲットをゲームエリアに追加
            gameContainer.appendChild(target);
            gameState.currentTarget = target;

            // ターゲットのタイマーを開始
            startTargetTimer();
        }

        // ===========================================
        // ゲームエリアのクリック/タッチイベント（空振り検知）
        // ===========================================
        
        // タッチイベント（スマホ用）
        gameContainer.addEventListener('touchend', (e) => { 
            if (e.target === gameContainer) {
                e.preventDefault();
                e.stopPropagation();
                handleGameAreaClick(e); 
            }
        }, { passive: false });

        // クリックイベント（PC用）
        gameContainer.addEventListener('click', (e) => {
            if (e.target === gameContainer) {
                handleGameAreaClick(e);
            }
        });

        // ===========================================
        // ターゲットをクリック/タップした時の処理
        // ===========================================
        function handleTargetClick(e) {
            if (!gameState.isGameActive) return;

            // ターゲットのサイズから基本スコアを取得
            const sizeClass = e.currentTarget.dataset.sizeClass;
            const baseScore = sizeScoreMap[sizeClass] || 1;
            
            // 難易度による倍率を適用
            const multiplier = difficultySettings[gameState.currentDifficulty].scoreMultiplier;
            
            // コンボボーナスを計算
            const comboBonus = gameState.combo > 0 ? gameState.combo * difficultySettings[gameState.currentDifficulty].comboBonus : 0;
            
            // 最終的な獲得ポイント
            const points = Math.round(baseScore * multiplier) + Math.round(comboBonus);

            // スコアとコンボを更新
            gameState.score += points;
            scoreDisplay.textContent = gameState.score;
            gameState.combo++;
            comboDisplay.textContent = gameState.combo;

            // クリック位置を取得（タッチとクリックの両方に対応）
            const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            
            // フィードバックメッセージを表示
            const text = gameState.combo > 1 ? `COMBO x${gameState.combo} (+${points})` : `+${points}`;
            showFeedback(clientX, clientY, text, gameState.combo > 1 ? 'combo-bonus' : 'success');

            // 次のターゲットを作成
            createTarget();
        }

        // ===========================================
        // ゲームエリアを空振りした時の処理
        // ===========================================
        function handleGameAreaClick(e) {
            if (!gameState.isGameActive) return;
            if (e.target.classList.contains('target')) return;
            if (e.target.closest('.overlay')) return;

            // ペナルティを適用
            const penalty = difficultySettings[gameState.currentDifficulty].missPenalty;
            gameState.score = Math.max(0, gameState.score - penalty);
            scoreDisplay.textContent = gameState.score;
            
            // ミスカウントを増加
            gameState.miss++;
            missDisplay.textContent = gameState.miss;
            
            // コンボをリセット
            gameState.combo = 0;
            comboDisplay.textContent = gameState.combo;
            
            // クリック位置を取得（タッチとクリックの両方に対応）
            const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            
            // ミスのフィードバックを表示
            showFeedback(clientX, clientY, `MISS (-${penalty})`, 'miss');

            // 次のターゲットを作成
            createTarget();
        }

        // ===========================================
        // フィードバック表示（+10、MISSなどのテキスト）
        // ===========================================
        function showFeedback(x, y, text, type) {
            const feedback = document.createElement('div');
            feedback.className = `feedback ${type}`;
            feedback.textContent = text;
            feedback.style.left = x + 'px';
            feedback.style.top = y + 'px';
            feedback.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(feedback);
            
            // 0.6秒後に自動的に削除
            setTimeout(() => feedback.remove(), 600);
        }

        // ===========================================
        // 難易度選択ボタンのクリック処理
        // ===========================================
        function handleDifficultyClick(e) {
            const diff = e.currentTarget.dataset.difficulty;
            if (!diff) return;
            
            // 全ボタンの選択状態を解除
            document.querySelectorAll('#difficultySelection button').forEach(b => b.classList.remove('selected'));
            
            // クリックされたボタンを選択状態に
            e.currentTarget.classList.add('selected');
            
            // ゲーム状態を更新
            gameState.currentDifficulty = diff;
        }

        // ===========================================
        // 時間選択ボタンのクリック処理
        // ===========================================
        function handleTimeClick(e) {
            const newTime = parseInt(e.currentTarget.dataset.time, 10);
            
            // 全ボタンの選択状態を解除
            document.querySelectorAll('#timeSelection button').forEach(b => b.classList.remove('selected'));
            
            // クリックされたボタンを選択状態に
            e.currentTarget.classList.add('selected');
            
            // ゲーム時間を更新
            GAME_DURATION = newTime * 1000;
            gameTimeDisplay.textContent = (GAME_DURATION / 1000).toFixed(2);
        }

        // ===========================================
        // ターゲットのタイマー管理
        // ===========================================
        function startTargetTimer() {
            stopTargetTimer();  // 既存のタイマーを停止
            
            const target = gameState.currentTarget;
            if (!target) return;

            // 難易度からターゲットの寿命を取得
            const lifetime = difficultySettings[gameState.currentDifficulty].targetLifetime;
            const penalty = difficultySettings[gameState.currentDifficulty].missPenalty;

            // 残り時間が半分になったら警告を表示
            const warningTimeout = setTimeout(() => { 
                if (target) target.classList.add('warning'); 
            }, lifetime / 2);

            // タイムアウト時の処理
            gameState.targetTimer = setTimeout(() => {
                if (target && gameState.isGameActive) {
                    // ペナルティを適用
                    gameState.score = Math.max(0, gameState.score - penalty);
                    scoreDisplay.textContent = gameState.score;
                    
                    // コンボをリセット
                    gameState.combo = 0;
                    comboDisplay.textContent = gameState.combo;
                    
                    // ミスカウントを増加
                    gameState.miss++;
                    missDisplay.textContent = gameState.miss;
                    
                    // ターゲットを灰色にする
                    target.classList.add('timed-out');
                    
                    // 警告メッセージを表示
                    showTimerWarning(`TIME UP! (-${penalty})`);
                    
                    // 次のターゲットを作成
                    createTarget();
                }
            }, lifetime);

            // 警告タイマーの参照を保存
            gameState.targetTimer.warningTimeout = warningTimeout;
        }

        // ===========================================
        // ターゲットのタイマーを停止
        // ===========================================
        function stopTargetTimer() {
            if (gameState.targetTimer) {
                clearTimeout(gameState.targetTimer);
                if (gameState.targetTimer.warningTimeout) clearTimeout(gameState.targetTimer.warningTimeout);
                gameState.targetTimer = null;
            }
        }

        // ===========================================
        // タイマー警告メッセージの表示
        // ===========================================
        function showTimerWarning(message) {
            const warning = document.createElement('div');
            warning.className = 'timer-warning';
            warning.textContent = message;
            gameContainer.appendChild(warning);
            
            // 0.5秒後に自動的に削除
            setTimeout(() => warning.remove(), 500);
        }

        // ===========================================
        // イベントリスナーの設定
        // ===========================================
        
        // スタートボタンのクリック処理
        startButton.addEventListener('click', () => {
            if (!gameState.isGameActive) {
                if (startButton.textContent === 'Start Game') {
                    startGame();
                } else if (startButton.textContent === 'Play Again') { 
                    resetGame(); 
                    startGame(); 
                }
            }
        });

        // 難易度選択ボタンにイベントリスナーを追加
        document.querySelectorAll('#difficultySelection button').forEach(btn => 
            btn.addEventListener('click', handleDifficultyClick));
        
        // 時間選択ボタンにイベントリスナーを追加
        document.querySelectorAll('#timeSelection button').forEach(btn => 
            btn.addEventListener('click', handleTimeClick));

        // ===========================================
        // ゲームの初期化
        // ===========================================
        resetGame();