"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSeoAiService = void 0;
class LocalSeoAiService {
    aiProvider;
    ollamaBaseUrl;
    model;
    constructor() {
        this.aiProvider = process.env.AI_PROVIDER || 'none';
        this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.AI_MODEL || 'llama3';
    }
    async analyzeCompetitorLandscape(organizationId, locationId) {
        if (this.aiProvider !== 'ollama') {
            return "AI provider not configured. Please configure an open-source AI provider like Ollama.";
        }
        try {
            // Check if Ollama is accessible
            const healthCheck = await fetch(`${this.ollamaBaseUrl}/api/version`).catch(() => null);
            if (!healthCheck || !healthCheck.ok) {
                return "AI provider unavailable. Ensure Ollama is running.";
            }
            // TODO: Fetch competitor data via CompetitorInsightsService, construct prompt, and call Ollama chat API.
            // For now, this is a placeholder implementation pending full AI rollout phase.
            return "Local SEO AI Analysis is enabled but pending model prompt configuration.";
        }
        catch (error) {
            console.error('Ollama AI Error:', error);
            return "AI provider unavailable.";
        }
    }
}
exports.LocalSeoAiService = LocalSeoAiService;
