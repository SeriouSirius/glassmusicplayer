<script setup>
import { inject, ref, watch, nextTick, computed } from 'vue'
import { api } from '../api/index.js'

const player = inject('player')

const lyricsContainer = ref(null)

// ── Auto-scroll ──────────────────────────────────────────────────────────────
watch(() => player.lyricIndex.value, () => {
  nextTick(() => {
    const el = lyricsContainer.value?.querySelector('.lyric-line.active')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
})

// ── Word-level: which word in active line is lit ─────────────────────────────
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

const coverSrc = computed(() =>
  player.lyricsCoverUrl.value ||
  player.currentSong.value?.al?.picUrl ||
  player.currentSong.value?.picUrl || ''
)

// ── Song ID helper ────────────────────────────────────────────────────────────
const currentSongId = computed(() =>
  player.currentSong.value?.id || player.currentSong.value?.songId || null
)

// ── Translation map: time → text ───────────────────────────────────────────────
const showTranslation = ref(false)

// Build a map of time -> translation for fast lookup when rendering lyrics
const translationMap = computed(() => {
  const map = new Map()
  for (const item of (player.translatedLyrics?.value ?? [])) {
    map.set(Math.round(item.time * 100) / 100, item.text)
  }
  return map
})

// For each parsed lyric line, find the best-matching translation by closest time
const translationByIndex = computed(() => {
  const tArr = player.translatedLyrics?.value ?? []
  if (!tArr.length) return []
  return player.parsedLyrics.value.map(line => {
    // Find the translation entry with the smallest time diff ≤ 1s
    let best = null, bestDiff = Infinity
    for (const t of tArr) {
      const diff = Math.abs(t.time - line.time)
      if (diff < bestDiff && diff <= 1.0) { best = t.text; bestDiff = diff }
    }
    return best
  })
})

const hasTranslation = computed(() => (player.translatedLyrics?.value?.length ?? 0) > 0)

function toggleTranslation() {
  if (!hasTranslation.value) { showFeedback('暂无翻译歌词'); return }
  showTranslation.value = !showTranslation.value
}

// ── Song Detail ──────────────────────────────────────────────────────────────
const showDetailModal = ref(false)
const songDetail = ref(null)
const detailLoading = ref(false)

async function openSongDetail() {
  if (!currentSongId.value) return
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const res = await api(`/song/detail?ids=${currentSongId.value}`)
    songDetail.value = res?.songs?.[0] ?? null
  } catch (e) {
    songDetail.value = null
  } finally {
    detailLoading.value = false
  }
}

// ── Like / Unlike ────────────────────────────────────────────────────────────
const isLiked = ref(false)
const likeLoading = ref(false)

watch(() => player.currentSong.value?.id, () => {
  isLiked.value = player.likedSongIds?.value?.has(currentSongId.value) ?? false
  showTranslation.value = false // reset on song change
}, { immediate: true })

async function toggleLike() {
  if (!currentSongId.value || likeLoading.value) return
  likeLoading.value = true
  const newLike = !isLiked.value
  try {
    const res = await api(`/like?id=${currentSongId.value}&like=${newLike}`, { method: 'POST' })
    if (res?.code === 200) {
      isLiked.value = newLike
      showFeedback(newLike ? '已添加到喜欢 ❤️' : '已取消喜欢')
      if (player.likedSongIds?.value) {
        newLike
          ? player.likedSongIds.value.add(currentSongId.value)
          : player.likedSongIds.value.delete(currentSongId.value)
      }
    } else {
      showFeedback('请先登录')
    }
  } catch {
    showFeedback('操作失败')
  } finally {
    likeLoading.value = false
  }
}

// ── Download ─────────────────────────────────────────────────────────────────
const downloadLoading = ref(false)

async function downloadSong() {
  if (!currentSongId.value || downloadLoading.value) return
  downloadLoading.value = true
  try {
    const res = await api(`/song/url?id=${currentSongId.value}`)
    const url = res?.data?.[0]?.url
    if (!url) { showFeedback('暂无下载链接'); return }
    const songName = player.currentSong.value?.name || 'song'
    const a = document.createElement('a')
    a.href = url; a.download = `${songName}.mp3`
    a.target = '_blank'; a.rel = 'noopener noreferrer'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    showFeedback('开始下载 🎵')
  } catch {
    showFeedback('下载失败')
  } finally {
    downloadLoading.value = false
  }
}

// ── Shared feedback toast ─────────────────────────────────────────────────────
const feedbackMsg = ref('')
let feedbackTimer = null
function showFeedback(msg) {
  feedbackMsg.value = msg
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { feedbackMsg.value = '' }, 2400)
}
</script>

