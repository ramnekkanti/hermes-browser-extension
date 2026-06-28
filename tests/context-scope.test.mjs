import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONTEXT_SCOPE_MODES,
  filterPromptTabs,
  messageStorageKeyForScope,
  normalizeContextScope,
  resolveContextTargetTab,
  sessionBindingKeyForScope,
  shouldRefreshForTabEvent,
  tabScopeId,
} from '../extension/lib/context-scope.mjs';

const tabs = [
  { id: 1, windowId: 10, title: 'One', url: 'https://one.example' },
  { id: 2, windowId: 10, title: 'Two', url: 'https://two.example' },
];

test('normalizeContextScope defaults to follow-active', () => {
  assert.equal(normalizeContextScope({}).mode, CONTEXT_SCOPE_MODES.FOLLOW_ACTIVE);
  assert.equal(tabScopeId({}), 'follow-active');
});

test('pinned tab scope resolves the pinned tab instead of active tab', () => {
  const scope = normalizeContextScope({ mode: 'pinned-tab', pinnedTabId: 2 });
  assert.deepEqual(resolveContextTargetTab({ activeTab: tabs[0], tabs, scope }), tabs[1]);
});

test('pinned tab scope returns null when the pinned tab is gone', () => {
  const scope = normalizeContextScope({ mode: 'pinned-tab', pinnedTabId: 99 });
  assert.equal(resolveContextTargetTab({ activeTab: tabs[0], tabs, scope }), null);
});

test('pinned tab scope ignores active-tab switches but refreshes pinned-tab updates', () => {
  const scope = normalizeContextScope({ mode: 'pinned-tab', pinnedTabId: 2 });
  assert.equal(shouldRefreshForTabEvent({ scope, eventType: 'activated', eventTabId: 1 }), false);
  assert.equal(shouldRefreshForTabEvent({ scope, eventType: 'updated', eventTabId: 1 }), false);
  assert.equal(shouldRefreshForTabEvent({ scope, eventType: 'updated', eventTabId: 2 }), true);
});

test('scope storage keys isolate messages and sessions per pinned tab', () => {
  const scope = normalizeContextScope({ mode: 'pinned-tab', pinnedTabId: 2 });
  assert.equal(messageStorageKeyForScope(scope), 'hermesBrowserMessages:tab:2');
  assert.equal(sessionBindingKeyForScope(scope), 'hermesBrowserSession:tab:2');
});

test('filterPromptTabs keeps selected tab ids only and allows empty selections', () => {
  assert.deepEqual(filterPromptTabs(tabs, normalizeContextScope({ selectedTabIds: [2] })), [tabs[1]]);
  assert.deepEqual(filterPromptTabs(tabs, normalizeContextScope({ selectedTabIds: [] })), []);
  assert.deepEqual(filterPromptTabs(tabs, normalizeContextScope({ selectedTabIds: null })), tabs);
});
