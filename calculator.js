/*
 * SubnetSnap: dependency-free IPv4 subnet arithmetic.
 * Works in a browser and can be required by Node.js for tests.
 */
(function (root) {
  'use strict';

  function parseIPv4(value) {
    if (typeof value !== 'string') {
      throw new Error('Enter an IPv4 address, such as 192.168.1.10.');
    }

    const parts = value.trim().split('.');
    if (parts.length !== 4 || parts.some((part) => !/^(0|[1-9]\d{0,2})$/.test(part))) {
      throw new Error('Enter four numbers from 0 to 255, separated by dots.');
    }

    const octets = parts.map(Number);
    if (octets.some((octet) => octet > 255)) {
      throw new Error('Each part of the address must be between 0 and 255.');
    }

    return octets.reduce((number, octet) => (((number << 8) >>> 0) | octet) >>> 0, 0);
  }

  function formatIPv4(number) {
    const address = number >>> 0;
    return [24, 16, 8, 0].map((shift) => (address >>> shift) & 255).join('.');
  }

  function classifyIP(address) {
    const first = address >>> 24;
    const second = (address >>> 16) & 255;
    const third = (address >>> 8) & 255;

    if (address === 0xffffffff) return { label: 'Limited broadcast', description: 'Used for local-network broadcast.' };
    if (first === 0) return { label: 'Special-use', description: 'Part of the 0.0.0.0/8 “this network” block.' };
    if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) {
      return { label: 'Private IPv4', description: 'In an RFC 1918 private address range.' };
    }
    if (first === 127) return { label: 'Loopback', description: 'Reserved for the local machine.' };
    if (first === 169 && second === 254) return { label: 'Link-local', description: 'Typically used without a DHCP lease.' };
    if (first === 100 && second >= 64 && second <= 127) return { label: 'Shared address space', description: 'The 100.64.0.0/10 range, commonly used by carrier-grade NAT.' };
    if (first === 192 && second === 0 && third === 2 || first === 198 && second === 51 && third === 100 || first === 203 && second === 0 && third === 113) {
      return { label: 'Documentation range', description: 'Reserved for examples and documentation.' };
    }
    if (first === 198 && (second === 18 || second === 19)) return { label: 'Benchmark range', description: 'Reserved for network-device benchmarking.' };
    if (first >= 224 && first <= 239) return { label: 'Multicast', description: 'An IPv4 multicast address.' };
    if (first >= 240) return { label: 'Reserved', description: 'In the high-address special-use range.' };
    return { label: 'Other IPv4', description: 'Not in the special-use ranges recognized by this tool. Public reachability is not guaranteed.' };
  }

  function calculate(rawIP, rawPrefix) {
    const address = parseIPv4(rawIP);
    const prefix = typeof rawPrefix === 'string' && rawPrefix.trim() !== '' ? Number(rawPrefix) : rawPrefix;

    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
      throw new Error('CIDR prefix must be a whole number from 0 to 32.');
    }

    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const wildcard = (~mask) >>> 0;
    const network = (address & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const totalAddresses = 2 ** (32 - prefix);
    const usableHosts = prefix === 32 ? 1 : prefix === 31 ? 2 : totalAddresses - 2;
    const firstUsable = prefix >= 31 ? network : network + 1;
    const lastUsable = prefix >= 31 ? broadcast : broadcast - 1;

    return {
      address: formatIPv4(address),
      prefix,
      cidr: formatIPv4(network) + '/' + prefix,
      network: formatIPv4(network),
      broadcast: formatIPv4(broadcast),
      subnetMask: formatIPv4(mask),
      wildcardMask: formatIPv4(wildcard),
      firstUsable: formatIPv4(firstUsable),
      lastUsable: formatIPv4(lastUsable),
      totalAddresses,
      usableHosts,
      networkBits: prefix,
      hostBits: 32 - prefix,
      binary: address.toString(2).padStart(32, '0'),
      classification: classifyIP(address),
      note: prefix === 31
        ? '/31 networks have two addresses, both usable for point-to-point links (RFC 3021).'
        : prefix === 32
          ? '/32 identifies a single address. It has no separate network or broadcast host.'
          : 'For conventional IPv4 subnets, the network and broadcast addresses are not assigned to hosts.'
    };
  }

  const api = { parseIPv4, formatIPv4, calculate, classifyIP };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SubnetSnap = api;
})(typeof window !== 'undefined' ? window : null);
