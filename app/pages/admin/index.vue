<script setup>
const { api } = useApi()
const toast = useToast()
const { user } = useAuth()

const users = ref([])
const loading = ref(true)
const busy = ref(false)
const form = reactive({ email: '', password: '', role: 'STAFF' })

async function load() {
  loading.value = true
  try {
    const res = await api('/api/admin/users', { query: { size: 100, sort: 'id' } })
    users.value = res.content
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function create() {
  busy.value = true
  try {
    await api('/api/admin/users', { method: 'POST', body: { ...form } })
    toast.ok('Account created')
    Object.assign(form, { email: '', password: '', role: 'STAFF' })
    await load()
  } catch (e) {
    toast.err(e.message)
  } finally {
    busy.value = false
  }
}

async function toggle(u) {
  try {
    await api(`/api/admin/users/${u.id}/enabled`, { method: 'PATCH', query: { value: !u.enabled } })
    await load()
  } catch (e) { toast.err(e.message) }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head"><h1>User management</h1><p class="muted">Create staff accounts and enable or disable users.</p></div>

    <form class="card stack" @submit.prevent="create">
      <h2>New staff / admin account</h2>
      <div class="form-row">
        <label>Email <input v-model="form.email" type="email" required></label>
        <label>Password (min 8) <input v-model="form.password" type="password" minlength="8" required></label>
        <label>Role
          <select v-model="form.role"><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select>
        </label>
      </div>
      <div><button class="btn" :disabled="busy">Create account</button></div>
    </form>

    <div class="card">
      <h2>All users</h2>
      <div v-if="loading" class="empty">Loading...</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Active</th><th>Created</th><th /></tr></thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge">{{ u.role }}</span></td>
              <td>{{ u.enabled ? 'Yes' : 'No' }}</td>
              <td>{{ fmtDate(u.createdAt) }}</td>
              <td>
                <button v-if="u.id !== user?.id" class="btn small" :class="u.enabled ? 'danger' : 'ok'" @click="toggle(u)">
                  {{ u.enabled ? 'Disable' : 'Enable' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>