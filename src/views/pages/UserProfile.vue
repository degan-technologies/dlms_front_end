<template>
  <div class="user-profile-page">
    <div class="profile-card">
      <div class="accent-bar"></div>
      <button class="back-btn right" @click="goBack" title="Back">
        <i class="pi pi-arrow-left"></i>
      </button>
      <div class="avatar-section">
        <div class="avatar">
          <span v-if="user.username">{{ user.username.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="user-meta">
          <h2>{{ user.username }}</h2>
          <p class="role-branch">
            <span v-if="user.roles && user.roles.length">
              <i class="pi pi-star-fill"></i> {{ user.roles[0].name }}
            </span>
            <span v-if="user.library_branch">
              &nbsp;| <i class="pi pi-building"></i> {{ user.library_branch.branch_name }}
            </span>
          </p>
        </div>
      </div>
      <div class="profile-details">
        <p><i class="pi pi-envelope"></i> <strong>Email:</strong> {{ user.email }}</p>
        <p><i class="pi pi-phone"></i> <strong>Phone:</strong> {{ user.phone_no || 'N/A' }}</p>
      </div>
      <div class="profile-actions">
        <Button label="Edit Profile" icon="pi pi-pencil" @click="openEdit" />
        <Button label="Change Password" icon="pi pi-key" severity="info" @click="showPassword = true" />
        <Button label="Forgot Password?" icon="pi pi-envelope" severity="help" @click="showForgot = true" class="p-button-text" />
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Dialog v-model:visible="showEdit" header="Edit Profile" :modal="true" :style="{ width: '400px' }">
      <div class="p-fluid">
        <div class="p-field mb-3">
          <label>Username</label>
          <InputText v-model="editUser.username" :class="{'p-invalid': v$.editUser.username.$error}" />
          <small class="p-error" v-if="v$.editUser.username.$error">
            {{ v$.editUser.username.$errors[0].$message }}
          </small>
        </div>
        <div class="p-field mb-3">
          <label>Email</label>
          <InputText v-model="editUser.email" :class="{'p-invalid': v$.editUser.email.$error}" />
          <small class="p-error" v-if="v$.editUser.email.$error">
            {{ v$.editUser.email.$errors[0].$message }}
          </small>
        </div>
        <div class="p-field mb-3">
          <label>Phone Number</label>
          <InputText v-model="editUser.phone_no" :class="{'p-invalid': v$.editUser.phone_no.$error}" />
          <small class="p-error" v-if="v$.editUser.phone_no.$error">
            {{ v$.editUser.phone_no.$errors[0].$message }}
          </small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showEdit = false" class="p-button-text" />
        <Button label="Save" icon="pi pi-check" @click="saveProfile" :loading="loading" />
      </template>
    </Dialog>

    <!-- Change Password Modal -->
    <Dialog v-model:visible="showPassword" header="Change Password" :modal="true" :style="{ width: '400px' }">
      <div class="p-fluid">
        <div class="p-field mb-3">
          <label>Current Password</label>
          <Password v-model="passwords.current" :class="{'p-invalid': v$.passwords.current.$error}" toggleMask />
          <small class="p-error" v-if="v$.passwords.current.$error">
            {{ v$.passwords.current.$errors[0].$message }}
          </small>
        </div>
        <div class="p-field mb-3">
          <label>New Password</label>
          <Password v-model="passwords.new" :class="{'p-invalid': v$.passwords.new.$error}" toggleMask />
          <small class="p-error" v-if="v$.passwords.new.$error">
            {{ v$.passwords.new.$errors[0].$message }}
          </small>
        </div>
        <div class="p-field mb-3">
          <label>Confirm Password</label>
          <Password v-model="passwords.confirm" :class="{'p-invalid': v$.passwords.confirm.$error}" toggleMask />
          <small class="p-error" v-if="v$.passwords.confirm.$error">
            {{ v$.passwords.confirm.$errors[0].$message }}
          </small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showPassword = false" class="p-button-text" />
        <Button label="Change" icon="pi pi-check" @click="changePassword" :loading="loading" />
      </template>
    </Dialog>
    <!-- Forgot Password Modal -->
    <Dialog v-model:visible="showForgot" header="Forgot Password" :modal="true" :style="{ width: '400px' }">
      <div class="p-fluid">
        <div class="p-field mb-3">
          <label>Email</label>
          <InputText v-model="forgotEmail" :class="{'p-invalid': forgotError}" />
          <small class="p-error" v-if="forgotError">{{ forgotError }}</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showForgot = false" class="p-button-text" />
        <Button label="Send Reset Link" icon="pi pi-send" @click="sendResetLink()" :loading="loading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import Cookies from 'js-cookie' // Add this import

const toast = useToast()
const loading = ref(false)
const showEdit = ref(false)
const showPassword = ref(false)
const showForgot = ref(false)
const forgotEmail = ref('')
const forgotError = ref('')

const user = ref({
  username: '',
  email: '',
  phone_no: ''
})

const editUser = ref({
  username: '',
  email: '',
  phone_no: ''
})

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

// Validation rules
const rules = {
  editUser: {
    username: { required },
    email: { required, email },
    phone_no: { required }
  },
  passwords: {
    current: { required },
    new: { required, minLength: minLength(4) },
    confirm: { required }
  }
}

const v$ = useVuelidate(rules, { editUser, passwords })

// Fetch user data on component mount
async function fetchUser() {
  let token = Cookies.get('access_token')
  if (!token) token = localStorage.getItem('access_token')
  if (!token) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 })
    return
  }
  const response = await axios.get('http://localhost:8000/api/user', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  user.value = response.data.user
  editUser.value = {
    username: response.data.user.username || '',
    email: response.data.user.email || '',
    phone_no: response.data.user.phone_no || ''
  }
}

