<template>
  <div class="playlist-card" @click="$emit('click')">
    <div class="card bg-dark text-white h-100">
      <img :src="playlist.imageUrl" class="card-img-top" :alt="playlist.name">
      <div class="card-body">
        <h5 class="card-title text-truncate">{{ playlist.name }}</h5>
        <p class="card-text text-truncate text-muted">{{ playlist.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Playlist {
  id: string
  name: string
  description: string
  imageUrl: string
  tracks: number
}

defineProps<{
  playlist: Playlist
}>()
</script>

<style scoped>
.playlist-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.playlist-card:hover {
  transform: scale(1.05);
}

.card {
  background-color: #181818 !important;
  border: none;
}

.card-img-top {
  border-radius: 4px;
  object-fit: cover;
  aspect-ratio: 1;
}

.card-body {
  padding: 1rem;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.875rem;
}
</style> 