<template>
  <Teleport to="body">
    <div class="lo-root" v-if="player.showLyrics.value">

      <!-- Close button (top-right) -->
      <button class="lo-close" @click="player.showLyrics.value = false">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <div class="lo-panel">

        <!-- ── LEFT 30%: cover + meta + action buttons ────────────────────── -->
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

          <!-- ── Four round icon buttons (horizontal) ─────────────────────── -->
          <div class="lo-actions">

            <!-- Song Detail -->
            <div class="lo-btn-wrap">
              <button class="lo-icon-btn" @click="openSongDetail" aria-label="歌曲详情">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </button>
              <span class="lo-btn-tip">歌曲详情</span>
            </div>

            <!-- Like / Unlike -->
            <div class="lo-btn-wrap">
              <button
                class="lo-icon-btn"
                :class="{ liked: isLiked, 'btn-loading': likeLoading }"
                @click="toggleLike"
                :aria-label="isLiked ? '取消喜欢' : '喜欢歌曲'"
              >
                <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <span class="lo-btn-tip">{{ isLiked ? '已喜欢' : '喜欢歌曲' }}</span>
            </div>

            <!-- Translation toggle -->
            <div class="lo-btn-wrap">
              <button
                class="lo-icon-btn"
                :class="{ active: showTranslation, disabled: !hasTranslation }"
                @click="toggleTranslation"
                aria-label="歌词翻译"
              >
                <!-- "T" translation icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M3 5h8M7 3v2M11 19l4-9 4 9M12.5 15.5h5"/>
                  <path d="M5 7c0 4 3 6 5 7"/>
                  <path d="M9 7c0 4-2 5.5-4 7"/>
                </svg>
              </button>
              <span class="lo-btn-tip">歌词翻译</span>
            </div>

            <!-- Download -->
            <div class="lo-btn-wrap">
              <button
                class="lo-icon-btn"
                :class="{ 'btn-loading': downloadLoading }"
                @click="downloadSong"
                aria-label="下载歌曲"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <span class="lo-btn-tip">下载歌曲</span>
            </div>

          </div>

          <!-- Feedback toast -->
          <Transition name="toast-fade">
            <div v-if="feedbackMsg" class="lo-toast">{{ feedbackMsg }}</div>
          </Transition>
        </div>

        <!-- ── RIGHT 70%: lyrics ──────────────────────────────────────────── -->
        <div class="lo-right">
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
                  @click="() => { const a = document.querySelector('audio'); if(a && line.time != null) a.currentTime = line.time }"
                >
                  <!-- Main lyric text -->
                  <div class="lyric-main">
                    <template v-if="line.words && player.isWordLevel.value">
                      <span
                        v-for="(w, wi) in line.words"
                        :key="wi"
                        class="lyric-word"
                        :class="{
                          'word-active': i === player.lyricIndex.value && wi <= activeWordIndex,
                          'word-next':   i === player.lyricIndex.value && wi > activeWordIndex
                        }"
                      >{{ w.text }}</span>
                    </template>
                    <template v-else>{{ line.text }}</template>
                  </div>
                  <!-- Translation line (shown when enabled and exists) -->
                  <Transition name="tl-fade">
                    <div
                      v-if="showTranslation && translationByIndex[i]"
                      class="lyric-translation"
                    >{{ translationByIndex[i] }}</div>
                  </Transition>
                </div>
              </template>
              <div v-else class="lyric-line" style="opacity:0.35;text-align:center">暂无歌词</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Song Detail Modal ────────────────────────────────────────────────── -->
    <Transition name="modal-fade">
      <div v-if="showDetailModal" class="lo-modal-backdrop" @click.self="showDetailModal = false">
        <div class="lo-modal">
          <div class="lo-modal-header">
            <span class="lo-modal-title">歌曲详情</span>
            <button class="lo-close-sm" @click="showDetailModal = false">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="lo-modal-body">
            <div v-if="detailLoading" class="lo-modal-loading">加载中…</div>
            <template v-else-if="songDetail">
              <div class="lo-detail-row">
                <img :src="songDetail.al?.picUrl" class="lo-detail-cover" referrerpolicy="no-referrer">
                <div class="lo-detail-info">
                  <div class="lo-detail-name">{{ songDetail.name }}</div>
                  <div class="lo-detail-item"><span class="lo-detail-label">歌手</span>{{ songDetail.ar?.map(a => a.name).join(' / ') }}</div>
                  <div class="lo-detail-item"><span class="lo-detail-label">专辑</span>{{ songDetail.al?.name }}</div>
                  <div class="lo-detail-item" v-if="songDetail.publishTime"><span class="lo-detail-label">发行</span>{{ new Date(songDetail.publishTime).getFullYear() }}</div>
                  <div class="lo-detail-item" v-if="songDetail.dt"><span class="lo-detail-label">时长</span>{{ Math.floor(songDetail.dt/60000) }}:{{ String(Math.floor((songDetail.dt%60000)/1000)).padStart(2,'0') }}</div>
                  <div class="lo-detail-item" v-if="songDetail.pop != null"><span class="lo-detail-label">热度</span>{{ songDetail.pop }}</div>
                </div>
              </div>
            </template>
            <div v-else class="lo-modal-loading" style="color:var(--text-tertiary)">暂无详情</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Fullscreen root ─────────────────────────────────────────────────────────── */
