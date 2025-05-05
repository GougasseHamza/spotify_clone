<template>
  <div class="debug-page p-4">
    <h1 class="mb-4">Authentication Debug</h1>
    
    <div class="card bg-dark mb-4">
      <div class="card-header">
        <h3 class="mb-0">Authentication State</h3>
      </div>
      <div class="card-body">
        <pre class="bg-dark-subtle p-3 rounded text-white">{{ authState }}</pre>
      </div>
    </div>
    
    <div class="d-flex gap-3">
      <button class="btn btn-primary" @click="refreshState">Refresh State</button>
      <NuxtLink to="/" class="btn btn-outline-light">Back to Home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// No auth middleware on this page
// definePageMeta({
//   middleware: ['auth']
// })

const { user, isAuthenticated, authInitialized } = useAuth()
const { auth } = useFirebase()

const lastCheck = ref(new Date())
const authState = computed(() => {
  return {
    currentTime: new Date().toLocaleString(),
    lastCheck: lastCheck.value.toLocaleString(),
    authInitialized: authInitialized.value,
    isAuthenticated: isAuthenticated.value,
    user: user.value ? {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
      emailVerified: user.value.emailVerified,
      createdAt: user.value.metadata.creationTime,
      lastLogin: user.value.metadata.lastSignInTime
    } : null,
    firebase: {
      currentUser: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email
      } : null
    }
  }
})

const refreshState = () => {
  lastCheck.value = new Date()
}

onMounted(() => {
  refreshState()
  // Auto-refresh every 3 seconds
  const interval = setInterval(refreshState, 3000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.debug-page {
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  min-height: 100vh;
  color: white;
}

pre {
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.bg-dark-subtle {
  background-color: #333 !important;
}
</style> 