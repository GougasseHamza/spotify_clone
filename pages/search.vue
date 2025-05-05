<template>
  <div class="search-page">
    <div class="search-header mb-4">
      <h1 class="mb-4">Search</h1>
      <div class="search-container">
        <SearchBar @select="handleTrackSelect" />
      </div>
    </div>

    <!-- Spotify Player -->
    <SpotifyPlayer class="mb-4" />
    
    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h2 class="mb-4">Top Results</h2>
      
      <!-- Tracks Grid -->
      <div class="tracks-grid">
        <div v-for="track in searchResults" :key="track.id" 
             class="track-card" @click="handleTrackSelect(track)">
          <div class="track-image">
            <img :src="track.album.images[1]?.url || '/default-album.png'" 
                 :alt="track.album.name">
            <button class="play-button" @click.stop="playTrack(track)">
              <i class="bi bi-play-fill"></i>
            </button>
          </div>
          <div class="track-info">
            <h3 class="track-name">{{ track.name }}</h3>
            <p class="track-artist">{{ track.artists[0].name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Browse Categories -->
    <div v-else class="browse-categories">
      <h2 class="mb-4">Browse All</h2>
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.id" 
             class="category-card" :style="{ backgroundColor: category.color }">
          <h3>{{ category.name }}</h3>
          <img :src="category.image" :alt="category.name">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

const { searchTracks } = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()
const searchResults = ref<any[]>([])

// Mock categories data
const categories = ref([
  { id: 1, name: 'Pop', color: '#FF4081', image: '/categories/pop.jpg' },
  { id: 2, name: 'Rock', color: '#7C4DFF', image: '/categories/rock.jpg' },
  { id: 3, name: 'Hip-Hop', color: '#FF6E40', image: '/categories/hiphop.jpg' },
  { id: 4, name: 'Electronic', color: '#18FFFF', image: '/categories/electronic.jpg' },
  { id: 5, name: 'Jazz', color: '#69F0AE', image: '/categories/jazz.jpg' },
  { id: 6, name: 'Classical', color: '#FFD740', image: '/categories/classical.jpg' },
])

const handleTrackSelect = (track: any) => {
  console.log('Selected track:', track)
  searchResults.value = [track, ...searchResults.value.filter(t => t.id !== track.id)]
}

const playTrack = (track: any) => {
  if (!isPlayerReady.value) {
    console.warn('Spotify player is not ready yet')
    return
  }
  
  console.log('Playing track:', track.name)
  playerPlayTrack(track.uri)
}
</script>

<style scoped>
.search-page {
  padding: 20px;
}

.search-header {
  margin-bottom: 40px;
}

.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.track-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.track-card:hover {
  background: rgba(255, 255, 255, 0.2);
}

.track-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 16px;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.play-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1DB954;
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease;
}

.track-card:hover .play-button {
  opacity: 1;
  transform: translateY(0);
}

.track-info {
  color: white;
}

.track-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.category-card {
  position: relative;
  border-radius: 8px;
  padding: 16px;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.category-card:hover {
  transform: scale(1.02);
}

.category-card h3 {
  position: relative;
  z-index: 1;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.category-card img {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  object-fit: cover;
  transform: rotate(25deg) translate(18%, -2%);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}
</style> 