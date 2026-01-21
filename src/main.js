import './styles/main.css';
import { initializeUI, updateDashboard } from '@modules/ui';
import { BPMNParser } from '@modules/parser';
import { AnalysisEngine } from '@modules/analyzer';
import { ExportManager } from '@modules/exporter';
import { Validator } from '@modules/validator';
import { AIOptimizer } from '@modules/ai-optimizer';
import { VisualizationEngine } from '@modules/visualization';
import { MiningEngine } from '@modules/mining-engine';
import { LogCollector } from '@utils/log-collector';
import { updateMiningResults } from '@modules/ui';

// App State Management
class BPMNApp {
    constructor() {
        this.state = {
            currentProcess: null,
            analysisResults: null,
            visualization: null,
            settings: this.loadSettings(),
            history: []
        };

        this.parser = new BPMNParser();
        this.analyzer = new AnalysisEngine();
        this.exporter = new ExportManager();
        this.validator = new Validator();
        this.aiOptimizer = new AIOptimizer();
        this.vizEngine = new VisualizationEngine();
        this.miningEngine = new MiningEngine();
        this.logCollector = new LogCollector();

        this.init();
    }

    async init() {
        await initializeUI(this);
        this.setupEventListeners();
        this.setupProgressListeners();

        // Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    }

    async loadProcess(file) {
        try {
            this.showProgress(0, 'Datei wird geladen...');

            const xmlContent = await this.parser.readFile(file);
            this.showProgress(30, 'XML wird geparst...');

            const parsed = await this.parser.parseBPMN(xmlContent, file.name);
            this.showProgress(60, 'Prozess wird analysiert...');

            const analysis = await this.analyzer.analyze(parsed);
            this.showProgress(90, 'Visualisierung wird erstellt...');

            const visualization = await this.vizEngine.createVisualization(parsed);

            this.state.currentProcess = parsed;
            this.state.analysisResults = analysis;
            this.state.visualization = visualization;

            updateDashboard(this.state);
            this.showProgress(100, 'Analyse abgeschlossen!');

            // AI recommendations asynchronously
            this.loadAIRecommendations(analysis);

            // Save to history
            this.saveToHistory(parsed, analysis);

        } catch (error) {
            // console.error('Fehler beim Laden:', error);
            this.showError(error.message);
        }
    }

    async loadAIRecommendations(_analysis) {
        // console.log('Loading AI recommendations...');
        // This could be an async call to an AI service
    }

    async optimizeProcess(strategy = 'auto') {
        if (!this.state.currentProcess) return;

        const recommendations = await this.aiOptimizer.generateRecommendations(
            this.state.currentProcess,
            this.state.analysisResults,
            strategy
        );

        return recommendations;
    }

    saveToHistory(process, analysis) {
        this.state.history.unshift({
            timestamp: new Date().toISOString(),
            processName: process.name || 'Unbenannter Prozess',
            elementCount: process.elements.length,
            isoScore: analysis.compliance?.score || 0,
            data: { process, analysis }
        });

        // Keep only 10 entries
        if (this.state.history.length > 10) {
            this.state.history.pop();
        }

        localStorage.setItem('bpmn-history', JSON.stringify(this.state.history));
    }

    showProgress(percent, message) {
        const progressEvent = new CustomEvent('progress', {
            detail: { percent, message }
        });
        window.dispatchEvent(progressEvent);
    }

    showError(message) {
        const errorEvent = new CustomEvent('error', {
            detail: { message }
        });
        window.dispatchEvent(errorEvent);
    }

    setupEventListeners() {
        // File upload button
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.loadProcess(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    this.loadProcess(files[0]);
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const modalClose = helpModal?.querySelector('.modal-close');

        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => {
                helpModal.style.display = 'flex';
                helpModal.classList.add('active');
            });
        }

        if (modalClose && helpModal) {
            modalClose.addEventListener('click', () => {
                helpModal.style.display = 'none';
                helpModal.classList.remove('active');
            });
        }

        // Close modal on background click
        if (helpModal) {
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.style.display = 'none';
                    helpModal.classList.remove('active');
                }
            });
        }

        // Sample button
        const sampleBtn = document.getElementById('load-sample-btn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/samples/sample-process.bpmn');
                    if (!response.ok) throw new Error('Sample file not found');
                    const xml = await response.text();
                    const blob = new Blob([xml], { type: 'text/xml' });
                    const file = new File([blob], 'sample-process.bpmn', { type: 'text/xml' });
                    await this.loadProcess(file);
                } catch (error) {
                    this.showError('Sample-Datei konnte nicht geladen werden');
                }
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                if (!this.state.currentProcess) {
                    this.showError('Bitte zuerst eine BPMN-Datei laden');
                    return;
                }

                // Simple export as JSON for now
                const exportData = {
                    process: this.state.currentProcess,
                    analysis: this.state.analysisResults,
                    timestamp: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bpmn-analysis.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active tab content
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `tab-${tabName}`) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Mining Event Listeners
        const mineCsvBtn = document.getElementById('mine-csv-btn');
        const mineNetworkBtn = document.getElementById('mine-network-btn');
        const mineSystemBtn = document.getElementById('mine-system-btn');
        const logInput = document.getElementById('log-input');

        if (mineCsvBtn && logInput) {
            mineCsvBtn.addEventListener('click', () => {
                logInput.setAttribute('data-type', 'generic');
                logInput.click();
            });
        }

        if (mineNetworkBtn && logInput) {
            mineNetworkBtn.addEventListener('click', () => {
                logInput.setAttribute('data-type', 'har');
                logInput.click();
            });
        }

        if (logInput) {
            logInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.handleLogUpload(file);
                }
            });
        }

        if (mineSystemBtn) {
            mineSystemBtn.addEventListener('click', () => this.handleSystemMining());
        }
    }

    async handleLogUpload(file) {
        try {
            this.showProgress(20, 'Lade Log-Datei...');
            const events = await this.logCollector.parse(file);

            this.showProgress(50, 'Analysiere Prozess-Traces...');
            const miningResult = await this.miningEngine.discover(events);

            this.showProgress(80, 'Visualisiere entdeckten Prozess...');

            this.state.currentProcess = {
                xml: '<!-- Discovered Process -->',
                graph: miningResult.graph,
                elements: miningResult.graph.nodes
            };

            const analysis = await this.analyzer.analyze(this.state.currentProcess);
            this.state.analysisResults = analysis;

            await this.vizEngine.createVisualization(this.state.currentProcess);
            updateDashboard(this.state);
            updateMiningResults(miningResult);

            this.showProgress(100, 'Process Mining abgeschlossen');
            setTimeout(() => this.showProgress(0), 1500);
            this.showNotification('Prozess erfolgreich aus Log extrahiert', 'success');
        } catch (error) {
            // console.error('Mining error:', error);
            this.showError(`Mining fehlgeschlagen: ${error.message}`);
            this.showProgress(0);
        }
    }

    async handleSystemMining() {
        try {
            this.showProgress(30, 'Sammle Systeminformationen...');

            const events = [
                { caseId: 'system', activity: `OS: ${navigator.platform}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Browser: ${navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Chrome/Edge'}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Language: ${navigator.language}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Screen: ${window.screen.width}x${window.screen.height}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Cores: ${navigator.hardwareConcurrency || 'unknown'}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Battery: ${navigator.getBattery ? 'available' : 'unknown'}`, timestamp: new Date().toISOString() },
                { caseId: 'system', activity: `Cookies: ${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}`, timestamp: new Date().toISOString() }
            ];

            const miningResult = await this.miningEngine.discover(events);

            this.state.currentProcess = {
                xml: '<!-- System Info Process -->',
                graph: miningResult.graph,
                elements: miningResult.graph.nodes
            };

            const analysis = await this.analyzer.analyze(this.state.currentProcess);
            this.state.analysisResults = analysis;

            await this.vizEngine.createVisualization(this.state.currentProcess);
            updateDashboard(this.state);
            updateMiningResults(miningResult);

            this.showProgress(100, 'System-Mining abgeschlossen');
            setTimeout(() => this.showProgress(0), 1500);
        } catch (error) {
            this.showError(`System-Mining fehlgeschlagen: ${error.message}`);
            this.showProgress(0);
        }
    }

    // Progress and error events
    setupProgressListeners() {
        window.addEventListener('progress', (e) => {
            const { percent, message } = e.detail;
            this.showProgress(percent, message);
        });

        window.addEventListener('error', (e) => {
            const { message } = e.detail;
            this.showNotification(message, 'error');
        });

        window.addEventListener('export-request', async (e) => {
            const { format, options } = e.detail;
            await this.handleExport(format, options);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '400px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    async handleExport(format, options = {}) {
        const exportData = {
            process: this.state.currentProcess,
            analysis: this.state.analysisResults,
            visualization: this.state.visualization
        };

        return await this.exporter.export(format, exportData, options);
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('bpmn-settings') || '{}');
    }

    saveSettings(settings) {
        this.state.settings = { ...this.state.settings, ...settings };
        localStorage.setItem('bpmn-settings', JSON.stringify(this.state.settings));
    }

    async loadSampleProcess() {
        try {
            const response = await fetch('/samples/sample-process.bpmn');
            if (response.ok) {
                const xml = await response.text();
                const blob = new Blob([xml], { type: 'text/xml' });
                const file = new File([blob], 'sample-process.bpmn', { type: 'text/xml' });
                await this.loadProcess(file);
            }
        } catch (error) {
            // Ignore initial load local errors
        }
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
    window.bpmnApp = new BPMNApp();
});

export default BPMNApp;
