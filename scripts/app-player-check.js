const frame = document.querySelector('#tonearm');
const events = document.querySelector('#events');
const summary = document.querySelector('#summary');
const state = document.querySelector('#state');
let frameDoc = null;
let media = null;
let recording = false;
let hookError = null;
let rows = [];
let connected = false;

const timestamp = () => new Date().toISOString();

function showState(message, active = recording) {
  state.textContent = message;
  state.dataset.active = String(active);
}

function addResult(action, result, detail, track = '') {
  if (!recording) return;
  rows.unshift({ at: timestamp(), action, result, track, detail });
  render();
}

function render() {
  events.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No interactions recorded yet.';
    events.append(empty);
    summary.textContent = 'No interactions recorded';
    return;
  }

  const counts = rows.reduce((total, row) => {
    total[row.result] = (total[row.result] || 0) + 1;
    return total;
  }, {});
  summary.textContent = `${rows.length} checks · ${counts.pass || 0} passed · ${counts.fail || 0} failed · ${counts.info || 0} informational`;
  for (const item of rows) {
    const box = document.createElement('article');
    box.className = 'event';
    box.dataset.result = item.result;
    const heading = document.createElement('strong');
    const label = document.createElement('span');
    const result = document.createElement('span');
    const detail = document.createElement('p');
    label.textContent = item.action;
    result.textContent = item.result.toUpperCase();
    detail.textContent = [item.track, item.detail].filter(Boolean).join(' · ');
    heading.append(label, result);
    box.append(heading, detail);
    events.append(box);
  }
}

function titleNow() {
  return frameDoc?.querySelector('#player .np b')?.textContent?.trim() || 'Nothing playing';
}

function rowNow() {
  return frameDoc?.querySelector('.row.cur')?.dataset.id || '';
}

function mediaSnapshot() {
  if (!media) return null;
  return {
    paused: media.paused,
    time: media.currentTime || 0,
    duration: Number.isFinite(media.duration) ? media.duration : 0,
    volume: media.volume,
    muted: media.muted,
    src: media.currentSrc || media.src || '',
  };
}

function attachMedia(audio) {
  if (media === audio) return;
  media = audio;
  audio.addEventListener('error', () => {
    addResult('Audio error', 'fail', audio.error?.message || 'The browser reported an audio error.', titleNow());
  });
}

function waitFor(predicate, timeout = 5000) {
  return new Promise(resolve => {
    const started = Date.now();
    const poll = () => {
      try { if (predicate()) return resolve(true); } catch {}
      if (Date.now() - started >= timeout) return resolve(false);
      setTimeout(poll, 100);
    };
    poll();
  });
}

function recordAfterAction(action, target, previous) {
  const delay = action === 'row' ? 900 : action === 'seek' ? 500 : 400;
  setTimeout(async () => {
    if (!recording || !frameDoc) return;
    if (action === 'row' || action === 'keyboard row') {
      const id = target.dataset.id;
      await waitFor(() => rowNow() === id && media && !media.paused, 12000);
    } else if (action === 'toggle') {
      await waitFor(() => media && media.paused !== previous.paused, 6000);
    } else if (action === 'seek') {
      await waitFor(() => {
        const input = frameDoc.querySelector('#sk');
        const duration = media?.duration;
        const expected = input && duration ? Number(input.value) / Number(input.max) * duration : NaN;
        return Number.isFinite(expected) && Math.abs((media?.currentTime || 0) - expected) < 3;
      }, 4000);
    }
    const audio = mediaSnapshot();
    const track = titleNow();
    let result = 'info';
    let detail = 'Observed; compare with the intended action.';

    if (action === 'row' || action === 'keyboard row') {
      const id = target.dataset.id;
      const selectedAndPlaying = rowNow() === id && track !== 'Nothing playing' && audio && !audio.paused;
      result = selectedAndPlaying ? 'pass' : 'fail';
      detail = selectedAndPlaying
        ? 'Selected row, player title, and active playback agree.'
        : `Expected row ${id} to become active and play; actual row ${rowNow() || 'none'}, audio ${audio?.paused ? 'paused' : 'unavailable'}.`;
    } else if (action === 'toggle') {
      const changed = audio && audio.paused !== previous.paused;
      result = changed ? 'pass' : 'fail';
      detail = changed
        ? audio.paused ? 'Audio paused through Tonearm control.' : 'Audio playing through Tonearm control.'
        : 'Audio paused/playing state did not change after the player control.';
    } else if (action === 'next' || action === 'prev') {
      if (audio && audio.src !== previous.src) {
        result = 'pass';
        detail = 'The current audio source changed.';
      } else if (action === 'prev' && audio && previous.time > 3 && audio.time < 1.5) {
        result = 'pass';
        detail = 'Previous restarted the current song from the beginning.';
      } else if (action === 'next' && audio?.paused) {
        result = 'info';
        detail = 'The player may have reached the end of its current queue; review the queue edge rule.';
      } else {
        result = 'fail';
        detail = 'No expected source change or restart was observed.';
      }
    } else if (action === 'volume') {
      const input = frameDoc.querySelector('#vl');
      const expected = input ? Number(input.value) / 100 : NaN;
      const applied = audio && (audio.muted || Math.abs(audio.volume - expected) < 0.02);
      result = applied ? 'pass' : 'fail';
      detail = applied ? `Audio volume control applied (${Math.round(audio.volume * 100)}%).` : 'Audio volume did not match the volume control.';
    } else if (action === 'seek') {
      const input = frameDoc.querySelector('#sk');
      const expected = input && audio?.duration ? Number(input.value) / Number(input.max) * audio.duration : NaN;
      const applied = Number.isFinite(expected) && audio && Math.abs(audio.time - expected) < 3;
      result = applied ? 'pass' : 'fail';
      detail = applied ? 'Audio position follows the seek control (within 3 seconds).' : 'Audio position did not follow the seek control; wait for seek completion and retry.';
    } else if (action === 'shuffle' || action === 'repeat') {
      const selector = action === 'shuffle' ? '[data-a="shuf"]' : '[data-a="rep"]';
      const button = frameDoc.querySelector(selector);
      const value = button?.getAttribute('aria-pressed') || button?.getAttribute('aria-label') || '';
      const changed = value && value !== previous.control;
      result = changed ? 'pass' : 'fail';
      detail = changed ? `Tonearm updated the ${action} control state.` : `The ${action} control state did not change.`;
    }
    addResult(action, result, detail, track);
  }, delay);
}

