<script setup>
import { inject } from 'vue'
import { formatCount } from '../utils/format.js'

const banners = inject('banners')
const bannerIndex = inject('bannerIndex')
</script>

<template>
  <div class="banner-carousel" v-if="banners.length">
    <div
      class="banner-slide"
      v-for="(b, i) in banners"
      :key="i"
      :class="{active: bannerIndex === i}"
    >
      <img
        :src="b.imageUrl"
        :alt="b.typeTitle"
        referrerpolicy="no-referrer"
        @error="$event.target.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22400%22><rect fill=%22%23667eea%22 width=%221200%22 height=%22400%22/><text fill=%22white%22 font-size=%2240%22 x=%22500%22 y=%22220%22>GlassMusic</text></svg>'"
      >
      <div class="banner-overlay">
        <div class="banner-title">{{ b.typeTitle || '发现好音乐' }}</div>
        <div class="banner-sub">精选推荐，每日更新</div>
      </div>
    </div>
    <div class="banner-dots">
      <div class="banner-dot" v-for="(b, i) in banners" :key="i" :class="{active: bannerIndex === i}"></div>
    </div>
  </div>
</template>
