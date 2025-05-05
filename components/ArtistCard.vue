<template>
  <div class="artist-card" @click="$emit('click')">
    <div class="card bg-dark text-white h-100">
      <img :src="artist.imageUrl" class="card-img-top rounded-circle" :alt="artist.name">
      <div class="card-body text-center">
        <h5 class="card-title text-truncate">{{ artist.name }}</h5>
        <p class="card-text text-muted">{{ artist.followers }} followers</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Artist {
  id: string
  name: string
  imageUrl: string
  followers: string
}

defineProps<{
  artist: Artist
}>()
</script>

<style scoped>
.artist-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.artist-card:hover {
  transform: scale(1.05);
}

.card {
  background-color: #181818 !important;
  border: none;
}

.card-img-top {
  padding: 1rem;
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