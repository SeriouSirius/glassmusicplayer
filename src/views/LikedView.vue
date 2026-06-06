<script setup>
import { inject } from 'vue'
import { formatDuration } from '../utils/format.js'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const like = inject('like')
const player = inject('player')
const playLiked = inject('playLiked')
const playSong = inject('playSong')
const findSongById = inject('findSongById')

function getSongCover(s) {
  return s.al?.picUrl || s.album?.picUrl
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
    <h1 class="page-title">我喜欢的音乐</h1>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
    </button>
  </div>
  <div v-if="like.likedSongs.value.length" class="glass-card" style="padding:8px 0">
    <div style="padding:12px 16px;display:flex;gap:10px;margin-bottom:8px">
      <button class="btn btn-primary" @click="playLiked">
        <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
      </button>
      <span style="font-size:13px;color:var(--text-secondary);display:flex;align-items:center">{{ like.likedSongs.value.length }}首歌</span>
    </div>
    <div class="song-list">
      <div
        class="song-item"
        v-for="(s, i) in like.likedSongs.value"
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
        <div class="song-actions">
          <button class="song-action-btn liked" @click.stop="like.toggleLike(s.id, findSongById)">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state glass-card">
    <svg viewBox="0 0 24 24" fill="var(--text-tertiary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    <p>还没有喜欢的歌曲，去发现页面添加吧</p>
  </div>
</template>
