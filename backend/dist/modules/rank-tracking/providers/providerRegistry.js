"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingProviderRegistry = exports.ProviderStatus = void 0;
const noopRankingProvider_1 = require("./noopRankingProvider");
var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["CONFIGURED"] = "CONFIGURED";
    ProviderStatus["NOT_CONFIGURED"] = "NOT_CONFIGURED";
    ProviderStatus["UNAVAILABLE"] = "UNAVAILABLE";
    ProviderStatus["ERROR"] = "ERROR";
})(ProviderStatus || (exports.ProviderStatus = ProviderStatus = {}));
class ProviderRegistry {
    providers = new Map();
    defaultProviderName = null;
    constructor() {
        // Register the fallback Noop Provider
        this.registerProvider(new noopRankingProvider_1.NoopRankingProvider());
        this.defaultProviderName = 'NOOP'; // Default until a real one is configured
    }
    registerProvider(provider) {
        this.providers.set(provider.providerName, provider);
    }
    getProvider(name) {
        const targetName = name || this.defaultProviderName;
        if (!targetName) {
            throw new Error('No ranking provider specified or configured.');
        }
        const provider = this.providers.get(targetName);
        if (!provider) {
            throw new Error(`Ranking provider '${targetName}' not found.`);
        }
        return provider;
    }
    async getProviderStatus(name) {
        try {
            const provider = this.getProvider(name);
            if (provider.providerName === 'NOOP') {
                return ProviderStatus.NOT_CONFIGURED;
            }
            const isHealthy = await provider.healthCheck();
            return isHealthy ? ProviderStatus.CONFIGURED : ProviderStatus.UNAVAILABLE;
        }
        catch (err) {
            return ProviderStatus.ERROR;
        }
    }
}
exports.rankingProviderRegistry = new ProviderRegistry();
