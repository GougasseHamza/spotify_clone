<template>
  <div class="logout-page d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="text-center">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Logging out...</span>
      </div>
      <p class="text-light mt-3">Logging you out...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { logout } = useAuth()

onMounted(async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Always redirect to home page after logout attempt
    router.push('/')
  }
})
</script> 