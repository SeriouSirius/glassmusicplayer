<script setup>
import { inject } from 'vue'
import { formatDuration } from '../utils/format.js'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const fmSongs = inject('fmSongs')
const fmLoading = inject('fmLoading')
const loadFM = inject('loadFM')
const playSong = inject('playSong')
const player = inject('player')
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">私人FM</h1>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="btn btn-primary" @click="loadFM" :disabled="fmLoading">
        <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> 换一批
      </button>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
        <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
      </button>
    </div>
  </div>
  <div v-if="fmSongs.length" class="glass-card" style="padding:8px 0">
    <div class="song-list">
      <div
        class="song-item"
        v-for="(s, i) in fmSongs"
        :key="s.id"
        :class="{playing: player.currentSong.value?.id === s.id}"
        @click="playSong(s, true)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="s.album?.picUrl" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ s.name }}</div>
          <div class="song-artist">{{ s.artists?.map(a => a.name).join(' / ') }}</div>
        </div>
        <span class="song-duration">{{ formatDuration(s.duration) }}</span>
      </div>
    </div>
  </div>
  <div v-else class="empty-state glass-card"><p>点击"换一批"发现新音乐</p></div>
</template>
