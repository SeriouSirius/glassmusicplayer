<script setup>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue'
import { formatTime } from '../utils/format.js'

const player = inject('player')
const like = inject('like')
const findSongById = inject('findSongById')

const progressBar = ref(null)
const volumeBar = ref(null)
const showQualityMenu = ref(false)
const qualityMenuRef = ref(null)

function handleSeekTo(e) {
  player.seekTo(e, progressBar.value)
}
function handleProgressHover(e) {
  player.onProgressHover(e, progressBar.value)
}
function handleSetVolume(e) {
  player.setVolume(e, volumeBar.value)
}
function handleToggleLike() {
  if (!player.currentSong.value) return
  like.toggleLike(player.currentSong.value.id, findSongById)
}
function selectQuality(q) {
  player.setAudioQuality(q)
  showQualityMenu.value = false
}
function handleClickOutside(e) {
  if (qualityMenuRef.value && !qualityMenuRef.value.contains(e.target)) {
    showQualityMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="player-pill">
    <!-- 未播放 placeholder -->
    <template v-if="!player.currentSong.value">
      <div class="pill-placeholder">
        <div class="pill-placeholder-cover">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="opacity:0.4">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="pill-placeholder-text">
          <span class="pill-placeholder-title">選擇一首歌曲開始播放</span>
        </div>
        <div class="pill-placeholder-controls">
          <button class="pill-btn pill-btn-play" disabled>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
    </template>

    <!-- 播放中 -->
    <template v-else>
      <!-- 封面 + 歌曲資訊 -->
      <div class="pill-song">
        <img
          class="pill-cover"
          :class="{ spinning: player.isPlaying.value }"
          :src="player.currentSong.value.al?.picUrl || player.currentSong.value.album?.picUrl || player.currentSong.value.picUrl"
          referrerpolicy="no-referrer"
          @click="player.showLyrics.value = true"
          alt=""
        />
        <div class="pill-song-info">
          <div class="pill-song-name">{{ player.currentSong.value.name }}</div>
          <div class="pill-song-artist">{{ player.currentArtist.value }}</div>
        </div>
        <button
          class="pill-like"
          :class="{ liked: like.likedIds.value.has(player.currentSong.value.id) }"
          @click="handleToggleLike"
          :title="like.likedIds.value.has(player.currentSong.value.id) ? '移出我喜歡' : '加入我喜歡'"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <!-- 進度暉 -->
      <div class="pill-progress-row" @mousemove="handleProgressHover" @mouseleave="player.progressHoverX.value = -1">
        <span class="pill-time">{{ formatTime(player.currentTime.value) }}</span>
        <div class="pill-progress" @click="handleSeekTo" ref="progressBar">
          <div class="pill-progress-fill" :style="{ width: player.progressPercent.value + '%' }">
            <div class="pill-progress-thumb"></div>
          </div>
          <div
            class="pill-progress-bubble"
            v-if="player.progressHoverX.value >= 0"
            :style="{ left: player.progressHoverX.value + 'px' }"
          >{{ formatTime(player.progressHoverTime.value) }}</div>
        </div>
        <span class="pill-time">{{ formatTime(player.duration.value) }}</span>
      </div>

      <!-- 控制按鈕第 + 音量質量 -->
      <div class="pill-controls">
        <button
          class="pill-btn"
          @click="player.playMode.value = player.playMode.value === 'loop' ? 'shuffle' : player.playMode.value === 'shuffle' ? 'single' : 'loop'"
          :title="player.playModeText.value"
        >
          <svg v-if="player.playMode.value === 'loop'" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          <svg v-if="player.playMode.value === 'shuffle'" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          <svg v-if="player.playMode.value === 'single'" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">1</text></svg>
        </button>

        <button class="pill-btn" @click="player.prevSong" title="上一首">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>

        <button class="pill-btn pill-btn-play" @click="player.togglePlay">
          <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <button class="pill-btn" @click="player.manualNextSong" title="下一首">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>

        <button class="pill-btn" @click="player.showLyrics.value = !player.showLyrics.value" title="歌詞">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        </button>

        <div class="pill-divider"></div>

        <!-- 音量 -->
        <div class="pill-volume">
          <button class="pill-btn" style="width:28px;height:28px" @click="player.toggleMute" title="靜音">
            <svg v-if="player.volume.value > 0" viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          </button>
          <div class="pill-volume-bar" @click="handleSetVolume" ref="volumeBar">
            <div class="pill-volume-fill" :style="{ width: player.volume.value * 100 + '%' }"></div>
          </div>
        </div>

        <!-- 音質 -->
        <div class="pill-quality" ref="qualityMenuRef">
          <button class="pill-btn pill-quality-btn" @click.stop="showQualityMenu = !showQualityMenu">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span>{{ player.qualityLabel.value }}</span>
          </button>
          <div class="pill-quality-menu" v-if="showQualityMenu">
            <div
              class="pill-quality-item"
              :class="{ active: player.audioQuality.value === q.value }"
              v-for="q in player.qualityOptions"
              :key="q.value"
              @click.stop="selectQuality(q.value)"
            >{{ q.label }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Floating pill shell ─────────────────────────────────────────────────────── */
.player-pill {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 10px 16px;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.18),
    0 1px 4px oklch(0 0 0 / 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  /* clamp width: min 320px, natural, max 860px */
  max-width: min(860px, calc(100vw - 48px));
  min-width: 320px;
}

/* ── Placeholder state ──────────────────────────────────────────────────────── */
.pill-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 280px;
}
.pill-placeholder-cover {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: var(--color-surface-offset);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pill-placeholder-text {
  flex: 1;
  overflow: hidden;
}
.pill-placeholder-title {
  font-size: 0.8125rem;
  color: var(--color-text-faint);
  white-space: nowrap;
}
.pill-placeholder-controls {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ── Song info (left) ────────────────────────────────────────────────────────── */
.pill-song {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  max-width: 220px;
}
.pill-cover {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  object-fit: cover;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.3s;
}
.pill-cover:hover { transform: scale(1.05); }
@keyframes spin { to { transform: rotate(360deg); } }
.pill-cover.spinning { animation: spin 8s linear infinite; }
.pill-song-info {
  overflow: hidden;
}
.pill-song-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.pill-song-artist {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.pill-like {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s, background 0.18s;
  flex-shrink: 0;
}
.pill-like:hover { color: var(--color-error); background: var(--color-error-highlight); }
.pill-like.liked { color: var(--color-error); }

/* ── Progress row (middle) ───────────────────────────────────────────────────── */
.pill-progress-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}
.pill-time {
  font-size: 0.6875rem;
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
}
.pill-progress {
  flex: 1;
  height: 4px;
  background: var(--color-surface-offset);
  border-radius: 9999px;
  cursor: pointer;
  position: relative;
  overflow: visible;
}
.pill-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
  position: relative;
  transition: width 0.1s linear;
}
.pill-progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  transition: transform 0.15s;
}
.pill-progress:hover .pill-progress-thumb { transform: translateY(-50%) scale(1); }
.pill-progress-bubble {
  position: absolute;
  top: -24px;
  transform: translateX(-50%);
  background: var(--color-surface-offset);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid var(--color-border);
}

/* ── Controls (right) ───────────────────────────────────────────────────────── */
.pill-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.pill-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}
.pill-btn:hover:not(:disabled) {
  background: var(--color-surface-offset);
  color: var(--color-text);
}
.pill-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.pill-btn-play {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
}
.pill-btn-play:hover:not(:disabled) {
  background: var(--color-primary-hover);
  color: #fff;
}

.pill-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 4px;
  flex-shrink: 0;
}

/* 音量 */
.pill-volume {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pill-volume-bar {
  width: 64px;
  height: 4px;
  background: var(--color-surface-offset);
  border-radius: 9999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.pill-volume-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
  pointer-events: none;
}

/* 音質 */
.pill-quality {
  position: relative;
}
.pill-quality-btn {
  width: auto;
  border-radius: 9999px;
  padding: 0 8px;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
}
.pill-quality-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  z-index: 300;
  min-width: 88px;
}
.pill-quality-item {
  padding: 8px 14px;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.pill-quality-item:hover { background: var(--color-surface-offset); color: var(--color-text); }
.pill-quality-item.active { color: var(--color-primary); font-weight: 600; }

/* 退出歌詞重疊時不小時 placeholder 的高度 */
@media (max-width: 600px) {
  .player-pill {
    bottom: 12px;
    padding: 8px 12px;
    gap: 8px;
    border-radius: 20px;
  }
  .pill-song { max-width: 140px; }
  .pill-song-name, .pill-song-artist { max-width: 100px; }
  .pill-volume, .pill-quality, .pill-divider { display: none; }
  .pill-progress-row { min-width: 80px; }
}
</style>
