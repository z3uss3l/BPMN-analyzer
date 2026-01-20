import * as d3 from 'd3';
import dagre from 'dagre';
import { COLOR_SCHEMES, LAYOUT_OPTIONS } from '@utils/constants';

/**
 * Visualization Engine for BPMN diagrams
 * Handles creating and managing BPMN diagram visualizations using D3.js and Dagre
 */
export class VisualizationEngine {
    constructor(options = {}) {
        this.options = {
            container: '#visualization-area',
            width: 800,
            height: 600,
            theme: 'light',
            layout: 'dagre',
            ...options
        };

        this.svg = null;
        this.g = null;
        this.zoom = null;
        this.currentLayout = null;
        this.nodes = [];
        this.edges = [];
        this.colorScheme = COLOR_SCHEMES[this.options.theme] || COLOR_SCHEMES.light || {};
    }

    /**
     * Create visualization from BPMN data
     * @param {Object} bpmnData - Parsed BPMN data
     * @returns {Object} Visualization result
     */
    async createVisualization(bpmnData) {
        try {
            this.clearVisualization();

            // Extract nodes and edges from BPMN data
            this.extractGraphElements(bpmnData);

            // Create layout
            await this.createLayout();

            // Render visualization
            this.render();

            return {
                success: true,
                svg: this.svg,
                nodes: this.nodes,
                edges: this.edges,
                layout: this.currentLayout
            };
        } catch (error) {
            throw new Error(`Visualization failed: ${error.message}`);
        }
    }

    /**
     * Extract graph elements from BPMN data
     * @param {Object} bpmnData - BPMN data
     */
    extractGraphElements(bpmnData) {
        this.nodes = [];
        this.edges = [];

        // Extract nodes from graph metadata
        if (bpmnData.graph && bpmnData.graph.nodes) {
            const nodes = bpmnData.graph.nodes instanceof Map ? Array.from(bpmnData.graph.nodes.values()) : Object.values(bpmnData.graph.nodes);
            nodes.forEach(nodeData => {
                const node = {
                    id: nodeData.id,
                    type: nodeData.type,
                    name: nodeData.name || nodeData.id,
                    data: nodeData,
                    x: 0,
                    y: 0,
                    width: this.getNodeWidth(nodeData.type),
                    height: this.getNodeHeight(nodeData.type)
                };
                this.nodes.push(node);
            });
        }

        // Extract edges from sequence flows
        // Extract edges from graph metadata
        if (bpmnData.graph && bpmnData.graph.edges) {
            const edges = bpmnData.graph.edges instanceof Map ? Array.from(bpmnData.graph.edges.values()) : Object.values(bpmnData.graph.edges);
            edges.forEach(flow => {
                const edge = {
                    id: flow.id,
                    source: flow.source,
                    target: flow.target,
                    name: flow.name || '',
                    data: flow
                };
                this.edges.push(edge);
            });
        }
    }

    /**
     * Create layout using Dagre
     */
    async createLayout() {
        const g = new dagre.graphlib.Graph();
        g.setGraph({
            rankdir: 'LR',
            nodesep: 50,
            ranksep: 50,
            marginx: 20,
            marginy: 20
        });
        g.setDefaultEdgeLabel(() => ({}));

        // Add nodes to graph
        this.nodes.forEach(node => {
            g.setNode(node.id, {
                width: node.width,
                height: node.height
            });
        });

        // Add edges to graph
        this.edges.forEach(edge => {
            g.setEdge(edge.source, edge.target);
        });

        // Layout
        dagre.layout(g);

        // Update node positions
        this.nodes.forEach(node => {
            const nodeWithPosition = g.node(node.id);
            node.x = nodeWithPosition.x;
            node.y = nodeWithPosition.y;
        });

        this.currentLayout = g;
    }

