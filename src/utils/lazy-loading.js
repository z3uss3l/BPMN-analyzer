// Dynamic imports for large modules
const loadAIOptimizer = () => import('@modules/ai-optimizer');
const loadVisualization = () => import('@modules/visualization');

// Lazy loading for rarely used features
export async function handleAIRequest() {
    const { AIOptimizer } = await loadAIOptimizer();
    return new AIOptimizer();
}

export { loadAIOptimizer, loadVisualization };
