<script setup>
import { inject, ref, watch, nextTick } from 'vue'

const player = inject('player')
const lyricsContainer = ref(null)

// Scroll active lyric into view
watch(() => player.lyricIndex.value, () => {
  if (player.showLyrics.value && lyricsContainer.value) {
    const ls = lyricsContainer.value.querySelectorAll('.lyric-line')
    if (ls[player.lyricIndex.value]) {
      ls[player.lyricIndex.value].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})
</script>

<template>
  <div class="lyrics-overlay" v-if="player.showLyrics.value" @click.self="player.showLyrics.value = false">
    <button class="lyrics-close" @click="player.showLyrics.value = false">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    <img
      class="lyrics-cover"
      :src="player.currentSong.value?.al?.picUrl || player.currentSong.value?.album?.picUrl || player.currentSong.value?.picUrl"
      referrerpolicy="no-referrer"
    >
    <div class="lyrics-title">{{ player.currentSong.value?.name }}</div>
    <div class="lyrics-artist">{{ player.currentArtist.value }}</div>
    <div class="lyrics-container" ref="lyricsContainer">
      <div
        class="lyric-line"
        v-for="(l, i) in player.parsedLyrics.value"
        :key="i"
        :class="{active: player.lyricIndex.value === i, passed: player.lyricIndex.value > i}"
      >{{ l.text }}</div>
      <div v-if="!player.parsedLyrics.value.length" style="color:var(--text-tertiary);padding:40px 0">暂无歌词</div>
    </div>
  </div>
</template>
