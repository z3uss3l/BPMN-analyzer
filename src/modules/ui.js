// Use getters for elements to ensure they are fetched from the DOM when needed
export const UI = {
    get elements() {
        return {
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'),
            progressContainer: document.getElementById('progress-container'),
            dashboardSection: document.getElementById('dashboard-section'),
            progressFill: document.getElementById('progress-fill'),
            progressPercent: document.getElementById('progress-percent'),
            progressSteps: document.getElementById('progress-steps'),
            notationOutput: document.getElementById('notation-output'),
            lineCount: document.getElementById('line-count'),
            charCount: document.getElementById('char-count'),
            overviewTab: document.getElementById('tab-overview'),
            aiSection: document.getElementById('ai-section')
        };
    }
};

export async function initializeUI(_app) {
    // console.log('UI Initializing...');
    const elements = UI.elements;

    // Hide dashboard initially
    if (elements.dashboardSection) {
        elements.dashboardSection.style.display = 'none';
    }

    // console.log('UI Initialized successfully');
}

export function updateDashboard(state) {
    // console.log('Updating dashboard with state:', state);
    const elements = UI.elements;

    if (!state.analysisResults || !state.currentProcess) {
        // console.warn('Cannot update dashboard: missing data');
        return;
    }

    const { analysisResults } = state;
    const basic = analysisResults.basic || {};

    // Update stats
    const updateText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateText('stat-elements', basic.elementCount || 0);
    updateText('stat-tasks', basic.taskCount || 0);
    updateText('stat-paths', basic.pathCount || 0);

    // ISO score
    const isoScore = analysisResults.compliance?.overallScore || 0;
    updateText('stat-iso', `${isoScore}%`);

    // Show dashboard
    if (elements.dashboardSection) {
        elements.dashboardSection.style.display = 'block';
    }

    // Update notation output
    updateNotation(state);

    // Update overview
    updateOverview(state);

    // Update AI recommendations if they exist in state
    if (state.analysisResults.recommendations) {
        updateAIRecommendations(state);
    }
}

export function updateAIRecommendations(state) {
    const elements = UI.elements;
    if (!elements.aiSection || !state.analysisResults) return;

    const { recommendations } = state.analysisResults;

    if (!recommendations || recommendations.length === 0) {
        elements.aiSection.style.display = 'block';
        return;
    }

    elements.aiSection.style.display = 'block';
    const container = elements.aiSection.querySelector('div[style*="text-align: center"]');
    if (!container) return;

    container.style.textAlign = 'left';
    container.style.padding = '0';

    container.innerHTML = `
        <div class="recommendations-list">
            ${recommendations.map(rec => `
                <div class="recommendation-item severity-${rec.severity}">
                    <div class="rec-header">
                        <span class="rec-title">${rec.title}</span>
                        <span class="badge badge-sm">${rec.severity.toUpperCase()}</span>
                    </div>
                    <p class="rec-desc">${rec.description}</p>
                    <div class="rec-action">
                        <strong>Lösung:</strong> ${rec.action}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

export function updateOverview(state) {
    const elements = UI.elements;
    if (!elements.overviewTab || !state.analysisResults) return;

    const { analysisResults } = state;
    const { complexity, performance: perf, compliance } = analysisResults;

    elements.overviewTab.innerHTML = `
        <div class="overview-grid">
            <div class="overview-card">
                <h4>📊 Komplexität</h4>
                <p>McCabe-Index: <strong>${complexity?.mcCabe || 0}</strong></p>
                <p>Nesting-Tiefe: <strong>${complexity?.nestingDepth || 0}</strong></p>
                <p>Entscheidungspunkte: <strong>${complexity?.decisionPoints || 0}</strong></p>
            </div>
            <div class="overview-card">
                <h4>⚡ Performance</h4>
                <p>Geschätzte Dauer: <strong>${perf?.estimatedDuration || 0} Min.</strong></p>
                <p>Engpässe: <strong>${perf?.bottlenecks?.length || 0} identifiziert</strong></p>
                <p>Ressourcen-Nutzung: <strong>${Math.round((perf?.resourceUtilization || 0) * 100)}%</strong></p>
            </div>
            <div class="overview-card">
                <h4>🛡️ Compliance</h4>
                <p>ISO 9001 Score: <strong>${compliance?.overallScore || 0}%</strong></p>
                <p>Fehlgeschlagene Checks: <strong>${compliance?.failedChecks || 0}</strong></p>
            </div>
        </div>
    `;
}

export function updateNotation(state) {
    const elements = UI.elements;
    if (!elements.notationOutput || !state.currentProcess) return;

    const xml = state.currentProcess.xml || '';
    elements.notationOutput.value = xml;

    if (elements.lineCount) {
        const lines = xml.split('\n').length;
        elements.lineCount.textContent = `${lines} Zeilen`;
    }

    if (elements.charCount) {
        elements.charCount.textContent = `${xml.length} Zeichen`;
    }
}
