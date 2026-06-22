import { ref, computed } from 'vue'
import { api, getApiBase } from '../api/index.js'
import { isLoggedIn } from './useAuth.js'

const API = getApiBase()

const currentSong = ref(null)
const isPlaying = ref(false)
const playList = ref([])
const playIndex = ref(-1)
const playMode = ref(localStorage.getItem('playMode') || 'loop')
const audioQuality = ref(localStorage.getItem('audioQuality') || 'exhigh')
const qualityOptions = [
  { value: 'standard', label: '标准' },
  { value: 'higher', label: '较高' },
  { value: 'exhigh', label: '极高' },
  { value: 'lossless', label: '无损' },
  { value: 'jyeffect', label: '高清环绕声' },
  { value: 'sky', label: '沉浸环绕声' },
  { value: 'dolby', label: '杜比全景声' },
  { value: 'jymaster', label: '超清母带' }
]
const qualityLabel = computed(() => qualityOptions.find(q => q.value === audioQuality.value)?.label || '极高')
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(parseFloat(localStorage.getItem('volume') || '0.8'))
const showLyrics = ref(false)
const lyrics = ref('')
const parsedLyrics = ref([])
const isWordLevel = ref(false)
const lyricIndex = ref(-1)
const progressHoverX = ref(-1)
const progressHoverTime = ref(0)
const toastMsg = ref('')
// Large cover URL for lyrics overlay — reset to '' on each new song
const lyricsCoverUrl = ref('')

let audioEl = null
function setAudioEl(el) { audioEl = el }

let _startPlayRunning = false
let _consecutiveSkips = 0
const MAX_CONSECUTIVE_SKIPS = 3

const currentArtist = computed(() => {
  if (!currentSong.value) return ''
  const a = currentSong.value.ar || currentSong.value.artists
  return a?.map(x => x.name).join(' / ') || ''
})

const currentAlbum = computed(() => {
  if (!currentSong.value) return ''
  return currentSong.value.al?.name || currentSong.value.album?.name || ''
})

const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const playModeText = computed(() => ({ loop: '列表循环', shuffle: '随机播放', single: '单曲循环' }[playMode.value]))

function normalizeSong(s) {
  return {
    id: s.id,
    name: s.name,
    ar: s.ar || s.artists,
    al: s.al || s.album,
    dt: s.dt || s.duration,
    picUrl: s.al?.picUrl || s.album?.picUrl || s.picUrl
  }
}

function showToast(m) { toastMsg.value = m; setTimeout(() => toastMsg.value = '', 2500) }

// Fetch a high-res (512px) cover for the lyrics overlay.
// Resets lyricsCoverUrl before fetching so the overlay shows the
// regular thumbnail immediately, then upgrades once resolved.
async function fetchLargecover(song) {
  lyricsCoverUrl.value = '' // reset first so overlay uses thumbnail during load
  const picUrl = song.al?.picUrl || song.album?.picUrl || song.picUrl
  if (!picUrl) return
  const base = picUrl.split('?')[0]
  lyricsCoverUrl.value = base + '?param=512y512'
}

async function playSong(song, isFm = false) {
  const n = normalizeSong(song)
  if (isFm) {
    playList.value = [n]; playIndex.value = 0
  } else {
    const idx = playList.value.findIndex(s => s.id === n.id)
    if (idx === -1) { playList.value.push(n); playIndex.value = playList.value.length - 1 }
    else { playIndex.value = idx }
  }
  _consecutiveSkips = 0
  await startPlay()
}

