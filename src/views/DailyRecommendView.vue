<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/index.js'

const songs = ref([])
const isLoading = ref(true)
const error = ref('')

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
        v-if="songs.length"
        class="play-all-btn"
        @click="emit('play-song', songs[0], songs)"
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
      <div v-for="i in 15" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-index"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-artist"></div>
        </div>
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
    <ul v-else class="song-list" role="list">
      <li
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-row"
        @click="emit('play-song', song, songs)"
        role="button"
        tabindex="0"
        @keyup.enter="emit('play-song', song, songs)"
      >
        <span class="song-index">{{ index + 1 }}</span>
        <img
          :src="song.al?.picUrl + '?param=48y48'"
          :alt="song.al?.name"
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
  padding: var(--space-6) var(--space-8);
  max-width: var(--content-wide);
}

.daily-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-divider);
}

.daily-date {
  width: 72px;
  height: 72px;
  background: var(--color-primary);
  border-radius: var(--radius-lg);
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
}

.daily-meta {
  flex: 1;
}

.daily-meta h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.meta-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-interactive);
}

.play-all-btn:hover {
  background: var(--color-primary-hover);
}

/* Skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-offset) 25%,
    var(--color-surface-dynamic) 50%,
    var(--color-surface-offset) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-list { display: flex; flex-direction: column; gap: var(--space-2); }

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-2);
}

.skeleton-index { width: 24px; height: 14px; flex-shrink: 0; }
.skeleton-info { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
.skeleton-title { height: 14px; width: 55%; }
.skeleton-artist { height: 12px; width: 35%; }
.skeleton-duration { width: 36px; height: 12px; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16);
  color: var(--color-text-muted);
  text-align: center;
}

.empty-icon { color: var(--color-text-faint); }

/* Song list */
.song-list { list-style: none; }

.song-row {
  display: grid;
  grid-template-columns: 32px 40px 1fr 1fr 52px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-interactive);
}

.song-row:hover { background: var(--color-surface-offset); }
.song-row:active { background: var(--color-surface-dynamic); }

.song-index {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.song-name {
  font-size: var(--text-sm);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .daily-view { padding: var(--space-4); }
  .song-album { display: none; }
  .song-row {
    grid-template-columns: 28px 40px 1fr 44px;
  }
}
</style>
