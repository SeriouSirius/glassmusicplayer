<script setup>
import { inject } from 'vue'
import Sidebar from './Sidebar.vue'
import DiscoverView from '../views/DiscoverView.vue'
import SearchView from '../views/SearchView.vue'
import PlaylistDetailView from '../views/PlaylistDetailView.vue'
import ArtistDetailView from '../views/ArtistDetailView.vue'
import AlbumDetailView from '../views/AlbumDetailView.vue'
import ToplistView from '../views/ToplistView.vue'
import FMView from '../views/FMView.vue'
import LikedView from '../views/LikedView.vue'
import RecentView from '../views/RecentView.vue'
import DailyRecommendView from '../views/DailyRecommendView.vue'

const currentView = inject('currentView')
const isLoading = inject('isLoading')
const mainContent = inject('mainContent')
const playlistDetail = inject('playlistDetail')
const artistDetail = inject('artistDetail')
const albumDetail = inject('albumDetail')
</script>

<template>
  <div class="bg-decor">
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>
    <div class="bg-blob bg-blob-3"></div>
    <div class="bg-blob bg-blob-4"></div>
  </div>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content" ref="mainContent">
      <DiscoverView v-if="currentView === 'discover'" />
      <ToplistView v-if="currentView === 'toplist'" />
      <SearchView v-if="currentView === 'search'" />
      <PlaylistDetailView v-if="currentView === 'playlist' && playlistDetail" />
      <ArtistDetailView v-if="currentView === 'artist' && artistDetail" />
      <AlbumDetailView v-if="currentView === 'album' && albumDetail" />
      <LikedView v-if="currentView === 'liked'" />
      <RecentView v-if="currentView === 'recent'" />
      <FMView v-if="currentView === 'fm'" />
      <DailyRecommendView v-if="currentView === 'daily'" />
      <div v-if="isLoading" class="loading-wrap"><div class="loading-spinner"></div>加载中...</div>
    </main>
  </div>
</template>
