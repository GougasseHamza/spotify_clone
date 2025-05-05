<template>
  <div class="my-music-page">
    <h1 class="mb-4">My Music</h1>
    
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading your music...</p>
    </div>
    
    <div v-else>
      <!-- Connection Status -->
      <div v-if="!isSpotifyConnected" class="text-center py-5">
        <div class="alert alert-dark">
          <h4>Connect to Spotify</h4>
          <p class="mb-3">To view your personalized music data, you need to connect your Spotify account.</p>
          <button @click="connectSpotify" class="btn btn-success rounded-pill px-4">
            <i class="bi bi-spotify me-2"></i> Connect to Spotify
          </button>
        </div>
      </div>

      <div v-else>
        <!-- Spotify Player -->
        <SpotifyPlayer class="mb-4" />

        <!-- Top Artists -->
        <section class="mb-5">
          <h2 class="mb-3">Your Top Artists</h2>
          <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            <div v-for="artist in topArtists" :key="artist.id" class="col">
              <div class="card bg-dark h-100">
                <img :src="artist.images[0]?.url || '/img/placeholder-artist.png'" class="card-img-top" :alt="artist.name">
                <div class="card-body">
                  <h5 class="card-title">{{ artist.name }}</h5>
                  <p class="card-text text-muted">Artist</p>
                </div>
              </div>
            </div>
            <div v-if="topArtists.length === 0" class="col-12">
              <div class="alert alert-dark">
                <p class="mb-0">No top artists found. Start listening to build your profile!</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Recently Played -->
        <section class="mb-5">
          <h2 class="mb-3">Recently Played</h2>
          <div class="row">
            <div v-for="track in recentlyPlayed" :key="track.played_at" class="col-12 mb-2">
              <div class="d-flex align-items-center p-2 rounded hover-bg-dark">
                <img :src="track.track.album.images[0]?.url || '/img/placeholder-album.png'" 
                    class="me-3" width="48" height="48" :alt="track.track.name">
                <div class="flex-grow-1">
                  <div class="track-name">{{ track.track.name }}</div>
                  <div class="artist-name text-muted">{{ track.track.artists.map(a => a.name).join(', ') }}</div>
                </div>
                <div class="text-muted small me-3">{{ formatDate(track.played_at) }}</div>
                <button @click="playTrack(track.track)" 
                        class="btn btn-sm btn-success rounded-circle" 
                        title="Play track">
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
            </div>
            <div v-if="recentlyPlayed.length === 0" class="col-12">
              <div class="alert alert-dark">
                <p class="mb-0">No recently played tracks found. Start listening to see your history!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'
import { useAuth } from '~/composables/useAuth'

// Types for Spotify data
interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  uri: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{
    id: string;
    name: string;
    uri: string;
  }>;
}

interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

// Add auth middleware to protect this route
definePageMeta({
  middleware: ['auth']
})

const { getMyTopArtists, getMyRecentlyPlayed, login, hasToken, isConnected, isInitialized } = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()
const { user, isAuthenticated } = useAuth()
const isLoading = ref(true)
const topArtists = ref<SpotifyArtist[]>([])
const recentlyPlayed = ref<RecentlyPlayedItem[]>([])
const isSpotifyConnected = computed(() => isInitialized.value && isConnected.value)

onMounted(async () => {
  console.log('My Music Page - Auth State:', { 
    user: user.value, 
    isAuthenticated: isAuthenticated.value,
    spotifyState: {
      isInitialized: isInitialized.value,
      hasToken: hasToken.value,
      isConnected: isConnected.value
    }
  })
  
  try {
    // Wait for Spotify to initialize
    await waitFor(() => isInitialized.value)
    isLoading.value = false
    
    // Only try to load data if we have a token
    if (isConnected.value) {
      loadMusicData()
    }
  } catch (error) {
    console.error('Error in initialization:', error)
    isLoading.value = false
  }
})

// Function to wait for a condition
const waitFor = (condition: () => boolean, maxWait = 5000, interval = 100) => {
  return new Promise<void>((resolve, reject) => {
    if (condition()) {
      resolve()
      return
    }
    
    const startTime = Date.now()
    const intervalId = setInterval(() => {
      if (condition()) {
        clearInterval(intervalId)
        resolve()
        return
      }
      
      if (Date.now() - startTime > maxWait) {
        clearInterval(intervalId)
        resolve() // Resolve anyway after timeout
      }
    }, interval)
  })
}

// Load music data from Spotify
const loadMusicData = async () => {
  isLoading.value = true
  
  try {
    // Try to load Spotify data
    const [artistsData, recentlyPlayedData] = await Promise.allSettled([
      getMyTopArtists(),
      getMyRecentlyPlayed()
    ])
    
    if (artistsData.status === 'fulfilled' && artistsData.value) {
      topArtists.value = artistsData.value as SpotifyArtist[]
    }
    
    if (recentlyPlayedData.status === 'fulfilled' && recentlyPlayedData.value) {
      recentlyPlayed.value = recentlyPlayedData.value as RecentlyPlayedItem[]
    }
  } catch (error) {
    console.error('Error loading music data:', error)
  } finally {
    isLoading.value = false
  }
}

// Play a track
const playTrack = (track: SpotifyTrack) => {
  if (!isPlayerReady.value) {
    console.warn('Spotify player is not ready yet')
    return
  }
  
  console.log('Playing track:', track.name)
  playerPlayTrack(track.uri)
}

// Format date to relative time (e.g., "2 hours ago")
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  } else {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
  }
}

// Connect to Spotify
const connectSpotify = () => {
  login()
}
</script>

<style scoped>
.my-music-page {
  padding: 1rem;
}

.hover-bg-dark:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style> 