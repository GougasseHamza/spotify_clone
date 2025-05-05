<template>
  <div class="callback-page d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="text-center">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-light mt-3">Authenticating with Spotify...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { handleCallback } = useSpotify()

onMounted(async () => {
  try {
    const code = route.query.code as string
    if (code) {
      await handleCallback(code)
      router.push('/')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Authentication error:', error)
    router.push('/')
  }
})
</script> 