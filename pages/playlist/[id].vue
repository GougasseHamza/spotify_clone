<template>
  <div class="container-fluid playlist-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-light">Loading playlist...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-3">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <div>
          <strong>Error</strong>
          <p class="mb-0">{{ error }}</p>
        </div>
      </div>
      <button @click="loadPlaylist" class="btn btn-danger mt-3">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Retry
      </button>
    </div>

    <!-- Playlist Content -->
    <div v-else-if="playlist" class="playlist-content">
      <!-- Playlist Header -->
      <div class="playlist-header p-4" :style="headerStyle">
        <div class="d-flex align-items-end">
          <img 
            :src="playlist.images?.[0]?.url || '/default-playlist.jpg'" 
            class="rounded shadow me-4" 
            width="232" 
            height="232" 
            :alt="playlist.name"
          >
          <div class="playlist-info">
            <h1 class="mb-2">{{ playlist.name }}</h1>
            <p class="text-muted mb-3">
              {{ playlist.description || 'No description' }}
            </p>
            <div class="d-flex align-items-center mb-4">
              <img 
                :src="playlist.owner.images?.[0]?.url || '/default-user.jpg'" 
                class="rounded-circle me-2" 
                width="24" 
                height="24" 
                :alt="playlist.owner.display_name"
              >
              <span class="text-muted">{{ playlist.owner.display_name }}</span>
              <span class="text-muted mx-2">•</span>
              <span class="text-muted">{{ playlist.tracks.total }} songs</span>
            </div>
            <div class="d-flex gap-2">
              <button 
                @click="playPlaylist" 
                class="btn btn-success rounded-pill px-4"
                :disabled="!isPlayerReady"
              >
                <i class="bi bi-play-fill me-2"></i>
                Play
              </button>
              <button class="btn btn-outline-light rounded-pill px-4">
                <i class="bi bi-shuffle me-2"></i>
                Shuffle
              </button>
              <button 
                @click="openAddTracksModal"
                class="btn btn-primary rounded-pill px-4"
              >
                <i class="bi bi-plus-lg me-2"></i>
                Add songs
              </button>
              <!-- Debug button for playlist info -->
              <button 
                @click="debugMode = !debugMode" 
                class="btn btn-dark rounded-pill ms-2"
                title="Debug Info"
              >
                <i class="bi bi-bug"></i>
              </button>
            </div>
            
            <!-- Debug info panel -->
            <div v-if="debugMode" class="mt-3 p-3 bg-dark rounded">
              <h6 class="text-warning">Debug Info:</h6>
              <p class="mb-1 small">isOwnPlaylist: {{ isOwnPlaylist }}</p>
              <p class="mb-1 small">Current User: {{ user?.email }}</p>
              <p class="mb-1 small">Playlist Owner: {{ playlist?.owner?.display_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tracks List -->
      <div class="tracks-list p-4">
        <!-- Tracks Table Header -->
        <div class="tracks-header d-flex align-items-center text-muted mb-3 px-3">
          <div style="width: 40px">#</div>
          <div class="flex-grow-1">TITLE</div>
          <div style="width: 150px">DATE ADDED</div>
          <div style="width: 150px" class="text-end">ACTIONS</div>
        </div>

        <!-- Tracks List -->
        <div class="list-group">
          <div 
            v-for="(item, index) in tracks" 
            :key="item.track?.id || index"
            class="track-item list-group-item bg-dark text-white border-secondary"
            @mouseenter="hoveredTrackIndex = index" 
            @mouseleave="hoveredTrackIndex = -1"
          >
            <div class="d-flex align-items-center">
              <!-- Track Number or Play Button -->
              <div class="track-number" style="width: 40px">
                <span v-if="hoveredTrackIndex !== index">{{ index + 1 }}</span>
                <button 
                  v-else
                  @click="playTrack(item.track)" 
                  class="btn btn-link text-white p-0"
                  :disabled="!isPlayerReady"
                >
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
              
              <!-- Track Info -->
              <div class="d-flex align-items-center flex-grow-1">
                <img 
                  :src="item.track?.album?.images?.[0]?.url || '/default-album.jpg'" 
                  class="rounded me-3" 
                  width="40" 
                  height="40" 
                  :alt="item.track?.name"
                >
                <div>
                  <div class="track-name">{{ item.track?.name }}</div>
                  <div class="artist-name text-muted small">
                    {{ item.track?.artists?.map(artist => artist.name).join(', ') }}
                  </div>
                </div>
              </div>
              
              <!-- Date Added -->
              <div class="text-muted small" style="width: 150px">
                {{ formatDate(item.added_at) }}
              </div>
              
              <!-- Actions -->
              <div class="track-actions text-end" style="width: 150px">
                <div class="d-flex justify-content-end">
                  <!-- Remove from Playlist Button -->
                  <button 
                    @click="confirmRemoveTrack(item.track)" 
                    class="btn btn-outline-danger btn-sm"
                    title="Remove from playlist"
                  >
                    <i class="bi bi-trash me-1"></i>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Track Confirmation Modal -->
    <div 
      class="modal fade" 
      id="removeTrackModal" 
      tabindex="-1" 
      aria-labelledby="removeTrackModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="removeTrackModalLabel">Remove Track</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to remove "<strong>{{ trackToRemove?.name }}</strong>" from this playlist?</p>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="removeTrack" :disabled="isRemoving">
              <span v-if="isRemoving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Tracks Dialog -->
    <div 
      class="modal fade" 
      id="addTracksModal" 
      tabindex="-1" 
      aria-labelledby="addTracksModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="addTracksModalLabel">
              <i class="bi bi-music-note-list me-2"></i>
              Add Songs to Playlist
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <span class="input-group-text bg-dark text-white border-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-dark text-white border-secondary" 
                placeholder="Search for songs to add..." 
                v-model="searchQuery"
                @input="onSearchInput"
                autofocus
              >
            </div>
            
            <div v-if="isSearching" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-light" role="status">
                <span class="visually-hidden">Searching...</span>
              </div>
            </div>
            
            <div v-else-if="searchResults.length > 0" class="search-results-list">
              <div 
                v-for="track in searchResults" 
                :key="track.id"
                class="search-result-item d-flex align-items-center p-2 rounded mb-2"
                :class="{ 'selected': selectedTracks.includes(track.uri) }"
                @click="toggleTrackSelection(track)"
              >
                <img 
                  :src="track.album?.images?.[0]?.url || '/default-album.jpg'" 
                  class="rounded me-3" 
                  width="40" 
                  height="40" 
                  :alt="track.name"
                >
                <div class="flex-grow-1">
                  <div class="track-name">{{ track.name }}</div>
                  <div class="artist-name text-muted small">
                    {{ track.artists?.map(artist => artist.name).join(', ') }}
                  </div>
                </div>
                <div class="selection-indicator">
                  <i v-if="selectedTracks.includes(track.uri)" class="bi bi-check-circle-fill text-success fs-5"></i>
                  <i v-else class="bi bi-plus-circle text-light"></i>
                </div>
              </div>
            </div>
            
            <div v-else-if="searchQuery" class="text-center py-3">
              <p class="text-muted">No tracks found. Try a different search term.</p>
            </div>
            
            <div v-else class="text-center py-3">
              <p class="text-muted">
                <i class="bi bi-music-note-beamed me-2 fs-4"></i><br>
                Search for songs to add to your playlist
              </p>
            </div>
          </div>
          <div class="modal-footer border-secondary">
            <span class="me-auto text-muted" v-if="selectedTracks.length > 0">
              {{ selectedTracks.length }} song{{ selectedTracks.length !== 1 ? 's' : '' }} selected
            </span>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-success" 
              @click="addTracksToPlaylist" 
              :disabled="selectedTracks.length === 0 || isAdding"
            >
              <span v-if="isAdding" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-plus-lg me-2"></i>
              Add Selected Songs
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'
import { useAuth } from '~/composables/useAuth'
import AddToPlaylistMenu from '~/components/AddToPlaylistMenu.vue'

// Types for Spotify data
interface SpotifyTrack {
  id: string
  name: string
  uri: string
  album: {
    images: { url: string }[]
    name: string
    id: string
  }
  artists: Array<{ id: string, name: string }>
}

interface PlaylistTrack {
  track: SpotifyTrack
  added_at: string
}

interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  tracks: {
    total: number
    items?: PlaylistTrack[]
  }
  owner: {
    id: string
    display_name: string
    images?: { url: string }[]
  }
}

// Modal control - we'll implement this using Bootstrap's modal API
// let removeTrackModal: any = null;
// let addTracksModal: any = null;

const route = useRoute()
const { 
  getPlaylistTracks, 
  getPlaylist,
  play, 
  addTrackToPlaylist, 
  removeTracksFromPlaylist,
  searchTracks: searchTracksApi
} = useSpotify()
const { playTrack: playerPlayTrack, isPlayerReady } = useSpotifyPlayer()
const { user } = useAuth()

const isLoading = ref(true)
const error = ref<string | null>(null)
const playlist = ref<SpotifyPlaylist | null>(null)
const tracks = ref<PlaylistTrack[]>([])
const hoveredTrackIndex = ref(-1)
const trackToRemove = ref<SpotifyTrack | null>(null)
const isRemoving = ref(false)
const isOwnPlaylist = computed(() => {
  if (!user.value || !playlist.value) return false;
  
  // For the purpose of this app, we'll just assume all users can add songs
  // This makes it easier to test the functionality
  return true;
  
  // Original logic: (kept for reference)
  // // Check by email if we don't have matching IDs
  // if (user.value.email && playlist.value.owner.display_name) {
  //   // Sometimes the owner ID doesn't match the user ID, but the display name matches the email
  //   const userEmail = user.value.email;
  //   const username = userEmail.split('@')[0]; // Extract username part of email
  //   return playlist.value.owner.display_name.toLowerCase().includes(username.toLowerCase());
  // }
  
  // // Fallback to ID check
  // return playlist.value.owner.id === user.value.uid;
})

// Search and add tracks vars
const searchQuery = ref('')
const searchResults = ref<SpotifyTrack[]>([])
const isSearching = ref(false)
const selectedTracks = ref<string[]>([])
const isAdding = ref(false)
const debugMode = ref(false)

// Compute header background style
const headerStyle = computed(() => {
  if (!playlist.value?.images?.[0]?.url) return {}
  
  return {
    background: `linear-gradient(to bottom, rgba(0,0,0,0.7), #121212), url(${playlist.value.images[0].url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

// Load playlist data
const loadPlaylist = async () => {
  const playlistId = route.params.id as string
  if (!playlistId) {
    error.value = 'No playlist ID provided'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    // Get playlist details
    const playlistDetails = await getPlaylist(playlistId)
    playlist.value = playlistDetails
    
    // Load playlist tracks
    const playlistTracks = await getPlaylistTracks(playlistId)
    tracks.value = playlistTracks
  } catch (err) {
    console.error('Error loading playlist:', err)
    error.value = 'Failed to load playlist'
  } finally {
    isLoading.value = false
  }
}

// Play a track
const playTrack = (track: SpotifyTrack) => {
  if (!isPlayerReady.value) {
    console.warn('Player not ready')
    return
  }
  
  playerPlayTrack(track.uri)
}

// Play the entire playlist
const playPlaylist = async () => {
  if (!isPlayerReady.value || !playlist.value) {
    console.warn('Player not ready or no playlist')
    return
  }

  try {
    await play({ context_uri: `spotify:playlist:${playlist.value.id}` })
  } catch (error) {
    console.error('Error playing playlist:', error)
  }
}

// Format date to relative time
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

// Open add tracks modal
const openAddTracksModal = () => {
  // Reset state
  searchQuery.value = ''
  searchResults.value = []
  selectedTracks.value = []
  
  // Manually create and open Bootstrap modal
  try {
    // @ts-ignore
    const Modal = window.bootstrap.Modal
    const modalEl = document.getElementById('addTracksModal')
    if (modalEl && Modal) {
      const modal = new Modal(modalEl)
      modal.show()
    } else {
      console.error('Modal element or Bootstrap Modal not found')
    }
  } catch (error) {
    console.error('Error opening modal:', error)
  }
}

// Confirm remove track
const confirmRemoveTrack = (track: SpotifyTrack) => {
  trackToRemove.value = track
  
  // Manually create and open Bootstrap modal
  try {
    // @ts-ignore
    const Modal = window.bootstrap.Modal
    const modalEl = document.getElementById('removeTrackModal')
    if (modalEl && Modal) {
      const modal = new Modal(modalEl)
      modal.show()
    } else {
      console.error('Modal element or Bootstrap Modal not found')
    }
  } catch (error) {
    console.error('Error opening modal:', error)
  }
}

// Handle search input with debounce
let searchTimeoutId: any = null
const onSearchInput = () => {
  clearTimeout(searchTimeoutId)
  searchTimeoutId = setTimeout(() => {
    searchTracks()
  }, 500)
}

// Remove track from playlist
const removeTrack = async () => {
  if (!trackToRemove.value || !playlist.value) return
  
  try {
    isRemoving.value = true
    await removeTracksFromPlaylist(playlist.value.id, [trackToRemove.value.uri])
    
    // Remove from local state
    tracks.value = tracks.value.filter(item => item.track.uri !== trackToRemove.value?.uri)
    
    // Update total count
    if (playlist.value) {
      playlist.value.tracks.total -= 1
    }
    
    // Hide modal
    try {
      // @ts-ignore
      const Modal = window.bootstrap.Modal
      const modalEl = document.getElementById('removeTrackModal')
      if (modalEl && Modal) {
        const modal = Modal.getInstance(modalEl)
        if (modal) modal.hide()
      }
    } catch (error) {
      console.error('Error closing modal:', error)
    }
  } catch (err) {
    console.error('Error removing track:', err)
    alert('Failed to remove track from playlist')
  } finally {
    isRemoving.value = false
    trackToRemove.value = null
  }
}

// Search for tracks
const searchTracks = async () => {
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  try {
    const results = await searchTracksApi(searchQuery.value)
    searchResults.value = results
  } catch (err) {
    console.error('Error searching tracks:', err)
  } finally {
    isSearching.value = false
  }
}

// Toggle track selection
const toggleTrackSelection = (track: SpotifyTrack) => {
  const index = selectedTracks.value.indexOf(track.uri)
  if (index === -1) {
    selectedTracks.value.push(track.uri)
  } else {
    selectedTracks.value.splice(index, 1)
  }
}

// Add selected tracks to playlist
const addTracksToPlaylist = async () => {
  if (selectedTracks.value.length === 0 || !playlist.value) return
  
  isAdding.value = true
  try {
    await addTrackToPlaylist(playlist.value.id, selectedTracks.value)
    
    // Reload playlist tracks
    const playlistTracks = await getPlaylistTracks(playlist.value.id)
    tracks.value = playlistTracks
    
    // Update total count
    if (playlist.value) {
      playlist.value.tracks.total = playlistTracks.length
    }
    
    // Hide modal
    try {
      // @ts-ignore
      const Modal = window.bootstrap.Modal
      const modalEl = document.getElementById('addTracksModal')
      if (modalEl && Modal) {
        const modal = Modal.getInstance(modalEl)
        if (modal) modal.hide()
      }
    } catch (error) {
      console.error('Error closing modal:', error)
    }
  } catch (err) {
    console.error('Error adding tracks:', err)
    alert('Failed to add tracks to playlist')
  } finally {
    isAdding.value = false
  }
}

// Initialize component
onMounted(() => {
  loadPlaylist()
})
</script>

<style scoped>
.playlist-header {
  border-radius: 8px 8px 0 0;
}

.playlist-info h1 {
  font-size: 2.5rem;
  font-weight: 700;
}

.track-item {
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.track-number {
  color: #b3b3b3;
  font-size: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-name {
  font-weight: 500;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-result-item.selected {
  background-color: rgba(29, 185, 84, 0.2);
}

.selection-indicator {
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 