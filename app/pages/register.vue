<script setup>
const { register } = useAuth()
const toast = useToast()
const busy = ref(false)
const form = reactive({
  role: 'STUDENT', fullName: '', email: '', password: '',
  major: '', studentCode: '', phone: '',
  companyName: '', industry: '', address: '', website: ''
})

async function submit() {
  busy.value = true
  try {
    const body = { role: form.role, fullName: form.fullName, email: form.email, password: form.password, phone: form.phone || null }
    if (form.role === 'STUDENT') {
      body.major = form.major
      body.studentCode = form.studentCode || null
    } else {
      body.companyName = form.companyName
      body.industry = form.industry || null
      body.address = form.address || null
      body.website = form.website || null
    }
    const res = await register(body)
    toast.ok('Account created')
    await navigateTo(homeFor(res.role))
  } catch (e) {
    toast.err(e.message)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-card card">
    <h1>Create account</h1>
    <div class="tabs">
      <button type="button" :class="{ active: form.role === 'STUDENT' }" @click="form.role = 'STUDENT'">I am a student</button>
      <button type="button" :class="{ active: form.role === 'COMPANY' }" @click="form.role = 'COMPANY'">I am a company</button>
    </div>
    <form class="stack" @submit.prevent="submit">
      <label>{{ form.role === 'STUDENT' ? 'Full name' : 'Contact person' }}
        <input v-model="form.fullName" required>
      </label>
      <label>Email <input v-model="form.email" type="email" required></label>
      <label>Password (min 8 characters)
        <input v-model="form.password" type="password" required minlength="8">
      </label>

      <template v-if="form.role === 'STUDENT'">
        <label>Major <input v-model="form.major" required placeholder="e.g. Computer Science"></label>
        <div class="form-row">
          <label>Student code <input v-model="form.studentCode"></label>
          <label>Phone <input v-model="form.phone"></label>
        </div>
      </template>

      <template v-else>
        <label>Company name <input v-model="form.companyName" required></label>
        <div class="form-row">
          <label>Industry <input v-model="form.industry"></label>
          <label>Phone <input v-model="form.phone"></label>
        </div>
        <label>Address <input v-model="form.address"></label>
        <label>Website <input v-model="form.website" placeholder="https://"></label>
        <p class="muted">A university staff member must verify your company before you can post internships.</p>
      </template>

      <button class="btn" :disabled="busy">{{ busy ? 'Creating...' : 'Create account' }}</button>
    </form>
    <p class="muted">Already registered? <NuxtLink to="/login">Sign in</NuxtLink></p>
  </div>
</template>