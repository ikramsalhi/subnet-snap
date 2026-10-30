(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const ip = $('ip-address');
  const prefix = $('prefix');
  const range = $('prefix-range');
  const form = $('subnet-form');
  const error = $('error-message');
  const resultsSection = $('results-section');
  const formatter = new Intl.NumberFormat('en-US');
  let latestResult = null;
  let toastTimer = null;

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    resultsSection.hidden = true;
    latestResult = null;
  }

  function clearError() {
    error.hidden = true;
    error.textContent = '';
    resultsSection.hidden = false;
  }

  function renderBits(bits, length) {
    const strip = $('bit-strip');
    strip.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 32; index++) {
      const bit = document.createElement('span');
      bit.className = index < length ? 'bit' : 'bit host';
      bit.textContent = bits[index];
      fragment.append(bit);
    }
    strip.append(fragment);
    strip.setAttribute('aria-label', `${length} network bits, ${32 - length} host bits. IP address in binary: ${bits.match(/.{8}/g).join('.')}`);
  }

  function render() {
    try {
      const r = SubnetSnap.calculate(ip.value, prefix.value);
      clearError();
      latestResult = r;
      $('result-cidr').textContent = r.cidr;
      $('result-mask').textContent = r.subnetMask;
      $('result-wildcard').textContent = r.wildcardMask;
      $('result-broadcast').textContent = r.broadcast;
      $('result-first').textContent = r.firstUsable;
      $('result-last').textContent = r.lastUsable;
      $('result-hosts').textContent = formatter.format(r.usableHosts);
      $('result-total').textContent = formatter.format(r.totalAddresses) + ' total addresses';
      $('result-note').textContent = r.note;
      $('network-bits').textContent = r.networkBits + ' network bits';
      $('host-bits').textContent = r.hostBits + ' host bits';
      $('ip-classification').textContent = r.classification.label;
      $('classification-description').textContent = r.classification.description;
      $('range-label').textContent = '/' + r.prefix;
      renderBits(r.binary, r.prefix);
    } catch (err) {
      showError(err.message);
    }
  }

  function synchronizeRange() {
    const n = Number(prefix.value);
    if (Number.isInteger(n) && n >= 0 && n <= 32 && prefix.value.trim() !== '') {
      range.value = String(n);
      $('range-label').textContent = '/' + n;
    }
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2100);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  ip.addEventListener('input', render);
  prefix.addEventListener('input', () => {
    synchronizeRange();
    render();
  });
  range.addEventListener('input', () => {
    prefix.value = range.value;
    render();
  });
  document.querySelectorAll('[data-example]').forEach((button) => {
    button.addEventListener('click', () => {
      const [sampleIP, samplePrefix] = button.dataset.example.split('/');
      ip.value = sampleIP;
      prefix.value = samplePrefix;
      synchronizeRange();
      render();
    });
  });
  $('copy-results').addEventListener('click', async () => {
    if (!latestResult) return;
    const r = latestResult;
    const summary = [
      `SubnetSnap: ${r.address}/${r.prefix}`,
      `Network: ${r.cidr}`,
      `Subnet mask: ${r.subnetMask}`,
      `Wildcard mask: ${r.wildcardMask}`,
      `Broadcast: ${r.broadcast}`,
      `First usable: ${r.firstUsable}`,
      `Last usable: ${r.lastUsable}`,
      `Usable hosts: ${formatter.format(r.usableHosts)}`,
      `Total addresses: ${formatter.format(r.totalAddresses)}`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Copied to clipboard');
    } catch (_) {
      showToast('Copy unavailable — try on HTTPS or localhost');
    }
  });
  $('year').textContent = String(new Date().getFullYear());
  render();
})();
