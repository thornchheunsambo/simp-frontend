<script setup>
const { login } = useAuth()
const toast = useToast()
const form = reactive({ email: '', password: '' })
const busy = ref(false)

async function submit() {
  busy.value = true
  try {
    const res = await login(form.email, form.password)
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
    <h1>Sign in</h1>
    <p class="muted">Student Internship Management Platform</p>
    <form class="stack" @submit.prevent="submit">
      <label>Email
        <input v-model="form.email" type="email" required autocomplete="username">
      </label>
      <label>Password
        <input v-model="form.password" type="password" required autocomplete="current-password">
      </label>
      <button class="btn" :disabled="busy">{{ busy ? 'Signing in...' : 'Sign in' }}</button>
    </form>
    <p class="muted">No account yet? <NuxtLink to="/register">Register</NuxtLink></p>
  </div>
</template>