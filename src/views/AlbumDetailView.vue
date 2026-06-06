<script setup>
import { inject } from 'vue'
import SongList from '../components/SongList.vue'
import ErrorCard from '../components/ErrorCard.vue'

const albumDetail = inject('albumDetail')
const albumSongs = inject('albumSongs')
const albumError = inject('albumError')
const playAlbumSongs = inject('playAlbumSongs')
const openAlbum = inject('openAlbum')
</script>

<template>
  <div class="album-detail-header">
    <img class="album-detail-cover" :src="albumDetail.album?.picUrl || albumDetail.album?.blurPicUrl" referrerpolicy="no-referrer">
    <div class="album-detail-info">
      <span class="album-detail-tag">专辑</span>
      <h1 class="album-detail-name">{{ albumDetail.album?.name }}</h1>
      <div class="album-detail-meta">{{ albumDetail.album?.artist?.name }} · {{ albumDetail.album?.publishTime ? new Date(albumDetail.album.publishTime).toLocaleDateString() : '' }}</div>
      <div class="album-detail-desc" v-if="albumDetail.album?.description">{{ albumDetail.album.description }}</div>
      <div class="album-detail-actions">
        <button class="btn btn-primary" @click="playAlbumSongs">
          <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
        </button>
      </div>
    </div>
  </div>
  <ErrorCard v-if="albumError" icon="💿" title="专辑加载失败" :description="albumError" @retry="openAlbum(albumDetail.album?.id)" />
  <div v-else class="glass-card" style="padding:8px 0">
    <SongList :songs="albumSongs" :show-album="false" />
  </div>
</template>
