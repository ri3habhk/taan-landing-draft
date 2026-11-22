// Carry the draft in a fragment: it is not sent with the initial HTTP request.
(() => {
  'use strict';
  const form = document.querySelector('.hero-prompt');
  const field = form.querySelector('textarea');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const prompt = field.value;
    if (!prompt.trim() || [...prompt].length > 8000) {
      field.setCustomValidity('Enter a music prompt of up to 8,000 characters.');
      field.reportValidity();
      return;
    }
    const destination = new URL('https://app.taan.ai/');
    destination.hash = new URLSearchParams({ prompt }).toString();
    location.assign(destination.href);
  });
  field.addEventListener('input', () => field.setCustomValidity(''));
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
})();
