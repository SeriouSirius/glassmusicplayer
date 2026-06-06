<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../api/index.js'

const songs = ref([])
const isLoading = ref(true)
const error = ref('')

// Bug 3: 限制 30 首
const displaySongs = computed(() => songs.value.slice(0, 30))

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

const emit = defineEmits(['play-song'])

// Bug 2: 傳入正確的 index、列表也統一用 displaySongs
function playSong(song, index) {
  emit('play-song', song, displaySongs.value, index)
}

function playAll() {
  emit('play-song', displaySongs.value[0], displaySongs.value, 0)
}
</script>

<template>
  <div class="daily-view">
    <div class="daily-header">
      <div class="daily-date">
        <span class="date-number">{{ new Date().getDate() }}</span>
        <span class="date-label">每日推薦</span>
      </div>
      <div class="daily-meta">
        <h1>每日推薦</h1>
        <p class="meta-desc">根據你的音樂品味，每天更新</p>
      </div>
      <button
        v-if="displaySongs.length"
        class="play-all-btn"
        @click="playAll"
        aria-label="播放全部"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M8 5v14l11-7z"/>
        </svg>
        播放全部
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="isLoading" class="skeleton-list">
      <div v-for="i in 10" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-index"></div>
        <div class="skeleton skeleton-cover"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-artist"></div>
        </div>
        <div class="skeleton skeleton-album"></div>
        <div class="skeleton skeleton-duration"></div>
      </div>
    </div>

    <!-- 錯誤 -->
    <div v-else-if="error" class="empty-state">
      <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" class="empty-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>{{ error }}</p>
    </div>

    <!-- 歌曲列表 -->
    <ul v-else class="song-list">
      <li
        v-for="(song, index) in displaySongs"
        :key="song.id"
        class="song-row"
        @click="playSong(song, index)"
        role="button"
        tabindex="0"
        @keyup.enter="playSong(song, index)"
      >
        <span class="song-index">{{ index + 1 }}</span>
        <img
          :src="(song.al?.picUrl || '') + '?param=40y40'"
          :alt="song.al?.name || ''"
          class="song-cover"
          width="40" height="40"
          loading="lazy"
        />
        <div class="song-info">
          <span class="song-name">{{ song.name }}</span>
          <span class="song-artist">{{ song.ar?.map(a => a.name).join(' / ') }}</span>
        </div>
        <span class="song-album">{{ song.al?.name }}</span>
        <span class="song-duration">
          {{ Math.floor(song.dt / 60000) }}:{{ String(Math.floor((song.dt % 60000) / 1000)).padStart(2, '0') }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.daily-view {
  padding: 24px 32px;
  max-width: 1200px;
  box-sizing: border-box;
}

.daily-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-divider, rgba(0,0,0,0.1));
}

.daily-date {
  width: 72px;
  height: 72px;
  background: var(--color-primary, #01696f);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.date-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.date-label {
  font-size: 0.625rem;
  opacity: 0.85;
  margin-top: 2px;
  letter-spacing: 0.05em;
}

.daily-meta { flex: 1; }

.daily-meta h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text, #28251d);
  margin: 0 0 4px;
}

.meta-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted, #7a7974);
  margin: 0;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: var(--color-primary, #01696f);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 180ms ease;
  flex-shrink: 0;
}

.play-all-btn:hover {
  background: var(--color-primary-hover, #0c4e54);
}

/* Skeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-offset, #edeae5) 25%,
    var(--color-surface-dynamic, #e6e4df) 50%,
    var(--color-surface-offset, #edeae5) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-row {
  display: grid;
  grid-template-columns: 32px 40px 1fr 1fr 52px;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.skeleton-index   { height: 14px; }
.skeleton-cover   { width: 40px; height: 40px; border-radius: 6px; }
.skeleton-info    { display: flex; flex-direction: column; gap: 6px; }
.skeleton-title   { height: 13px; width: 55%; }
.skeleton-artist  { height: 11px; width: 35%; }
.skeleton-album   { height: 12px; width: 70%; }
.skeleton-duration{ height: 12px; width: 36px; justify-self: end; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 32px;
  color: var(--color-text-muted, #7a7974);
  text-align: center;
}

.empty-icon { color: var(--color-text-faint, #bab9b4); }

/* Song list */
.song-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.song-row {
  display: grid;
  grid-template-columns: 32px 40px 1fr 1fr 52px;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 180ms ease;
  outline: none;
}

.song-row:hover  { background: var(--color-surface-offset, #edeae5); }
.song-row:active { background: var(--color-surface-dynamic, #e6e4df); }
.song-row:focus-visible { outline: 2px solid var(--color-primary, #01696f); }

.song-index {
  font-size: 0.8125rem;
  color: var(--color-text-faint, #bab9b4);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-surface-offset, #edeae5);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.song-name {
  font-size: 0.875rem;
  color: var(--color-text, #28251d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.song-artist {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7a7974);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7a7974);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 0.75rem;
  color: var(--color-text-faint, #bab9b4);
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .daily-view { padding: 16px; }

  .song-row {
    grid-template-columns: 28px 40px 1fr 44px;
  }

  .song-album { display: none; }
}
</style>
