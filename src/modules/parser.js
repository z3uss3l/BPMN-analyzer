import bpmnModdle from 'bpmn-moddle';
// import { SUPPORTED_FORMATS, NAMESPACES } from '@utils/constants';

export class BPMNParser {
    constructor() {
        this.moddle = new bpmnModdle();
        this.vendorPatterns = {
            camunda: /camunda:/,
            activiti: /activiti:/,
            flowable: /flowable:/,
            signavio: /signavio:/
        };
    }

    async parseBPMN(xmlContent, fileName = '') {
        try {
            // Detect format
            const format = this.detectFormat(xmlContent, fileName);

            // Normalize if necessary
            let normalizedXML = xmlContent;
            if (format !== 'bpmn20') {
                normalizedXML = this.normalizeVendorFormat(xmlContent, format);
            }

            // Parse with bpmn-moddle
            const result = await this.moddle.fromXML(normalizedXML);
            const rootElement = result.rootElement;

            // Extract all elements into a flat map for easier processing
            const elements = new Map();
            this.traverseElements(rootElement, elements);

            // Extract metadata
            const metadata = this.extractMetadata(rootElement);

            // Create process graph
            const processGraph = this.buildProcessGraph(elements);

            return {
                xml: normalizedXML,
                originalXml: xmlContent,
                format,
                metadata,
                graph: processGraph,
                elements: this.extractElements(elements),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            throw new Error(`Parsing error: ${error.message}`);
        }
    }

    detectFormat(xml, fileName) {
        // Detect based on namespaces and structure
        if (xml.includes('http://www.omg.org/spec/BPMN/20100524/MODEL')) {
            return 'bpmn20';
        }

        for (const [vendor, pattern] of Object.entries(this.vendorPatterns)) {
            if (pattern.test(xml)) {
                return vendor;
            }
        }

        // Based on filename
        if (fileName.endsWith('.bpmn') || fileName.endsWith('.bpmn2')) {
            return 'bpmn20';
        }

        return 'unknown';
    }

    normalizeVendorFormat(xml, format) {
        let normalized = xml;

        switch (format) {
            case 'camunda':
                normalized = this.normalizeCamunda(xml);
                break;
            case 'activiti':
                normalized = this.normalizeActiviti(xml);
                break;
            case 'flowable':
                normalized = this.normalizeFlowable(xml);
                break;
            default:
                normalized = this.normalizeGeneric(xml);
        }

        return normalized;
    }

    normalizeCamunda(xml) {
        return xml
            .replace(/camunda:/g, '')
            .replace(/xmlns:camunda="[^"]+"/g, '')
            .replace(/<extensionElements>[\s\S]*?<\/extensionElements>/g, '')
            .replace(/<bpmn2:/g, '<bpmn:')
            .replace(/<\/bpmn2:/g, '</bpmn:');
    }

    traverseElements(element, map) {
        if (!element) return;
        if (element.id && !map.has(element.id)) {
            map.set(element.id, element);
        }

        // Children can be in flowElements, rootElements, elements (custom), etc.
        const children = element.flowElements || element.rootElements || element.elements || [];
        children.forEach(child => this.traverseElements(child, map));

        // Also check for processes specifically within definitions
        if (element.$type === 'bpmn:Definitions' && element.rootElements) {
            element.rootElements.forEach(root => {
                if (root.$type === 'bpmn:Process') {
                    this.traverseElements(root, map);
                }
            });
        }
    }

    buildProcessGraph(elements = new Map()) {
        const graph = {
            nodes: new Map(),
            edges: new Map(),
            lanes: new Map(),
            startEvents: [],
            endEvents: [],
            gateways: []
        };

        if (!elements) return graph;

        // Iterate through elements and classify
        const elementList = elements instanceof Map ? Array.from(elements.values()) : Object.values(elements);
        elementList.forEach(element => {
            const node = {
                id: element.id,
                type: element.$type ? element.$type.replace('bpmn:', '') : 'Unknown',
                name: element.name || element.id,
                incoming: element.incoming || [],
                outgoing: element.outgoing || [],
                lane: this.findLaneForElement(element, elements),
                documentation: element.documentation || null,
                extensionElements: element.extensionElements || null
            };

            graph.nodes.set(element.id, node);

            // Classification
            if (node.type.includes('StartEvent')) graph.startEvents.push(node);
            if (node.type.includes('EndEvent')) graph.endEvents.push(node);
            if (node.type.includes('Gateway')) graph.gateways.push(node);
        });

        // Extract edges
        elementList.forEach(element => {
            if (element.$type === 'bpmn:SequenceFlow') {
                graph.edges.set(element.id, {
                    id: element.id,
                    source: element.sourceRef?.id,
                    target: element.targetRef?.id,
                    name: element.name || null,
                    condition: element.conditionExpression?.body || null
                });
            }
        });

        return graph;
    }

    extractElements(elements) {
        const result = {};

        const elementList = elements instanceof Map ? Array.from(elements.entries()) : Object.entries(elements);
        elementList.forEach(([id, element]) => {
            if (element.$type) {
                result[id] = {
                    id,
                    type: element.$type.replace('bpmn:', ''),
                    name: element.name || id,
                    attributes: this.extractAttributes(element),
                    documentation: element.documentation || null
                };
            }
        });

        return result;
    }

    extractAttributes(element) {
        const attrs = {};
        Object.keys(element).forEach(key => {
            if (!key.startsWith('$') && key !== 'id' && key !== 'name') {
                attrs[key] = element[key];
            }
        });
        return attrs;
    }

    findLaneForElement(element, elements) {
        // Search for lane that contains this element
        const elementList = elements instanceof Map ? Array.from(elements.entries()) : Object.entries(elements);
        for (const [_id, el] of elementList) {
            if (el.$type === 'bpmn:Lane' && el.flowNodeRef) {
                if (el.flowNodeRef.some(ref => ref.id === element.id)) {
                    return el.name || el.id;
                }
            }
        }
        return null;
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (_e) => resolve(_e.target.result);
            reader.onerror = (_e) => reject(new Error('File reading error'));
            reader.readAsText(file);
        });
    }

    // Implementations for missing methods
    normalizeActiviti(xml) {
        return xml.replace(/activiti:/g, '');
    }

    normalizeFlowable(xml) {
        return xml.replace(/flowable:/g, '');
    }

    normalizeGeneric(xml) {
        return xml;
    }

    extractMetadata(rootElement) {
        return {
            id: rootElement?.id || 'unknown',
            name: rootElement?.name || 'Unnamed Process',
            targetNamespace: rootElement?.targetNamespace,
            exporter: rootElement?.exporter,
            exporterVersion: rootElement?.exporterVersion
        };
    }
}
