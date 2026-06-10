<script setup>
import { inject } from 'vue'
import { formatDuration, imgUrl } from '../utils/format.js'

const playSong = inject('playSong')
const player = inject('player')
const recentSongs = inject('recentSongs')

function getSongCover(s) {
  return imgUrl(s.al?.picUrl || s.album?.picUrl || s.picUrl, 44)
}

function getSongArtist(s) {
  const ar = s.ar || s.artists
  if (!ar || !ar.length) return s.artistName || '未知歌手'
  return ar.map(a => a.name).join(' / ')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">最近播放</h1>
    </div>
    <div class="song-list" v-if="recentSongs?.length">
      <div
        class="song-item"
        :class="{ playing: player.currentSong.value?.id === song.id }"
        v-for="(song, i) in recentSongs"
        :key="song.id"
        @click="playSong(song)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="getSongCover(song)" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ song.name }}</div>
          <div class="song-artist">{{ getSongArtist(song) }}</div>
        </div>
        <div class="song-duration">{{ formatDuration(song.dt || song.duration) }}</div>
      </div>
    </div>
    <div class="empty-state" v-else>
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7v4l5-5-5-5v4z"/></svg>
      <p>还没有播放记录</p>
    </div>
  </div>
</template>
