<script setup>
import { inject } from 'vue'
import { formatCount, highlightText, formatDuration } from '../utils/format.js'
import SongList from '../components/SongList.vue'
import ErrorCard from '../components/ErrorCard.vue'

const isDark = inject('isDark')
const toggleTheme = inject('toggleTheme')
const searchQuery = inject('searchQuery')
const searchTab = inject('searchTab')
const searchResults = inject('searchResults')
const searchPlaylistResults = inject('searchPlaylistResults')
const searchArtistResults = inject('searchArtistResults')
const searchAlbumResults = inject('searchAlbumResults')
const searchError = inject('searchError')
const hotSearches = inject('hotSearches')
const isLoading = inject('isLoading')
const doSearch = inject('doSearch')
const switchSearchTab = inject('switchSearchTab')
const openPlaylist = inject('openPlaylist')
const openArtist = inject('openArtist')
const openAlbum = inject('openAlbum')
const playPlaylist = inject('playPlaylist')
const player = inject('player')
const like = inject('like')
const findSongById = inject('findSongById')
const playSong = inject('playSong')
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">搜索</h1>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
    </button>
  </div>
  <div class="glass-card" style="margin-bottom:24px">
    <div style="display:flex;gap:12px">
      <input class="search-input" style="flex:1;padding-left:40px" v-model="searchQuery" placeholder="搜索歌曲、歌手、专辑..." @keyup.enter="doSearch">
      <button class="btn btn-primary" @click="doSearch">搜索</button>
    </div>
  </div>
  <div class="search-tabs" v-if="searchQuery.trim()">
    <button class="search-tab" :class="{active: searchTab === 'song'}" @click="switchSearchTab('song')">歌曲</button>
    <button class="search-tab" :class="{active: searchTab === 'playlist'}" @click="switchSearchTab('playlist')">歌单</button>
    <button class="search-tab" :class="{active: searchTab === 'artist'}" @click="switchSearchTab('artist')">歌手</button>
    <button class="search-tab" :class="{active: searchTab === 'album'}" @click="switchSearchTab('album')">专辑</button>
  </div>
  <!-- Hot searches -->
  <div v-if="!searchQuery.trim() && hotSearches.length" class="glass-card">
    <h3 style="margin-bottom:16px;font-size:16px;font-weight:600">热搜榜</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
      <div class="song-item" v-for="(h, i) in hotSearches" :key="i" @click="searchQuery = h.searchWord; doSearch()">
        <span class="song-index" :style="{color: i < 3 ? 'var(--accent)' : 'var(--text-tertiary)'}">{{ i + 1 }}</span>
        <div class="song-info"><div class="song-name">{{ h.searchWord }}</div><div class="song-artist" style="font-size:11px">{{ h.content }}</div></div>
      </div>
    </div>
  </div>
  <!-- Error -->
  <ErrorCard v-if="searchError" icon="🔍" title="搜索失败" :description="searchError" @retry="doSearch" />
  <!-- Song results -->
  <template v-if="searchTab === 'song' && searchResults.length && !searchError">
    <div class="glass-card" style="padding:8px 0">
      <SongList :songs="searchResults" />
    </div>
  </template>
  <!-- Playlist results -->
  <template v-if="searchTab === 'playlist' && searchPlaylistResults.length && !searchError">
    <div class="search-playlist-grid">
      <div class="playlist-card" v-for="pl in searchPlaylistResults" :key="pl.id" @click="openPlaylist(pl.id)">
        <div class="playlist-cover-wrap">
          <img :src="pl.picUrl || pl.coverImgUrl" referrerpolicy="no-referrer" loading="lazy">
          <div class="playlist-play-count"><svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px"><path d="M8 5v14l11-7z"/></svg>{{ formatCount(pl.playCount) }}</div>
        </div>
        <div class="playlist-name" v-html="highlightText(pl.name, searchQuery)"></div>
      </div>
    </div>
  </template>
  <!-- Artist results -->
  <template v-if="searchTab === 'artist' && searchArtistResults.length && !searchError">
    <div class="search-artist-grid">
      <div class="artist-card" v-for="ar in searchArtistResults" :key="ar.id" @click="openArtist(ar.id)">
        <img class="artist-avatar" :src="ar.picUrl || ar.img1v1Url" referrerpolicy="no-referrer" loading="lazy">
        <div class="artist-name" v-html="highlightText(ar.name, searchQuery)"></div>
        <div class="artist-fans" v-if="ar.fans">{{ formatCount(ar.fans) }} 粉丝</div>
      </div>
    </div>
  </template>
  <!-- Album results -->
  <template v-if="searchTab === 'album' && searchAlbumResults.length && !searchError">
    <div class="album-grid">
      <div class="album-card" v-for="al in searchAlbumResults" :key="al.id" @click="openAlbum(al.id)">
        <div class="album-cover-wrap"><img :src="al.picUrl" referrerpolicy="no-referrer" loading="lazy"></div>
        <div class="album-name" v-html="highlightText(al.name, searchQuery)"></div>
        <div class="album-artist" v-html="highlightText(al.artist?.name || '', searchQuery)"></div>
      </div>
    </div>
  </template>
  <!-- No results -->
  <div v-if="searchQuery.trim() && !isLoading && !searchError && ((searchTab === 'song' && !searchResults.length) || (searchTab === 'playlist' && !searchPlaylistResults.length) || (searchTab === 'artist' && !searchArtistResults.length) || (searchTab === 'album' && !searchAlbumResults.length))" class="empty-state glass-card" style="margin-top:20px"><p>未找到相关结果</p></div>
</template>
