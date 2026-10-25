<script setup>
const { api } = useApi()
const toast = useToast()

const tab = ref('all') // all | recommended | saved
const filters = reactive({ field: '', location: '', maxDurationWeeks: '', deadlineBefore: '', skill: '' })
const items = ref([])
const page = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const saved = ref(new Set())
const applied = ref(new Set())
const applyTo = ref(null)
const cover = ref('')
const busy = ref(false)

async function refreshSaved() {
  try { saved.value = new Set((await api('/api/bookmarks')).map((i) => i.id)) } catch { /* ignore */ }
}
async function refreshApplied() {
  try { applied.value = new Set((await api('/api/applications/me')).map((a) => a.internshipId)) } catch { /* ignore */ }
}

async function load() {
  loading.value = true
  try {
    if (tab.value === 'saved') {
      items.value = await api('/api/bookmarks')
      saved.value = new Set(items.value.map((i) => i.id))
      totalPages.value = 1
    } else {
      const query = { page: page.value, size: 9 }
      if (tab.value === 'all') {
        for (const [k, v] of Object.entries(filters)) if (v !== '' && v != null) query[k] = v
      }
      const res = await api(tab.value === 'all' ? '/api/internships' : '/api/internships/recommended', { query })
      items.value = res.content
      totalPages.value = res.totalPages ?? res.page?.totalPages ?? 1
    }
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

function search() { page.value = 0; load() }
function go(d) { page.value += d; load() }
watch(tab, () => { page.value = 0; load() })

async function toggleSave(i) {
  try {
    if (saved.value.has(i.id)) {
      await api(`/api/bookmarks/${i.id}`, { method: 'DELETE' })
      saved.value.delete(i.id)
      if (tab.value === 'saved') items.value = items.value.filter((x) => x.id !== i.id)
    } else {
      await api(`/api/bookmarks/${i.id}`, { method: 'POST' })
      saved.value.add(i.id)
    }
  } catch (e) { toast.err(e.message) }
}

function openApply(i) { applyTo.value = i; cover.value = '' }

async function submitApply() {
  busy.value = true
  try {
    await api('/api/applications', { method: 'POST', body: { internshipId: applyTo.value.id, coverLetter: cover.value } })
    applied.value.add(applyTo.value.id)
    toast.ok('Application submitted')
    applyTo.value = null
  } catch (e) {
    toast.err(e.message)
  } finally {
    busy.value = false
  }
}

onMounted(() => { refreshSaved(); refreshApplied(); load() })
</script>

<template>
  <div>
    <div class="page-head">
      <h1>Find internships</h1>
      <p class="muted">Only university-approved listings are shown.</p>
    </div>

    <div class="tabs">
      <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All listings</button>
      <button :class="{ active: tab === 'recommended' }" @click="tab = 'recommended'">Recommended for me</button>
      <button :class="{ active: tab === 'saved' }" @click="tab = 'saved'">Saved</button>
    </div>

    <form v-if="tab === 'all'" class="card" @submit.prevent="search">
      <div class="form-row">
        <label>Field <input v-model="filters.field" placeholder="e.g. software"></label>
        <label>Location <input v-model="filters.location" placeholder="e.g. Phnom Penh"></label>
        <label>Skill <input v-model="filters.skill" placeholder="e.g. Java"></label>
      </div>
      <div class="form-row" style="margin-top: .8rem">
        <label>Max duration (weeks) <input v-model="filters.maxDurationWeeks" type="number" min="1"></label>
        <label>Deadline before <input v-model="filters.deadlineBefore" type="date"></label>
        <div class="row" style="align-items: flex-end"><button class="btn">Search</button></div>
      </div>
    </form>

    <div v-if="loading" class="empty">Loading...</div>
    <div v-else-if="!items.length" class="empty">
      {{ tab === 'recommended' ? 'Add your major and skills in your profile to get recommendations.' : 'No internships found.' }}
    </div>

    <div v-else class="grid">
      <div v-for="i in items" :key="i.id" class="card">
        <div>
          <h3>{{ i.title }}</h3>
          <span class="muted">{{ i.companyName }}</span>
        </div>
        <div class="muted">
          {{ i.field }}<span v-if="i.location"> - {{ i.location }}</span><span v-if="i.durationWeeks"> - {{ i.durationWeeks }} weeks</span>
        </div>
        <p style="margin: 0; font-size: .92rem">{{ i.description.length > 180 ? i.description.slice(0, 180) + '...' : i.description }}</p>
        <div class="chips"><span v-for="s in i.skills" :key="s" class="chip">{{ s }}</span></div>
        <div class="muted">Deadline: <b>{{ fmtDate(i.deadline) }}</b> - {{ i.slots }} slot(s)</div>
        <div class="row" style="margin-top: auto">
          <button class="btn small" :disabled="applied.has(i.id)" @click="openApply(i)">
            {{ applied.has(i.id) ? 'Applied' : 'Apply' }}
          </button>
          <button class="btn small ghost" @click="toggleSave(i)">{{ saved.has(i.id) ? 'Saved - remove' : 'Save' }}</button>
        </div>
      </div>
    </div>

    <div v-if="tab !== 'saved' && totalPages > 1" class="pager">
      <button class="btn small ghost" :disabled="page === 0" @click="go(-1)">Previous</button>
      <span class="muted">Page {{ page + 1 }} of {{ totalPages }}</span>
      <button class="btn small ghost" :disabled="page + 1 >= totalPages" @click="go(1)">Next</button>
    </div>

    <div v-if="applyTo" class="modal-bg" @click.self="applyTo = null">
      <div class="modal">
        <h2>Apply: {{ applyTo.title }}</h2>
        <p class="muted">{{ applyTo.companyName }} - your profile and CV are sent with the application.</p>
        <form class="stack" @submit.prevent="submitApply">
          <label>Cover letter (optional)
            <textarea v-model="cover" placeholder="Why are you a good fit?" />
          </label>
          <div class="row">
            <button class="btn" :disabled="busy">{{ busy ? 'Sending...' : 'Submit application' }}</button>
            <button type="button" class="btn ghost" @click="applyTo = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>