async function startPlay() {
  if (_startPlayRunning) return
  _startPlayRunning = true
  const song = playList.value[playIndex.value]
  if (!song) { _startPlayRunning = false; return }
  currentSong.value = song
  // Reset cover & lyrics immediately on new song
  lyricsCoverUrl.value = ''
  parsedLyrics.value = []
  isWordLevel.value = false
  lyricIndex.value = -1

  let played = false
  try {
    const qualityUrl = isLoggedIn.value
      ? `/song/url/v1?id=${song.id}&level=${audioQuality.value}&randomCNIP=true`
      : `/song/url/v1?id=${song.id}&level=${audioQuality.value}&unblock=true&randomCNIP=true`
    const r = await api(qualityUrl)
    if (r?.data?.[0]?.url) {
      played = await tryAudioSrc(r.data[0].url)
      if (played) {
        _startPlayRunning = false; _consecutiveSkips = 0
        // Fire both in parallel — no need to await
        loadLyrics(song.id)
        fetchLargecover(song)
        addToRecent(song)
        return { noSource: false }
      }
    }
  } catch (e) {}

  try {
    const r = await api('/song/url/match?id=' + song.id + '&randomCNIP=true')
    const matchUrl = typeof r?.data === 'string' ? r.data : r?.data?.[0]?.url
    if (matchUrl) {
      played = await tryAudioSrc(matchUrl)
      if (played) {
        _startPlayRunning = false; _consecutiveSkips = 0
        showToast('已匹配替代音源')
        loadLyrics(song.id)
        fetchLargecover(song)
        addToRecent(song)
        return { noSource: false }
      }
    }
  } catch (e) {}

  _startPlayRunning = false
  _consecutiveSkips++
  if (_consecutiveSkips >= MAX_CONSECUTIVE_SKIPS) {
    showToast('连续多首暂无音源，已停止播放'); _consecutiveSkips = 0
    return { noSource: true, msg: '连续多首暂无音源，已停止播放' }
  }
  showToast('暂无音源，自动切换下一首')
  setTimeout(() => nextSong(), 300)
  return { noSource: true, msg: '暂无音源，自动切换下一首' }
}

async function tryAudioSrc(url) {
  if (!url) return false
  audioEl.src = url; audioEl.volume = volume.value; audioEl.load()
  try {
    await audioEl.play(); isPlaying.value = true; return true
  } catch (e) {
    isPlaying.value = false; showToast('点击播放按钮开始播放'); return true
  }
}

function togglePlay() {
  if (isPlaying.value) { audioEl.pause(); isPlaying.value = false }
  else { audioEl.play().then(() => isPlaying.value = true).catch(() => {}) }
}

function prevSong() {
  if (!playList.value.length) return
  _consecutiveSkips = 0
  if (playMode.value === 'shuffle') playIndex.value = Math.floor(Math.random() * playList.value.length)
  else playIndex.value = (playIndex.value - 1 + playList.value.length) % playList.value.length
  startPlay()
}

function nextSong() {
  if (!playList.value.length) return
  if (playMode.value === 'shuffle') playIndex.value = Math.floor(Math.random() * playList.value.length)
  else playIndex.value = (playIndex.value + 1) % playList.value.length
  startPlay()
}

function manualNextSong() { _consecutiveSkips = 0; nextSong() }

async function playPlaylist(id) {
  try {
    const r = await api('/playlist/track/all?id=' + id + '&limit=200')
    if (r?.songs) {
      playList.value = r.songs.map(s => normalizeSong(s))
      playIndex.value = 0; _consecutiveSkips = 0
      await startPlay()
    }
  } catch (e) { return { error: true, msg: '播放歌单失败' } }
}

function playSongsList(songs, startIndex = 0) {
  if (!songs || !songs.length) return
  playList.value = songs.map(s => normalizeSong(s))
  playIndex.value = Math.max(0, Math.min(startIndex, songs.length - 1))
  _consecutiveSkips = 0; startPlay()
}

const recentSongs = ref(JSON.parse(localStorage.getItem('recentSongs') || '[]'))

function addToRecent(song) {
  const i = recentSongs.value.findIndex(s => s.id === song.id)
  if (i !== -1) recentSongs.value.splice(i, 1)
  recentSongs.value.unshift(normalizeSong(song))
  if (recentSongs.value.length > 100) recentSongs.value = recentSongs.value.slice(0, 100)
  localStorage.setItem('recentSongs', JSON.stringify(recentSongs.value))
}

// ── Lyrics ────────────────────────────────────────────────────────────────────

function parseYrc(yrcStr) {
  const lines = yrcStr.split('\n').filter(l => l.trim().startsWith('{'))
  const result = []
  for (const l of lines) {
    try {
      const obj = JSON.parse(l)
      if (!obj.c?.length) continue
      const lineTime = obj.t / 1000
      const words = []
      let fullText = ''
      for (const w of obj.c) {
        if (!w.tx?.trim()) continue
        words.push({ time: (obj.t + (w.t || 0)) / 1000, duration: (w.x || 500) / 1000, text: w.tx })
        fullText += w.tx
      }
      if (fullText.trim()) result.push({ time: lineTime, text: fullText.trim(), words })
    } catch (e) {}
  }
  result.sort((a, b) => a.time - b.time)
  return result
}

