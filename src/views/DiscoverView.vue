<script setup>
import { inject } from 'vue'
import BannerCarousel from '../components/BannerCarousel.vue'
import PlaylistGrid from '../components/PlaylistGrid.vue'
import SongList from '../components/SongList.vue'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const banners = inject('banners')
const bannerIndex = inject('bannerIndex')
const newSongs = inject('newSongs')
const showSearchOverlay = inject('showSearchOverlay')
const navigate = inject('navigate')
const recommendPlaylists = inject('recommendPlaylists')
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">发现</h1>
    <div style="display:flex;align-items:center;gap:12px">
      <div class="search-box" @click.self="showSearchOverlay = true">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input class="search-input" placeholder="搜索歌曲、歌手、专辑..." @focus="showSearchOverlay = true" readonly>
      </div>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
        <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
      </button>
    </div>
  </div>
  <BannerCarousel />
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">推荐歌单</h2>
      <span class="section-more" @click="navigate('search')">查看更多</span>
    </div>
    <PlaylistGrid :playlists="recommendPlaylists" />
  </div>
  <div class="section">
    <div class="section-header"><h2 class="section-title">新歌速递</h2></div>
    <div class="glass-card" style="padding:8px 0">
      <SongList :songs="newSongs" />
    </div>
  </div>
</template>
