// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false, // single-page app: easy to run and to host as a static site
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // override with NUXT_PUBLIC_API_BASE (see .env.example)
      apiBase: 'https://simp-api-g9n4.onrender.com/'
    }
  },
  app: {
    head: {
      title: 'SIMP - Student Internship Management Platform',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})