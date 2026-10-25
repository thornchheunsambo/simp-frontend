<script setup>
const { api, download } = useApi()
const toast = useToast()

const companies = ref([])
const listings = ref([])
const report = ref(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    ;[companies.value, listings.value, report.value] = await Promise.all([
      api('/api/companies/pending'),
      api('/api/internships/pending'),
      api('/api/reports/placements')
    ])
  } catch (e) {
    toast.err(e.message)
  } finally {
    loading.value = false
  }
}

async function reviewCompany(c, approved) {
  try {
    await api(`/api/companies/${c.id}/verify`, { method: 'PATCH', query: { approved } })
    toast.ok(approved ? 'Company verified' : 'Company rejected')
    await load()
  } catch (e) { toast.err(e.message) }
}

async function reviewListing(i, approved) {
  try {
    await api(`/api/internships/${i.id}/review`, { method: 'PATCH', query: { approved } })
    toast.ok(approved ? 'Listing approved' : 'Listing rejected')
    await load()
  } catch (e) { toast.err(e.message) }
}

async function exportCsv() {
  try { await download('/api/reports/placements/export', 'placements') } catch (e) { toast.err(e.message) }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head row between">
      <div><h1>Review &amp; reports</h1><p class="muted">Verify companies, approve listings and monitor placements.</p></div>
      <button class="btn ghost" @click="exportCsv">Export CSV</button>
    </div>

    <div v-if="loading" class="empty">Loading...</div>
    <template v-else>
      <div v-if="report" class="stats">
        <div class="stat"><span class="muted">Applications</span><b>{{ report.totalApplications }}</b></div>
        <div class="stat"><span class="muted">Companies</span><b>{{ report.totalCompanies }}</b></div>
        <div class="stat"><span class="muted">Placement rate</span><b>{{ report.placementRatePercent }}%</b></div>
        <div class="stat"><span class="muted">Completion rate</span><b>{{ report.completionRatePercent }}%</b></div>
      </div>

      <div class="card">
        <h2>Companies waiting for verification ({{ companies.length }})</h2>
        <div v-if="!companies.length" class="empty">Nothing to review.</div>
        <div v-else class="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Industry</th><th>Website</th><th /></tr></thead>
            <tbody>
              <tr v-for="c in companies" :key="c.id">
                <td><b>{{ c.name }}</b><br><span class="muted">{{ c.address }}</span></td>
                <td>{{ c.industry }}</td>
                <td>{{ c.website }}</td>
                <td class="row">
                  <button class="btn small ok" @click="reviewCompany(c, true)">Verify</button>
                  <button class="btn small danger" @click="reviewCompany(c, false)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Listings waiting for approval ({{ listings.length }})</h2>
        <div v-if="!listings.length" class="empty">Nothing to review.</div>
        <div v-else class="table-wrap">
          <table>
            <thead><tr><th>Listing</th><th>Company</th><th>Deadline</th><th /></tr></thead>
            <tbody>
              <tr v-for="i in listings" :key="i.id">
                <td><b>{{ i.title }}</b><br><span class="muted">{{ i.field }} - {{ i.location }}</span>
                  <div style="max-width: 420px; font-size: .88rem">{{ i.description }}</div></td>
                <td>{{ i.companyName }}</td>
                <td>{{ fmtDate(i.deadline) }}</td>
                <td class="row">
                  <button class="btn small ok" @click="reviewListing(i, true)">Approve</button>
                  <button class="btn small danger" @click="reviewListing(i, false)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="report" class="card">
        <h2>Applications by status</h2>
        <div class="row">
          <div v-for="(n, s) in report.applicationsByStatus" :key="s" class="row" style="gap: .35rem">
            <StatusBadge :status="s" /> <b>{{ n }}</b>
          </div>
        </div>
        <h2 style="margin-top: 1rem">Listings by status</h2>
        <div class="row">
          <div v-for="(n, s) in report.internshipsByStatus" :key="s" class="row" style="gap: .35rem">
            <StatusBadge :status="s" /> <b>{{ n }}</b>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>