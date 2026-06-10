<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { formatDuration, imgUrl } from '../utils/format.js'
import { api } from '../api/index.js'

const playSong = inject('playSong')
const player = inject('player')
const isLoggedIn = inject('isLoggedIn')

const songs = ref([])
const loading = ref(false)
const error = ref('')

async function loadDaily() {
  if (!isLoggedIn.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await api('/recommend/songs')
    songs.value = data?.data?.dailySongs || data?.recommend || []
  } catch (e) {
    console.error(e)
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function getCoverUrl(s) {
  return imgUrl(s.al?.picUrl || s.album?.picUrl || s.picUrl, 44)
}

function getSongArtist(s) {
  const ar = s.ar || s.artists
  if (!ar || !ar.length) return s.artistName || '未知歌手'
  return ar.map(a => a.name).join(' / ')
}

// Load when logged in; re-load if login state changes to true
watch(isLoggedIn, (v) => { if (v) loadDaily() })
onMounted(() => { if (isLoggedIn.value) loadDaily() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">每日推荐</h1>
    </div>
    <div class="song-list" v-if="!loading && songs.length">
      <div
        class="song-item"
        :class="{ playing: player.currentSong.value?.id === s.id }"
        v-for="(s, i) in songs"
        :key="s.id"
        @click="playSong(s)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="getCoverUrl(s)" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ s.name }}</div>
          <div class="song-artist">{{ getSongArtist(s) }}</div>
        </div>
        <div class="song-duration">{{ formatDuration(s.dt || s.duration) }}</div>
      </div>
    </div>
    <div v-else-if="loading" class="loading-wrap"><div class="loading-spinner"></div>加载中...</div>
    <div class="empty-state" v-else-if="!isLoggedIn">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      <p>请先登录以获取每日推荐</p>
    </div>
    <div class="empty-state" v-else-if="error">
      <p>{{ error }}</p>
    </div>
    <div class="empty-state" v-else>
      <p>暂无每日推荐</p>
    </div>
  </div>
</template>
