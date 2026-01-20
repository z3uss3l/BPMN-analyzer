/**
 * Mining Engine for BPMN Analyzer Pro
 * Discovers process models from event logs and other traces
 */
export class MiningEngine {
    constructor() {
        this.config = {
            algorithm: 'alpha',
            threshold: 0.1
        };
    }

    /**
     * Discover process graph from event log
     * @param {Array} eventLog - List of {caseId, activity, timestamp}
     */
    async discover(eventLog) {
        if (!eventLog || eventLog.length === 0) {
            throw new Error('Kein Event Log vorhanden');
        }

        // 1. Group by Case ID to extract traces
        const traces = this.extractTraces(eventLog);

        // 2. Build Directly-Follows Graph (DFG)
        const dfg = this.buildDFG(traces);

        // 3. Convert DFG to Process Graph (Simple discovery for now)
        const graph = this.createGraphFromDFG(dfg);

        return {
            graph,
            metadata: {
                caseCount: traces.size,
                eventCount: eventLog.length,
                variants: this.countVariants(traces),
                discoveryTime: Date.now()
            }
        };
    }

    extractTraces(log) {
        const traces = new Map();

        // Ensure sorted by timestamp
        const sortedLog = [...log].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        sortedLog.forEach(event => {
            if (!traces.has(event.caseId)) {
                traces.set(event.caseId, []);
            }
            traces.get(event.caseId).push(event.activity);
        });

        return traces;
    }

    buildDFG(traces) {
        const dfg = {
            nodes: new Set(),
            startNodes: new Set(),
            endNodes: new Set(),
            relations: new Map() // 'A -> B' => count
        };

        traces.forEach(trace => {
            if (trace.length === 0) return;

            // Mark start and end
            dfg.startNodes.add(trace[0]);
            dfg.endNodes.add(trace[trace.length - 1]);

            for (let i = 0; i < trace.length; i++) {
                const current = trace[i];
                dfg.nodes.add(current);

                if (i < trace.length - 1) {
                    const next = trace[i + 1];
                    const relation = `${current} -> ${next}`;
                    dfg.relations.set(relation, (dfg.relations.get(relation) || 0) + 1);
                }
            }
        });

        return dfg;
    }

    createGraphFromDFG(dfg) {
        const graph = {
            nodes: new Map(),
            edges: new Map(),
            gateways: [],
            startEvents: [],
            endEvents: []
        };

        // Create Nodes
        dfg.nodes.forEach(activity => {
            const nodeId = `task_${activity.replace(/[^a-zA-Z0-9]/g, '_')}`;
            graph.nodes.set(nodeId, {
                id: nodeId,
                name: activity,
                type: 'task',
                incoming: [],
                outgoing: []
            });
        });

        // Add Start/End Events
        dfg.startNodes.forEach(activity => {
            const startId = `start_${activity.replace(/[^a-zA-Z0-9]/g, '_')}`;
            graph.startEvents.push({ id: startId, type: 'startEvent' });

            // Connect start to first task
            const targetId = `task_${activity.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const edgeId = `edge_${startId}_${targetId}`;
            graph.edges.set(edgeId, { id: edgeId, source: startId, target: targetId });
        });

        // Create Edges
        dfg.relations.forEach((count, relation) => {
            const [source, target] = relation.split(' -> ');
            const sourceId = `task_${source.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const targetId = `task_${target.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const edgeId = `edge_${sourceId}_${targetId}`;

            graph.edges.set(edgeId, {
                id: edgeId,
                source: sourceId,
                target: targetId,
                weight: count
            });

            // Link ids back to nodes
            if (graph.nodes.has(sourceId)) graph.nodes.get(sourceId).outgoing.push(edgeId);
            if (graph.nodes.has(targetId)) graph.nodes.get(targetId).incoming.push(edgeId);
        });

        return graph;
    }

    countVariants(traces) {
        const variants = new Set();
        traces.forEach(trace => {
            variants.add(trace.join(';'));
        });
        return variants.size;
    }
}
