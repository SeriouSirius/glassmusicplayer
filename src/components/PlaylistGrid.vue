<script setup>
import { inject } from 'vue'
import { formatCount, imgUrl } from '../utils/format.js'

const props = defineProps({ playlists: Array })
const openPlaylist = inject('openPlaylist')
</script>

<template>
  <div class="playlist-grid">
    <div class="playlist-card" v-for="pl in playlists" :key="pl.id" @click="openPlaylist(pl.id)">
      <div class="playlist-cover-wrap">
        <img :src="imgUrl(pl.picUrl || pl.coverImgUrl, 200)" :alt="pl.name" referrerpolicy="no-referrer" loading="lazy">
        <div class="playlist-play-count">
          <svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px"><path d="M8 5v14l11-7z"/></svg>{{ formatCount(pl.playCount) }}
        </div>
        <div class="playlist-play-btn">
          <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="playlist-name">{{ pl.name }}</div>
    </div>
  </div>
</template>
