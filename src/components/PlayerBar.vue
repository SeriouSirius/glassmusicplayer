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
  <div class="player-bar" v-if="player.currentSong.value">
    <div class="player-song">
      <img
        class="player-cover"
        :class="{spinning: player.isPlaying.value}"
        :src="player.currentSong.value.al?.picUrl || player.currentSong.value.album?.picUrl || player.currentSong.value.picUrl"
        referrerpolicy="no-referrer"
        @click="player.showLyrics.value = true"
      >
      <div class="player-song-info">
        <div class="player-song-name">{{ player.currentSong.value.name }}</div>
        <div class="player-song-artist">{{ player.currentArtist.value }}</div>
      </div>
      <button
        class="player-like"
        :class="{liked: like.likedIds.value.has(player.currentSong.value.id)}"
        @click="handleToggleLike"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="player-controls">
      <div class="player-buttons">
        <button class="player-btn" @click="player.playMode.value = player.playMode.value === 'loop' ? 'shuffle' : player.playMode.value === 'shuffle' ? 'single' : 'loop'" :title="player.playModeText.value">
          <svg v-if="player.playMode.value === 'loop'" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          <svg v-if="player.playMode.value === 'shuffle'" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          <svg v-if="player.playMode.value === 'single'" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="currentColor">1</text></svg>
        </button>
        <button class="player-btn" @click="player.prevSong"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
        <button class="player-btn play-btn" @click="player.togglePlay">
          <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="player-btn" @click="player.manualNextSong"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
        <button class="player-btn" @click="player.showLyrics.value = !player.showLyrics.value" title="歌词"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></button>
      </div>
      <div class="player-progress" @mousemove="handleProgressHover" @mouseleave="player.progressHoverX.value = -1">
        <span class="progress-time">{{ formatTime(player.currentTime.value) }}</span>
        <div class="progress-bar" @click="handleSeekTo" ref="progressBar">
          <div class="progress-fill" :style="{width: player.progressPercent.value + '%'}"><div class="progress-thumb"></div></div>
          <div class="progress-bubble" v-if="player.progressHoverX.value >= 0" :style="{left: player.progressHoverX.value + 'px'}">{{ formatTime(player.progressHoverTime.value) }}</div>
        </div>
        <span class="progress-time">{{ formatTime(player.duration.value) }}</span>
      </div>
    </div>
    <div class="player-extra">
      <div class="quality-wrap" ref="qualityMenuRef">
        <button class="quality-btn" @click.stop="showQualityMenu = !showQualityMenu">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span>{{ player.qualityLabel.value }}</span>
        </button>
        <div class="quality-menu" v-if="showQualityMenu">
          <div
            class="quality-menu-item"
            :class="{active: player.audioQuality.value === q.value}"
            v-for="q in player.qualityOptions"
            :key="q.value"
            @click.stop="selectQuality(q.value)"
          >{{ q.label }}</div>
        </div>
      </div>
      <div class="volume-wrap">
        <button class="player-btn" style="width:28px;height:28px" @click="player.toggleMute">
          <svg v-if="player.volume.value > 0" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        </button>
        <div class="volume-bar" @click="handleSetVolume" ref="volumeBar"><div class="volume-fill" :style="{width: player.volume.value * 100 + '%'}"></div></div>
      </div>
    </div>
  </div>
</template>