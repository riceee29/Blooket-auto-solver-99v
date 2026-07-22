// ==UserScript==
// @name         Blooket Ultra Auto-Solver Pro v2.0 (Rayfield UI)
// @namespace    https://blooket.com
// @version      2026.2.0
// @description  Next-Gen Blooket Auto Solver with Enhanced Highlight & React Fiber Engine
// @author       Rice
// @match        https://*.blooket.com/*
// @grant        none
// ==/UserScript==

javascript:(function () {
    if (window.__blooket_solver_v2__) {
        const uiElem = document.getElementById('rf-blooket-ui');
        if (uiElem) uiElem.style.display = uiElem.style.display === 'none' ? 'block' : 'none';
        return;
    }

    window.__blooket_solver_v2__ = true;

    // --- Config State ---
    const config = {
        enabled: true,
        highlightOnly: false,
        baseDelay: 800,
        randomJitter: true,
        isProcessing: false,
        intervalId: null
    };

    // --- Dynamic CSS ---
    const style = document.createElement('style');
    style.id = 'rf-blooket-style-v2';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Pretendard:wght@400;600;700&display=swap');

        #rf-blooket-ui {
            position: fixed;
            top: 60px;
            left: 60px;
            width: 330px;
            background: rgba(13, 13, 20, 0.94);
            backdrop-filter: blur(16px);
            color: #e2e8f0;
            font-family: 'Pretendard', -apple-system, sans-serif;
            border-radius: 14px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 229, 255, 0.3);
            z-index: 99999999;
            user-select: none;
            overflow: hidden;
        }

        .rf-header {
            background: linear-gradient(90deg, #10101c 0%, #18182a 100%);
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rf-title {
            font-family: 'JetBrains Mono', monospace;
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
