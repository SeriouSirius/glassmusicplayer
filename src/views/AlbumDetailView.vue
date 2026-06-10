<script setup>
import { inject } from 'vue'
import { imgUrl } from '../utils/format.js'
import SongList from '../components/SongList.vue'

const albumDetail = inject('albumDetail')
const playSong = inject('playSong')
const player = inject('player')

function playAll() {
  if (albumDetail.value?.songs?.length) playSong(albumDetail.value.songs[0], false, albumDetail.value.songs)
}
</script>

<template>
  <div class="album-detail-header">
    <img
      class="album-detail-cover"
      :src="imgUrl(albumDetail.album?.picUrl || albumDetail.album?.blurPicUrl, 200)"
      referrerpolicy="no-referrer"
    >
    <div class="album-detail-info">
      <span class="album-detail-tag">专辑</span>
      <h1 class="album-detail-name">{{ albumDetail.album?.name }}</h1>
      <div class="album-detail-meta">{{ albumDetail.album?.artist?.name }} · {{ albumDetail.album?.publishTime ? new Date(albumDetail.album.publishTime).getFullYear() : '' }}</div>
      <div class="album-detail-desc" v-if="albumDetail.album?.description">{{ albumDetail.album.description }}</div>
      <div class="album-detail-actions">
        <button class="btn btn-primary" @click="playAll">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>播放全部
        </button>
      </div>
    </div>
  </div>
  <SongList :songs="albumDetail.songs || []" />
</template>
