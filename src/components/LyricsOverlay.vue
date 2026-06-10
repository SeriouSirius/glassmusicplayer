<script setup>
import { inject, ref, watch, nextTick, computed } from 'vue'
import { formatTime } from '../utils/format.js'

const player = inject('player')
const like = inject('like')
const findSongById = inject('findSongById')

const lyricsContainer = ref(null)
const progressBar = ref(null)
const volumeBar = ref(null)
const showQualityMenu = ref(false)
const qualityMenuRef = ref(null)

// ── Auto-scroll to active lyric line ─────────────────────────────────────────
watch(() => player.lyricIndex.value, (idx) => {
  if (idx < 0) return
  nextTick(() => {
    const el = lyricsContainer.value?.querySelector('.lyric-line.active')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
})

// ── Playback controls (mirrored from PlayerBar) ───────────────────────────────
function handleSeekTo(e) { player.seekTo(e, progressBar.value) }
function handleProgressHover(e) { player.onProgressHover(e, progressBar.value) }
function handleSetVolume(e) { player.setVolume(e, volumeBar.value) }
function handleToggleLike() {
  if (!player.currentSong.value) return
  like.toggleLike(player.currentSong.value.id, findSongById)
}
function selectQuality(q) { player.setAudioQuality(q); showQualityMenu.value = false }

// ── Word-level highlight: which word inside the active line is active ─────────
const activeWordIndex = computed(() => {
  const line = player.parsedLyrics.value[player.lyricIndex.value]
  if (!line?.words) return -1
  const t = player.currentTime.value
  let active = -1
  for (let i = 0; i < line.words.length; i++) {
    if (t >= line.words[i].time) active = i
    else break
  }
  return active
})

const coverSrc = computed(() => player.lyricsCoverUrl.value || (
  player.currentSong.value
    ? (player.currentSong.value.al?.picUrl || player.currentSong.value.picUrl || '')
    : ''
))
</script>

<template>
  <Teleport to="body">
    <div class="lo-root" v-if="player.showLyrics.value" @click.self="player.showLyrics.value = false">
      <div class="lo-panel">

        <!-- ── LEFT: Cover + meta ─────────────────────────────────────────── -->
        <div class="lo-left">
          <img
            class="lo-cover"
            :class="{ spinning: player.isPlaying.value }"
            :src="coverSrc"
            referrerpolicy="no-referrer"
          >
          <div class="lo-meta">
            <div class="lo-title">{{ player.currentSong.value?.name }}</div>
            <div class="lo-artist">{{ player.currentArtist.value }}</div>
            <div class="lo-album">{{ player.currentAlbum.value }}</div>
          </div>

          <!-- Mini playback controls on left -->
          <div class="lo-mini-ctrl">
            <!-- Like -->
            <button class="lo-btn" :class="{ liked: like.likedIds.value.has(player.currentSong.value?.id) }" @click="handleToggleLike">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <!-- Prev -->
            <button class="lo-btn" @click="player.prevSong">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <!-- Play/Pause -->
            <button class="lo-btn lo-play" @click="player.togglePlay">
              <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M8 5v14l11-7z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <!-- Next -->
            <button class="lo-btn" @click="player.manualNextSong">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <!-- Play mode -->
            <button class="lo-btn" @click="player.playMode.value = player.playMode.value === 'loop' ? 'shuffle' : player.playMode.value === 'shuffle' ? 'single' : 'loop'">
              <svg v-if="player.playMode.value === 'loop'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              <svg v-if="player.playMode.value === 'shuffle'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
              <svg v-if="player.playMode.value === 'single'" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">1</text></svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="lo-progress-row" @mousemove="handleProgressHover" @mouseleave="player.progressHoverX.value = -1">
            <span class="lo-time">{{ formatTime(player.currentTime.value) }}</span>
            <div class="lo-progress" @click="handleSeekTo" ref="progressBar">
              <div class="lo-progress-fill" :style="{ width: player.progressPercent.value + '%' }">
                <div class="lo-progress-thumb"></div>
              </div>
              <div class="lo-progress-bubble" v-if="player.progressHoverX.value >= 0" :style="{ left: player.progressHoverX.value + 'px' }">
                {{ formatTime(player.progressHoverTime.value) }}
              </div>
            </div>
            <span class="lo-time">{{ formatTime(player.duration.value) }}</span>
          </div>
        </div>

        <!-- ── RIGHT: Lyrics ──────────────────────────────────────────────── -->
        <div class="lo-right">
          <button class="lo-close" @click="player.showLyrics.value = false">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <div class="lo-lyrics-scroll" ref="lyricsContainer">
            <div class="lo-lyrics-inner">
              <template v-if="player.parsedLyrics.value.length">
                <div
                  v-for="(line, i) in player.parsedLyrics.value"
                  :key="i"
                  class="lyric-line"
                  :class="{
                    active: i === player.lyricIndex.value,
                    passed: i < player.lyricIndex.value
                  }"
                  @click="() => { if (line.time) { const a = document.querySelector('audio'); if(a) a.currentTime = line.time } }"
                >
                  <!-- Word-level mode: highlight per-character -->
                  <template v-if="line.words && player.isWordLevel.value">
                    <span
                      v-for="(w, wi) in line.words"
                      :key="wi"
                      class="lyric-word"
                      :class="{
                        'word-active': i === player.lyricIndex.value && wi <= activeWordIndex,
                        'word-next': i === player.lyricIndex.value && wi > activeWordIndex
                      }"
                    >{{ w.text }}</span>
                  </template>
                  <!-- Line-level mode -->
                  <template v-else>{{ line.text }}</template>
                </div>
              </template>
              <div v-else class="lyric-line" style="opacity:0.35; text-align:center">暂无歌词</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Overlay backdrop ──────────────────────────────────────────────────────── */