function parseLrcStr(lrc) {
  const lines = lrc.split('\n')
  const result = []
  const reg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g
  for (const l of lines) {
    const ts = [...l.matchAll(reg)]
    const txt = l.replace(reg, '').trim()
    if (!txt) continue
    for (const m of ts) {
      const t = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3]) / (m[3].length === 2 ? 100 : 1000)
      result.push({ time: t, text: txt, words: null })
    }
  }
  result.sort((a, b) => a.time - b.time)
  return result
}

async function loadLyrics(id) {
  parsedLyrics.value = []; isWordLevel.value = false; lyrics.value = ''
  try {
    const rNew = await api('/lyric/new?id=' + id).catch(() => null)
    if (rNew?.yrc?.lyric) {
      const parsed = parseYrc(rNew.yrc.lyric)
      if (parsed.length) {
        parsedLyrics.value = parsed
        isWordLevel.value = true
        lyrics.value = rNew.yrc.lyric
        return
      }
    }
    const r = await api('/lyric?id=' + id).catch(() => null)
    if (r?.lrc?.lyric) {
      lyrics.value = r.lrc.lyric
      parsedLyrics.value = parseLrcStr(r.lrc.lyric)
    }
  } catch (e) { parsedLyrics.value = [] }
}

function parseLyrics(lrc) { parsedLyrics.value = parseLrcStr(lrc) }

function onTimeUpdate() {
  currentTime.value = audioEl.currentTime
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= parsedLyrics.value[i].time) {
      if (lyricIndex.value !== i) lyricIndex.value = i
      break
    }
  }
}

function onEnded() {
  _consecutiveSkips = 0
  if (playMode.value === 'single') {
    audioEl.currentTime = 0; audioEl.play().then(() => isPlaying.value = true).catch(() => {})
  } else { nextSong() }
}

function onLoaded() { duration.value = audioEl.duration }
function onError() { return { error: true, msg: '播放出错' } }

function seekTo(e, progressBar) {
  if (!progressBar || !duration.value) return
  const r = progressBar.getBoundingClientRect()
  const p = (e.clientX - r.left) / r.width
  audioEl.currentTime = Math.max(0, Math.min(p * duration.value, duration.value))
}

function onProgressHover(e, progressBar) {
  if (!progressBar || !duration.value) return
  const r = progressBar.getBoundingClientRect()
  const x = e.clientX - r.left
  const p = Math.max(0, Math.min(x / r.width, 1))
  progressHoverX.value = x; progressHoverTime.value = p * duration.value
}

function setVolume(e, volumeBar) {
  if (!volumeBar) return
  const r = volumeBar.getBoundingClientRect()
  volume.value = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
  audioEl.volume = volume.value; localStorage.setItem('volume', volume.value)
}

function toggleMute() {
  volume.value = volume.value > 0 ? 0 : 0.8
  audioEl.volume = volume.value; localStorage.setItem('volume', volume.value)
}

function setAudioQuality(q) {
  audioQuality.value = q; localStorage.setItem('audioQuality', q)
}

export function usePlayer() {
  return {
    currentSong, isPlaying, playList, playIndex, playMode,
    audioQuality, qualityOptions, qualityLabel,
    currentTime, duration, volume,
    showLyrics, lyrics, parsedLyrics, isWordLevel, lyricIndex,
    progressHoverX, progressHoverTime, toastMsg,
    recentSongs, lyricsCoverUrl,
    currentArtist, currentAlbum, progressPercent, playModeText,
    setAudioEl, normalizeSong, showToast,
    playSong, startPlay, togglePlay,
    prevSong, nextSong, manualNextSong,
    playPlaylist, playSongsList,
    loadLyrics, parseLyrics,
    onTimeUpdate, onEnded, onLoaded, onError,
    seekTo, onProgressHover, setVolume, toggleMute, setAudioQuality,
    addToRecent
  }
}
