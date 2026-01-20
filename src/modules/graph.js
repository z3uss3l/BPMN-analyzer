/**
 * Visualization Engine for BPMN diagrams
 * Handles rendering and interaction with BPMN diagrams
 */
import * as d3 from 'd3';

export class VisualizationEngine {
    constructor() {
        this.layouts = {
            dagre: this.createDagreLayout,
            d3force: this.createD3ForceLayout,
            elk: this.createELKLayout,
            hierarchical: this.createHierarchicalLayout
        };

        this.themes = {
            light: this.lightTheme,
            dark: this.darkTheme,
            corporate: this.corporateTheme
        };
    }

    async createVisualization(processData, options = {}) {
        const {
            layout = 'dagre',
            theme = 'light',
            interactive = true,
            animations = true
        } = options;

        const svg = await this.createSVGContainer();
        const layoutFn = this.layouts[layout];

        if (!layoutFn) {
            throw new Error(`Layout ${layout} not supported`);
        }

        const graph = await layoutFn(processData.graph);
        const nodes = this.createNodes(graph.nodes, theme);
        const edges = this.createEdges(graph.edges, theme);

        const visualization = {
            svg,
            nodes,
            edges,
            graph,
            metadata: {
                created: new Date().toISOString(),
                layout,
                theme,
                dimensions: graph.dimensions
            }
        };

        if (interactive) {
            this.addInteractivity(visualization);
        }

        if (animations) {
            this.animateEntrance(visualization);
        }

        return visualization;
    }

    async createDagreLayout(_graph) {
        // Placeholder for Dagre layout implementation
        throw new Error('createDagreLayout method not implemented');
    }

    createNodes(nodes, theme) {
        const themeConfig = this.themes[theme];

        return nodes.map(node => ({
            ...node,
            style: {
                ...this.getNodeStyle(node.type),
                ...themeConfig.nodes[node.type] || {}
            },
            interactive: {
                hover: true,
                click: true,
                drag: false
            }
        }));
    }

    getNodeStyle(type) {
        const styles = {
            'StartEvent': {
                fill: '#4CAF50',
                shape: 'circle',
                radius: 25
            },
            'EndEvent': {
                fill: '#F44336',
                shape: 'circle',
                radius: 25
            },
            'Task': {
                fill: '#2196F3',
                shape: 'rect',
                rx: 5,
                ry: 5
            },
            'UserTask': {
                fill: '#FF9800',
                shape: 'rect',
                rx: 5,
                ry: 5
            },
            'ServiceTask': {
                fill: '#9C27B0',
                shape: 'rect',
                rx: 5,
                ry: 5
            },
            'ExclusiveGateway': {
                fill: '#FFC107',
                shape: 'diamond',
                size: 40
            },
            'ParallelGateway': {
                fill: '#FF5722',
                shape: 'diamond',
                size: 40
            },
            'InclusiveGateway': {
                fill: '#795548',
                shape: 'diamond',
                size: 40
            }
        };

        return styles[type] || {
            fill: '#607D8B',
            shape: 'rect',
            rx: 3,
            ry: 3
        };
    }

    async createSVGContainer() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '600');
        svg.setAttribute('viewBox', '0 0 1000 600');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Defs for markers, gradients etc.
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Arrow marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#666');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        return svg;
    }

    addInteractivity(viz) {
        const { svg, nodes } = viz;

        nodes.forEach(node => {
            const element = this.findElementById(svg, node.id);
            if (element) {
                element.addEventListener('mouseenter', () => this.handleNodeHover(node, true));
                element.addEventListener('mouseleave', () => this.handleNodeHover(node, false));
                element.addEventListener('click', () => this.handleNodeClick(node));
            }
        });

        // Zoom and pan
        this.addZoomPan(svg);
    }

    addZoomPan(svg) {
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                svg.querySelector('g').setAttribute('transform', event.transform);
            });

        d3.select(svg).call(zoom);
    }

    async exportAsPNG(viz, options = {}) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // SVG to DataURL
        const svgData = new XMLSerializer().serializeToString(viz.svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = options.width || 2000;
                canvas.height = options.height || 1200;

                // White background for PNG
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw SVG
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Export as PNG
                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/png', 1.0);

                URL.revokeObjectURL(url);
            };

            img.onerror = reject;
            img.src = url;
        });
    }

    animateEntrance(viz) {
        const { nodes, edges } = viz;

        // Staggered animation
        nodes.forEach((node, i) => {
            const element = this.findElementById(viz.svg, node.id);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    element.style.transition = 'opacity 0.3s, transform 0.3s';
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                }, i * 50);
            }
        });

        edges.forEach((edge, i) => {
            const element = this.findElementById(viz.svg, edge.id);
            if (element) {
                element.style.strokeDasharray = element.getTotalLength();
                element.style.strokeDashoffset = element.getTotalLength();

                setTimeout(() => {
                    element.style.transition = 'stroke-dashoffset 0.8s ease-out';
                    element.style.strokeDashoffset = '0';
                }, nodes.length * 50 + i * 30);
            }
        });
    }

    // Placeholder implementations for missing methods
    createD3ForceLayout(_graph) { throw new Error('createD3ForceLayout method not implemented'); }
    createELKLayout(_graph) { throw new Error('createELKLayout method not implemented'); }
    createHierarchicalLayout(_graph) { throw new Error('createHierarchicalLayout method not implemented'); }
    createEdges(_edges, _theme) { throw new Error('createEdges method not implemented'); }
    findElementById(_svg, _id) { throw new Error('findElementById method not implemented'); }
    handleNodeHover(_node, _isHover) { throw new Error('handleNodeHover method not implemented'); }
    handleNodeClick(_node) { throw new Error('handleNodeClick method not implemented'); }
    lightTheme() { throw new Error('lightTheme method not implemented'); }
    darkTheme() { throw new Error('darkTheme method not implemented'); }
    corporateTheme() { throw new Error('corporateTheme method not implemented'); }
}
