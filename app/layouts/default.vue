<script setup>
const { token, user, logout } = useAuth()
const { api } = useApi()
const { toast } = useToast()
const unread = useState('simp_unread', () => 0)

const links = computed(() => {
  switch (user.value?.role) {
    case 'STUDENT':
      return [
        { to: '/student', label: 'Find internships' },
        { to: '/student/applications', label: 'My applications' },
        { to: '/student/profile', label: 'Profile' }
      ]
    case 'COMPANY':
      return [{ to: '/company', label: 'Dashboard' }]
    case 'STAFF':
      return [{ to: '/staff', label: 'Review & reports' }]
    case 'ADMIN':
      return [
        { to: '/admin', label: 'Users' },
        { to: '/staff', label: 'Review & reports' }
      ]
    default:
      return []
  }
})

async function refreshUnread() {
  if (!token.value) { unread.value = 0; return }
  try {
    const list = await api('/api/notifications')
    unread.value = list.filter((n) => !n.read).length
  } catch { /* ignore */ }
}

let timer
onMounted(() => {
  refreshUnread()
  timer = setInterval(refreshUnread, 30000)
})
onBeforeUnmount(() => clearInterval(timer))
watch(token, refreshUnread)
</script>

<template>
  <div>
    <header v-if="token" class="topbar">
      <NuxtLink class="brand" :to="homeFor(user?.role)">SIMP</NuxtLink>
      <nav>
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
      </nav>
      <div class="right">
        <NuxtLink to="/notifications" class="bell">Notifications<span v-if="unread" class="dot">{{ unread }}</span></NuxtLink>
        <span class="who">{{ user?.email }} - {{ user?.role }}</span>
        <button class="btn small ghost" @click="logout">Logout</button>
      </div>
    </header>

    <main class="container">
      <slot />
    </main>

    <div v-if="toast.message" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>