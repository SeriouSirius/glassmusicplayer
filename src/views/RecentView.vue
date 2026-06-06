<script setup>
import { inject } from 'vue'
import { formatDuration } from '../utils/format.js'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const recentSongs = inject('recentSongs')
const player = inject('player')
const playRecent = inject('playRecent')
const playSong = inject('playSong')

function getSongCover(s) {
  return s.al?.picUrl || s.album?.picUrl || s.picUrl
}

function getSongArtist(s) {
  const a = s.ar || s.artists
  return a?.map(x => x.name).join(' / ') || ''
}

function getSongDuration(s) {
  return formatDuration(s.dt || s.duration)
}
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">最近播放</h1>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
    </button>
  </div>
  <div v-if="recentSongs.length" class="glass-card" style="padding:8px 0">
    <div style="padding:12px 16px;display:flex;gap:10px;margin-bottom:8px">
      <button class="btn btn-primary" @click="playRecent">
        <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
      </button>
    </div>
    <div class="song-list">
      <div
        class="song-item"
        v-for="(s, i) in recentSongs"
        :key="s.id"
        :class="{playing: player.currentSong.value?.id === s.id}"
        @click="playSong(s)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="getSongCover(s)" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ s.name }}</div>
          <div class="song-artist">{{ getSongArtist(s) }}</div>
        </div>
        <span class="song-duration">{{ getSongDuration(s) }}</span>
      </div>
    </div>
  </div>
  <div v-else class="empty-state glass-card"><p>暂无播放记录</p></div>
</template>
