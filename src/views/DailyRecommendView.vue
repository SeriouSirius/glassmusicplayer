<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { api } from '../api/index.js'

const songs = ref([])
const isLoading = ref(true)
const error = ref('')

const displaySongs = computed(() => songs.value.slice(0, 30))

const playSong = inject('playSong')
const player = inject('player')
const like = inject('like')
const findSongById = inject('findSongById')

const todayBadge = (() => {
  const now = new Date()
  return `${now.getMonth() + 1}/${now.getDate()}`
})()

onMounted(async () => {
  try {
    const r = await api('/recommend/songs')
    songs.value = r.data?.dailySongs || []
  } catch (e) {
    error.value = '無法載入每日推薦，請確認已登入'
  } finally {
    isLoading.value = false
  }
})

function playAll() {
  if (displaySongs.value.length)
    playSong(displaySongs.value[0], false, displaySongs.value, 0)
}

function handlePlay(song, index) {
  playSong(song, false, displaySongs.value, index)
}

function getSongArtist(s) {
  return (s.ar || s.artists)?.map(a => a.name).join(' / ') || ''
}

function getSongAlbum(s) {
  return s.al?.name || s.album?.name || ''
}

function getCoverUrl(s) {
  const url = s.al?.picUrl || s.album?.picUrl || s.picUrl || ''
  return url ? `${url}?param=40y40` : ''
}

function getDuration(s) {
  const ms = s.dt || s.duration || 0
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
}

function handleToggleLike(id) {
  like.toggleLike(id, findSongById)
}
</script>

<template>
  <div>
    <div class="playlist-detail-header">
      <div class="daily-date-cover">
        <span class="date-number">{{ todayBadge }}</span>
        <span class="date-label">每日推薦</span>
      </div>
      <div class="playlist-detail-info">
        <span class="playlist-detail-tag">每日推薦</span>
        <h1 class="playlist-detail-name">每日推薦</h1>
        <div class="playlist-detail-meta">根據你的音樂品味，每天更新
          <template v-if="displaySongs.length"> · {{ displaySongs.length }}首</template>
        </div>
        <div class="playlist-detail-actions" v-if="displaySongs.length">
          <button class="btn btn-primary" @click="playAll">
            <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M8 5v14l11-7z"/></svg>
            播放全部
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="glass-card" style="padding:8px 0">
      <div class="song-list">
        <div v-for="i in 10" :key="i" class="song-item">
          <span class="song-index"><span class="skeleton-inline" style="width:16px;height:14px;border-radius:3px"></span></span>
          <div class="skeleton-inline" style="width:40px;height:40px;border-radius:6px;flex-shrink:0"></div>
          <div class="song-info">
            <div class="skeleton-inline" style="width:55%;height:13px;border-radius:3px;margin-bottom:6px"></div>
            <div class="skeleton-inline" style="width:35%;height:11px;border-radius:3px"></div>
          </div>
          <div class="skeleton-inline" style="width:30%;height:12px;border-radius:3px"></div>
          <div class="skeleton-inline" style="width:36px;height:12px;border-radius:3px"></div>
          <div class="song-actions"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 32px;color:var(--color-text-muted);text-align:center">
      <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style="color:var(--color-text-faint)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      <p>{{ error }}</p>
    </div>

    <!-- 歌曲列表 -->
    <div v-else class="glass-card" style="padding:8px 0">
      <div class="song-list">
        <div
          class="song-item"
          v-for="(s, i) in displaySongs"
          :key="s.id"
          :class="{ playing: player.currentSong.value?.id === s.id }"
          @click="handlePlay(s, i)"
        >
          <span class="song-index">{{ i + 1 }}</span>
          <img
            class="song-cover"
            :src="getCoverUrl(s)"
            :alt="getSongAlbum(s)"
            referrerpolicy="no-referrer"
            loading="lazy"
          />
          <div class="song-info">
            <div class="song-name">{{ s.name }}</div>
            <div class="song-artist">{{ getSongArtist(s) }}</div>
          </div>
          <span class="song-album">{{ getSongAlbum(s) }}</span>
          <span class="song-duration">{{ getDuration(s) }}</span>
          <div class="song-actions">
            <button
              class="song-action-btn"
              :class="{ liked: like.likedIds.value.has(s.id) }"
              @click.stop="handleToggleLike(s.id)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-date-cover {
  width: 140px;
  height: 140px;
  min-width: 140px;
  background: var(--color-primary, #01696f);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.date-number {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.date-label {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 4px;
  letter-spacing: 0.05em;
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton-inline {
  background: linear-gradient(
    90deg,
    var(--color-surface-offset, #edeae5) 25%,
    var(--color-surface-dynamic, #e6e4df) 50%,
    var(--color-surface-offset, #edeae5) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 3px;
  display: inline-block;
}

@media (max-width: 768px) {
  .daily-date-cover {
    width: 90px;
    height: 90px;
    min-width: 90px;
  }
  .date-number { font-size: 2rem; }
}
</style>
