<script setup>
const route = useRoute()
const { api, download } = useApi()
const toast = useToast()
const id = route.params.id

const listing = ref(null)
const applicants = ref([])
const loading = ref(true)
const iv = reactive({ appId: null, scheduledAt: '', mode: 'ONLINE', locationOrLink: '' })

async function load() {
  loading.value = true
  try {
    ;[listing.value, applicants.value] = await Promise.all([
      api(`/api/internships/${id}`),
      api(`/api/applications/internship/${id}`)
    ])
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function setStatus(a, status) {
  try {
    await api(`/api/applications/${a.id}/status`, { method: 'PATCH', body: { status } })
    toast.ok(`Moved to ${status}`)
    await load()
  } catch (e) { toast.err(e.message) }
}

function openInterview(a) {
  Object.assign(iv, { appId: a.id, scheduledAt: '', mode: 'ONLINE', locationOrLink: '' })
}

async function scheduleInterview() {
  try {
    await api(`/api/applications/${iv.appId}/interview`, {
      method: 'POST',
      body: { scheduledAt: new Date(iv.scheduledAt).toISOString(), mode: iv.mode, locationOrLink: iv.locationOrLink }
    })
    toast.ok('Interview scheduled, student notified')
    iv.appId = null
  } catch (e) { toast.err(e.message) }
}

async function downloadCv(a) {
  try { await download(`/api/documents/${a.cvDocumentId}/download`, `cv-${a.studentName.replace(/\s+/g, '-')}`) } catch (e) { toast.err(e.message) }
}

onMounted(load)
</script>

<template>
  <div>
    <NuxtLink to="/company" class="muted">&larr; Back to dashboard</NuxtLink>
    <div v-if="loading" class="empty">Loading...</div>
    <template v-else>
      <div class="page-head" style="margin-top: .5rem">
        <h1>{{ listing?.title }}</h1>
        <p class="muted">{{ listing?.field }} - deadline {{ fmtDate(listing?.deadline) }} - <StatusBadge :status="listing?.status" /></p>
      </div>

      <div v-if="!applicants.length" class="card empty">No applications yet.</div>

      <div v-for="a in applicants" :key="a.id" class="card">
        <div class="row between">
          <div>
            <h3>{{ a.studentName }}</h3>
            <span class="muted">Applied {{ fmtDateTime(a.appliedAt) }}</span>
          </div>
          <StatusBadge :status="a.status" />
        </div>
        <p v-if="a.coverLetter" style="white-space: pre-wrap">{{ a.coverLetter }}</p>
        <div class="row">
          <button v-if="a.cvDocumentId" class="btn small ghost" @click="downloadCv(a)">Download CV</button>
          <span v-else class="muted">No CV attached</span>
          <button
            v-for="next in NEXT_STATUS[a.status] || []"
            :key="next"
            class="btn small"
            :class="next === 'REJECTED' ? 'danger' : 'ok'"
            @click="setStatus(a, next)"
          >{{ next === 'REJECTED' ? 'Reject' : 'Mark ' + next.toLowerCase() }}</button>
          <button v-if="a.status === 'SHORTLISTED'" class="btn small ghost" @click="openInterview(a)">Schedule interview</button>
        </div>
      </div>

      <div v-if="iv.appId" class="modal-bg" @click.self="iv.appId = null">
        <div class="modal">
          <h2>Schedule interview</h2>
          <form class="stack" @submit.prevent="scheduleInterview">
            <label>Date and time <input v-model="iv.scheduledAt" type="datetime-local" required></label>
            <label>Mode
              <select v-model="iv.mode"><option value="ONLINE">Online</option><option value="ONSITE">On-site</option></select>
            </label>
            <label>{{ iv.mode === 'ONLINE' ? 'Meeting link' : 'Address' }} <input v-model="iv.locationOrLink"></label>
            <div class="row">
              <button class="btn">Schedule</button>
              <button type="button" class="btn ghost" @click="iv.appId = null">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>