.lo-root {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: var(--glass-bg-heavy);
  backdrop-filter: var(--glass-blur-heavy);
  -webkit-backdrop-filter: var(--glass-blur-heavy);
  display: flex;
  flex-direction: column;
  animation: loFadeIn 0.3s ease;
}
@keyframes loFadeIn { from { opacity:0 } to { opacity:1 } }

/* ── Close button ────────────────────────────────────────────────────────────── */
.lo-close {
  position: absolute;
  top: 20px; right: 24px;
  z-index: 10;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
  backdrop-filter: blur(12px);
}
.lo-close:hover { background: var(--hover-bg); color: var(--text-primary); }

/* ── Panel layout ─────────────────────────────────────────────────────────────── */
.lo-panel {
  display: flex;
  flex: 1;
  padding-bottom: 120px;
  overflow: hidden;
}

/* ── LEFT 30% ─────────────────────────────────────────────────────────────────── */
.lo-left {
  width: 30%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 24px;
  border-right: 1px solid var(--glass-border);
  position: relative; /* needed for toast positioning */
}

.lo-cover {
  width: min(220px, 22vw);
  height: min(220px, 22vw);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 12px 40px rgba(0,0,0,0.28);
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.lo-cover.spinning { animation: spin 16s linear infinite; }
.lo-cover:not(.spinning) { transition: transform 0.4s; }
.lo-cover:not(.spinning):hover { transform: scale(1.04); }

.lo-meta {
  text-align: center;
  width: 100%;
  padding: 0 8px;
}
.lo-title {
  font-size: 18px; font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 6px;
}
.lo-artist {
  font-size: 14px; color: var(--accent); font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lo-album {
  font-size: 12px; color: var(--text-tertiary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Round icon buttons row ──────────────────────────────────────────────── */
.lo-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Each button wrapped in a relative container for tooltip positioning */
.lo-btn-wrap {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.lo-icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  flex-shrink: 0;
}
.lo-icon-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
  transform: scale(1.1);
}
.lo-icon-btn:active { transform: scale(0.95); }

/* Liked state */
.lo-icon-btn.liked {
  color: #ff4d6d;
  border-color: rgba(255, 77, 109, 0.4);
  background: rgba(255, 77, 109, 0.1);
}
.lo-icon-btn.liked:hover { background: rgba(255, 77, 109, 0.18); }

/* Translation active state */
.lo-icon-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.1);
}
.lo-icon-btn.active:hover { opacity: 0.85; }

/* Disabled (no translation available) */
.lo-icon-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Loading state */
.lo-icon-btn.btn-loading {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Tooltip label — appears below button on hover */
.lo-btn-tip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--glass-bg-heavy, rgba(20,20,20,0.9));
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 3px 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease;
  z-index: 10;
  backdrop-filter: blur(8px);
}
.lo-btn-wrap:hover .lo-btn-tip { opacity: 1; }

