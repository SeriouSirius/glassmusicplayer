<script setup>
import { inject } from 'vue'
import SongList from '../components/SongList.vue'
import AlbumCard from '../components/AlbumCard.vue'

const artistDetail = inject('artistDetail')
const playSong = inject('playSong')
</script>

<template>
  <div class="artist-detail-header glass-card">
    <!-- artist cover uses different CDN, no param resize -->
    <img class="artist-detail-avatar" :src="artistDetail.artist?.cover || artistDetail.artist?.picUrl || artistDetail.artist?.img1v1Url" referrerpolicy="no-referrer">
    <h1 class="artist-detail-name">{{ artistDetail.artist?.name }}</h1>
    <div class="artist-detail-brief" v-if="artistDetail.artist?.briefDesc">{{ artistDetail.artist.briefDesc }}</div>
    <div class="artist-detail-actions">
      <button class="btn btn-primary" @click="playSong(artistDetail.hotSongs?.[0], false, artistDetail.hotSongs)">播放热门</button>
    </div>
  </div>
  <div class="section" style="margin-top:28px">
    <div class="section-header"><span class="section-title">热门歌曲</span></div>
    <SongList :songs="artistDetail.hotSongs || []" />
  </div>
  <div class="section" v-if="artistDetail.albums?.length">
    <div class="section-header"><span class="section-title">专辑</span></div>
    <AlbumCard :albums="artistDetail.albums" />
  </div>
</template>