function connect() {
  if (connected) return;
  connected = true;
  try {
    const win = frame.contentWindow;
    frameDoc = win.document;
    const mediaPrototype = win.HTMLMediaElement.prototype;
    const originalPlay = mediaPrototype.play;
    const originalPause = mediaPrototype.pause;
    mediaPrototype.play = function (...args) {
      attachMedia(this);
      return originalPlay.apply(this, args);
    };
    mediaPrototype.pause = function (...args) {
      attachMedia(this);
      return originalPause.apply(this, args);
    };

    win.addEventListener('error', event => addResult('App script error', 'fail', event.message || 'Uncaught browser error', titleNow()));
    win.addEventListener('unhandledrejection', event => addResult('Unhandled rejection', 'fail', String(event.reason || 'Unknown rejection'), titleNow()));
    frameDoc.addEventListener('click', event => {
      if (!recording) return;
      const button = event.target.closest?.('[data-a]');
      const row = event.target.closest?.('.row[data-play-ctx]');
      if (button) {
        if (button.dataset.a === 'playctx' && row) {
          recordAfterAction('row', row, mediaSnapshot());
          return;
        }
        const actionBySelector = { toggle: 'toggle', next: 'next', prev: 'prev', shuf: 'shuffle', rep: 'repeat' };
        const action = actionBySelector[button.dataset.a];
        if (!action) return;
        const previous = mediaSnapshot() || { paused: true, time: 0, src: '', volume: 0 };
        previous.control = button.getAttribute('aria-pressed') || button.getAttribute('aria-label') || '';
        recordAfterAction(action, button, previous);
      } else if (row) {
        recordAfterAction('row', row, mediaSnapshot());
      }
    }, true);
    frameDoc.addEventListener('change', event => {
      if (!recording) return;
      if (event.target.id === 'sk') recordAfterAction('seek', event.target, mediaSnapshot());
      if (event.target.id === 'vl') recordAfterAction('volume', event.target, mediaSnapshot());
    }, true);
    frameDoc.addEventListener('keydown', event => {
      if (!recording || !['Enter', ' '].includes(event.key)) return;
      const row = event.target.closest?.('.row[data-play-ctx]');
      if (row && event.target === row) recordAfterAction('keyboard row', row, mediaSnapshot());
    }, true);
    showState('App ready · recording off', false);
  } catch (error) {
    hookError = error;
    showState('Same-origin app access unavailable', false);
  }
}

frame.addEventListener('load', connect);
try {
  if (frame.contentDocument?.readyState === 'complete') connect();
} catch (error) {
  hookError = error;
  showState('Same-origin app access unavailable', false);
}
document.querySelector('#record').addEventListener('click', () => {
  if (hookError || !frameDoc) return showState('Reload from a local static server', false);
  recording = true;
  showState('Recording interactions', true);
});
document.querySelector('#stop').addEventListener('click', () => {
  recording = false;
  showState('Recording stopped', false);
});
document.querySelector('#clear').addEventListener('click', () => {
  rows = [];
  render();
});
document.querySelector('#export').addEventListener('click', () => {
  const report = { application: 'Tonearm', createdAt: timestamp(), url: location.href, results: [...rows].reverse() };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tonearm-app-player-check.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