/* ── Toast ───────────────────────────────────────────────────────────────────── */
.lo-toast {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.72);
  color: #fff;
  font-size: 13px;
  padding: 7px 16px;
  border-radius: 20px;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(8px);
  z-index: 20;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }

/* ── RIGHT 70%: lyrics scroll ──────────────────────────────────────────────── */
.lo-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lo-lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%);
  mask-image:         linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%);
}
.lo-lyrics-scroll::-webkit-scrollbar { display: none; }

.lo-lyrics-inner {
  padding: 48vh 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Lyric line ──────────────────────────────────────────────────────────────────── */
.lyric-line {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  opacity: 0.22;
  line-height: 1.45;
  padding: 5px 0;
  cursor: pointer;
  transition:
    opacity  0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    font-size 0.45s cubic-bezier(0.34, 1.2, 0.64, 1),
    filter   0.45s ease;
  transform-origin: left center;
  filter: blur(1.5px);
  user-select: none;
}
.lyric-line.passed {
  opacity: 0.30;
  filter: blur(0.5px);
  transform: scale(0.96);
}
.lyric-line.active {
  opacity: 1;
  font-size: 32px;
  filter: blur(0);
  transform: scale(1);
}

/* ── Translation line ──────────────────────────────────────────────────────────── */
.lyric-translation {
  font-size: 15px;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-top: 2px;
  line-height: 1.4;
  transition: opacity 0.3s ease;
}
/* Active line translation is more visible */
.lyric-line.active .lyric-translation {
  font-size: 17px;
  color: var(--text-secondary);
}
.tl-fade-enter-active, .tl-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.tl-fade-enter-from, .tl-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Word-level ──────────────────────────────────────────────────────────────── */
.lyric-word {
  display: inline;
  transition: color 0.18s ease, text-shadow 0.18s ease;
}
.lyric-line.active .word-active {
  color: var(--accent);
  text-shadow: 0 0 18px var(--accent);
}
.lyric-line.active .word-next {
  color: var(--text-primary);
  opacity: 0.55;
}

/* ── Song Detail Modal ────────────────────────────────────────────────────────── */
.lo-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 600;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.lo-modal {
  background: var(--glass-bg-heavy, rgba(28,27,25,0.95));
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  width: min(480px, 90vw);
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}
.lo-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
  border-bottom: 1px solid var(--glass-border);
}
.lo-modal-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.lo-close-sm {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
}
.lo-close-sm:hover { background: var(--hover-bg); color: var(--text-primary); }
.lo-modal-body { padding: 20px; }
.lo-modal-loading {
  text-align: center;
  padding: 32px 0;
  font-size: 14px;
  color: var(--text-secondary);
}
.lo-detail-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}
.lo-detail-cover {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.lo-detail-info { flex: 1; min-width: 0; }
.lo-detail-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  word-break: break-word;
}
.lo-detail-item {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  gap: 8px;
}
.lo-detail-label {
  color: var(--text-tertiary);
  flex-shrink: 0;
  width: 32px;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Mobile: stack vertically ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lo-panel { flex-direction: column; padding-bottom: 100px; }
  .lo-left {
    width: 100%; flex-direction: row;
    border-right: none; border-bottom: 1px solid var(--glass-border);
    padding: 14px 16px; gap: 14px;
    justify-content: flex-start; align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .lo-cover { width: 56px; height: 56px; }
  .lo-meta { text-align: left; flex: 1; min-width: 0; }
  .lo-actions { width: 100%; gap: 10px; }
  .lo-icon-btn { width: 36px; height: 36px; }
  .lyric-line { font-size: 20px; }
  .lyric-line.active { font-size: 23px; }
  .lyric-translation { font-size: 13px; }
  .lyric-line.active .lyric-translation { font-size: 14px; }
  .lo-lyrics-inner { padding: 30vw 20px 20px; }
}
</style>
