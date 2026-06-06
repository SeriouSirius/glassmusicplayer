<script setup>
import { ref, provide, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTheme } from './composables/useTheme.js'
import { usePlayer } from './composables/usePlayer.js'
import { useLike } from './composables/useLike.js'
import { api } from './api/index.js'
import AppLayout from './components/AppLayout.vue'
import PlayerBar from './components/PlayerBar.vue'
import LyricsOverlay from './components/LyricsOverlay.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import Toast from './components/Toast.vue'
import { useAuth } from './composables/useAuth.js'
import LoginModal from './components/LoginModal.vue'

const { isDark, initTheme, toggleTheme } = useTheme()
const player = usePlayer()
const like = useLike()

const auth = useAuth()
const showLoginModal = ref(false)

// App state
const currentView = ref('discover')
const isLoading = ref(false)
const banners = ref([])
const bannerIndex = ref(0)
const recommendPlaylists = ref([])
const newSongs = ref([])
const hotSearches = ref([])
const searchQuery = ref('')
const searchTab = ref('song')
const searchResults = ref([])
const searchPlaylistResults = ref([])
const searchArtistResults = ref([])
const searchAlbumResults = ref([])
const searchError = ref('')
const playlistDetail = ref(null)
const playlistSongs = ref([])
const playlistError = ref('')
const isToplistDetail = ref(false)
const fmSongs = ref([])
const fmLoading = ref(false)
const recentSongs = ref(JSON.parse(localStorage.getItem('recentSongs') || '[]'))
const createdPlaylists = ref([])
const toplist = ref([])
const toplistError = ref('')
const artistDetail = ref(null)
const artistTopSongs = ref([])
const artistError = ref('')
const albumDetail = ref(null)
const albumSongs = ref([])
const albumError = ref('')
const showSearchOverlay = ref(false)
const toastMsg = ref('')
const mainContent = ref(null)
const searchInput = ref(null)
const audioEl = ref(null)

// Provide all shared state to child components
provide('isDark', isDark)
provide('toggleTheme', toggleTheme)
provide('currentView', currentView)
provide('isLoading', isLoading)
provide('banners', banners)
provide('bannerIndex', bannerIndex)
provide('recommendPlaylists', recommendPlaylists)
provide('newSongs', newSongs)
provide('hotSearches', hotSearches)
provide('searchQuery', searchQuery)
provide('searchTab', searchTab)
provide('searchResults', searchResults)
provide('searchPlaylistResults', searchPlaylistResults)
provide('searchArtistResults', searchArtistResults)
provide('searchAlbumResults', searchAlbumResults)
provide('searchError', searchError)
provide('playlistDetail', playlistDetail)
provide('playlistSongs', playlistSongs)
provide('playlistError', playlistError)
provide('isToplistDetail', isToplistDetail)
provide('fmSongs', fmSongs)
provide('fmLoading', fmLoading)
provide('recentSongs', recentSongs)
provide('createdPlaylists', createdPlaylists)
provide('toplist', toplist)
provide('toplistError', toplistError)
provide('artistDetail', artistDetail)
provide('artistTopSongs', artistTopSongs)
provide('artistError', artistError)
provide('albumDetail', albumDetail)
provide('albumSongs', albumSongs)
provide('albumError', albumError)
provide('showSearchOverlay', showSearchOverlay)
provide('toastMsg', toastMsg)
provide('mainContent', mainContent)
provide('player', player)
provide('like', like)
// Auth
provide('isLoggedIn', auth.isLoggedIn)
provide('userProfile', auth.userProfile)
provide('showLoginModal', showLoginModal)
provide('logout', auth.logout)

// Helper functions
function showToast(m) { toastMsg.value = m; setTimeout(() => toastMsg.value = '', 2500) }
provide('showToast', showToast)

function findSongById(id) {
  return newSongs.value.find(s => s.id === id) ||
    searchResults.value.find(s => s.id === id) ||
    playlistSongs.value.find(s => s.id === id) ||
    fmSongs.value.find(s => s.id === id) ||
    recentSongs.value.find(s => s.id === id) ||
    like.likedSongs.value.find(s => s.id === id) ||
    artistTopSongs.value.find(s => s.id === id) ||
    albumSongs.value.find(s => s.id === id)
}
provide('findSongById', findSongById)

function addToRecent(song) {
  const i = recentSongs.value.findIndex(s => s.id === song.id)
  if (i !== -1) recentSongs.value.splice(i, 1)
  recentSongs.value.unshift(player.normalizeSong(song))
  if (recentSongs.value.length > 100) recentSongs.value = recentSongs.value.slice(0, 100)
  localStorage.setItem('recentSongs', JSON.stringify(recentSongs.value))
}
provide('addToRecent', addToRecent)

