import './styles/main.css';
import { initializeUI, updateDashboard } from '@modules/ui';
import { BPMNParser } from '@modules/parser';
import { AnalysisEngine } from '@modules/analyzer';
import { ExportManager } from '@modules/exporter';
import { Validator } from '@modules/validator';
import { AIOptimizer } from '@modules/ai-optimizer';
import { VisualizationEngine } from '@modules/visualization';

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
        
        this.init();
    }
    
    async init() {
        await initializeUI(this);
        this.setupEventListeners();
        this.loadSampleProcess();
        
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
            console.error('Fehler beim Laden:', error);
            this.showError(error.message);
        }
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
        window.addEventListener('progress', (e) => {
            // Update UI
        });
        
        window.addEventListener('export-request', async (e) => {
            const { format, options } = e.detail;
            await this.handleExport(format, options);
        });
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
        const response = await fetch('/samples/sample-process.bpmn');
        const xml = await response.text();
        return xml;
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
    window.bpmnApp = new BPMNApp();
});

export default BPMNApp;
