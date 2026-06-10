<script setup>
import { ref, onMounted, inject } from 'vue'
import { formatDuration, imgUrl } from '../utils/format.js'
import api from '../api/index.js'

const playSong = inject('playSong')
const player = inject('player')

const songs = ref([])
const loading = ref(false)

async function loadDaily() {
  loading.value = true
  try {
    const data = await api.getDailyRecommend()
    songs.value = data.data?.dailySongs || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function getCoverUrl(s) {
  return imgUrl(s.al?.picUrl || s.album?.picUrl || s.picUrl, 44)
}

onMounted(loadDaily)
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">每日推荐</h1>
    </div>
    <div class="song-list" v-if="!loading">
      <div
        class="song-item"
        :class="{ playing: player.currentSong.value?.id === s.id }"
        v-for="(s, i) in songs"
        :key="s.id"
        @dblclick="playSong(s)"
      >
        <span class="song-index">{{ i + 1 }}</span>
        <img class="song-cover" :src="getCoverUrl(s)" referrerpolicy="no-referrer" loading="lazy">
        <div class="song-info">
          <div class="song-name">{{ s.name }}</div>
          <div class="song-artist">{{ (s.ar || s.artists)?.map(a => a.name).join(' / ') }}</div>
        </div>
        <div class="song-duration">{{ formatDuration(s.dt || s.duration) }}</div>
      </div>
    </div>
    <div v-else class="loading-wrap"><div class="loading-spinner"></div>加载中...</div>
    <div class="empty-state" v-if="!loading && !songs.length">
      <p>暂无每日推荐，请先登录</p>
    </div>
  </div>
</template>
