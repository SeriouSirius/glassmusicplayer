<script setup>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue'
import { formatTime, imgUrl } from '../utils/format.js'

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

function coverUrl(song) {
  return imgUrl(song.al?.picUrl || song.album?.picUrl || song.picUrl, 40)
}
</script>

<template>
  <div class="player-pill">
    <!-- Placeholder: no song loaded -->
    <template v-if="!player.currentSong.value">
      <div class="pill-placeholder-cover">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      <span class="pill-placeholder-label">選擇一首歌曲開始播放</span>
      <button class="pill-btn pill-btn-play" disabled style="margin-left:auto">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </template>

    <!-- Active playback -->
    <template v-else>
      <div class="pill-song">
        <img
          class="pill-cover" :class="{ spinning: player.isPlaying.value }"
          :src="coverUrl(player.currentSong.value)"
          referrerpolicy="no-referrer" alt=""
          @click="player.showLyrics.value = true"
        />
        <div class="pill-song-info">
          <div class="pill-song-name">{{ player.currentSong.value.name }}</div>
          <div class="pill-song-artist">{{ player.currentArtist.value }}</div>
        </div>
        <button class="pill-like" :class="{ liked: like.likedIds.value.has(player.currentSong.value.id) }" @click="handleToggleLike">
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>

      <div class="pill-progress-row" @mousemove="handleProgressHover" @mouseleave="player.progressHoverX.value = -1">
        <span class="pill-time">{{ formatTime(player.currentTime.value) }}</span>
        <div class="pill-progress" @click="handleSeekTo" ref="progressBar">
          <div class="pill-progress-fill" :style="{ width: player.progressPercent.value + '%' }">
            <div class="pill-progress-thumb"></div>
          </div>
          <div class="pill-progress-bubble" v-if="player.progressHoverX.value >= 0" :style="{ left: player.progressHoverX.value + 'px' }">
            {{ formatTime(player.progressHoverTime.value) }}
          </div>
        </div>
        <span class="pill-time">{{ formatTime(player.duration.value) }}</span>
      </div>

      <div class="pill-controls">
        <button class="pill-btn" @click="player.playMode.value = player.playMode.value === 'loop' ? 'shuffle' : player.playMode.value === 'shuffle' ? 'single' : 'loop'" :title="player.playModeText.value">
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
        <button class="pill-btn" @click="player.showLyrics.value = !player.showLyrics.value" title="歌词">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        </button>

        <div class="pill-sep"></div>

        <div class="pill-volume">
          <button class="pill-btn" style="width:28px;height:28px" @click="player.toggleMute">
            <svg v-if="player.volume.value > 0" viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          </button>
          <div class="pill-volume-bar" @click="handleSetVolume" ref="volumeBar">
            <div class="pill-volume-fill" :style="{ width: player.volume.value * 100 + '%' }"></div>
          </div>
        </div>

        <div class="pill-quality" ref="qualityMenuRef">
          <button class="pill-btn pill-quality-btn" @click.stop="showQualityMenu = !showQualityMenu">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span>{{ player.qualityLabel.value }}</span>
          </button>
          <div class="pill-quality-menu" v-if="showQualityMenu">
            <div class="pill-quality-item" :class="{ active: player.audioQuality.value === q.value }" v-for="q in player.qualityOptions" :key="q.value" @click.stop="selectQuality(q.value)">{{ q.label }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.player-pill {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 9999px;
  background: var(--glass-bg-heavy);
  backdrop-filter: var(--glass-blur-heavy);
  -webkit-backdrop-filter: var(--glass-blur-heavy);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 2px 0 0 rgba(255,255,255,0.55) inset,
    0 -1px 0 0 rgba(255,255,255,0.12) inset,
    0 8px 32px rgba(31,38,135,0.16),
    0 2px 8px rgba(0,0,0,0.08);
  max-width: min(860px, calc(100vw - 48px));
  min-width: 300px;
  isolation: isolate;
}
.player-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  z-index: -1;
}
[data-theme="dark"] .player-pill {
  box-shadow:
    0 1px 0 0 rgba(255,255,255,0.10) inset,
    0 8px 32px rgba(0,0,0,0.45),
    0 2px 8px rgba(0,0,0,0.25);
}
.pill-placeholder-cover {
  width: 36px; height: 36px; border-radius: 9999px;
  background: var(--input-bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-tertiary); flex-shrink: 0;
}
.pill-placeholder-label {
  font-size: 13px; color: var(--text-tertiary);
  white-space: nowrap; flex: 1;
}
.pill-song {
  display: flex; align-items: center; gap: 9px;
  flex-shrink: 0; max-width: 200px;
}
.pill-cover {
  width: 36px; height: 36px; border-radius: 9999px;
  object-fit: cover; cursor: pointer; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: transform 0.3s;
}
.pill-cover:hover { transform: scale(1.06); }
@keyframes spin { to { transform: rotate(360deg); } }
.pill-cover.spinning { animation: spin 8s linear infinite; }
.pill-song-info { overflow: hidden; }
.pill-song-name {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;
}
.pill-song-artist {
  font-size: 11px; color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;
}
.pill-like {
  background: none; border: none; cursor: pointer;
  color: var(--text-tertiary); padding: 4px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition); flex-shrink: 0;
}
.pill-like:hover { color: #e84393; background: rgba(232,67,147,0.08); }
.pill-like.liked { color: #e84393; }
.pill-progress-row {
  flex: 1; display: flex; align-items: center; gap: 7px; min-width: 100px;
}
.pill-time {
  font-size: 11px; color: var(--text-tertiary);
  font-variant-numeric: tabular-nums; flex-shrink: 0; width: 30px; text-align: center;
}
.pill-progress {
  flex: 1; height: 3px; background: var(--input-bg);
  border-radius: 9999px; cursor: pointer; position: relative; overflow: visible;
}
.pill-progress-fill {
  height: 100%; background: var(--accent);
  border-radius: 9999px; position: relative; transition: width 0.1s linear;
}
.pill-progress-thumb {
  position: absolute; right: -4px; top: 50%;
  transform: translateY(-50%) scale(0);
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--accent); transition: transform 0.15s;
}
.pill-progress:hover .pill-progress-thumb { transform: translateY(-50%) scale(1); }
.pill-progress-bubble {
  position: absolute; top: -22px; transform: translateX(-50%);
  background: var(--glass-bg-heavy); backdrop-filter: var(--glass-blur);
  color: var(--text-primary); font-size: 11px; padding: 2px 6px;
  border-radius: 6px; white-space: nowrap; pointer-events: none;
  border: 1px solid var(--glass-border); box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.pill-controls { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.pill-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-secondary); width: 30px; height: 30px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: var(--transition); padding: 0; flex-shrink: 0;
}
.pill-btn:hover:not(:disabled) { background: var(--hover-bg); color: var(--text-primary); }
.pill-btn:disabled { opacity: 0.28; cursor: not-allowed; }
.pill-btn-play {
  width: 36px; height: 36px;
  background: var(--accent); color: #fff;
  box-shadow: 0 4px 14px rgba(0,113,227,0.35);
}
.pill-btn-play:hover:not(:disabled) {
  background: var(--accent-light); color: #fff; transform: scale(1.06);
}
.pill-sep {
  width: 1px; height: 18px; background: var(--glass-border); margin: 0 3px; flex-shrink: 0;
}
.pill-volume { display: flex; align-items: center; gap: 3px; }
.pill-volume-bar {
  width: 60px; height: 3px; background: var(--input-bg);
  border-radius: 9999px; cursor: pointer; position: relative; overflow: hidden;
}
.pill-volume-fill {
  height: 100%; background: var(--accent); border-radius: 9999px; pointer-events: none;
}
.pill-quality { position: relative; }
.pill-quality-btn {
  width: auto; border-radius: 9999px; padding: 0 8px;
  gap: 3px; font-size: 11px; font-weight: 600; height: 26px;
}
.pill-quality-menu {
  position: absolute; bottom: calc(100% + 10px); right: 0;
  background: var(--glass-bg-heavy);
  backdrop-filter: var(--glass-blur-heavy); -webkit-backdrop-filter: var(--glass-blur-heavy);
  border: 1px solid var(--glass-border); border-radius: 14px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18); z-index: 300; min-width: 84px;
  animation: menuIn 0.18s ease;
}
@keyframes menuIn { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: translateY(0); } }
.pill-quality-item {
  padding: 8px 14px; font-size: 13px; color: var(--text-secondary);
  cursor: pointer; transition: var(--transition); white-space: nowrap; text-align: center;
}
.pill-quality-item:hover { background: var(--hover-bg); color: var(--text-primary); }
.pill-quality-item.active { color: var(--accent); font-weight: 600; }
@media (max-width: 600px) {
  .player-pill { bottom: 12px; padding: 8px 12px; gap: 8px; border-radius: 22px; }
  .pill-song { max-width: 130px; }
  .pill-song-name, .pill-song-artist { max-width: 90px; }
  .pill-volume, .pill-quality, .pill-sep { display: none; }
  .pill-progress-row { min-width: 70px; }
}
</style>
