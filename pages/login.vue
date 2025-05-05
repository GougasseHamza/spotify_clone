<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card bg-dark text-white p-4">
            <div class="text-center mb-4">
              <h3 class="spotify-logo mb-4">Spotify</h3>
              <h4 class="fw-bold">Log in to Spotify</h4>
            </div>
            
            <!-- Login Form -->
            <form @submit.prevent="handleEmailLogin" v-if="!isRegistering">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control bg-dark-subtle text-white" 
                  id="email" 
                  v-model="email" 
                  required
                >
              </div>
              <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control bg-dark-subtle text-white" 
                  id="password" 
                  v-model="password" 
                  required
                >
              </div>
              <div v-if="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>
              <button type="submit" class="btn btn-success w-100 rounded-pill py-2 mb-3">
                Log In
              </button>
            </form>

            <!-- Register Form -->
            <form @submit.prevent="handleRegister" v-else>
              <div class="mb-3">
                <label for="register-email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control bg-dark-subtle text-white" 
                  id="register-email" 
                  v-model="email" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="register-password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control bg-dark-subtle text-white" 
                  id="register-password" 
                  v-model="password" 
                  required
                >
              </div>
              <div class="mb-4">
                <label for="confirm-password" class="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  class="form-control bg-dark-subtle text-white" 
                  id="confirm-password" 
                  v-model="confirmPassword" 
                  required
                >
              </div>
              <div v-if="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>
              <button type="submit" class="btn btn-success w-100 rounded-pill py-2 mb-3">
                Sign Up
              </button>
            </form>

            <!-- Divider with "or" text -->
            <div class="divider-with-text mb-3">
              <span>OR</span>
            </div>
            
            <!-- Social Logins -->
            <button @click="handleGoogleLogin" class="btn btn-outline-light w-100 rounded-pill py-2 mb-3 d-flex align-items-center justify-content-center">
              <i class="bi bi-google me-2"></i> Continue with Google
            </button>
            
            <!-- Toggle Login/Register -->
            <div class="text-center mt-4">
              <p v-if="!isRegistering">
                Don't have an account? 
                <a href="#" @click.prevent="isRegistering = true" class="text-success">Sign up for Spotify</a>
              </p>
              <p v-else>
                Already have an account? 
                <a href="#" @click.prevent="isRegistering = false" class="text-success">Log in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isRegistering = ref(false)

const handleGoogleLogin = async () => {
  try {
    errorMessage.value = ''
    await loginWithGoogle()
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to login with Google'
  }
}

const handleEmailLogin = async () => {
  try {
    errorMessage.value = ''
    await loginWithEmail(email.value, password.value)
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to login'
  }
}

const handleRegister = async () => {
  try {
    errorMessage.value = ''
    
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match'
      return
    }
    
    await registerWithEmail(email.value, password.value)
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to register'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.spotify-logo {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: -1px;
}

.divider-with-text {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider-with-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #333;
  z-index: 1;
}

.divider-with-text span {
  position: relative;
  background-color: #212529;
  padding: 0 15px;
  z-index: 2;
  color: #aaa;
}

.bg-dark-subtle {
  background-color: #333 !important;
  border-color: #333 !important;
}

.btn-success {
  background-color: #1DB954;
  border-color: #1DB954;
}

.btn-success:hover {
  background-color: #1ed760;
  border-color: #1ed760;
}
</style> 