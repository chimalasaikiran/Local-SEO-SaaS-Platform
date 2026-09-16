"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopRankingProvider = void 0;
class NoopRankingProvider {
    providerName = 'NOOP';
    supportedSearchEngines = ['GOOGLE'];
    supportedDevices = ['DESKTOP', 'MOBILE'];
    supportsGeoCoordinates = true;
    supportsLocalResults = true;
    async checkRanking(request) {
        // Deliberately throwing error to indicate not configured
        // This allows the worker to catch it and update job status properly
        throw new Error('RANKING_PROVIDER_NOT_CONFIGURED');
    }
    async checkRankings(requests) {
        throw new Error('RANKING_PROVIDER_NOT_CONFIGURED');
    }
    async healthCheck() {
        // It's technically healthy as a system, but it's fundamentally a No-op.
        return true;
    }
}
exports.NoopRankingProvider = NoopRankingProvider;
