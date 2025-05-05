<template>
  <div class="container py-4">
    <h1 class="mb-4">Spotify Connection Debug</h1>
    
    <div class="card bg-dark text-white mb-4">
      <div class="card-body">
        <h5 class="card-title">Connection Status</h5>
        <div class="row">
          <div class="col-md-6">
            <ul class="list-group list-group-flush">
              <li class="list-group-item bg-dark d-flex justify-content-between">
                <span>Initialized:</span>
                <span class="badge" :class="isInitialized ? 'bg-success' : 'bg-danger'">
                  {{ isInitialized ? 'Yes' : 'No' }}
                </span>
              </li>
              <li class="list-group-item bg-dark d-flex justify-content-between">
                <span>Has Token:</span>
                <span class="badge" :class="hasToken ? 'bg-success' : 'bg-danger'">
                  {{ hasToken ? 'Yes' : 'No' }}
                </span>
              </li>
              <li class="list-group-item bg-dark d-flex justify-content-between">
                <span>Connected:</span>
                <span class="badge" :class="isConnected ? 'bg-success' : 'bg-danger'">
                  {{ isConnected ? 'Yes' : 'No' }}
                </span>
              </li>
              <li class="list-group-item bg-dark d-flex justify-content-between">
                <span>Player Ready:</span>
                <span class="badge" :class="isPlayerReady ? 'bg-success' : 'bg-danger'">
                  {{ isPlayerReady ? 'Yes' : 'No' }}
                </span>
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <div class="d-grid gap-2">
              <button @click="connect" class="btn btn-success mb-2" :disabled="isConnected">
                Connect to Spotify
              </button>
              <button @click="disconnect" class="btn btn-danger mb-2" :disabled="!isConnected">
                Disconnect from Spotify
              </button>
              <button @click="testApi" class="btn btn-primary mb-2" :disabled="!isConnected">
                Test API Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card bg-dark text-white mb-4" v-if="testResults">
      <div class="card-body">
        <h5 class="card-title">API Test Results</h5>
        <div class="text-success" v-if="testResults.success">
          <p>API Connection Successful!</p>
          <p>User: {{ testResults.display_name }} ({{ testResults.email }})</p>
          <p>Product: {{ testResults.product }}</p>
        </div>
        <div class="text-danger" v-else>
          <p>API Connection Failed: {{ testResults.error }}</p>
        </div>
      </div>
    </div>
    
    <div class="card bg-dark text-white">
      <div class="card-body">
        <h5 class="card-title">Token Information</h5>
        <div v-if="hasToken">
          <div class="mb-3">
            <label class="form-label">Access Token</label>
            <div class="d-flex align-items-center">
              <input type="text" class="form-control form-control-sm bg-dark-subtle text-white" 
                     :value="maskToken(accessToken)" readonly />
              <button class="btn btn-outline-light ms-2" @click="copyToClipboard(accessToken)">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Refresh Token</label>
            <div class="d-flex align-items-center">
              <input type="text" class="form-control form-control-sm bg-dark-subtle text-white" 
                     :value="maskToken(refreshToken)" readonly />
              <button class="btn btn-outline-light ms-2" @click="copyToClipboard(refreshToken)">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Expires At</label>
            <input type="text" class="form-control form-control-sm bg-dark-subtle text-white" 
                   :value="formatExpiryTime(expiryTime)" readonly />
          </div>
        </div>
        <div v-else>
          <p class="text-muted">No token information available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSpotify } from '~/composables/useSpotify'
import { useSpotifyPlayer } from '~/composables/useSpotifyPlayer'

const { login, logout, isInitialized, hasToken, isConnected, spotifyApi } = useSpotify()
const { isPlayerReady } = useSpotifyPlayer()

const accessToken = ref('')
const refreshToken = ref('')
const expiryTime = ref(0)
const testResults = ref(null)

onMounted(() => {
  if (process.client) {
    accessToken.value = localStorage.getItem('spotify_access_token') || ''
    refreshToken.value = localStorage.getItem('spotify_refresh_token') || ''
    expiryTime.value = parseInt(localStorage.getItem('spotify_token_expires') || '0')
  }
})

const connect = () => {
  login()
}

const disconnect = () => {
  logout()
  testResults.value = null
}

const testApi = async () => {
  try {
    const response = await spotifyApi.getMe()
    testResults.value = {
      success: true,
      ...response.body
    }
  } catch (error) {
    console.error('API test failed:', error)
    testResults.value = {
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

const maskToken = (token: string) => {
  if (!token) return ''
  return token.substring(0, 10) + '...' + token.substring(token.length - 10)
}

const formatExpiryTime = (timestamp: number) => {
  if (!timestamp) return 'Not set'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = timestamp - now.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  
  if (diffMinutes < 0) {
    return `Expired ${-diffMinutes} minutes ago (${date.toLocaleString()})`
  } else {
    return `Expires in ${diffMinutes} minutes (${date.toLocaleString()})`
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Copied to clipboard')
    })
    .catch(err => {
      console.error('Error copying to clipboard:', err)
    })
}
</script>

<style scoped>
.list-group-item {
  border-color: #333;
}

.bg-dark-subtle {
  background-color: #333 !important;
  border-color: #333 !important;
}
</style> 