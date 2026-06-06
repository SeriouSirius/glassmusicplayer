<script setup>
import { inject, ref, nextTick, watch } from 'vue'
import { api } from '../api/index.js'

const showSearchOverlay = inject('showSearchOverlay')
const searchQuery = inject('searchQuery')
const hotSearches = inject('hotSearches')
const doSearch = inject('doSearch')

const overlaySearchInput = ref(null)
const suggestions = ref([])
const activeSuggestion = ref(-1)
let debounceTimer = null

watch(showSearchOverlay, (v) => {
  if (v) nextTick(() => overlaySearchInput.value?.focus())
  if (!v) { suggestions.value = []; activeSuggestion.value = -1 }
})

function handleSearch(query) {
  if (query !== undefined) searchQuery.value = query
  suggestions.value = []
  activeSuggestion.value = -1
  doSearch()
  showSearchOverlay.value = false
}

function handleHotTag(word) {
  handleSearch(word)
}

function onInput() {
  activeSuggestion.value = -1
  clearTimeout(debounceTimer)
  if (!searchQuery.value.trim()) {
    suggestions.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    try {
      const r = await api('/search/suggest?keywords=' + encodeURIComponent(searchQuery.value) + '&type=mobile')
      suggestions.value = r?.result?.allMatch?.slice(0, 8).map(s => s.keyword) || []
    } catch (e) {
      suggestions.value = []
    }
  }, 300)
}

function onKeydown(e) {
  if (!suggestions.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeSuggestion.value = Math.min(activeSuggestion.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeSuggestion.value = Math.max(activeSuggestion.value - 1, -1)
  } else if (e.key === 'Enter') {
    if (activeSuggestion.value >= 0) {
      e.preventDefault()
      handleSearch(suggestions.value[activeSuggestion.value])
    }
    // activeSuggestion === -1: fall through to normal Enter → handleSearch() via @keyup.enter
  } else if (e.key === 'Escape') {
    suggestions.value = []
    activeSuggestion.value = -1
  }
}
</script>

<template>
  <div class="search-overlay" v-if="showSearchOverlay" @click.self="showSearchOverlay = false">
    <div class="search-panel">
      <div class="search-panel-header">
        <input
          class="search-panel-input"
          v-model="searchQuery"
          placeholder="搜索歌曲、歌手、专辑..."
          @input="onInput"
          @keydown="onKeydown"
          @keyup.enter="activeSuggestion < 0 && handleSearch()"
          ref="overlaySearchInput"
          autocomplete="off"
        >
      </div>

      <!-- Autocomplete suggestions -->
      <div class="search-suggestions" v-if="searchQuery.trim() && suggestions.length">
        <div
          v-for="(s, i) in suggestions"
          :key="i"
          class="suggestion-item"
          :class="{ active: activeSuggestion === i }"
          @mousedown.prevent="handleSearch(s)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px;flex-shrink:0;opacity:0.45"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>{{ s }}</span>
        </div>
      </div>

      <!-- Hot searches (shown when input is empty) -->
      <div class="search-panel-body" v-else-if="!searchQuery.trim()">
        <div style="padding:4px 12px 12px;font-size:13px;font-weight:600;color:var(--text-secondary)">热门搜索</div>
        <div class="hot-tags">
          <span
            class="hot-tag"
            v-for="h in hotSearches.slice(0, 10)"
            :key="h.searchWord"
            @click="handleHotTag(h.searchWord)"
          >{{ h.searchWord }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-suggestions {
  border-top: 1px solid var(--border);
  padding: 4px 0;
}
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0;
  transition: background 0.12s;
}
.suggestion-item:hover,
.suggestion-item.active {
  background: var(--hover-bg, rgba(128,128,128,0.08));
}
.suggestion-item span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
