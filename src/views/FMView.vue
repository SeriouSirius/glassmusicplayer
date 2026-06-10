<script setup>
import { ref, onMounted, inject } from 'vue'
import { imgUrl } from '../utils/format.js'
import api from '../api/index.js'

const playSong = inject('playSong')
const player = inject('player')

const songs = ref([])
const loading = ref(false)

async function loadFM() {
  loading.value = true
  try {
    const data = await api.getPersonalFM()
    songs.value = (data.data || []).map(s => ({
      id: s.id, name: s.name,
      ar: s.artists, al: s.album,
      dt: s.duration,
      picUrl: s.album?.picUrl
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadFM)
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">私人FM</h1>
      <button class="btn btn-glass" @click="loadFM" :disabled="loading">换一批</button>
    </div>
    <div class="song-list" v-if="!loading">
      <div
        class="song-item"
        :class="{ playing: player.currentSong.value?.id === s.id }"
        v-for="(s, i) in songs"
        :key="s.id"
        @dblclick="playSong(s, true)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="imgUrl(s.album?.picUrl, 44)" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ s.name }}</div>
          <div class="song-artist">{{ s.artists?.map(a => a.name).join(' / ') }}</div>
        </div>
      </div>
    </div>
    <div v-else class="loading-wrap"><div class="loading-spinner"></div>加载中...</div>
  </div>
</template>
