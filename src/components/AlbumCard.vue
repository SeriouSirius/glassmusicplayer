<script setup>
import { inject } from 'vue'

defineProps({
  albums: { type: Array, required: true }
})

const openAlbum = inject('openAlbum')
</script>

<template>
  <div class="album-grid">
    <div class="album-card" v-for="al in albums" :key="al.id" @click="openAlbum(al.id)">
      <div class="album-cover-wrap">
        <img :src="al.picUrl" referrerpolicy="no-referrer" loading="lazy">
      </div>
      <div class="album-name">{{ al.name }}</div>
      <div class="album-artist">{{ al.artist?.name || '' }}</div>
    </div>
  </div>
</template>
