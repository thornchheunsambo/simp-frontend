<script setup>
defineProps({ status: { type: String, default: '' } })
</script>

<template>
  <span class="badge" :class="'s-' + (status || '').toLowerCase()">{{ (status || '').replace('_', ' ') }}</span>
</template>