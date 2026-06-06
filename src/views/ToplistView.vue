<script setup>
import { inject } from 'vue'
import ErrorCard from '../components/ErrorCard.vue'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const toplist = inject('toplist')
const toplistError = inject('toplistError')
const loadToplist = inject('loadToplist')
const openPlaylist = inject('openPlaylist')
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">榜单</h1>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
    </button>
  </div>
  <ErrorCard v-if="toplistError" icon="📊" title="榜单加载失败" :description="toplistError" @retry="loadToplist" />
  <div v-else-if="toplist.length" class="toplist-grid">
    <div class="toplist-card" v-for="tl in toplist" :key="tl.id" @click="openPlaylist(tl.id, true)">
      <div class="toplist-card-header">
        <img class="toplist-card-cover" :src="tl.coverImgUrl" referrerpolicy="no-referrer" loading="lazy">
        <div>
          <div class="toplist-card-name">{{ tl.name }}</div>
          <div class="toplist-card-update">{{ tl.updateFrequency }}</div>
        </div>
      </div>
      <div class="toplist-card-tracks">
        <span v-for="(t, i) in (tl.tracks || []).slice(0, 3)" :key="i">{{ i + 1 }}. {{ t.first }} - {{ t.second }}</span>
      </div>
    </div>
  </div>
</template>
