<template>
  <div class="profile-page">
    <div class="container py-5">
      <div class="row">
        <div class="col-lg-4">
          <div class="card bg-dark text-white mb-4">
            <div class="card-body text-center">
              <img 
                :src="user?.photoURL || 'https://via.placeholder.com/150?text=User'" 
                class="rounded-circle img-fluid" 
                style="width: 150px;" 
                alt="User Profile"
              >
              <h5 class="my-3">{{ user?.displayName || 'User' }}</h5>
              <p class="text-muted mb-1">{{ user?.email }}</p>
              <button class="btn btn-success" @click="showPhotoUploadModal = true">
                Change Photo
              </button>
            </div>
          </div>
        </div>
        
        <div class="col-lg-8">
          <div class="card bg-dark text-white mb-4">
            <div class="card-body">
              <h6 class="mb-4">Profile Information</h6>
              <form @submit.prevent="updateProfile">
                <div class="mb-3">
                  <label class="form-label" for="displayName">Display Name</label>
                  <input 
                    type="text" 
                    id="displayName" 
                    v-model="displayName" 
                    class="form-control bg-dark-subtle text-white" 
                    placeholder="Enter your display name"
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label" for="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="email" 
                    class="form-control bg-dark-subtle text-white" 
                    disabled
                  >
                </div>

                <div class="d-flex justify-content-end">
                  <button 
                    type="submit" 
                    class="btn btn-success"
                    :disabled="isLoading || !isChanged"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="card bg-dark text-white">
            <div class="card-body">
              <h6 class="mb-4">Security</h6>
              <div class="mb-3">
                <button 
                  class="btn btn-outline-light me-2"
                  @click="showResetPasswordModal = true"
                >
                  Reset Password
                </button>
                <button 
                  class="btn btn-danger"
                  @click="showDeleteAccountModal = true"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetPasswordModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-0">
            <h5 class="modal-title">Reset Password</h5>
            <button type="button" class="btn-close btn-close-white" @click="showResetPasswordModal = false"></button>
          </div>
          <div class="modal-body">
            <p>We'll send a password reset email to: <strong>{{ user?.email }}</strong></p>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-light" @click="showResetPasswordModal = false">Cancel</button>
            <button type="button" class="btn btn-success" @click="handleResetPassword">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Send Reset Email
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteAccountModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header border-0">
            <h5 class="modal-title">Delete Account</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteAccountModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-danger">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
            <p>Please type "DELETE" to confirm:</p>
            <input 
              type="text" 
              v-model="deleteConfirmation" 
              class="form-control bg-dark-subtle text-white"
              placeholder="Type DELETE here"
            >
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-light" @click="showDeleteAccountModal = false">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleDeleteAccount"
              :disabled="deleteConfirmation !== 'DELETE'"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop for modals -->
    <div 
      v-if="showResetPasswordModal || showDeleteAccountModal" 
      class="modal-backdrop show"
      @click="closeAllModals"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isLoading, updateUserProfile, resetPassword } = useAuth()

// Form data
const displayName = ref('')
const email = ref('')
const deleteConfirmation = ref('')

// Modal states
const showResetPasswordModal = ref(false)
const showDeleteAccountModal = ref(false)
const showPhotoUploadModal = ref(false)

// Computed properties
const isChanged = computed(() => {
  return displayName.value !== user.value?.displayName
})

// Initialize form data
onMounted(() => {
  if (user.value) {
    displayName.value = user.value.displayName || ''
    email.value = user.value.email || ''
  } else {
    // Redirect to login if not authenticated
    router.push('/login')
  }
})

// Methods
const updateProfile = async () => {
  if (!user.value || !isChanged.value) return
  
  try {
    await updateUserProfile(displayName.value)
    alert('Profile updated successfully')
  } catch (error: any) {
    alert(error.message || 'Failed to update profile')
  }
}

const handleResetPassword = async () => {
  if (!user.value?.email) return
  
  try {
    await resetPassword(user.value.email)
    showResetPasswordModal.value = false
    alert('Password reset email sent. Please check your inbox.')
  } catch (error: any) {
    alert(error.message || 'Failed to send reset email')
  }
}

const handleDeleteAccount = async () => {
  // This functionality would require additional Firebase security rules
  // and server-side code, so we'll just show a message for now
  alert('Account deletion requires additional server-side integration. Please contact support.')
  showDeleteAccountModal.value = false
}

const closeAllModals = () => {
  showResetPasswordModal.value = false
  showDeleteAccountModal.value = false
  showPhotoUploadModal.value = false
}
</script>

<style scoped>
.profile-page {
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  min-height: 100vh;
}

.card {
  border: none;
  border-radius: 10px;
}

.bg-dark-subtle {
  background-color: #333 !important;
  border-color: #333 !important;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #212529;
}

.btn-success {
  background-color: #1DB954;
  border-color: #1DB954;
}

.btn-success:hover:not(:disabled) {
  background-color: #1ed760;
  border-color: #1ed760;
}
</style> 