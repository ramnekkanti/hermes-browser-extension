export const CONTEXT_SCOPE_MODES = Object.freeze({
  FOLLOW_ACTIVE: 'follow-active',
  PINNED_TAB: 'pinned-tab',
});

export const DEFAULT_CONTEXT_SCOPE = Object.freeze({
  mode: CONTEXT_SCOPE_MODES.FOLLOW_ACTIVE,
  pinnedTabId: null,
  pinnedWindowId: null,
  pinnedTitle: '',
  pinnedUrl: '',
  selectedTabIds: null,
});

function finiteNumberOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeSelectedTabIds(value) {
  if (!Array.isArray(value)) return null;
  return [...new Set(value.map((item) => Number(item)).filter(Number.isFinite))];
}

export function normalizeContextScope(scope = {}) {
  const mode = scope?.mode === CONTEXT_SCOPE_MODES.PINNED_TAB
    ? CONTEXT_SCOPE_MODES.PINNED_TAB
    : CONTEXT_SCOPE_MODES.FOLLOW_ACTIVE;
  return {
    ...DEFAULT_CONTEXT_SCOPE,
    ...scope,
    mode,
    pinnedTabId: finiteNumberOrNull(scope?.pinnedTabId),
    pinnedWindowId: finiteNumberOrNull(scope?.pinnedWindowId),
    pinnedTitle: String(scope?.pinnedTitle || ''),
    pinnedUrl: String(scope?.pinnedUrl || ''),
    selectedTabIds: normalizeSelectedTabIds(scope?.selectedTabIds),
  };
}

export function tabScopeId(scope = DEFAULT_CONTEXT_SCOPE) {
  const normalized = normalizeContextScope(scope);
  return normalized.mode === CONTEXT_SCOPE_MODES.PINNED_TAB && normalized.pinnedTabId !== null
    ? `tab:${normalized.pinnedTabId}`
    : CONTEXT_SCOPE_MODES.FOLLOW_ACTIVE;
}

export function messageStorageKeyForScope(scope = DEFAULT_CONTEXT_SCOPE) {
  return `hermesBrowserMessages:${tabScopeId(scope)}`;
}

export function sessionBindingKeyForScope(scope = DEFAULT_CONTEXT_SCOPE) {
  return `hermesBrowserSession:${tabScopeId(scope)}`;
}

export function resolveContextTargetTab({ activeTab = null, tabs = [], scope = DEFAULT_CONTEXT_SCOPE } = {}) {
  const normalized = normalizeContextScope(scope);
  if (normalized.mode !== CONTEXT_SCOPE_MODES.PINNED_TAB) return activeTab;
  return tabs.find((tab) => Number(tab.id) === normalized.pinnedTabId) || null;
}

export function filterPromptTabs(tabs = [], scope = DEFAULT_CONTEXT_SCOPE) {
  const normalized = normalizeContextScope(scope);
  if (!Array.isArray(normalized.selectedTabIds)) return tabs;
  const ids = new Set(normalized.selectedTabIds);
  return tabs.filter((tab) => ids.has(Number(tab.id)));
}

export function shouldRefreshForTabEvent({ scope = DEFAULT_CONTEXT_SCOPE, eventTabId = null, eventType = 'activated' } = {}) {
  const normalized = normalizeContextScope(scope);
  if (normalized.mode !== CONTEXT_SCOPE_MODES.PINNED_TAB) return true;
  if (eventType === 'activated') return false;
  return Number(eventTabId) === normalized.pinnedTabId;
}

export function contextScopeFromTab(tab = {}, previousScope = DEFAULT_CONTEXT_SCOPE) {
  return normalizeContextScope({
    ...previousScope,
    mode: CONTEXT_SCOPE_MODES.PINNED_TAB,
    pinnedTabId: tab.id,
    pinnedWindowId: tab.windowId,
    pinnedTitle: tab.title || '',
    pinnedUrl: tab.url || '',
  });
}