// API load functions
async function loadDiscover() {
  isLoading.value = true
  try {
    const [bR, pR, nR] = await Promise.all([
      api('/banner').catch(() => null),
      api('/personalized?limit=12').catch(() => null),
      api('/top/song?type=0').catch(() => null)
    ])
    if (bR?.banners) banners.value = bR.banners
    if (pR?.result) recommendPlaylists.value = pR.result
    if (nR?.data) newSongs.value = nR.data.slice(0, 20)
  } catch (e) { console.error('Load discover error:', e) }
  isLoading.value = false
}
provide('loadDiscover', loadDiscover)

async function loadHotSearches() {
  try { const r = await api('/search/hot/detail'); if (r?.data) hotSearches.value = r.data } catch (e) { }
}
provide('loadHotSearches', loadHotSearches)

async function doSearch() {
  if (!searchQuery.value.trim()) return
  isLoading.value = true
  searchError.value = ''
  currentView.value = 'search'
  try {
    const tM = { song: 1, playlist: 100, artist: 101, album: 10 }
    const t = tM[searchTab.value] || 1
    const r = await api('/search?keywords=' + encodeURIComponent(searchQuery.value) + '&limit=50&type=' + t)
    if (searchTab.value === 'song') {
      searchResults.value = r?.result?.songs || []
      searchPlaylistResults.value = []; searchArtistResults.value = []; searchAlbumResults.value = []
      if (searchResults.value.length) {
        const ids = searchResults.value.map(s => s.id).join(',')
        try {
          const dr = await api('/song/detail?ids=' + ids)
          if (dr?.songs) {
            dr.songs.forEach(ds => {
              const idx = searchResults.value.findIndex(s => s.id === ds.id)
              if (idx !== -1 && ds.al?.picUrl) searchResults.value[idx].al = { ...searchResults.value[idx].al, picUrl: ds.al.picUrl }
            })
          }
        } catch (e) { }
      }
    } else if (searchTab.value === 'playlist') {
      searchPlaylistResults.value = r?.result?.playlists || []
      searchResults.value = []; searchArtistResults.value = []; searchAlbumResults.value = []
    } else if (searchTab.value === 'artist') {
      searchArtistResults.value = r?.result?.artists || []
      searchResults.value = []; searchPlaylistResults.value = []; searchAlbumResults.value = []
    } else if (searchTab.value === 'album') {
      searchAlbumResults.value = r?.result?.albums || []
      searchResults.value = []; searchPlaylistResults.value = []; searchArtistResults.value = []
    }
  } catch (e) {
    searchError.value = e.message || '网络异常，请稍后重试'
  }
  isLoading.value = false
}
provide('doSearch', doSearch)

function switchSearchTab(t) { searchTab.value = t; if (searchQuery.value.trim()) doSearch() }
provide('switchSearchTab', switchSearchTab)

async function openPlaylist(id, isTL = false) {
  isLoading.value = true; playlistError.value = ''; currentView.value = 'playlist'; isToplistDetail.value = isTL
  try {
    const [dR, tR] = await Promise.all([
      api('/playlist/detail?id=' + id).catch(() => null),
      api('/playlist/track/all?id=' + id + '&limit=200').catch(() => null)
    ])
    if (dR?.playlist) playlistDetail.value = dR.playlist
    if (tR?.songs) playlistSongs.value = tR.songs
  } catch (e) { playlistError.value = e.message || '歌单加载失败' }
  isLoading.value = false
  nextTick(() => { if (mainContent.value) mainContent.value.scrollTop = 0 })
}
provide('openPlaylist', openPlaylist)

async function loadToplist() {
  isLoading.value = true; toplistError.value = ''
  try {
    const r = await api('/toplist')
    if (r?.list) toplist.value = r.list
    else if (r?.playlists) toplist.value = r.playlists
  } catch (e) { toplistError.value = e.message || '榜单加载失败' }
  isLoading.value = false
}
provide('loadToplist', loadToplist)

async function openArtist(id) {
  isLoading.value = true; artistError.value = ''; currentView.value = 'artist'
  try {
    const [iR, sR] = await Promise.all([
      api('/artists?id=' + id).catch(() => null),
      api('/artist/top/song?id=' + id).catch(() => null)
    ])
    if (iR) artistDetail.value = iR
    if (sR?.songs) artistTopSongs.value = sR.songs
  } catch (e) { artistError.value = e.message || '歌手信息加载失败' }
  isLoading.value = false
  nextTick(() => { if (mainContent.value) mainContent.value.scrollTop = 0 })
}
provide('openArtist', openArtist)

async function openAlbum(id) {
  isLoading.value = true; albumError.value = ''; currentView.value = 'album'
  try {
    const r = await api('/album?id=' + id)
    if (r) { albumDetail.value = r; albumSongs.value = r.songs || [] }
  } catch (e) { albumError.value = e.message || '专辑加载失败' }
  isLoading.value = false
  nextTick(() => { if (mainContent.value) mainContent.value.scrollTop = 0 })
}
provide('openAlbum', openAlbum)

async function loadFM() {
  fmLoading.value = true
  try { const r = await api('/personal_fm'); if (r?.data) fmSongs.value = r.data } catch (e) { showToast('FM加载失败') }
  fmLoading.value = false
}
provide('loadFM', loadFM)