onMounted(fetchUser)

async function saveProfile() {
  try {
    loading.value = true
    const isValid = await v$.value.editUser.$validate()
    if (!isValid) return

    let token = Cookies.get('access_token')
    if (!token) token = localStorage.getItem('access_token')
    if (!token) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 })
      return
    }

    await axios.put('http://localhost:8000/api/user', editUser.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    await fetchUser() // <-- Fetch latest user data after update
    showEdit.value = false
    toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update profile', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  try {
    loading.value = true
    const isValid = await v$.value.passwords.$validate()
    if (!isValid) return

    if (passwords.value.new !== passwords.value.confirm) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 })
      return
    }

    let token = Cookies.get('access_token')
    if (!token) token = localStorage.getItem('access_token')
    if (!token) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 })
      return
    }

    await axios.post('http://localhost:8000/api/user', {
      current_password: passwords.value.current,
      password: passwords.value.new,
      password_confirmation: passwords.value.confirm
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    showPassword.value = false
    passwords.value = { current: '', new: '', confirm: '' }
    toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to change password', life: 3000 })
  } finally {
    loading.value = false
  }
}
function openEdit() {
  // Always pre-fill editUser with current user data
  editUser.value = {
    username: user.value.username || '',
    email: user.value.email || '',
    phone_no: user.value.phone_no || ''
  }
  showEdit.value = true
}
const router = useRouter()
function goBack() {
  router.back()
}

async function sendResetLink() {
  forgotError.value = ''
  if (!forgotEmail.value) {
    forgotError.value = 'Email is required'
    return
  }

  loading.value = true
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password', {
      email: forgotEmail.value
    })
    toast.add({ severity: 'success', summary: 'Success', detail: 'OTP sent to your email', life: 3000 })
    showForgot.value = false
    router.push({ 
      path: '/reset-password',
      query: { 
        email: forgotEmail.value,
        otp: response.data.otp // Assuming backend returns OTP in response
      }
    })
  } catch (error) {
    forgotError.value = error.response?.data?.message || 'Failed to send reset link'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.user-profile-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0;
  background: transparent;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card {
  width: 100%;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px rgba(33,150,243,0.10);
  padding: 2rem 2rem 1.5rem 2rem;
  color: #222;
  position: relative;
  animation: fadeIn 0.7s;
}

.accent-bar {
  height: 8px;
  width: 100%;
  border-radius: 1.5rem 1.5rem 0 0;
  background: linear-gradient(90deg, #42a5f5 0%, #7e57c2 100%);
  position: absolute;
  top: 0;
  left: 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42a5f5 0%, #7e57c2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 1.5rem;
  box-shadow: 0 2px 8px rgba(33,150,243,0.15);
}

.user-meta h2 {
  margin: 0;
  font-size: 2rem;
  color: #222;
}

.role-branch {
  font-size: 1rem;
  color: #7e57c2;
}

.profile-details {
  margin-bottom: 2rem;
}

.profile-details p {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.back-btn.right {
  position: absolute;
  top: 18px;
  right: 18px;
  left: unset;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7e57c2;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33,150,243,0.07);
  transition: background 0.2s;
  z-index: 2;
}
.back-btn.right:hover {
  background: #e3e3fa;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>