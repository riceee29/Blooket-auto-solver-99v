// ==UserScript==
// @name         Blooket Helper (Rice Premium UI)
// @namespace    https://blooket.com
// @version      2024-05-03
// @description  Sleek & modern animated UI with draggable window, minimize button, and answer highlighter.
// @author       Rice / Incine
// @match        https://*.blooket.com/*
// @icon         https://res.cloudinary.com/blooket/image/upload/v1613003832/Blooks/purpleAstronaut.svg
// @grant        none
// ==/UserScript==

javascript:(function () {
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
        /* 스위치 스타일 */
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
        /* 범위 조절 슬라이더 */
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
        /* 플로팅 최소화 아이콘 버튼 */
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
        /* 정답 시각적 피드백 효과 */
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

    // 최소화용 원형 아이콘 버튼
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

    // 강조 제거 함수
    function resetHighlights() {
        const containers = document.querySelectorAll('[class*="answerContainer"]');
        containers.forEach(el => {
            el.classList.remove('rice-correct-opt', 'rice-wrong-opt');
            el.style.opacity = "";
            el.style.border = "";
        });
    }

    // 최소화/복원 로직
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

    // 단축키 (Insert, 백틱 `)
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

            // 정답만 표시 (하이라이트) 처리
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

            // 오토 앤서 자동 답변 로직
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
})();            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            font-size: 13px;
            color: #00e5ff;
            display: flex;
            align-items: center;
            gap: 8px;
            text-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
        }

        .rf-controls {
            display: flex;
            gap: 6px;
        }

        .rf-btn {
            background: rgba(255, 255, 255, 0.06);
            color: #94a3b8;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 24px;
            height: 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .rf-btn:hover {
            background: #00e5ff;
            color: #0d0d14;
            box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
        }

        .rf-btn-close:hover {
            background: #ff4757 !important;
            color: #fff !important;
            box-shadow: 0 0 12px rgba(255, 71, 87, 0.6) !important;
        }

        .rf-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .rf-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.03);
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: border-color 0.2s ease;
        }

        .rf-row:hover {
            border-color: rgba(0, 229, 255, 0.4);
        }

        .rf-label {
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
        }

        .rf-sublabel {
            font-size: 10px;
            color: #64748b;
            display: block;
            margin-top: 2px;
        }

        .rf-switch {
            position: relative;
            width: 46px;
            height: 24px;
            background: #1a1a28;
            border-radius: 12px;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.12);
            transition: all 0.3s ease;
        }

        .rf-switch.active {
            background: #00e5ff;
            border-color: #00e5ff;
            box-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
        }

        .rf-switch-knob {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .rf-switch.active .rf-switch-knob {
            left: 24px;
            background: #0d0d14;
        }

        .rf-input-num {
            width: 65px;
            background: #141420;
            color: #00e5ff;
            border: 1px solid rgba(0, 229, 255, 0.4);
            border-radius: 6px;
            padding: 5px 8px;
            text-align: center;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            font-size: 13px;
            outline: none;
        }

        .rf-footer {
            font-size: 11px;
            color: #64748b;
            text-align: center;
            padding: 8px 0 4px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        #rf-blooket-fab {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 52px;
            height: 52px;
            background: #0d0d14;
            border: 2px solid #00e5ff;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
            z-index: 99999999;
            transition: transform 0.2s ease;
        }

        #rf-blooket-fab:hover {
            transform: scale(1.1);
        }

        #rf-answer-hint {
            margin-top: 10px;
            padding: 8px;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // --- UI Construct ---
    const ui = document.createElement('div');
    ui.id = 'rf-blooket-ui';
    ui.innerHTML = `
        <div class="rf-header" id="rf-drag-bar">
            <div class="rf-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                RAYFIELD // RICE SOLVER v2.0
            </div>
            <div class="rf-controls">
                <button class="rf-btn" id="rf-min-btn" title="최소화">-</button>
                <button class="rf-btn rf-btn-close" id="rf-close-btn" title="닫기">×</button>
            </div>
        </div>
        <div class="rf-body">
            <div class="rf-row">
                <div>
                    <span class="rf-label">오토 솔버 (Auto Solve)</span>
                    <span class="rf-sublabel">정답 자동 클릭 / 제출</span>
                </div>
                <div class="rf-switch active" id="rf-auto-sw">
                    <div class="rf-switch-knob"></div>
                </div>
            </div>
            <div class="rf-row">
                <div>
                    <span class="rf-label">정답 강조 (Highlight Only)</span>
                    <span class="rf-sublabel">클릭 대신 강렬한 초록 테두리</span>
                </div>
                <div class="rf-switch" id="rf-hl-sw">
                    <div class="rf-switch-knob"></div>
                </div>
            </div>
            <div class="rf-row">
                <div>
                    <span class="rf-label">기본 딜레이 (ms)</span>
                    <span class="rf-sublabel">응답 제출 간격</span>
                </div>
                <input type="number" class="rf-input-num" id="rf-delay-input" value="${config.baseDelay}" min="0" step="50">
            </div>
            <div class="rf-footer">Created by Rice | [Insert] 또는 [~] 키로 UI 토글</div>
        </div>
    `;
    document.body.appendChild(ui);

    const fab = document.createElement('div');
    fab.id = 'rf-blooket-fab';
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
    document.body.appendChild(fab);

    // --- Drag Logic ---
    const dragBar = document.getElementById('rf-drag-bar');
    let isDragging = false, dragX = 0, dragY = 0;

    dragBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragX = e.clientX - ui.offsetLeft;
        dragY = e.clientY - ui.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        ui.style.left = (e.clientX - dragX) + 'px';
        ui.style.top = (e.clientY - dragY) + 'px';
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // --- Handlers ---
    const autoSw = document.getElementById('rf-auto-sw');
    const hlSw = document.getElementById('rf-hl-sw');
    const delayInput = document.getElementById('rf-delay-input');

    autoSw.addEventListener('click', () => {
        config.enabled = !config.enabled;
        autoSw.classList.toggle('active', config.enabled);
    });

    hlSw.addEventListener('click', () => {
        config.highlightOnly = !config.highlightOnly;
        hlSw.classList.toggle('active', config.highlightOnly);
        if (!config.highlightOnly) clearHighlights();
    });

    delayInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        config.baseDelay = isNaN(val) || val < 0 ? 0 : val;
    });

    const minimizeUI = () => { ui.style.display = 'none'; fab.style.display = 'flex'; };
    const restoreUI = () => { ui.style.display = 'block'; fab.style.display = 'none'; };

    document.getElementById('rf-min-btn').addEventListener('click', minimizeUI);
    fab.addEventListener('click', restoreUI);

    document.getElementById('rf-close-btn').addEventListener('click', () => {
        if (config.intervalId) clearInterval(config.intervalId);
        clearHighlights();
        ui.remove();
        fab.remove();
        style.remove();
        delete window.__blooket_solver_v2__;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Insert' || e.key === '`') {
            if (ui.style.display === 'none' && fab.style.display === 'none') restoreUI();
            else { ui.style.display = 'none'; fab.style.display = 'none'; }
        }
    });

    // --- Highlighting Helper ---
    function applyHighlight(element) {
        if (!element) return;
        element.style.outline = '4px solid #10b981';
        element.style.outlineOffset = '-4px';
        element.style.boxShadow = '0 0 25px #10b981, inset 0 0 15px rgba(16, 185, 129, 0.4)';
        element.style.transition = 'all 0.2s ease';
        element.setAttribute('data-rf-highlighted', 'true');
    }

    function clearHighlights() {
        document.querySelectorAll('[data-rf-highlighted="true"]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.style.boxShadow = '';
            el.removeAttribute('data-rf-highlighted');
        });
        const hint = document.getElementById('rf-answer-hint');
        if (hint) hint.remove();
    }

    // --- React Fiber Fetcher ---
    function getBlooketState() {
        const container = document.querySelector('body > div');
        if (!container) return null;

        let targetNode = null;
        const walker = (node) => {
            if (!node) return null;
            const keys = Object.keys(node);
            const reactKey = keys.find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
            if (reactKey && node[reactKey]?.child?._owner?.stateNode) {
                return node[reactKey].child._owner.stateNode;
            }
            for (let child of node.children) {
                const res = walker(child);
                if (res) return res;
            }
            return null;
        };

        return walker(container);
    }

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    const calculateDelay = () => {
        if (!config.randomJitter || config.baseDelay === 0) return config.baseDelay;
        const jitter = (Math.random() * 0.4 - 0.2) * config.baseDelay;
        return Math.max(0, Math.floor(config.baseDelay + jitter));
    };

    // --- Core Loop ---
    const solve = async () => {
        if (!config.enabled || config.isProcessing) return;

        try {
            const stateNode = getBlooketState();
            if (!stateNode || !stateNode.state) return;

            const { question, stage, feedback } = stateNode.state;
            const pquestion = stateNode.props?.client?.question;
            const currentQ = question || pquestion;

            if (!currentQ) return;

            config.isProcessing = true;

            const delay = calculateDelay();
            if (delay > 0) await sleep(delay);

            // 1. Multiple Choice / True-False
            if (currentQ.qType !== "typing") {
                if (stage !== "feedback" && !feedback) {
                    const correctAnswers = currentQ.correctAnswers || [];
                    const answersDom = [...document.querySelectorAll('[class*="answerContainer"]')];

                    const correctIdx = currentQ.answers.findIndex(ans => correctAnswers.includes(ans));

                    if (correctIdx !== -1 && answersDom[correctIdx]) {
                        if (config.highlightOnly) {
                            clearHighlights();
                            applyHighlight(answersDom[correctIdx]);
                        } else {
                            clearHighlights();
                            answersDom[correctIdx].click();
                        }
                    }
                } else {
                    clearHighlights();
                    const feedbackBtn = document.querySelector('[class*="feedback"]');
                    if (feedbackBtn && feedbackBtn.firstChild) {
                        feedbackBtn.firstChild.click();
                    }
                }
            } 
            // 2. Typing Question
            else {
                const correctAnswer = currentQ.answers[0];
                const typingWrapper = document.querySelector("[class*='typingAnswerWrapper']");

                if (typingWrapper) {
                    if (config.highlightOnly) {
                        if (!document.getElementById('rf-answer-hint')) {
                            const hintDiv = document.createElement('div');
                            hintDiv.id = 'rf-answer-hint';
                            hintDiv.innerText = `💡 정답: ${correctAnswer}`;
                            typingWrapper.appendChild(hintDiv);
                        }
                    } else {
                        clearHighlights();
                        const reactKey = Object.keys(typingWrapper).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
                        if (reactKey) {
                            const owner = typingWrapper[reactKey]?.children?._owner || typingWrapper[reactKey]?.child?._owner;
                            if (owner && owner.stateNode) {
                                owner.stateNode.sendAnswer(correctAnswer);
                            }
                        }
                    }
                }
            }

            // Next Question Click
            const nextContainer = document.querySelector('[class*="questionContainer"]');
            if (nextContainer && !config.highlightOnly) {
                clearHighlights();
                nextContainer.click();
            }

        } catch (err) {
        } finally {
            config.isProcessing = false;
        }
    };

    config.intervalId = setInterval(solve, 150);
})();
