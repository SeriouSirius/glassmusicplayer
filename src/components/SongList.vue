<script setup>
import { inject } from 'vue'
import { formatDuration, highlightText, imgUrl } from '../utils/format.js'

const props = defineProps({ songs: Array, query: { type: String, default: '' } })
const playSong = inject('playSong')
const player = inject('player')
const like = inject('like')
const findSongById = inject('findSongById')

function getSongCover(s) {
  return imgUrl(s.al?.picUrl || s.album?.picUrl || s.picUrl, 44)
}

function getSongArtist(s) {
  const ar = s.ar || s.artists
  if (!ar || !ar.length) return s.artistName || '未知歌手'
  return ar.map(a => a.name).join(' / ')
}

function getSongAlbum(s) {
  return s.al?.name || s.album?.name || ''
}

function handleToggleLike(song) {
  like.toggleLike(song.id, findSongById)
}
</script>

<template>
  <div class="song-list">
    <div
      class="song-item"
      :class="{ playing: player.currentSong.value?.id === song.id }"
      v-for="(song, i) in songs"
      :key="song.id"
      @click="playSong(song)"
    >
      <span class="song-index">{{ i + 1 }}</span>
      <img class="song-cover" :src="getSongCover(song)" referrerpolicy="no-referrer" loading="lazy">
      <div class="song-info">
        <div class="song-name" v-html="highlightText(song.name, query)"></div>
        <div class="song-artist">{{ getSongArtist(song) }}</div>
      </div>
      <div class="song-album">{{ getSongAlbum(song) }}</div>
      <div class="song-actions">
        <button
          class="song-action-btn"
          :class="{ liked: like.likedIds.value.has(song.id) }"
          @click.stop="handleToggleLike(song)"
          :title="like.likedIds.value.has(song.id) ? '取消喜欢' : '喜欢'"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
        <button class="song-action-btn" @click.stop="playSong(song)" title="播放">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <span v-if="!song.fee || song.fee === 0" class="song-no-source" style="display:none"></span>
      <div class="song-duration">{{ formatDuration(song.dt || song.duration) }}</div>
    </div>
  </div>
</template>
