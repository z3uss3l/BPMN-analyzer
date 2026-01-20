// Dynamic imports for large modules
const loadAIOptimizer = () => import('@modules/ai-optimizer');
const loadVisualization = () => import('@modules/visualization');

// Lazy loading for rarely used features
if (userRequestsAI) {
    const { AIOptimizer } = await loadAIOptimizer();
    // ... use it
}

export { loadAIOptimizer, loadVisualization };
