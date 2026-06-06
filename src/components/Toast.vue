<script setup>
import { inject } from 'vue'

const toastMsg = inject('toastMsg')
</script>

<template>
  <div class="toast" v-if="toastMsg">{{ toastMsg }}</div>
</template>
