<script setup>
import { inject, ref, watch, nextTick } from 'vue'
import { imgUrl } from '../utils/format.js'

const player = inject('player')
const lyricsContainer = ref(null)

function getActiveLine() {
  if (!player.lyrics.value?.length) return -1
  for (let i = player.lyrics.value.length - 1; i >= 0; i--) {
    if (player.currentTime.value >= player.lyrics.value[i].time) return i
  }
  return -1
}

const activeLine = ref(-1)
watch(() => player.currentTime.value, () => {
  const idx = getActiveLine()
  if (idx !== activeLine.value) {
    activeLine.value = idx
    nextTick(() => {
      const el = lyricsContainer.value?.querySelector('.lyric-line.active')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
})
</script>

<template>
  <div class="lyrics-overlay" v-if="player.showLyrics.value">
    <button class="lyrics-close" @click="player.showLyrics.value = false">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    <img
      class="lyrics-cover"
      :src="imgUrl(player.currentSong.value?.al?.picUrl || player.currentSong.value?.album?.picUrl || player.currentSong.value?.picUrl, 280)"
      referrerpolicy="no-referrer"
    >
    <div class="lyrics-title">{{ player.currentSong.value?.name }}</div>
    <div class="lyrics-artist">{{ player.currentArtist?.value }}</div>
    <div class="lyrics-container" ref="lyricsContainer">
      <div
        v-if="player.lyrics.value?.length"
        v-for="(line, i) in player.lyrics.value"
        :key="i"
        class="lyric-line"
        :class="{ active: i === activeLine, passed: i < activeLine }"
      >{{ line.text }}</div>
      <div v-else class="lyric-line" style="opacity:0.4">暂无歌词</div>
    </div>
  </div>
</template>
