// Proxy Manager for rotating proxies and managing connections

export class ProxyManager {
  private proxyPool: string[];
  private currentIndex: Map<string, number>;
  private blacklist: Set<string>;

  constructor() {
    // Initialize proxy pool from environment variables
    const proxyEndpoints = process.env.PROXY_POOL_ENDPOINTS?.split(',') || [];
    this.proxyPool = proxyEndpoints;
    this.currentIndex = new Map();
    this.blacklist = new Set();
  }

  async getProxy(proxyId?: string): Promise<string | undefined> {
    if (!this.proxyPool.length) {
      console.warn('No proxies available in pool');
      return undefined;
    }

    if (proxyId && !this.blacklist.has(proxyId)) {
      return proxyId;
    }

    // Get next available proxy
    const availableProxies = this.proxyPool.filter(p => !this.blacklist.has(p));
    if (!availableProxies.length) {
      console.error('All proxies are blacklisted');
      return undefined;
    }

    return availableProxies[Math.floor(Math.random() * availableProxies.length)];
  }

  async rotateProxy(accountId: string): Promise<string> {
    const currentIdx = this.currentIndex.get(accountId) || 0;
    const nextIdx = (currentIdx + 1) % this.proxyPool.length;

    this.currentIndex.set(accountId, nextIdx);

    const newProxy = this.proxyPool[nextIdx];

    // Skip blacklisted proxies
    if (this.blacklist.has(newProxy)) {
      return this.rotateProxy(accountId); // Recursive call to get next
    }

    console.log(`Rotated proxy for ${accountId} to proxy #${nextIdx}`);
    return newProxy;
  }

  blacklistProxy(proxy: string): void {
    this.blacklist.add(proxy);
    console.warn(`Proxy blacklisted: ${proxy}`);
  }

  whitelistProxy(proxy: string): void {
    this.blacklist.delete(proxy);
    console.log(`Proxy whitelisted: ${proxy}`);
  }

  getPoolStatus(): {
    total: number;
    available: number;
    blacklisted: number;
  } {
    return {
      total: this.proxyPool.length,
      available: this.proxyPool.length - this.blacklist.size,
      blacklisted: this.blacklist.size
    };
  }
}