function navigate(v) {
  currentView.value = v
  if (v === 'search') nextTick(() => searchInput.value?.focus())
  if (v === 'toplist' && !toplist.value.length) loadToplist()
  nextTick(() => { if (mainContent.value) mainContent.value.scrollTop = 0 })
}
provide('navigate', navigate)

function collectPlaylist() { showToast('歌单已收藏') }
provide('collectPlaylist', collectPlaylist)

// Bug 2 fix: playSongWrapper 接收 (song, isFm, list, startIndex)
// DailyRecommendView emit('play-song', song, list, index) 對應
// AppLayout 將 @play-song="(song, list, idx) => playSong(song, false, list, idx)"
async function playSongWrapper(song, isFm = false, list = null, startIndex = null) {
  if (list && list.length > 1) {
    const idx = startIndex !== null ? startIndex : list.findIndex(s => s.id === song.id)
    player.playSongsList(list, idx >= 0 ? idx : 0)
    return
  }
  const result = await player.playSong(song, isFm)
  if (result?.noSource) showToast(result.msg)
  addToRecent(player.normalizeSong(song))
}
provide('playSong', playSongWrapper)

async function playPlaylistWrapper(id) {
  const result = await player.playPlaylist(id)
  if (result?.error) showToast(result.msg)
}
provide('playPlaylist', playPlaylistWrapper)

function playArtistTopSongs() {
  if (!artistTopSongs.value.length) return
  player.playSongsList(artistTopSongs.value)
}
provide('playArtistTopSongs', playArtistTopSongs)

function playAlbumSongs() {
  if (!albumSongs.value.length) return
  player.playSongsList(albumSongs.value)
}
provide('playAlbumSongs', playAlbumSongs)

function playLiked() {
  if (!like.likedSongs.value.length) return
  player.playSongsList(like.likedSongs.value)
}
provide('playLiked', playLiked)

function playRecent() {
  if (!recentSongs.value.length) return
  player.playSongsList(recentSongs.value)
}
provide('playRecent', playRecent)

// Banner rotation
let bannerTimer
function startBannerRotation() {
  bannerTimer = setInterval(() => {
    if (banners.value.length) bannerIndex.value = (bannerIndex.value + 1) % banners.value.length
  }, 5000)
}

// Keyboard shortcuts
function handleKeydown(e) {
  const t = e.target.tagName.toLowerCase()
  if (t === 'input' || t === 'textarea') return
  switch (e.code) {
    case 'Space': e.preventDefault(); player.togglePlay(); break
    case 'ArrowLeft': e.preventDefault(); player.prevSong(); break
    case 'ArrowRight': e.preventDefault(); player.nextSong(); break
    case 'ArrowUp':
      e.preventDefault()
      player.volume.value = Math.min(1, player.volume.value + 0.05)
      if (audioEl.value) audioEl.value.volume = player.volume.value
      localStorage.setItem('volume', player.volume.value)
      showToast('音量 ' + Math.round(player.volume.value * 100) + '%')
      break
    case 'ArrowDown':
      e.preventDefault()
      player.volume.value = Math.max(0, player.volume.value - 0.05)
      if (audioEl.value) audioEl.value.volume = player.volume.value
      localStorage.setItem('volume', player.volume.value)
      showToast('音量 ' + Math.round(player.volume.value * 100) + '%')
      break
    case 'KeyM':
      player.toggleMute()
      if (audioEl.value) audioEl.value.volume = player.volume.value
      showToast(player.volume.value > 0 ? '音量 ' + Math.round(player.volume.value * 100) + '%' : '已静音')
      break
    case 'KeyL':
      player.playMode.value = player.playMode.value === 'loop' ? 'shuffle' : player.playMode.value === 'shuffle' ? 'single' : 'loop'
      showToast(player.playModeText.value)
      break
  }
}

watch(() => player.playMode.value, v => localStorage.setItem('playMode', v))
watch(showSearchOverlay, v => {
  if (v) nextTick(() => {
    const input = document.querySelector('.search-panel-input')
    if (input) input.focus()
  })
})

onMounted(() => {
  initTheme()
  loadDiscover()
  loadHotSearches()
  startBannerRotation()
  auth.initAuth()
  document.addEventListener('keydown', handleKeydown)
  if (audioEl.value) player.setAudioEl(audioEl.value)
})

onUnmounted(() => {
  clearInterval(bannerTimer)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <AppLayout />
  <PlayerBar />
  <LyricsOverlay />
  <SearchOverlay />
  <Toast />
  <audio
    ref="audioEl"
    @timeupdate="player.onTimeUpdate"
    @ended="player.onEnded"
    @loadedmetadata="player.onLoaded"
    @error="() => { const r = player.onError(); if(r?.error) showToast(r.msg) }"
  ></audio>
  <LoginModal
    v-if="showLoginModal"
    @close="showLoginModal = false"
    @success="showLoginModal = false"
  />
</template>
