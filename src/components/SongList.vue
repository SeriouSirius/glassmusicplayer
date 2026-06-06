<script setup>
import { inject } from 'vue'
import { formatDuration } from '../utils/format.js'

const props = defineProps({
  songs: { type: Array, required: true },
  showAlbum: { type: Boolean, default: true },
  startIndex: { type: Number, default: 0 }
})

const player = inject('player')
const like = inject('like')
const playSong = inject('playSong')
const findSongById = inject('findSongById')

function getSongCover(s) {
  return s.al?.picUrl || s.album?.picUrl || s.picUrl
}

function getSongArtist(s) {
  const a = s.ar || s.artists
  return a?.map(x => x.name).join(' / ') || ''
}

function getSongAlbum(s) {
  return s.al?.name || s.album?.name || ''
}

function getSongDuration(s) {
  return formatDuration(s.dt || s.duration)
}

function handleToggleLike(id) {
  like.toggleLike(id, findSongById)
}
</script>

<template>
  <div class="song-list">
    <div
      class="song-item"
      v-for="(s, i) in songs"
      :key="s.id"
      :class="{playing: player.currentSong.value?.id === s.id}"
      @click="playSong(s)"
    >
      <span class="song-index">{{ startIndex + i + 1 }}</span>
      <img class="song-cover" :src="getSongCover(s)" referrerpolicy="no-referrer" loading="lazy">
      <div class="song-info">
        <div class="song-name">{{ s.name }}</div>
        <div class="song-artist">{{ getSongArtist(s) }}</div>
      </div>
      <span class="song-album" v-if="showAlbum">{{ getSongAlbum(s) }}</span>
      <span class="song-duration">{{ getSongDuration(s) }}</span>
      <div class="song-actions">
        <button
          class="song-action-btn"
          :class="{liked: like.likedIds.value.has(s.id)}"
          @click.stop="handleToggleLike(s.id)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
