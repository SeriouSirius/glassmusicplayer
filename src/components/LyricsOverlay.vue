<script setup>
import { inject, ref, watch, nextTick, computed } from 'vue'

const player = inject('player')

const lyricsContainer = ref(null)

// ── Auto-scroll ───────────────────────────────────────────────────────────────
watch(() => player.lyricIndex.value, () => {
  nextTick(() => {
    const el = lyricsContainer.value?.querySelector('.lyric-line.active')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
})

// ── Word-level: which word in active line is lit ──────────────────────────────
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

        <!-- ── LEFT 30%: cover + meta (fully centered) ────────────────────── -->
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
              </template>
              <div v-else class="lyric-line" style="opacity:0.35;text-align:center">暂无歌词</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Fullscreen root ─────────────────────────────────────────────────────────── */
.lo-root {
  position: fixed;
  inset: 0;
  z-index: 500;          /* below player-pill (z-index 200 on pill → pill sits above) */
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

/* ── Two-column panel: fills screen, leaves room for player-pill at bottom ─── */
.lo-panel {
  display: flex;
  flex: 1;
  /* leave ~120px at bottom so the floating pill isn't covered */
  padding-bottom: 120px;
  overflow: hidden;
}

/* ── LEFT 30%: fully centered ────────────────────────────────────────────────── */
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

/* ── RIGHT 70%: lyrics scroll ────────────────────────────────────────────────── */
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

/* ── Apple Music spring lyrics ───────────────────────────────────────────────── */
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

/* ── Mobile: stack vertically ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lo-panel { flex-direction: column; padding-bottom: 100px; }
  .lo-left {
    width: 100%; flex-direction: row;
    border-right: none; border-bottom: 1px solid var(--glass-border);
    padding: 16px 20px; gap: 16px;
    justify-content: center; align-items: center;
    flex-shrink: 0;
  }
  .lo-cover { width: 64px; height: 64px; }
  .lo-meta { text-align: left; flex: 1; min-width: 0; }
  .lyric-line { font-size: 20px; }
  .lyric-line.active { font-size: 23px; }
  .lo-lyrics-inner { padding: 30vw 20px 20px; }
}
</style>
