import dns from 'dns';
import { promisify } from 'util';
import net from 'net';
import { URL } from 'url';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

/**
 * Validates if an IP is within a private or reserved range to prevent SSRF.
 */
export function isPrivateIP(ip: string): boolean {
  // Check IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map((part) => parseInt(part, 10));
    
    return (
      parts[0] === 10 || // 10.0.0.0/8
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
      (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
      parts[0] === 127 || // 127.0.0.0/8 (Loopback)
      parts[0] === 169 && parts[1] === 254 || // 169.254.0.0/16 (Link-local)
      parts[0] === 0 // 0.0.0.0/8 (Current network)
    );
  }

  // Check IPv6
  if (net.isIPv6(ip)) {
    // Very simplified check for IPv6 loopback and private/link-local
    const normalized = ip.toLowerCase();
    return (
      normalized === '::1' || // Loopback
      normalized.startsWith('fe80:') || // Link-local
      normalized.startsWith('fc00:') || // Unique local address
      normalized.startsWith('fd00:')
    );
  }

  return false;
}

/**
 * Validates a URL against SSRF by checking its host against private IP ranges.
 * This function resolves the DNS to an IP to prevent DNS rebinding or obfuscated IPs.
 */
export async function validateSSRF(targetUrl: string): Promise<boolean> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return false;
  }

  // Only allow http and https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return false;
  }

  const host = parsedUrl.hostname;

  // Block obvious localhosts
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return false;
  }

  // If host is an IP directly, check it
  if (net.isIP(host)) {
    if (isPrivateIP(host)) return false;
  }

  // Resolve DNS to IP to prevent DNS rebinding attacks mapping to local IP
  try {
    let ips: string[] = [];
    
    try {
      const v4 = await resolve4(host);
      ips = ips.concat(v4);
    } catch (e) {
      // Ignore
    }

    try {
      const v6 = await resolve6(host);
      ips = ips.concat(v6);
    } catch (e) {
      // Ignore
    }

    if (ips.length === 0) {
      // If we can't resolve it, it might be unresolvable or we should be cautious. 
      // But we let standard HTTP requests fail normally on DNS errors.
      return true; 
    }

    // Check if any resolved IP is private
    for (const ip of ips) {
      if (isPrivateIP(ip)) {
        return false;
      }
    }

  } catch (error) {
    // If DNS resolution fails completely, we allow it to proceed and let the HTTP client handle the failure.
    // However, some strict implementations block unresolvable hostnames.
  }

  return true;
}
