<script setup>
import { inject, computed } from 'vue'
import { formatCount } from '../utils/format.js'
import SongList from '../components/SongList.vue'
import ErrorCard from '../components/ErrorCard.vue'

const playlistDetail = inject('playlistDetail')
const playlistSongs = inject('playlistSongs')
const playlistError = inject('playlistError')
const isToplistDetail = inject('isToplistDetail')
const playPlaylist = inject('playPlaylist')
const openPlaylist = inject('openPlaylist')
const toggleSubscribePlaylist = inject('toggleSubscribePlaylist')
const isPlaylistSubscribed = inject('isPlaylistSubscribed')
const isLoggedIn = inject('isLoggedIn')
const userProfile = inject('userProfile')

// Hide subscribe button for own playlists and toplists
const showSubscribeBtn = computed(() => {
  if (isToplistDetail.value) return false
  if (!playlistDetail.value) return false
  if (isLoggedIn.value && userProfile.value?.userId === playlistDetail.value.userId) return false
  return true
})

const subscribed = computed(() =>
  playlistDetail.value ? isPlaylistSubscribed(playlistDetail.value.id) : false
)
</script>

<template>
  <div class="playlist-detail-header">
    <img class="playlist-detail-cover" :src="playlistDetail.coverImgUrl" referrerpolicy="no-referrer">
    <div class="playlist-detail-info">
      <span class="playlist-detail-tag">{{ isToplistDetail ? '榜單' : '歌單' }}</span>
      <h1 class="playlist-detail-name">{{ playlistDetail.name }}</h1>
      <div class="playlist-detail-meta">{{ playlistDetail.creator?.nickname }} · {{ playlistDetail.trackCount }}首 · {{ formatCount(playlistDetail.playCount) }}次播放</div>
      <div class="playlist-detail-desc" v-if="playlistDetail.description">{{ playlistDetail.description }}</div>
      <div class="playlist-detail-meta" v-if="isToplistDetail && playlistDetail.updateTime">更新時間：{{ new Date(playlistDetail.updateTime).toLocaleDateString() }}</div>
      <div class="playlist-detail-actions">
        <button class="btn btn-primary" @click="playPlaylist(playlistDetail.id)">
          <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg> 播放全部
        </button>
        <button
          v-if="showSubscribeBtn"
          class="btn"
          :class="subscribed ? 'btn-subscribed' : 'btn-glass'"
          @click="toggleSubscribePlaylist(playlistDetail)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px">
            <path v-if="subscribed" d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            <path v-else d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
          </svg>
          {{ subscribed ? '✓ 已收藏' : '收藏歌單' }}
        </button>
      </div>
    </div>
  </div>
  <ErrorCard v-if="playlistError" icon="🎵" title="歌單加载失败" :description="playlistError" @retry="openPlaylist(playlistDetail.id, isToplistDetail)" />
  <div v-else class="glass-card" style="padding:8px 0">
    <SongList :songs="playlistSongs" />
  </div>
</template>

<style scoped>
.btn-subscribed {
  background: var(--color-primary-highlight);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.btn-subscribed:hover {
  background: var(--color-error-highlight);
  color: var(--color-error);
  border-color: var(--color-error);
}
/* Hover hint: show 取消收藏 on hover */
.btn-subscribed:hover::after {
  content: '';
}
</style>
