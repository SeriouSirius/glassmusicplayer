<script setup>
import { inject } from 'vue'

defineProps({
  artists: { type: Array, required: true }
})

const openArtist = inject('openArtist')
</script>

<template>
  <div class="search-artist-grid">
    <div class="artist-card" v-for="ar in artists" :key="ar.id" @click="openArtist(ar.id)">
      <img class="artist-avatar" :src="ar.picUrl || ar.img1v1Url" referrerpolicy="no-referrer" loading="lazy">
      <div class="artist-name">{{ ar.name }}</div>
      <div class="artist-fans" v-if="ar.fans">{{ ar.fans }} 粉丝</div>
    </div>
  </div>
</template>
