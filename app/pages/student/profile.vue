<script setup>
const { api, download } = useApi()
const toast = useToast()

const form = reactive({ fullName: '', major: '', phone: '', studentCode: '', skills: '' })
const cvId = ref(null)
const busy = ref(false)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const p = await api('/api/students/me')
    form.fullName = p.fullName
    form.major = p.major
    form.phone = p.phone || ''
    form.studentCode = p.studentCode || ''
    form.skills = (p.skills || []).join(', ')
    cvId.value = p.cvDocumentId
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function save() {
  busy.value = true
  try {
    await api('/api/students/me', {
      method: 'PUT',
      body: { fullName: form.fullName, major: form.major, phone: form.phone, studentCode: form.studentCode, skills: splitList(form.skills) }
    })
    toast.ok('Profile saved')
  } catch (e) {
    toast.err(e.message)
  } finally {
    busy.value = false
  }
}

async function uploadCv(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  fd.append('docType', 'CV')
  try {
    await api('/api/documents', { method: 'POST', body: fd })
    toast.ok('CV uploaded')
    await load()
  } catch (e) {
    toast.err(e.message)
  }
  ev.target.value = ''
}

async function downloadCv() {
  try { await download(`/api/documents/${cvId.value}/download`, 'my-cv') } catch (e) { toast.err(e.message) }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head"><h1>My profile</h1><p class="muted">Your major and skills power the "Recommended for me" tab.</p></div>
    <div v-if="loading" class="empty">Loading...</div>
    <template v-else>
      <form class="card stack" @submit.prevent="save">
        <div class="form-row">
          <label>Full name <input v-model="form.fullName" required></label>
          <label>Major <input v-model="form.major" required></label>
        </div>
        <div class="form-row">
          <label>Student code <input v-model="form.studentCode"></label>
          <label>Phone <input v-model="form.phone"></label>
        </div>
        <label>Skills (comma separated)
          <input v-model="form.skills" placeholder="Java, Spring Boot, PostgreSQL">
        </label>
        <div><button class="btn" :disabled="busy">{{ busy ? 'Saving...' : 'Save profile' }}</button></div>
      </form>

      <div class="card">
        <h2>CV</h2>
        <p class="muted">PDF or Word, max 5 MB. Companies see your CV when you apply.</p>
        <div class="row">
          <button v-if="cvId" class="btn small ghost" @click="downloadCv">Download current CV</button>
          <span v-else class="muted">No CV uploaded yet.</span>
          <input type="file" accept=".pdf,.doc,.docx" style="max-width: 320px" @change="uploadCv">
        </div>
      </div>
    </template>
  </div>
</template>