.lo-root {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  animation: loFadeIn 0.28s ease;
}
@keyframes loFadeIn { from { opacity:0 } to { opacity:1 } }

/* ── Main panel ─────────────────────────────────────────────────────────────── */
.lo-panel {
  display: flex;
  width: min(1000px, calc(100vw - 40px));
  height: min(640px, calc(100vh - 80px));
  border-radius: 28px;
  overflow: hidden;
  background: var(--glass-bg-heavy);
  backdrop-filter: var(--glass-blur-heavy);
  -webkit-backdrop-filter: var(--glass-blur-heavy);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 2px 0 0 rgba(255,255,255,0.5) inset,
    0 32px 80px rgba(0,0,0,0.28);
  animation: loPanelIn 0.32s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes loPanelIn {
  from { opacity:0; transform: scale(0.94) translateY(16px) }
  to   { opacity:1; transform: scale(1) translateY(0) }
}

/* ── LEFT 30% ───────────────────────────────────────────────────────────────── */
.lo-left {
  width: 30%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 24px;
  border-right: 1px solid var(--glass-border);
  gap: 14px;
  overflow: hidden;
}

.lo-cover {
  width: 160px; height: 160px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  flex-shrink: 0;
  transition: transform 0.4s;
}
.lo-cover:not(.spinning):hover { transform: scale(1.04); }
@keyframes spin { to { transform: rotate(360deg); } }
.lo-cover.spinning { animation: spin 16s linear infinite; }

.lo-meta { text-align: center; width: 100%; }
.lo-title {
  font-size: 16px; font-weight: 700; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 4px;
}
.lo-artist { font-size: 13px; color: var(--accent); font-weight: 500; margin-bottom: 2px; }
.lo-album  { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Mini playback controls */
.lo-mini-ctrl {
  display: flex; align-items: center; gap: 6px;
}
.lo-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-secondary); border-radius: 50%;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.lo-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
.lo-btn.liked { color: #e84393; }
.lo-play {
  width: 46px; height: 46px;
  background: var(--accent); color: #fff;
  box-shadow: 0 4px 16px rgba(0,113,227,0.35);
}
.lo-play:hover { background: var(--accent-light) !important; color: #fff !important; transform: scale(1.06); }

/* Progress row */
.lo-progress-row {
  display: flex; align-items: center; gap: 7px;
  width: 100%;
}
.lo-time {
  font-size: 11px; color: var(--text-tertiary);
  font-variant-numeric: tabular-nums; flex-shrink: 0;
}
.lo-progress {
  flex: 1; height: 3px; background: var(--input-bg);
  border-radius: 9999px; cursor: pointer; position: relative; overflow: visible;
}
.lo-progress-fill {
  height: 100%; background: var(--accent);
  border-radius: 9999px; position: relative; transition: width 0.1s linear;
}
.lo-progress-thumb {
  position: absolute; right: -4px; top: 50%;
  transform: translateY(-50%) scale(0);
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--accent); transition: transform 0.15s;
}
.lo-progress:hover .lo-progress-thumb { transform: translateY(-50%) scale(1); }
.lo-progress-bubble {
  position: absolute; top: -24px; transform: translateX(-50%);
  background: var(--glass-bg-heavy); backdrop-filter: blur(12px);
  color: var(--text-primary); font-size: 11px; padding: 2px 7px;
  border-radius: 6px; white-space: nowrap; pointer-events: none;
  border: 1px solid var(--glass-border);
}

/* ── RIGHT 70% ──────────────────────────────────────────────────────────────── */
.lo-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.lo-close {
  position: absolute; top: 16px; right: 16px; z-index: 2;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  border-radius: 50%; width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-secondary);
  transition: var(--transition);
}
.lo-close:hover { background: var(--hover-bg); color: var(--text-primary); }

/* Fade mask top & bottom */
.lo-lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 85%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 85%,
    transparent 100%
  );
}
.lo-lyrics-scroll::-webkit-scrollbar { display: none; }

.lo-lyrics-inner {
  padding: 160px 32px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Lyric lines: Apple Music spring effect ─────────────────────────────────── */
.lyric-line {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  opacity: 0.22;
  line-height: 1.4;
  padding: 6px 0;
  cursor: pointer;
  transition:
    opacity 0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    font-size 0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    filter 0.45s ease;
  transform-origin: left center;
  filter: blur(1.5px);
  user-select: none;
}
.lyric-line.passed {
  opacity: 0.32;
  filter: blur(0.5px);
  transform: scale(0.96);
}
.lyric-line.active {
  opacity: 1;
  font-size: 30px;
  filter: blur(0);
  transform: scale(1.0);
  color: var(--text-primary);
}

/* ── Word-level highlight ────────────────────────────────────────────────────── */
.lyric-word {
  display: inline;
  transition:
    color 0.18s ease,
    text-shadow 0.18s ease;
}
.lyric-line.active .word-active {
  color: var(--accent);
  text-shadow: 0 0 18px var(--accent);
}
.lyric-line.active .word-next {
  color: var(--text-primary);
  opacity: 0.6;
}

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 680px) {
  .lo-panel { flex-direction: column; height: min(90vh, 700px); border-radius: 20px; }
  .lo-left {
    width: 100%; flex-direction: row;
    border-right: none; border-bottom: 1px solid var(--glass-border);
    padding: 16px 20px; gap: 14px; flex-wrap: wrap; justify-content: center;
  }
  .lo-cover { width: 64px; height: 64px; }
  .lo-meta { text-align: left; flex: 1; min-width: 0; }
  .lo-right { flex: 1; min-height: 0; }
  .lyric-line { font-size: 20px; }
  .lyric-line.active { font-size: 22px; }
}
</style>
