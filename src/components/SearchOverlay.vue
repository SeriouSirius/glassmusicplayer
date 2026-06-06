<script setup>
import { inject, ref, nextTick, watch } from 'vue'

const showSearchOverlay = inject('showSearchOverlay')
const searchQuery = inject('searchQuery')
const hotSearches = inject('hotSearches')
const doSearch = inject('doSearch')

const overlaySearchInput = ref(null)

watch(showSearchOverlay, (v) => {
  if (v) nextTick(() => overlaySearchInput.value?.focus())
})

function handleSearch() {
  doSearch()
  showSearchOverlay.value = false
}

function handleHotTag(word) {
  searchQuery.value = word
  handleSearch()
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
          @keyup.enter="handleSearch"
          ref="overlaySearchInput"
        >
      </div>
      <div class="search-panel-body" v-if="!searchQuery">
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
