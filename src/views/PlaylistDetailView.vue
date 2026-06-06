<script setup>
import { inject } from 'vue'
import { formatCount } from '../utils/format.js'
import SongList from '../components/SongList.vue'
import ErrorCard from '../components/ErrorCard.vue'

const playlistDetail = inject('playlistDetail')
const playlistSongs = inject('playlistSongs')
const playlistError = inject('playlistError')
const isToplistDetail = inject('isToplistDetail')
const playPlaylist = inject('playPlaylist')
const openPlaylist = inject('openPlaylist')
const collectPlaylist = inject('collectPlaylist')
</script>

<template>
  <div class="playlist-detail-header">
    <img class="playlist-detail-cover" :src="playlistDetail.coverImgUrl" referrerpolicy="no-referrer">
    <div class="playlist-detail-info">
      <span class="playlist-detail-tag">{{ isToplistDetail ? '榜单' : '歌单' }}</span>
      <h1 class="playlist-detail-name">{{ playlistDetail.name }}</h1>
      <div class="playlist-detail-meta">{{ playlistDetail.creator?.nickname }} · {{ playlistDetail.trackCount }}首 · {{ formatCount(playlistDetail.playCount) }}次播放</div>
      <div class="playlist-detail-desc" v-if="playlistDetail.description">{{ playlistDetail.description }}</div>
      <div class="playlist-detail-meta" v-if="isToplistDetail && playlistDetail.updateTime">更新时间：{{ new Date(playlistDetail.updateTime).toLocaleDateString() }}</div>
      <div class="playlist-detail-actions">
        <button class="btn btn-primary" @click="playPlaylist(playlistDetail.id)">
          <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
        </button>
        <button class="btn btn-glass" @click="collectPlaylist">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg> 收藏歌单
        </button>
      </div>
    </div>
  </div>
  <ErrorCard v-if="playlistError" icon="🎵" title="歌单加载失败" :description="playlistError" @retry="openPlaylist(playlistDetail.id, isToplistDetail)" />
  <div v-else class="glass-card" style="padding:8px 0">
    <SongList :songs="playlistSongs" />
  </div>
</template>
