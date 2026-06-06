<script setup>
import { inject } from 'vue'
import SongList from '../components/SongList.vue'
import ErrorCard from '../components/ErrorCard.vue'

const artistDetail = inject('artistDetail')
const artistTopSongs = inject('artistTopSongs')
const artistError = inject('artistError')
const playArtistTopSongs = inject('playArtistTopSongs')
const openArtist = inject('openArtist')
</script>

<template>
  <div class="artist-detail-header glass-card">
    <img class="artist-detail-avatar" :src="artistDetail.artist?.cover || artistDetail.artist?.picUrl || artistDetail.artist?.img1v1Url" referrerpolicy="no-referrer">
    <h1 class="artist-detail-name">{{ artistDetail.artist?.name }}</h1>
    <div class="artist-detail-brief" v-if="artistDetail.artist?.briefDesc">{{ artistDetail.artist.briefDesc }}</div>
    <div class="artist-detail-actions">
      <button class="btn btn-primary" @click="playArtistTopSongs">
        <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
      </button>
    </div>
  </div>
  <ErrorCard v-if="artistError" icon="🎤" title="歌手信息加载失败" :description="artistError" @retry="openArtist(artistDetail.artist?.id)" style="margin-top:20px" />
  <div v-else class="glass-card" style="padding:8px 0;margin-top:20px">
    <h3 style="padding:12px 16px 8px;font-size:16px;font-weight:600">热门歌曲</h3>
    <SongList :songs="artistTopSongs" />
  </div>
</template>
