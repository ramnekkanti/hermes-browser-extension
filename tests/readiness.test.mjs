import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  deriveStartupView,
  initialStartupReadiness,
  reduceStartupReadiness,
  selectedModelReadiness,
} from '../extension/lib/readiness.mjs';

test('startup reducer keeps the readiness screen visible until hard gates pass', () => {
  let state = initialStartupReadiness({ gatewayMode: 'local-api', gatewayUrl: 'http://127.0.0.1:8642' });
  state = reduceStartupReadiness(state, { step: 'settings', status: 'ready' });
  state = reduceStartupReadiness(state, { step: 'gateway', status: 'ready', gateway: { connected: true, state: 'connected' } });
  state = reduceStartupReadiness(state, { step: 'capabilities', status: 'ready' });
  state = reduceStartupReadiness(state, { step: 'models', status: 'active', detail: 'Loading models…' });

  let view = deriveStartupView(state);
  assert.equal(view.visible, true);
  assert.equal(view.ready, false);
  assert.match(view.detail, /Loading models/i);

  state = reduceStartupReadiness(state, { step: 'models', status: 'ready' });
  state = reduceStartupReadiness(state, { step: 'selectedModel', status: 'ready' });
  state = reduceStartupReadiness(state, { step: 'skills', status: 'skipped' });
  state = reduceStartupReadiness(state, { step: 'profiles', status: 'skipped' });
  state = reduceStartupReadiness(state, { step: 'sessions', status: 'ready' });
  state = reduceStartupReadiness(state, { step: 'sessionBinding', status: 'ready' });
  view = deriveStartupView(state);

  assert.equal(state.ready, true);
  assert.equal(view.visible, false);
  assert.equal(view.progress, 100);
});

test('startup reducer classifies unconfigured and unreachable gateways as setup/error states', () => {
  const setup = reduceStartupReadiness(initialStartupReadiness(), {
    step: 'gateway',
    status: 'unconfigured',
    detail: 'Add a Hermes API token.',
  });
  assert.equal(setup.phase, 'setup-needed');
  assert.equal(deriveStartupView(setup).title, 'Connect to Hermes');

  const unreachable = reduceStartupReadiness(initialStartupReadiness(), {
    step: 'gateway',
    status: 'unreachable',
    detail: 'http://127.0.0.1:8642 is not responding.',
  });
  assert.equal(unreachable.phase, 'error');
  assert.equal(deriveStartupView(unreachable).title, 'Hermes needs attention');
});

test('missing capabilities and sparse model data degrade without blocking ready state', () => {
  let state = initialStartupReadiness();
  for (const [step, status] of [
    ['settings', 'ready'],
    ['gateway', 'ready'],
    ['capabilities', 'legacy'],
    ['models', 'fallback'],
    ['selectedModel', 'observed'],
    ['skills', 'skipped'],
    ['profiles', 'skipped'],
    ['sessions', 'fallback'],
    ['sessionBinding', 'ready'],
  ]) {
    state = reduceStartupReadiness(state, { step, status });
  }
  assert.equal(state.ready, true);
  assert.equal(deriveStartupView(state).visible, false);
});

test('selectedModelReadiness distinguishes requestable, observed, and missing models', () => {
  assert.equal(selectedModelReadiness({
    settings: { model: 'openai/gpt-5.5' },
    availableModels: [{ id: 'openai/gpt-5.5', rawModelId: 'gpt-5.5', runtimeSelectable: true }],
  }).status, 'ready');

  assert.equal(selectedModelReadiness({
    settings: { model: 'history-only' },
    availableModels: [{ id: 'history-only', runtimeSelectable: false }],
  }).status, 'observed');

  assert.equal(selectedModelReadiness({
    settings: { model: 'missing-model' },
    availableModels: [],
    activeSessionRuntime: { provider: 'openrouter', model: 'observed-runtime' },
  }).status, 'observed');

  assert.equal(selectedModelReadiness({ settings: { model: 'missing-model' }, availableModels: [] }).status, 'error');
});

test('sidepanel includes startup readiness UI, styles, and boot controller wiring', () => {
  const html = readFileSync(new URL('../extension/sidepanel.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../extension/sidepanel.css', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../extension/sidepanel.js', import.meta.url), 'utf8');

  assert.match(html, /id="startupScreen"/);
  assert.match(html, /id="startupStepList"/);
  assert.match(css, /startup-screen/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /runStartupReadiness/);
  assert.match(js, /deriveStartupView/);
});
