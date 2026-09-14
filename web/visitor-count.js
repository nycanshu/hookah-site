// Independent of MediaPipe and the camera bundle: begin the request in <head>.
// GoatCounter's public counter is cached on its servers for up to four hours.
// A same-origin backend endpoint can be configured in a meta tag for fresh API
// data. Keep the private GoatCounter API token on that backend, never here.
(() => {
  const endpoint = document.querySelector('meta[name="visitor-count-endpoint"]')?.content
    || 'https://hookahbaar.goatcounter.com/counter/%2F.json';
  function footer() {
    const chip = document.getElementById('vibed');
    if (chip) return Promise.resolve(chip);
    // The async script can win the race with HTML parsing. Observe only until
    // the footer arrives; DOMContentLoaded would also wait for camera modules.
    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        const chip = document.getElementById('vibed');
        if (chip) { observer.disconnect(); resolve(chip); }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  async function load() {
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return;
      const raw = (await response.json()).count;
      if (typeof raw !== 'string' && typeof raw !== 'number') return;
      const formatted = String(raw).trim();
      if (!/^\d[\d\s,.]*$/.test(formatted)) return;
      const count = Number(formatted.replace(/[\s,.]/g, ''));
      if (!Number.isSafeInteger(count) || count < 0) return;
      const chip = await footer();
      if (count === 0) chip.textContent = 'be the first to vibe';
      else {
        const number = document.createElement('b');
        number.textContent = count.toLocaleString('en-IN');
        chip.replaceChildren(number, ` ${count === 1 ? 'guy has' : 'guys have'} vibed so far`);
      }
      chip.hidden = false;
    } catch { /* A blocked or unavailable counter must never delay the camera. */ }
  }
  load();
})();
