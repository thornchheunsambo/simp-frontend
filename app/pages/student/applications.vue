<script setup>
const { api } = useApi()
const toast = useToast()

const apps = ref([])
const interviews = ref([])
const history = ref({}) // applicationId -> list
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    ;[apps.value, interviews.value] = await Promise.all([api('/api/applications/me'), api('/api/interviews/me')])
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

const titleOf = (applicationId) => apps.value.find((a) => a.id === applicationId)?.internshipTitle || ''

async function toggleHistory(a) {
  if (history.value[a.id]) { delete history.value[a.id]; return }
  try { history.value[a.id] = await api(`/api/applications/${a.id}/history`) } catch (e) { toast.err(e.message) }
}

async function withdraw(a) {
  if (!confirm('Withdraw this application?')) return
  try {
    await api(`/api/applications/${a.id}/withdraw`, { method: 'PATCH' })
    toast.ok('Application withdrawn')
    await load()
  } catch (e) { toast.err(e.message) }
}

async function uploadReport(a, ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  fd.append('docType', 'COMPLETION_REPORT')
  fd.append('applicationId', a.id)
  try {
    await api('/api/documents', { method: 'POST', body: fd })
    toast.ok('Completion document uploaded')
  } catch (e) {
    toast.err(e.message)
  }
  ev.target.value = ''
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head"><h1>My applications</h1><p class="muted">Track every step from Pending to Completed.</p></div>

    <div v-if="loading" class="empty">Loading...</div>
    <div v-else-if="!apps.length" class="empty">You have not applied yet. <NuxtLink to="/student">Find internships</NuxtLink></div>

    <div v-for="a in apps" :key="a.id" class="card">
      <div class="row between">
        <div>
          <h3>{{ a.internshipTitle }}</h3>
          <span class="muted">{{ a.companyName }} - applied {{ fmtDateTime(a.appliedAt) }}</span>
        </div>
        <StatusBadge :status="a.status" />
      </div>
      <div class="row" style="margin-top: .75rem">
        <button class="btn small ghost" @click="toggleHistory(a)">{{ history[a.id] ? 'Hide history' : 'Status history' }}</button>
        <button v-if="['PENDING', 'SHORTLISTED'].includes(a.status)" class="btn small danger" @click="withdraw(a)">Withdraw</button>
        <label v-if="['ACCEPTED', 'COMPLETED'].includes(a.status)" style="min-width: 0; flex: 0">
          Upload completion report (PDF/DOCX)
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" @change="uploadReport(a, $event)">
        </label>
      </div>
      <ul v-if="history[a.id]" class="timeline">
        <li v-for="(h, idx) in history[a.id]" :key="idx">
          {{ fmtDateTime(h.changedAt) }}: {{ h.fromStatus || 'start' }} to <b>{{ h.toStatus }}</b><span v-if="h.note"> - {{ h.note }}</span>
        </li>
      </ul>
    </div>

    <div v-if="interviews.length" class="card">
      <h2>Interviews</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Internship</th><th>When</th><th>Mode</th><th>Where / link</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="iv in interviews" :key="iv.id">
              <td>{{ titleOf(iv.applicationId) }}</td>
              <td>{{ fmtDateTime(iv.scheduledAt) }}</td>
              <td>{{ iv.mode }}</td>
              <td>{{ iv.locationOrLink }}</td>
              <td><StatusBadge :status="iv.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>