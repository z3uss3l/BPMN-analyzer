// tests/unit/analyzer.test.js
import { AnalysisEngine } from '../../src/modules/analyzer';
import { sampleProcess } from '../fixtures/sample-process';

describe('AnalysisEngine', () => {
    let analyzer;
    
    beforeEach(() => {
        analyzer = new AnalysisEngine();
    });
    
    test('should analyze basic process metrics', async () => {
        const analysis = await analyzer.analyze(sampleProcess);
        
        expect(analysis.basic.elementCount).toBeGreaterThan(0);
        expect(analysis.complexity.score).toBeDefined();
        expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
    
    test('should calculate McCabe complexity correctly', () => {
        const complexity = analyzer.calculateMcCabeComplexity(sampleProcess.graph);
        expect(typeof complexity).toBe('number');
        expect(complexity).toBeGreaterThanOrEqual(0);
    });
});
