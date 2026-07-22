(function () {
    if (document.getElementById('rice-blooket-ui')) {
        const existingUI = document.getElementById('rice-blooket-ui');
        existingUI.style.display = existingUI.style.display === 'none' ? 'block' : 'none';
        return;
    }

    // 설정 변수
    let isHackEnabled = true;
    let showCorrectOnly = true;
    let answerDelay = 1000;
    let isProcessing = false;

    // --- 1. 프리미엄 CSS 스타일 정의 ---
    const style = document.createElement('style');
    style.innerHTML = `
        #rice-blooket-ui {
            position: fixed;
            top: 50px;
            left: 50px;
            width: 330px;
            background: rgba(13, 13, 23, 0.95);
            backdrop-filter: blur(12px);
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            z-index: 999999;
            user-select: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #rice-blooket-ui.hidden {
            transform: scale(0.85) translateY(-20px);
            opacity: 0;
            pointer-events: none;
        }
        .rf-header {
            background: linear-gradient(135deg, #6366f1, #a855f7);
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .rf-title {
            font-weight: 800;
            font-size: 14px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: 0.5px;
        }
        .rf-author {
            font-size: 10px;
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 20px;
            font-weight: normal;
        }
        .rf-controls {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .rf-btn-min {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .rf-btn-min:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        .rf-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .rf-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.04);
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rf-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: rgba(255, 255, 255, 0.04);
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rf-label-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }
        .rf-label {
            font-size: 13px;
            font-weight: 600;
            color: #e2e8f0;
        }
        .rf-toggle {
            position: relative;
            width: 44px;
            height: 24px;
            background: #334155;
            border-radius: 12px;
            cursor: pointer;
            transition: 0.3s;
        }
        .rf-toggle.active {
            background: #6366f1;
        }
        .rf-toggle-circle {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            transition: 0.3s;
        }
        .rf-toggle.active .rf-toggle-circle {
            left: 23px;
        }
        .rf-range {
            width: 100%;
            -webkit-appearance: none;
            background: #334155;
            height: 6px;
            border-radius: 3px;
            outline: none;
            margin-top: 4px;
        }
        .rf-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #a855f7;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .rf-range::-webkit-slider-thumb:hover {
            transform: scale(1.25);
        }
        .rf-footer {
            font-size: 10px;
            color: #64748b;
            text-align: center;
            padding-bottom: 12px;
        }
        #rice-blooket-icon {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 46px;
            height: 46px;
            background: #0f0f15;
            border: 2px solid #a855f7;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
            z-index: 999999;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #rice-blooket-icon:hover {
            transform: scale(1.1) rotate(5deg);
        }
        .rice-correct-opt {
            border: 4px solid #10b981 !important;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.6) !important;
            opacity: 1 !important;
            transform: scale(1.02);
            transition: all 0.2s ease;
        }
        .rice-wrong-opt {
            opacity: 0.25 !important;
            filter: grayscale(60%) blur(0.5px);
            transition: all 0.2s ease;
        }
    `;
    document.head.appendChild(style);

    // --- 2. DOM 요소 생성 ---
    const ui = document.createElement('div');
    ui.id = 'rice-blooket-ui';
    ui.innerHTML = `
        <div class="rf-header" id="rf-drag-header">
            <div class="rf-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Rice Blooket Menu
            </div>
            <div class="rf-controls">
                <span class="rf-author">By Rice</span>
                <button class="rf-btn-min" id="rf-minimize-btn" title="최소화">−</button>
            </div>
        </div>
        <div class="rf-body">
            <div class="rf-row">
                <span class="rf-label">오토 앤서 (자동 답변)</span>
                <div class="rf-toggle active" id="rf-auto-toggle">
                    <div class="rf-toggle-circle"></div>
                </div>
            </div>
            <div class="rf-column">
                <div class="rf-label-container">
                    <span class="rf-label">제출 딜레이</span>
                    <span class="rf-label" id="rf-delay-val" style="color: #a855f7;">1000ms</span>
                </div>
                <input type="range" class="rf-range" id="rf-delay-range" min="0" max="5000" step="50" value="${answerDelay}">
            </div>
            <div class="rf-row">
                <span class="rf-label">정답만 표시 (강조)</span>
                <div class="rf-toggle active" id="rf-highlight-toggle">
                    <div class="rf-toggle-circle"></div>
                </div>
            </div>
            <div class="rf-footer">[Insert] 또는 [~] 키로 메뉴 표시/숨김</div>
        </div>
    `;
    document.body.appendChild(ui);

    const miniIcon = document.createElement('div');
    miniIcon.id = 'rice-blooket-icon';
    miniIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
    document.body.appendChild(miniIcon);

    // --- 3. 창 드래그 로직 ---
    const header = document.getElementById('rf-drag-header');
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - ui.offsetLeft;
        offsetY = e.clientY - ui.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        ui.style.left = (e.clientX - offsetX) + 'px';
        ui.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // --- 4. 이벤트 연결 및 UI 토글 ---
    const autoToggle = document.getElementById('rf-auto-toggle');
    const highlightToggle = document.getElementById('rf-highlight-toggle');
    const delayRange = document.getElementById('rf-delay-range');
    const delayVal = document.getElementById('rf-delay-val');
    const minBtn = document.getElementById('rf-minimize-btn');

    autoToggle.addEventListener('click', () => {
        isHackEnabled = !isHackEnabled;
        autoToggle.classList.toggle('active', isHackEnabled);
    });

    highlightToggle.addEventListener('click', () => {
        showCorrectOnly = !showCorrectOnly;
        highlightToggle.classList.toggle('active', showCorrectOnly);
        if (!showCorrectOnly) {
            resetHighlights();
        }
    });

    delayRange.addEventListener('input', (e) => {
        answerDelay = parseInt(e.target.value, 10);
        delayVal.textContent = `${answerDelay}ms`;
    });

    function resetHighlights() {
        const containers = document.querySelectorAll('[class*="answerContainer"]');
        containers.forEach(el => {
            el.classList.remove('rice-correct-opt', 'rice-wrong-opt');
            el.style.opacity = "";
            el.style.border = "";
        });
    }

    const minimizeUI = () => {
        ui.style.display = 'none';
        miniIcon.style.display = 'flex';
    };

    const restoreUI = () => {
        ui.style.display = 'block';
        miniIcon.style.display = 'none';
    };

    minBtn.addEventListener('click', minimizeUI);
    miniIcon.addEventListener('click', restoreUI);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Insert' || e.key === '`') {
            if (ui.style.display === 'none' && miniIcon.style.display === 'none') {
                restoreUI();
            } else {
                ui.style.display = 'none';
                miniIcon.style.display = 'none';
            }
        }
    });

    // --- 5. Blooket 오토 로직 ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const autoAnswer = async () => {
        try {
            const reactRoot = (function react(r = document.querySelector("body>div")) { 
                return Object.values(r)[1]?.children?.[0]?._owner.stateNode ? r : react(r.querySelector(":scope>div"));
            })();

            const owner = Object.values(reactRoot)[1]?.children?.[0]?._owner;
            if (!owner) return;

            const { stateNode: { state: { question, stage, feedback }, props: { client: { question: pquestion } } } } = owner;
            const targetQ = question || pquestion;
            if (!targetQ) return;

            if (showCorrectOnly) {
                const correctIndices = targetQ.answers
                    .map((x, i) => targetQ.correctAnswers.includes(x) ? i : null)
                    .filter(x => x !== null);
                
                const answers = [...document.querySelectorAll(`[class*="answerContainer"]`)];
                answers.forEach((el, idx) => {
                    if (correctIndices.includes(idx)) {
                        el.classList.add('rice-correct-opt');
                        el.classList.remove('rice-wrong-opt');
                    } else {
                        el.classList.add('rice-wrong-opt');
                        el.classList.remove('rice-correct-opt');
                    }
                });
            }

            if (!isHackEnabled || isProcessing) return;

            isProcessing = true;

            if (answerDelay > 0) {
                await sleep(answerDelay);
            }

            if (question && question.qType !== "typing") {
                if (stage !== "feedback" && !feedback) {
                    const correctIdx = targetQ.answers.map((x, i) => targetQ.correctAnswers.includes(x) ? i : null).filter(x => x !== null)[0];
                    const answers = [...document.querySelectorAll(`[class*="answerContainer"]`)];
                    
                    if (answers[correctIdx]) {
                        answers[correctIdx].click();
                    }
                } else {
                    document.querySelector('[class*="feedback"]')?.firstChild?.click();
                }
            } else if (question && question.qType === "typing") {
                const typingWrapper = document.querySelector("[class*='typingAnswerWrapper']");
                if (typingWrapper) {
                    Object.values(typingWrapper)[1]?.children?._owner?.stateNode?.sendAnswer(question.answers[0]);
                }
            }

            const nextQuestion = document.querySelector('[class*="questionContainer"]');
            if (nextQuestion) {
                nextQuestion.click();
            }
        } catch (err) {
        } finally {
            isProcessing = false;
        }
    };

    setInterval(autoAnswer, 200);
})();
