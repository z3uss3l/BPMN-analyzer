/**
 * Log Collector for BPMN Analyzer Pro
 * Handles parsing and normalization of various log formats
 */
export class LogCollector {
    constructor() {
        this.supportedFormats = ['csv', 'json', 'har'];
    }

    async parse(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const content = await this.readFile(file);

        switch (extension) {
            case 'csv':
                return this.parseCSV(content);
            case 'json':
                return this.parseJSON(content);
            case 'har':
                return this.parseHAR(content);
            default:
                throw new Error(`Format .${extension} wird nicht unterstützt`);
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (_e) => resolve(_e.target.result);
            reader.onerror = (_e) => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsText(file);
        });
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV Datei ist leer oder ungültig');

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Try to identify columns
        const caseIdx = headers.findIndex(h => h.includes('case') || h.includes('id'));
        const activityIdx = headers.findIndex(h => h.includes('activity') || h.includes('event') || h.includes('task'));
        const timeIdx = headers.findIndex(h => h.includes('timestamp') || h.includes('time') || h.includes('datum'));

        if (caseIdx === -1 || activityIdx === -1) {
            throw new Error('CSV Spalten nicht erkannt. Benötigt: Case ID, Activity');
        }

        return lines.slice(1).map((line, idx) => {
            const cols = line.split(',');
            return {
                caseId: cols[caseIdx]?.trim() || 'case_unknown',
                activity: cols[activityIdx]?.trim() || 'activity_unknown',
                timestamp: cols[timeIdx]?.trim() || new Date(idx).toISOString()
            };
        });
    }

    parseJSON(jsonText) {
        try {
            const data = JSON.parse(jsonText);
            const events = Array.isArray(data) ? data : data.events || [];

            return events.map(e => ({
                caseId: e.caseId || e.id || 'unknown',
                activity: e.activity || e.name || 'unknown',
                timestamp: e.timestamp || e.time || new Date().toISOString()
            }));
        } catch (e) {
            throw new Error('JSON Parsing Fehler');
        }
    }

    /**
     * Parse HAR (HTTP Archive) to mine session flow
     */
    parseHAR(harText) {
        const data = JSON.parse(harText);
        const entries = data.log.entries;

        // Group by URL/Domain as sequence
        return entries.map(entry => ({
            caseId: 'network_session',
            activity: `${entry.request.method} ${new URL(entry.request.url).pathname}`,
            timestamp: entry.startedDateTime
        }));
    }
}
