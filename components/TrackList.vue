<template>
  <div class="track-list">
    <table class="table table-dark table-hover">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Title</th>
          <th scope="col">Artist</th>
          <th scope="col">Album</th>
          <th scope="col">Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(track, index) in tracks" :key="track.id" class="track-item" @click="$emit('play', track)">
          <td class="align-middle">{{ index + 1 }}</td>
          <td class="align-middle">
            <div class="d-flex align-items-center">
              <img :src="track.imageUrl" :alt="track.name" class="track-image me-3">
              <span>{{ track.name }}</span>
            </div>
          </td>
          <td class="align-middle">{{ track.artist }}</td>
          <td class="align-middle">{{ track.album }}</td>
          <td class="align-middle">{{ track.duration }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  imageUrl: string
}

defineProps<{
  tracks: Track[]
}>()
</script>

<style scoped>
.track-list {
  width: 100%;
}

.table {
  color: white;
}

.table-dark {
  background-color: transparent;
}

.track-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.track-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

th, td {
  border-color: #282828;
}
</style> 