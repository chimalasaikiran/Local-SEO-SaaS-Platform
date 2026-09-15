import { RankingProvider } from './rankingProvider';
import { NoopRankingProvider } from './noopRankingProvider';

export enum ProviderStatus {
  CONFIGURED = 'CONFIGURED',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  UNAVAILABLE = 'UNAVAILABLE',
  ERROR = 'ERROR'
}

class ProviderRegistry {
  private providers: Map<string, RankingProvider> = new Map();
  private defaultProviderName: string | null = null;

  constructor() {
    // Register the fallback Noop Provider
    this.registerProvider(new NoopRankingProvider());
    this.defaultProviderName = 'NOOP'; // Default until a real one is configured
  }

  registerProvider(provider: RankingProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  getProvider(name?: string): RankingProvider {
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

  async getProviderStatus(name?: string): Promise<ProviderStatus> {
    try {
      const provider = this.getProvider(name);
      if (provider.providerName === 'NOOP') {
        return ProviderStatus.NOT_CONFIGURED;
      }
      
      const isHealthy = await provider.healthCheck();
      return isHealthy ? ProviderStatus.CONFIGURED : ProviderStatus.UNAVAILABLE;
    } catch (err) {
      return ProviderStatus.ERROR;
    }
  }
}

export const rankingProviderRegistry = new ProviderRegistry();
