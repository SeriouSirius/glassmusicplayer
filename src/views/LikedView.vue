<script setup>
import { inject } from 'vue'
import { formatDuration, imgUrl } from '../utils/format.js'

const like = inject('like')
const playSong = inject('playSong')
const player = inject('player')
const findSongById = inject('findSongById')

function getSongCover(s) {
  return imgUrl(s.al?.picUrl || s.album?.picUrl, 44)
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
      <h1 class="page-title">我喜欢</h1>
    </div>
    <div class="song-list">
      <div
        class="song-item"
        :class="{ playing: player.currentSong.value?.id === song.id }"
        v-for="(song, i) in like.likedSongs.value"
        :key="song.id"
        @dblclick="playSong(song)"
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
    <div class="empty-state" v-if="!like.likedSongs.value.length">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <p>还没有喜欢的歌曲</p>
    </div>
  </div>
</template>
