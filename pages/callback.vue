<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="text-center p-8 rounded-lg bg-gray-800">
      <div v-if="error" class="text-red-500 mb-4">
        {{ error }}
      </div>
      <div v-else class="text-white">
        <div class="mb-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <p>Connecting to Spotify...</p>
      </div>
      
      <!-- Debug Information (only shown if there's an error) -->
      <div v-if="error && debugInfo" class="mt-4 text-left">
        <details class="text-sm text-gray-400">
          <summary class="cursor-pointer">Debug Information</summary>
          <pre class="mt-2 p-2 bg-gray-900 rounded">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSpotify } from '~/composables/useSpotify'

const router = useRouter()
const error = ref<string | null>(null)
const debugInfo = ref<any>(null)

onMounted(async () => {
  console.log('Callback page mounted')
  const { handleCallback } = useSpotify()
  
  try {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const spotifyError = urlParams.get('error')
    
    console.log('Received callback parameters:', {
      hasCode: !!code,
      hasState: !!state,
      error: spotifyError,
      fullUrl: window.location.href
    })
    
    // Collect debug information
    debugInfo.value = {
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      error: spotifyError,
      fullUrl: window.location.href,
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      timestamp: new Date().toISOString()
    }
    
    // Check for Spotify error
    if (spotifyError) {
      console.error('Spotify returned an error:', spotifyError)
      throw new Error(`Spotify returned an error: ${spotifyError}`)
    }
    
    // Verify we have the authorization code
    if (!code) {
      console.error('No authorization code in callback URL')
      throw new Error('No authorization code received from Spotify')
    }
    
    console.log('Starting callback processing')
    // Process the callback
    await handleCallback(code)
    console.log('Callback processed successfully')
    
    // Redirect to the music page on success
    console.log('Redirecting to /my-music')
    router.push('/my-music')
  } catch (e: any) {
    console.error('Error processing Spotify callback:', e)
    error.value = e.message || 'An error occurred while connecting to Spotify'
  }
})
</script>

<style scoped>
.loading {
  display: inline-block;
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid #4f46e5;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 