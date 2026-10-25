<script setup>
const { api } = useApi()
const toast = useToast()

const company = ref(null)
const listings = ref([])
const loading = ref(true)
const busy = ref(false)
const form = reactive({ title: '', field: '', location: '', durationWeeks: 12, slots: 1, deadline: '', skills: '', description: '' })

const verified = computed(() => company.value?.verificationStatus === 'VERIFIED')

async function load() {
  loading.value = true
  try {
    company.value = await api('/api/companies/me')
    listings.value = await api('/api/internships/mine')
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function create() {
  busy.value = true
  try {
    await api('/api/internships', {
      method: 'POST',
      body: {
        title: form.title, description: form.description, field: form.field, location: form.location,
        durationWeeks: Number(form.durationWeeks), slots: Number(form.slots), deadline: form.deadline,
        skills: splitList(form.skills)
      }
    })
    toast.ok('Submitted. University staff will review your listing.')
    Object.assign(form, { title: '', field: '', location: '', durationWeeks: 12, slots: 1, deadline: '', skills: '', description: '' })
    await load()
  } catch (e) {
    toast.err(e.message)
  } finally {
    busy.value = false
  }
}

async function close(i) {
  if (!confirm('Close this listing?')) return
  try {
    await api(`/api/internships/${i.id}/close`, { method: 'PATCH' })
    await load()
  } catch (e) { toast.err(e.message) }
}

onMounted(load)
</script>

<template>
  <div>
    <div v-if="loading" class="empty">Loading...</div>
    <template v-else>
      <div class="page-head row between">
        <div>
          <h1>{{ company?.name }}</h1>
          <p class="muted">{{ company?.industry }} <span v-if="company?.address">- {{ company.address }}</span></p>
        </div>
        <StatusBadge :status="company?.verificationStatus" />
      </div>

      <div v-if="!verified" class="card">
        <b>Waiting for verification.</b>
        <p class="muted" style="margin: .25rem 0 0">
          University staff must verify your company before you can post internships.
          You will get a notification when it is done.
        </p>
      </div>

      <form class="card stack" @submit.prevent="create">
        <h2>Post a new internship</h2>
        <div class="form-row">
          <label>Title <input v-model="form.title" required :disabled="!verified"></label>
          <label>Field <input v-model="form.field" required placeholder="e.g. Software Development" :disabled="!verified"></label>
        </div>
        <div class="form-row">
          <label>Location <input v-model="form.location" :disabled="!verified"></label>
          <label>Duration (weeks) <input v-model="form.durationWeeks" type="number" min="1" :disabled="!verified"></label>
          <label>Slots <input v-model="form.slots" type="number" min="1" :disabled="!verified"></label>
          <label>Application deadline <input v-model="form.deadline" type="date" required :disabled="!verified"></label>
        </div>
        <label>Required skills (comma separated) <input v-model="form.skills" placeholder="Java, SQL" :disabled="!verified"></label>
        <label>Description <textarea v-model="form.description" required :disabled="!verified" /></label>
        <div><button class="btn" :disabled="!verified || busy">{{ busy ? 'Submitting...' : 'Submit for approval' }}</button></div>
      </form>

      <div class="card">
        <h2>My listings</h2>
        <div v-if="!listings.length" class="empty">No listings yet.</div>
        <div v-else class="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Deadline</th><th /></tr></thead>
            <tbody>
              <tr v-for="i in listings" :key="i.id">
                <td><b>{{ i.title }}</b><br><span class="muted">{{ i.field }}</span></td>
                <td><StatusBadge :status="i.status" /></td>
                <td>{{ fmtDate(i.deadline) }}</td>
                <td class="row">
                  <NuxtLink :to="`/company/internships/${i.id}`" class="btn small ghost">Applicants</NuxtLink>
                  <button v-if="['APPROVED', 'PENDING_APPROVAL'].includes(i.status)" class="btn small danger" @click="close(i)">Close</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>