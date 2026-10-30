const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, parseIPv4, formatIPv4 } = require('../calculator');

test('calculates a typical /24 correctly', () => {
  const r = calculate('192.168.10.42', 24);
  assert.equal(r.cidr, '192.168.10.0/24');
  assert.equal(r.subnetMask, '255.255.255.0');
  assert.equal(r.wildcardMask, '0.0.0.255');
  assert.equal(r.broadcast, '192.168.10.255');
  assert.equal(r.firstUsable, '192.168.10.1');
  assert.equal(r.lastUsable, '192.168.10.254');
  assert.equal(r.usableHosts, 254);
  assert.equal(r.totalAddresses, 256);
  assert.equal(r.classification.label, 'Private IPv4');
});

test('calculates a /27 with correct subnet boundary', () => {
  const r = calculate('10.0.0.75', 27);
  assert.equal(r.network, '10.0.0.64');
  assert.equal(r.broadcast, '10.0.0.95');
  assert.equal(r.usableHosts, 30);
});

test('handles /0 without JavaScript bitshift wraparound', () => {
  const r = calculate('8.8.8.8', 0);
  assert.equal(r.network, '0.0.0.0');
  assert.equal(r.broadcast, '255.255.255.255');
  assert.equal(r.totalAddresses, 4294967296);
  assert.equal(r.usableHosts, 4294967294);
});

test('handles /31 point-to-point usage', () => {
  const r = calculate('172.16.0.3', 31);
  assert.equal(r.network, '172.16.0.2');
  assert.equal(r.firstUsable, '172.16.0.2');
  assert.equal(r.lastUsable, '172.16.0.3');
  assert.equal(r.usableHosts, 2);
});

test('handles /32 single host', () => {
  const r = calculate('203.0.113.7', 32);
  assert.equal(r.network, '203.0.113.7');
  assert.equal(r.broadcast, '203.0.113.7');
  assert.equal(r.usableHosts, 1);
});

test('can round trip an address without signed bitwise errors', () => {
  assert.equal(formatIPv4(parseIPv4('250.253.254.255')), '250.253.254.255');
});

test('rejects malformed addresses', () => {
  for (const invalid of ['192.168.1', '192.168.1.256', '192.168.01.1', '-1.2.3.4', '1.2.3.4.5', 'hello', '1..2.3']) {
    assert.throws(() => calculate(invalid, 24));
  }
});

test('rejects missing or out-of-range CIDR prefixes', () => {
  for (const invalid of ['', -1, 33, 15.5, 'abc', null]) {
    assert.throws(() => calculate('10.0.0.1', invalid));
  }
});