    /**
     * Render visualization using D3.js
     */
    render() {
        const container = d3.select(this.options.container);

        // Clear existing content
        container.selectAll('*').remove();

        // Create SVG
        this.svg = container
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group
        this.g = this.svg.append('g');

        // Create edge group
        const edgeGroup = this.g.append('g').attr('class', 'edges');

        // Create node group
        const nodeGroup = this.g.append('g').attr('class', 'nodes');

        // Render edges
        this.renderEdges(edgeGroup);

        // Render nodes
        this.renderNodes(nodeGroup);

        // Fit to view
        this.fitToView();
    }

    /**
     * Render edges
     * @param {d3.Selection} edgeGroup - Edge group
     */
    renderEdges(edgeGroup) {
        const edges = edgeGroup.selectAll('.edge')
            .data(this.edges)
            .enter()
            .append('g')
            .attr('class', 'edge');

        // Add path
        edges.append('path')
            .attr('d', d => this.createEdgePath(d))
            .attr('fill', 'none')
            .attr('stroke', this.colorScheme.primary || '#666')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');

        // Add arrowhead marker
        this.svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 9)
            .attr('refY', 5)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z')
            .attr('fill', this.colorScheme.primary || '#666');

        // Add label if exists
        edges.filter(d => d.name)
            .append('text')
            .attr('x', d => this.getEdgeMidpoint(d).x)
            .attr('y', d => this.getEdgeMidpoint(d).y)
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .text(d => d.name)
            .style('font-size', '12px')
            .style('fill', this.colorScheme.text || '#000');
    }

    /**
     * Render nodes
     * @param {d3.Selection} nodeGroup - Node group
     */
    renderNodes(nodeGroup) {
        const nodes = nodeGroup.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x - d.width / 2}, ${d.y - d.height / 2})`)
            .style('cursor', 'pointer')
            .call(this.createDragBehavior());

        // Add node shape based on type
        nodes.each((d, i, nodes) => {
            const node = d3.select(nodes[i]);
            this.renderNodeShape(node, d);
        });

        // Add node label
        nodes.append('text')
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(d => d.name)
            .style('font-size', '12px')
            .style('fill', this.colorScheme.text || '#000');

        // Add hover effects
        nodes.on('mouseover', function (_event, _d) {
            d3.select(this).select('rect, circle, path')
                .attr('stroke', '#333')
                .attr('stroke-width', 3);
        })
            .on('mouseout', function (_event, _d) {
                d3.select(this).select('rect, circle, path')
                    .attr('stroke', 'none')
                    .attr('stroke-width', 1);
            });
    }

    /**
     * Render node shape based on BPMN element type
     * @param {d3.Selection} node - Node selection
     * @param {Object} d - Node data
     */
    renderNodeShape(node, d) {
        const fillColor = this.colorScheme[d.type] || this.colorScheme.primary || '#fff';

        switch (d.type) {
            case 'task':
            case 'userTask':
            case 'serviceTask':
                node.append('rect')
                    .attr('width', d.width)
                    .attr('height', d.height)
                    .attr('rx', 5)
                    .attr('ry', 5)
                    .attr('fill', fillColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 1);
                break;

            case 'startEvent':
                node.append('circle')
                    .attr('cx', d.width / 2)
                    .attr('cy', d.height / 2)
                    .attr('r', Math.min(d.width, d.height) / 2)
                    .attr('fill', fillColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;

            case 'endEvent':
                node.append('circle')
                    .attr('cx', d.width / 2)
                    .attr('cy', d.height / 2)
                    .attr('r', Math.min(d.width, d.height) / 2)
                    .attr('fill', fillColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 3);
                break;

            case 'exclusiveGateway':
                node.append('path')
                    .attr('d', this.createDiamondPath(d.width, d.height))
                    .attr('fill', fillColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 1);
                break;

            default:
                node.append('rect')
                    .attr('width', d.width)
                    .attr('height', d.height)
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .attr('fill', fillColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 1);
        }
    }

    /**
     * Create diamond path for gateways
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {string} Path string
     */
    createDiamondPath(width, height) {
        return `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`;
    }

    /**
     * Create edge path
     * @param {Object} edge - Edge data
     * @returns {string} Path string
     */
    createEdgePath(edge) {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        const targetNode = this.nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return '';

        const x1 = sourceNode.x;
        const y1 = sourceNode.y;
        const x2 = targetNode.x;
        const y2 = targetNode.y;

        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    /**
     * Get edge midpoint
     * @param {Object} edge - Edge data
     * @returns {Object} Midpoint coordinates
     */
    getEdgeMidpoint(edge) {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        const targetNode = this.nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return { x: 0, y: 0 };

        return {
            x: (sourceNode.x + targetNode.x) / 2,
            y: (sourceNode.y + targetNode.y) / 2
        };
    }

    /**
     * Create drag behavior for nodes
     * @returns {d3.DragBehavior} Drag behavior
     */
    createDragBehavior() {
        return d3.drag()
            .on('start', (event, _d) => {
                d3.select(event.sourceEvent.target.parentNode).raise();
            })
            .on('drag', (event, d) => {
                d.x = event.x;
                d.y = event.y;
                d3.select(event.sourceEvent.target.parentNode)
                    .attr('transform', `translate(${d.x - d.width / 2}, ${d.y - d.height / 2})`);
            })
            .on('end', (_event, _d) => {
                // Update edges if needed
                this.updateEdges();
            });
    }

    /**
     * Update edges after node dragging
     */
    updateEdges() {
        this.g.selectAll('.edge path')
            .attr('d', d => this.createEdgePath(d));

        this.g.selectAll('.edge text')
            .attr('x', d => this.getEdgeMidpoint(d).x)
            .attr('y', d => this.getEdgeMidpoint(d).y);
    }

    /**
     * Get node width based on type
     * @param {string} type - Node type
     * @returns {number} Width
     */
    getNodeWidth(type) {
        const widths = {
            task: 100,
            userTask: 100,
            serviceTask: 100,
            startEvent: 40,
            endEvent: 40,
            exclusiveGateway: 60
        };
        return widths[type] || 80;
    }

    /**
     * Get node height based on type
     * @param {string} type - Node type
     * @returns {number} Height
     */
    getNodeHeight(type) {
        const heights = {
            task: 60,
            userTask: 60,
            serviceTask: 60,
            startEvent: 40,
            endEvent: 40,
            exclusiveGateway: 60
        };
        return heights[type] || 50;
    }

    /**
     * Clear visualization
     */
    clearVisualization() {
        if (this.svg) {
            this.svg.selectAll('*').remove();
        }
        this.nodes = [];
        this.edges = [];
    }

    /**
     * Fit visualization to view
     */
    fitToView() {
        if (!this.svg || !this.nodes.length) return;

        const bounds = this.g.node().getBBox();
        const fullWidth = this.options.width;
        const fullHeight = this.options.height;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;

        if (width == 0 || height == 0) return;

        const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }

    /**
     * Export visualization as PNG
     * @returns {Promise<Blob>} PNG blob
     */
    async exportPNG() {
        if (!this.svg) throw new Error('No visualization to export');

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(this.svg.node());
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = this.options.width;
                canvas.height = this.options.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/png');
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
    }

    /**
     * Export visualization as SVG
     * @returns {string} SVG string
     */
    exportSVG() {
        if (!this.svg) throw new Error('No visualization to export');
        return new XMLSerializer().serializeToString(this.svg.node());
    }

    /**
     * Set theme
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        if (COLOR_SCHEMES[theme]) {
            this.colorScheme = COLOR_SCHEMES[theme];
            this.options.theme = theme;
            this.render();
        }
    }

    /**
     * Set layout
     * @param {string} layout - Layout type
     */
    setLayout(layout) {
        if (LAYOUT_OPTIONS[layout]) {
            this.options.layout = layout;
            this.createLayout();
            this.render();
        }
    }
}
