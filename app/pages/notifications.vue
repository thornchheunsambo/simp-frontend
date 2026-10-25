<script setup>
const { api } = useApi()
const toast = useToast()
const unread = useState('simp_unread', () => 0)
const items = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    items.value = await api('/api/notifications')
    unread.value = items.value.filter((n) => !n.read).length
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function markRead(n) {
  if (n.read) return
  try {
    await api(`/api/notifications/${n.id}/read`, { method: 'PATCH' })
    n.read = true
    unread.value = items.value.filter((x) => !x.read).length
  } catch (e) {
    toast.err(e.message)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head"><h1>Notifications</h1><p class="muted">Updates about applications, interviews and reviews.</p></div>
    <div v-if="loading" class="empty">Loading...</div>
    <div v-else-if="!items.length" class="empty">No notifications yet.</div>
    <div v-for="n in items" :key="n.id" class="card" :style="{ opacity: n.read ? 0.65 : 1 }">
      <div class="row between">
        <div>
          <span class="badge">{{ n.type.replace('_', ' ') }}</span>
          <p style="margin: .4rem 0 0">{{ n.message }}</p>
          <span class="muted">{{ fmtDateTime(n.createdAt) }}</span>
        </div>
        <button v-if="!n.read" class="btn small ghost" @click="markRead(n)">Mark as read</button>
      </div>
    </div>
  </div>
</template>