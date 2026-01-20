import bpmnModdle from 'bpmn-moddle';
import { SUPPORTED_FORMATS, NAMESPACES } from '@utils/constants';

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
            const { rootElement, elements } = await this.moddle.fromXML(normalizedXML);
            
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
        
        switch(format) {
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
    
    buildProcessGraph(elements) {
        const graph = {
            nodes: new Map(),
            edges: new Map(),
            lanes: new Map(),
            startEvents: [],
            endEvents: [],
            gateways: []
        };
        
        // Iterate through elements and classify
        Object.values(elements).forEach(element => {
            if (!element.$type) return;
            
            const node = {
                id: element.id,
                type: element.$type.replace('bpmn:', ''),
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
        Object.values(elements).forEach(element => {
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
        
        Object.entries(elements).forEach(([id, element]) => {
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
        for (const [id, el] of Object.entries(elements)) {
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
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File reading error'));
            reader.readAsText(file);
        });
    }

    // Placeholder implementations for missing methods
    normalizeActiviti(xml) { throw new Error('normalizeActiviti method not implemented'); }
    normalizeFlowable(xml) { throw new Error('normalizeFlowable method not implemented'); }
    normalizeGeneric(xml) { throw new Error('normalizeGeneric method not implemented'); }
    extractMetadata(rootElement) { throw new Error('extractMetadata method not implemented'); }
}
